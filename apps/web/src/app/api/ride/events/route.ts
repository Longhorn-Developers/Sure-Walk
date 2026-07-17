import { ensureAuthenticated } from "@/lib/auth";
import { getDBInWorker } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { users } from "@/lib/db/schema/users";
import {
  getActiveRideByUserID,
  getInProgressRideStateFromRide,
} from "@/lib/ride-info-stream/ride-helper";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const { env } = getCloudflareContext();
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
  const rideFullInfo = { ...currentRide, rideState: rideState };

  const forwardedHeaders = new Headers();
  forwardedHeaders.append("x-current-ride", JSON.stringify(rideFullInfo));

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
