import { and, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { getDB } from "./db";
import { rides } from "./db/schema/rides";
import { Samsara } from "@samsarahq/samsara";

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
    .then((res) => res.shift());

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

export {
  getActiveRides,
  getActiveRideByUserID,
  setPickupStopState,
  setDropoffStopState,
};
