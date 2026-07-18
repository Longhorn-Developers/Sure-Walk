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

export async function handleRideStream(request: Request, env: CloudflareEnv) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected upgrade: websocket", { status: 426 });
  }

  const newHeaders = new Headers(request.headers);
  newHeaders.append(
    "Authorization",
    request.headers.get("Sec-WebSocket-Protocol") ?? "",
  );
  const reqWithHeaders = new Request(request.url, {
    method: request.method,
    headers: newHeaders,
  });
  const authResponse = ensureAuthenticated(reqWithHeaders);
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
      { status: 404 },
    );
  }

  const rideState = getInProgressRideStateFromRide(currentRide);
  const rideFullInfo = { ...currentRide, rideState: rideState };

  const forwardedHeaders = new Headers(request.headers);
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
