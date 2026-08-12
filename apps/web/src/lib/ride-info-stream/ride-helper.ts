import { Samsara } from "@samsarahq/samsara";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import { and, eq, gt, isNull, notInArray, sql } from "drizzle-orm";

import { getDBInWorker } from "../db";
import { Ride, rides } from "../db/schema/rides";
import { users } from "../db/schema/users";
import { vehicles } from "../db/schema/vehicles";

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
        // since active rides will be at most a few hours long, only limit the
        // search on the rides table from the past day and a half
        // using the submittedAt index
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
    // when the dropoff stop state is skipped, this can mean many things:
    // (1) a cancelled / missed ride had its stop state updated after the tracking window
    // (2) the ride was already completed but it was never marked as arrived on the
    //     dropoff location so it is in an indeterminate state
    // (3) a driver will be picking up another user before going to this ride's
    //     dropoff location

    // in scenario (1), the return value won't matter since the ride won't even be active
    // in scenario (2), this would lead to this ride being active but in limbo but I would
    // imagine that this would be very unlikely
    // scenario (3) is the situation that matters most here: even though the driver is
    // concurrently doing another ride, we want this ride to still be viewed through the app
    // if we treat this ride like it is over like in scenarios 1 and 2, then the user might
    // think that their ride is over when it is not

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
  getActiveRideByShareCode,
  getActiveRideByUserID,
  getActiveRides,
  getInProgressRideStateFromRide,
  setDropoffStopState,
  setPickupStopState,
};
