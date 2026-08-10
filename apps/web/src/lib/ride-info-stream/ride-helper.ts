import { and, eq, isNull, notInArray, sql, gt } from "drizzle-orm";
import { getDBInWorker } from "../db";
import { rides, Ride } from "../db/schema/rides";
import { Samsara } from "@samsarahq/samsara";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import { vehicles } from "../db/schema/vehicles";
import { users } from "../db/schema/users";

const getActiveRides = async (env: CloudflareEnv) => {
  const results = await getDBInWorker(env)
    .select()
    .from(rides)
    .where(
      and(
        notInArray(rides.pickupStopState, ["skipped"]),
        notInArray(rides.dropoffStopState, ["departed"]),
        isNull(rides.cancelledTime),
        sql`${rides.numPickedUp} IS NOT 0`,
        gt(rides.submittedAt, new Date(Date.now() - 1000 * 60 * 60 * 36)),
      ),
    );

  return results;
};

const getActiveRideByUserID = async (userID: string, env: CloudflareEnv) => {
  const ride = await getDBInWorker(env)
    .select()
    .from(rides)
    .where(
      and(
        eq(rides.userID, userID),
        notInArray(rides.pickupStopState, ["skipped"]),
        notInArray(rides.dropoffStopState, ["departed"]),
        isNull(rides.cancelledTime),
        sql`${rides.numPickedUp} IS NOT 0`,
        gt(rides.submittedAt, new Date(Date.now() - 1000 * 60 * 60 * 36)),
      ),
    )
    .leftJoin(vehicles, eq(rides.vehicleID, vehicles.samsaraID))
    .leftJoin(users, eq(rides.userID, users.id))
    .then(([res]) => {
      if (res) {
        return { ...res.rides, vehicle: res.vehicles, user: res.users };
      } else {
        return undefined;
      }
    });

  return ride;
};

const getActiveRideByShareCode = async (
  shareCode: string,
  env: CloudflareEnv,
) => {
  const ride = await getDBInWorker(env)
    .select()
    .from(rides)
    .where(
      and(
        eq(rides.shareCode, shareCode),
        notInArray(rides.pickupStopState, ["skipped"]),
        notInArray(rides.dropoffStopState, ["departed"]),
        isNull(rides.cancelledTime),
        sql`${rides.numPickedUp} IS NOT 0`,
        gt(rides.submittedAt, new Date(Date.now() - 1000 * 60 * 60 * 36)),
      ),
    )
    .leftJoin(vehicles, eq(rides.vehicleID, vehicles.samsaraID))
    .leftJoin(users, eq(rides.userID, users.id))
    .then(([res]) => {
      if (res) {
        return { ...res.rides, vehicle: res.vehicles, user: res.users };
      } else {
        return undefined;
      }
    });

  return ride;
};

const setPickupStopState = async (
  stopID: string,
  stopState: Samsara.MinimalRouteStopAuditLogsResponseBody.State,
  env: CloudflareEnv,
) => {
  await getDBInWorker(env)
    .update(rides)
    .set({ pickupStopState: stopState })
    .where(eq(rides.pickupStopID, stopID));
};

const setDropoffStopState = async (
  stopID: string,
  stopState: Samsara.MinimalRouteStopAuditLogsResponseBody.State,
  env: CloudflareEnv,
) => {
  await getDBInWorker(env)
    .update(rides)
    .set({ dropoffStopState: stopState })
    .where(eq(rides.dropoffStopID, stopID));
};

const getInProgressRideStateFromRide = (ride: Ride): InProgressRideState => {
  if (ride.dropoffStopState === "arrived") {
    return "dropped off";
  } else if (ride.dropoffStopState === "skipped") {
    return "in progress";
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

export {
  getActiveRides,
  getActiveRideByUserID,
  getActiveRideByShareCode,
  setPickupStopState,
  setDropoffStopState,
  getInProgressRideStateFromRide,
};
