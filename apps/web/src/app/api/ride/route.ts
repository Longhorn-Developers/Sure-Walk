import { ensureAuthenticated } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { locations } from "@/lib/db/schema/locations";
import { users } from "@/lib/db/schema/users";
import {
  getActiveRideByUserID,
  getInProgressRideStateFromRide,
} from "@/lib/ride-info-stream/ride-helper";
import { createRoute } from "@/lib/ride-info-stream/samsara-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import CurrentRideMini from "@sure-walk/utils/types/current-ride-mini";
import z from "zod";

const groupRideMember = z.object({
  firstName: z
    .string()
    .min(1, "First name must be at least 1 character.")
    .max(30, "First name must be at most 30 characters."),
  lastName: z
    .string()
    .min(1, "Last name must be at least 1 character.")
    .max(30, "Last name must be at most 30 characters."),
  eid: z.string().min(4, "EID must be at least 4 characters.").optional(),
  userType: z.enum(["ut-affiliated", "guest"]),
});

const partialRide = z.object({
  pickupLocation: z.int(),
  dropoffLocation: z.int(),
  groupRide: z.array(groupRideMember),
});

export async function POST(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const data = await request.json();
  const validationResult = partialRide.safeParse(data);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Invalid request body.",
        errors: validationResult.error.issues,
      },
      { status: 400 },
    );
  }

  const { pickupLocation, dropoffLocation, groupRide } = validationResult.data;

  const [pickupLocationInfo] = await getDB()
    .select()
    .from(locations)
    .where(and(eq(locations.id, pickupLocation), eq(locations.type, "pickup")));

  if (!pickupLocationInfo) {
    return NextResponse.json(
      {
        message: "Invalid pickup location.",
      },
      { status: 400 },
    );
  }

  const [dropoffLocationInfo] = await getDB()
    .select()
    .from(locations)
    .where(and(eq(locations.id, dropoffLocation)));

  if (
    !dropoffLocationInfo ||
    pickupLocationInfo.id === dropoffLocationInfo.id
  ) {
    return NextResponse.json(
      {
        message: "Invalid dropoff location.",
      },
      { status: 400 },
    );
  }

  const accountID = authResponse.accountID!;
  const user = (await getDB()
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountID))
    .leftJoin(users, eq(accounts.userID, users.id))
    .then(([result]) => result.users))!;

  const { env } = getCloudflareContext();
  const currentRide = await getActiveRideByUserID(user.id, env);
  if (currentRide) {
    return NextResponse.json(
      {
        message: "User currently has an active ride.",
      },
      { status: 400 },
    );
  }

  await createRoute({
    user,
    members: groupRide,
    pickupLocation: pickupLocationInfo,
    dropoffLocation: dropoffLocationInfo,
  });

  return NextResponse.json(
    { message: "Ride successfully created." },
    { status: 200 },
  );
}

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

  const { env } = getCloudflareContext();
  const currentRide = await getActiveRideByUserID(user.id, env);
  if (!currentRide) {
    return new NextResponse(null, { status: 204 });
  }

  const currentRideMini: CurrentRideMini = {
    pickupLocationID: currentRide.pickupLocationID,
    dropoffLocationID: currentRide.dropoffLocationID,
    rideState: getInProgressRideStateFromRide(currentRide),
    groupRide: currentRide.members,
  };

  return NextResponse.json(currentRideMini, { status: 200 });
}
