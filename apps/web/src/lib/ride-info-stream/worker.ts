import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ensureAuthenticated } from "../auth";
import { getDBInWorker } from "../db";
import { accounts } from "../db/schema/accounts";
import { users } from "../db/schema/users";
import {
  getActiveRideByUserID,
  getInProgressRideStateFromRide,
} from "./ride-helper";

export async function apiRideEvents(request: Request, env: CloudflareEnv) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const accountID = authResponse.accountID!;
  const user = (await getDBInWorker(env)
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountID))
    .leftJoin(users, eq(accounts.userID, users.id))
    .then(([result]) => result.users))!;

  const currentRide = await getActiveRideByUserID(user.id, env);

  if (!currentRide) {
    return NextResponse.json(
      { message: "No active ride for this account." },
      { status: 400 },
    );
  }

  const rideState = getInProgressRideStateFromRide(currentRide);
  const vehicle = currentRide.vehicle;

  const forwardedHeaders = new Headers();
  forwardedHeaders.append("x-user-id", user.id);
  forwardedHeaders.append("x-ride-state", rideState);
  forwardedHeaders.append("x-vehicle-info", JSON.stringify(vehicle));

  const doID = env.RIDE_INFO_STREAM.idFromName("global");
  const stub = env.RIDE_INFO_STREAM.get(doID);

  return await stub.fetch(
    new Request(request.url, {
      method: request.method,
      body: request.body,
      headers: forwardedHeaders,
    }),
  );
}
