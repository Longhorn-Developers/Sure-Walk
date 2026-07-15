import { DurableObject } from "cloudflare:workers";
import { NextResponse } from "next/server";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import { Samsara } from "@samsarahq/samsara";
import {
  getAsset,
  getRouteUpdates,
  getVehicleLocations,
} from "./samsara-utils";
import {
  getActiveRides,
  setDropoffStopState,
  setPickupStopState,
} from "../ride-helper";
import { Ride, rides } from "../db/schema/rides";
import { getDB } from "../db";
import { eq } from "drizzle-orm";
import { Vehicle, vehicles } from "../db/schema/vehicles";

export class RideInfoStream extends DurableObject<CloudflareEnv> {
  streams: Map<string, WritableStreamDefaultWriter>;
  encoder: TextEncoder;

  constructor(state: DurableObjectState, env: CloudflareEnv) {
    super(state, env);
    this.streams = new Map();
    this.encoder = new TextEncoder();
    this.ctx.blockConcurrencyWhile(async () => {
      await this.pollInfo();
    });
  }

  async fetch(request: Request): Promise<Response> {
    const userID = request.headers.get("x-user-id");
    const rideState = request.headers.get(
      "x-ride-state",
    )! as InProgressRideState;
    const vehicleInfo = JSON.parse(
      request.headers.get("x-vehicle-info") ?? "null",
    ) as Vehicle | null;
    if (!userID) {
      // should be unreachable due to worker middleware
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const responseHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    };

    request.signal.addEventListener("abort", () => {
      this.streams.delete(userID);
      writer.close().catch(() => {});
    });

    this.streams.set(userID, writer);

    await writer.write(
      this.encoder.encode(
        `retry: 10000\nevent: connected\ndata: ${rideState}\n
        ${vehicleInfo ? `event: vehicleInfo\ndata: ${this.vehicleInfoShort(vehicleInfo)}\n\n` : ""}`,
      ),
    );

    return new Response(readable, { headers: responseHeaders });
  }

  async alarm() {
    await this.pollInfo();
  }

  async pollInfo() {
    let routeUpdates = await this.pollRouteUpdates();
    let activeRides = await getActiveRides();

    if (activeRides.length === 0) {
      // durable object will be spun down
      return;
    }

    await this.streamRouteUpdates(activeRides, routeUpdates);
    let hasNextPage = routeUpdates.pagination.hasNextPage;
    activeRides = await getActiveRides();
    while (hasNextPage) {
      await this.streamRouteUpdates(activeRides, routeUpdates);
      routeUpdates = await this.pollRouteUpdates();
      activeRides = await getActiveRides();
      hasNextPage = routeUpdates.pagination.hasNextPage;
    }

    const vehicleLocations = await this.pollLocations();
    await this.streamLocations(activeRides, vehicleLocations);

    const currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm) {
      await this.ctx.storage.setAlarm(Date.now() + 5000);
    }
  }

  async streamLocations(
    activeRides: (typeof Ride)[],
    vehicleLocations: Samsara.VehicleLocationsListResponse,
  ) {
    for (const ride of activeRides) {
      if (
        ride.vehicleID &&
        ride.pickupStopState !== "scheduled" &&
        this.streams.has(ride.userID)
      ) {
        const data = vehicleLocations.data.find(
          (vehicle) => vehicle.id === ride.vehicleID,
        );
        if (data) {
          const writer = this.streams.get(ride.userID)!;
          await writer
            .write(
              this.encoder.encode(
                `event: vehicleLocation\ndata: ${JSON.stringify(data.locations[0])}\n\n`,
              ),
            )
            .catch(() => this.streams.delete(ride.userID));
        }
      }
    }
  }

  async streamRouteUpdates(
    activeRides: (typeof Ride)[],
    routeUpdates: Samsara.RoutesGetRoutesFeedResponseBody,
  ) {
    for (const ride of routeUpdates.data) {
      for (const stop of ride.changes.after.stops ?? []) {
        const stopID = stop.id;
        const stopState = stop.state!;
        const stopType =
          ride.route.stops?.at(0)?.id === stopID ? "pickup" : "dropoff";
        const userID = activeRides.find(
          ({ samsaraID }) => samsaraID === ride.route.id,
        )?.userID;
        if (stopType === "pickup") {
          await setPickupStopState(stopID, stopState);

          if (userID) {
            if (stopState === "scheduled") {
              await this.sendRouteUpdate(userID, "assigned");
            }
            if (stopState === "en route") {
              await this.sendRouteUpdate(userID, "en route");
              // get vehicle info
              const vehicleID = ride.route.vehicle?.id;
              if (vehicleID) {
                await getDB()
                  .update(rides)
                  .set({ vehicleID })
                  .where(eq(rides.samsaraID, ride.route.id));

                const asset = await getAsset(vehicleID);
                const assetInfo = asset.data[0];
                let vehicle: Vehicle;
                if (assetInfo.type === "vehicle") {
                  [vehicle] = await getDB()
                    .insert(vehicles)
                    .values({
                      samsaraID: vehicleID,
                      name: assetInfo.name ?? "unnamed",
                      make: assetInfo.make,
                      model: assetInfo.model,
                      year: assetInfo.year,
                      licensePlate: assetInfo.licensePlate,
                      adaAccessible: assetInfo.name?.includes("ADA") ?? false,
                      type: "vehicle",
                    })
                    .onConflictDoUpdate({
                      target: vehicles.samsaraID,
                      set: {
                        name: assetInfo.name ?? "unnamed",
                        make: assetInfo.make,
                        model: assetInfo.model,
                        year: assetInfo.year,
                        licensePlate: assetInfo.licensePlate,
                        adaAccessible: assetInfo.name?.includes("ADA") ?? false,
                      },
                    })
                    .returning();
                } else {
                  [vehicle] = await getDB()
                    .insert(vehicles)
                    .values({
                      samsaraID: vehicleID,
                      name: assetInfo.name ?? "unnamed",
                      licensePlate: assetInfo.licensePlate,
                      adaAccessible: assetInfo.name?.includes("ADA") ?? false,
                      type: "equipment",
                    })
                    .onConflictDoUpdate({
                      target: vehicles.samsaraID,
                      set: {
                        name: assetInfo.name ?? "unnamed",
                        licensePlate: assetInfo.licensePlate,
                        adaAccessible: assetInfo.name?.includes("ADA") ?? false,
                      },
                    })
                    .returning();
                }

                await this.sendVehicleInfo(userID, vehicle);
              }
            }
            if (stopState === "arrived") {
              await this.sendRouteUpdate(userID, "arrived");
              await getDB()
                .update(rides)
                .set({ actualPickupTime: stop.actualArrivalTime })
                .where(eq(rides.pickupStopID, stopID));
            }
            if (stopState === "departed") {
              await this.sendRouteUpdate(userID, "in progress");
            }
          }
        }

        if (stopType === "dropoff") {
          await setDropoffStopState(stopID, stopState);

          if (userID) {
            if (stopState === "arrived") {
              await this.sendRouteUpdate(userID, "dropped off");
              await getDB()
                .update(rides)
                .set({ actualDropoffTime: stop.actualArrivalTime })
                .where(eq(rides.dropoffStopID, stopID));
            }
            if (stopState === "departed") {
              // send feedback notification?
              if (this.streams.has(userID)) {
                const writer = this.streams.get(userID)!;
                await writer
                  .write(this.encoder.encode(`event: complete\n\n`))
                  .catch(() => {});
                writer.close().catch(() => {});
                this.streams.delete(userID);
              }
            }
          }
        }
      }
    }
  }

  async sendRouteUpdate(userID: string, rideState: InProgressRideState) {
    // send push notification (TODO)

    if (this.streams.has(userID)) {
      const writer = this.streams.get(userID)!;
      await writer
        .write(
          this.encoder.encode(`event: routeUpdate\ndata: ${rideState}\n\n`),
        )
        .catch(() => this.streams.delete(userID));
    }
  }

  vehicleInfoShort(vehicle: Vehicle) {
    let vehicleName: string;
    if (vehicle.type === "vehicle") {
      vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    } else {
      vehicleName = "Cart";
    }

    const vehicleInfo = {
      name: vehicleName,
      licensePlate: vehicle.licensePlate,
      adaAccessible: vehicle.adaAccessible,
    };

    return vehicleInfo;
  }

  async sendVehicleInfo(userID: string, vehicle: Vehicle) {
    const vehicleInfo = this.vehicleInfoShort(vehicle);

    // send push notification (TODO)

    if (this.streams.has(userID)) {
      const writer = this.streams.get(userID)!;
      await writer.write(
        this.encoder.encode(
          `event: vehicleInfo\ndata: ${JSON.stringify(vehicleInfo)}`,
        ),
      );
    }
  }

  async pollLocations(): Promise<Samsara.VehicleLocationsListResponse> {
    const result = await getVehicleLocations();
    return result;
  }

  async pollRouteUpdates(): Promise<Samsara.RoutesGetRoutesFeedResponseBody> {
    const endCursor = await this.ctx.storage.get<string>(
      "routeUpdatesEndCursor",
    );
    const result = await getRouteUpdates(endCursor);
    await this.ctx.storage.put(
      "routeUpdatesEndCursor",
      result.pagination.endCursor,
    );
    return result;
  }
}
