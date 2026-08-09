import { DurableObject } from "cloudflare:workers";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import VehicleInfoShort from "@sure-walk/utils/types/vehicle-info-short";
import { Samsara } from "@samsarahq/samsara";
import {
  fetchCurrentRoutes,
  getAsset,
  getFormSubmission,
  getRouteUpdates,
  getVehicleFromDriver,
  getAssetLocations,
  missRide,
  getVehicleLocations,
} from "./samsara-utils";
import {
  getActiveRides,
  setDropoffStopState,
  setPickupStopState,
} from "./ride-helper";
import { Ride, rides } from "../db/schema/rides";
import { getDBInWorker } from "../db";
import { eq } from "drizzle-orm";
import { Vehicle, vehicles } from "../db/schema/vehicles";
import { User, users } from "../db/schema/users";

export class RideInfoStream extends DurableObject<CloudflareEnv> {
  streams: Map<string, WebSocket[]>;

  constructor(state: DurableObjectState, env: CloudflareEnv) {
    super(state, env);
    this.streams = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const currentRide = JSON.parse(
      request.headers.get("x-current-ride") ?? "",
    ) as Ride & {
      user: User;
      vehicle: Vehicle | null;
      rideState: InProgressRideState;
    };
    const pickupLocationID = currentRide.pickupLocationID;
    const dropoffLocationID = currentRide.dropoffLocationID;
    const groupRide = currentRide.members;
    const rideState = currentRide.rideState;
    const shareCode = currentRide.shareCode ?? undefined;
    const vehicleInfo = currentRide.vehicle;
    const leader = currentRide.user;

    const websocketPair = new WebSocketPair();
    const [client, server] = Object.values(websocketPair);

    server.accept();
    this.streams.set(currentRide.id, [
      ...(this.streams.get(currentRide.id) ?? []),
      server,
    ]);

    server.addEventListener("close", () => {
      server.close(1000, "Closing normally.");
      this.deleteSocket(server, currentRide.id);
    });

    server.addEventListener("error", (error) => {
      console.log(error);
      server.close(4000, "Disconnected.");
      this.deleteSocket(server, currentRide.id);
    });

    setTimeout(() => {
      this.sendEvent(
        "connected",
        {
          rideState,
          pickupLocationID,
          dropoffLocationID,
          groupRide,
          shareCode,
          leader,
        },
        currentRide.id,
      );
      if (vehicleInfo) {
        this.sendEvent(
          "vehicleInfo",
          this.vehicleInfoShort(vehicleInfo),
          currentRide.id,
        );
      }
    }, 1000);

    const currentAlarm = await this.ctx.storage.getAlarm();
    if (currentAlarm === null) {
      this.ctx.storage.setAlarm(Date.now() + 5000);
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  deleteSocket(ws: WebSocket, rideID: string) {
    const currConnections = this.streams.get(rideID);
    this.streams.set(
      rideID,
      currConnections?.filter((val) => val !== ws) ?? [],
    );
  }

  sendEvent(eventType: string, data: object, rideID: string) {
    const payload = { data: data, eventType: eventType };
    this.streams.get(rideID)?.forEach((ws) => {
      ws.send(JSON.stringify(payload));
    });
  }

  async alarm() {
    await this.pollInfo();
  }

  async pollInfo() {
    const assignmentChanges = await this.pollAssignmentChanges();
    let activeRides = await getActiveRides(this.env);
    await this.streamAssignmentChanges(activeRides, assignmentChanges);

    let routeUpdates = await this.pollRouteUpdates();

    if (activeRides.length === 0 && routeUpdates.data.length === 0) {
      console.log(
        `Durable object spinning down at ${new Date().toLocaleTimeString()}`,
      );
      // durable object will be spun down
      return;
    }

    if (routeUpdates.data.length > 0) {
      await this.streamRouteUpdates(activeRides, routeUpdates);
      let hasNextPage = routeUpdates.pagination.hasNextPage;
      activeRides = await getActiveRides(this.env);
      while (hasNextPage) {
        await this.streamRouteUpdates(activeRides, routeUpdates);
        routeUpdates = await this.pollRouteUpdates();
        activeRides = await getActiveRides(this.env);
        hasNextPage = routeUpdates.pagination.hasNextPage;
      }
    }

    const assetLocations = await this.pollAssetLocations();
    const vehicleLocations = await this.pollVehicleLocations();
    await this.streamLocations(activeRides, assetLocations, vehicleLocations);

    const currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm) {
      this.ctx.storage.setAlarm(Date.now() + 5000);
    }
  }

  async streamAssignmentChanges(
    activeRides: Ride[],
    assignmentChanges: Samsara.RoutesFetchRoutesResponseBody,
  ) {
    for (const ride of activeRides) {
      if (ride.pickupStopState === "unassigned") {
        const route = (assignmentChanges.data ?? []).find(
          (route) => route.id === ride.samsaraID,
        );
        if (route?.vehicle || route?.driver) {
          await setPickupStopState(ride.pickupStopID, "scheduled", this.env);
          await setDropoffStopState(ride.dropoffStopID, "scheduled", this.env);
          await this.sendRouteUpdate(ride.id, "assigned");
        }
      }
    }
  }

  async streamLocations(
    activeRides: Ride[],
    assetLocations: Samsara.InlineResponse2002,
    vehicleLocations: Samsara.VehicleLocationsListResponse,
  ) {
    for (const ride of activeRides) {
      if (
        ride.vehicleID &&
        ride.pickupStopState !== "scheduled" &&
        (this.streams.get(ride.id) ?? []).length !== 0
      ) {
        const assetData = assetLocations.assets?.find(
          (vehicle) => vehicle.id + "" === ride.vehicleID,
        );
        if (assetData && assetData.location) {
          this.sendEvent("vehicleLocation", assetData.location[0], ride.id);
          continue;
        }

        const vehicleData = vehicleLocations.data.find(
          (vehicle) => vehicle.id === ride.vehicleID,
        );
        if (vehicleData && vehicleData.locations) {
          this.sendEvent("vehicleLocation", vehicleData.locations[0], ride.id);
        }
      }
    }
  }

  async streamRouteUpdates(
    activeRides: Ride[],
    routeUpdates: Samsara.RoutesGetRoutesFeedResponseBody,
  ) {
    for (const ride of routeUpdates.data) {
      for (const stop of ride.changes.after.stops ?? []) {
        const stopID = stop.id;
        const stopState = stop.state!;
        const stopType =
          ride.route.stops?.at(0)?.id === stopID ? "pickup" : "dropoff";
        const activeRide = activeRides.find(
          ({ samsaraID }) => samsaraID === ride.route.id,
        );
        const rideID = activeRide?.id;
        if (stopType === "pickup") {
          await setPickupStopState(stopID, stopState, this.env);

          if (rideID) {
            if (stopState === "scheduled") {
              // already done in streamAssignmentChanges
              // await this.sendRouteUpdate(rideID, "assigned");
            }
            if (stopState === "en route") {
              await this.sendRouteUpdate(rideID, "en route");

              // get vehicle info
              let vehicleID = ride.route.vehicle?.id;
              const driverID = ride.route.driver?.id;
              if (driverID) {
                const vehicleAssignment = await getVehicleFromDriver(driverID);
                if (vehicleAssignment.data.length > 0) {
                  vehicleID = vehicleAssignment.data[0].vehicle.id;
                }
              }
              if (vehicleID) {
                const asset = await getAsset(vehicleID);
                const assetInfo = asset.data[0];
                let vehicle: Vehicle;
                if (assetInfo.type === "vehicle") {
                  [vehicle] = await getDBInWorker(this.env)
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
                  [vehicle] = await getDBInWorker(this.env)
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

                await getDBInWorker(this.env)
                  .update(rides)
                  .set({ vehicleID: vehicleID })
                  .where(eq(rides.samsaraID, ride.route.id));

                await this.sendVehicleInfo(rideID, vehicle);
              }
            }
            if (stopState === "arrived") {
              await this.sendRouteUpdate(rideID, "arrived");
              await getDBInWorker(this.env)
                .update(rides)
                .set({ actualPickupTime: stop.actualArrivalTime })
                .where(eq(rides.pickupStopID, stopID));
            }
            if (stopState === "departed") {
              const formObject = ride.route.stops![0].forms;
              let numPickedUp: number | undefined = 1;
              if (formObject) {
                const submissionID = formObject![0].id;
                const form = await getFormSubmission(submissionID);
                if (form.data[0].status === "completed") {
                  numPickedUp = form.data[0].fields[0].numberValue?.value;
                }
              }
              if (numPickedUp === undefined) {
                numPickedUp = 1;
              }
              if (numPickedUp < 1) {
                await getDBInWorker(this.env)
                  .update(rides)
                  .set({ shareCode: null, numPickedUp })
                  .where(eq(rides.id, rideID));

                const [user] = await getDBInWorker(this.env)
                  .select()
                  .from(users)
                  .where(eq(users.id, activeRide.userID));
                await missRide(activeRide, user);
                this.streams
                  .get(rideID)
                  ?.forEach((ws) => ws.close(1000, "Missed pickup."));
                this.streams.delete(rideID);
              } else {
                await getDBInWorker(this.env)
                  .update(rides)
                  .set({ numPickedUp })
                  .where(eq(rides.id, rideID));
                await this.sendRouteUpdate(rideID, "in progress");
              }
            }
          }
        }

        if (stopType === "dropoff") {
          await setDropoffStopState(stopID, stopState, this.env);

          if (rideID) {
            if (stopState === "arrived") {
              await this.sendRouteUpdate(rideID, "dropped off");
              await getDBInWorker(this.env)
                .update(rides)
                .set({ actualDropoffTime: stop.actualArrivalTime })
                .where(eq(rides.dropoffStopID, stopID));
            }
            if (stopState === "departed") {
              // send feedback notification?
              await getDBInWorker(this.env)
                .update(rides)
                .set({ shareCode: null })
                .where(eq(rides.dropoffStopID, stopID));
              this.streams
                .get(rideID)
                ?.forEach((ws) => ws.close(1000, `Complete: ${rideID}`));
              this.streams.delete(rideID);
            }
          }

          if (stopState === "skipped") {
            await getDBInWorker(this.env)
              .update(rides)
              .set({ shareCode: null })
              .where(eq(rides.dropoffStopID, stopID));
          }
        }
      }
    }
  }

  async sendRouteUpdate(rideID: string, rideState: InProgressRideState) {
    // send push notification (TODO)

    this.sendEvent("routeUpdate", { rideState }, rideID);
  }

  vehicleInfoShort(vehicle: Vehicle): VehicleInfoShort {
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

  async sendVehicleInfo(rideID: string, vehicle: Vehicle) {
    const vehicleInfo = this.vehicleInfoShort(vehicle);

    // send push notification (TODO)

    this.sendEvent("vehicleInfo", vehicleInfo, rideID);
  }

  async pollAssetLocations(): Promise<Samsara.InlineResponse2002> {
    const result = await getAssetLocations();
    return result;
  }

  async pollVehicleLocations(): Promise<Samsara.VehicleLocationsListResponse> {
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

  async pollAssignmentChanges(): Promise<Samsara.RoutesFetchRoutesResponseBody> {
    const result = await fetchCurrentRoutes();
    return result;
  }

  async afterCancelRide(rideID: string): Promise<void> {
    this.streams
      .get(rideID)
      ?.forEach((ws) => ws.close(1000, "Ride cancelled."));
    this.streams.delete(rideID);
  }
}
