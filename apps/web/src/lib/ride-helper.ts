import { and, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { getDB } from "./db";
import { rides, Ride } from "./db/schema/rides";
import { Samsara } from "@samsarahq/samsara";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import { vehicles } from "./db/schema/vehicles";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const getActiveRides = async () => {
  const results = await getDB()
    .select()
    .from(rides)
    .where(
      and(
        inArray(rides.pickupStopState, [
          "unassigned",
          "scheduled",
          "en route",
          "arrived",
          "departed",
        ]),
        notInArray(rides.dropoffStopState, ["skipped", "departed"]),
        isNull(rides.cancelledTime),
        eq(rides.missedPickup, false),
      ),
    );

  return results;
};

const getActiveRideByUserID = async (userID: string) => {
  const ride = await getDB()
    .select()
    .from(rides)
    .where(
      and(
        eq(rides.userID, userID),
        inArray(rides.pickupStopState, [
          "unassigned",
          "scheduled",
          "en route",
          "arrived",
          "departed",
        ]),
        notInArray(rides.dropoffStopState, ["skipped", "departed"]),
        isNull(rides.cancelledTime),
        eq(rides.missedPickup, false),
      ),
    )
    .leftJoin(vehicles, eq(rides.vehicleID, vehicles.samsaraID))
    .then(([res]) => ({ ...res.rides, vehicle: res.vehicles }));

  return ride;
};

const setPickupStopState = async (
  stopID: string,
  stopState: Samsara.MinimalRouteStopAuditLogsResponseBody.State,
) => {
  await getDB()
    .update(rides)
    .set({ pickupStopState: stopState })
    .where(eq(rides.pickupStopID, stopID));
};

const setDropoffStopState = async (
  stopID: string,
  stopState: Samsara.MinimalRouteStopAuditLogsResponseBody.State,
) => {
  await getDB()
    .update(rides)
    .set({ dropoffStopState: stopState })
    .where(eq(rides.dropoffStopID, stopID));
};

const getInProgressRideStateFromRide = (
  ride: typeof Ride,
): InProgressRideState => {
  if (ride.dropoffStopState === "arrived") {
    return "dropped off";
  } else {
    switch (ride.pickupStopState) {
      case "departed":
        return "in progress";
      case "arrived":
        return "arrived";
      case "en route":
        return "en route";
      case "scheduled":
        return "assigned";
      default:
        return "received";
    }
  }
};

export const getDOStub = () => {
  const { env } = getCloudflareContext();
  const doID = env.RIDE_INFO_STREAM.idFromName("global");
  const stub = env.RIDE_INFO_STREAM.get(doID);
  return stub;
};

export {
  getActiveRides,
  getActiveRideByUserID,
  setPickupStopState,
  setDropoffStopState,
  getInProgressRideStateFromRide,
};
