import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDB } from "./db";
import { rides } from "./db/schema/rides";

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
        ]),
        isNull(rides.cancelledTime),
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
        ]),
        isNull(rides.cancelledTime),
      ),
    )
    .then((res) => res.at(0) ?? null);

  return ride;
};

export { getActiveRides, getActiveRideByUserID };
