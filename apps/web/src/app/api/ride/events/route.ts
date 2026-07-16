import { ensureAuthenticated } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { users } from "@/lib/db/schema/users";
import {
  getActiveRideByUserID,
  getDOStub,
  getInProgressRideStateFromRide,
} from "@/lib/ride-helper";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const accountID = authResponse.accountID!;
  const user = (await getDB()
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountID))
    .leftJoin(users, eq(accounts.userID, users.id))
    .then(([result]) => result.users))!;

  const currentRide = await getActiveRideByUserID(user.id);

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

  const stub = getDOStub();

  return await stub.fetch(
    new Request(request.url, {
      method: request.method,
      body: request.body,
      headers: forwardedHeaders,
    }),
  );
}
