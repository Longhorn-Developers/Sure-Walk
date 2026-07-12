import { DurableObject } from "cloudflare:workers";
import { NextResponse } from "next/server";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import { Samsara } from "@samsarahq/samsara";
import { getVehicleLocations } from "./samsara-utils";
import { getActiveRides } from "../ride-helper";

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
        `retry: 10000\nevent: connected\ndata: {"rideState": "${rideState}"}\n\n`,
      ),
    );

    return new Response(readable, { headers: responseHeaders });
  }

  async alarm() {
    await this.pollInfo();
  }

  async pollInfo() {
    const vehicleLocations = await this.pollLocations();
    const activeRides = await getActiveRides();

    if (activeRides.length === 0) {
      // durable object will be spun down
      return;
    }

    for (const ride of activeRides) {
      // stream locations
      if (
        ride.vehicleID &&
        ride.pickupStopState !== "assigned" &&
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

      // stream ride state (TODO)
    }

    const currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm) {
      await this.ctx.storage.setAlarm(Date.now() + 5000);
    }
  }

  async pollLocations(): Promise<Samsara.VehicleLocationsListResponse> {
    const result = await getVehicleLocations();
    return result;
  }
}
