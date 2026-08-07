import { ensureAuthenticated } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { feedback } from "@/lib/db/schema/feedback";
import { rides } from "@/lib/db/schema/rides";
import { User, users } from "@/lib/db/schema/users";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const canProvideFeedback = async (user: User, rideID: string) => {
  const [existingFeedback] = await getDB()
    .select()
    .from(feedback)
    .where(and(eq(feedback.userID, user.id), eq(feedback.rideID, rideID)));

  if (existingFeedback) {
    return NextResponse.json(
      {
        message: "Feedback already provided.",
      },
      { status: 403 },
    );
  }

  const [ride] = await getDB().select().from(rides).where(eq(rides.id, rideID));

  if (!ride) {
    return NextResponse.json(
      {
        message: "Ride not found.",
      },
      { status: 404 },
    );
  }

  if (
    ride.userID != user.id &&
    ride.members.find(
      (m) => m.phoneNumber === user.phoneNumber || m.eid === user.eid,
    ) === undefined
  ) {
    return NextResponse.json(
      {
        message:
          "You were not a part of this ride. If this is in error, this can happen due to an incorrect EID or phone number submitted by the leader if you are a group ride member.",
      },
      { status: 403 },
    );
  }

  return ride;
};

export async function GET(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const rideID = new URL(request.url).searchParams.get("rideID");
  if (!rideID) {
    return NextResponse.json(
      {
        message: "Ride ID required.",
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

  const allowed = await canProvideFeedback(user, rideID);
  if (allowed instanceof NextResponse) {
    return allowed;
  }

  return NextResponse.json(
    {
      submittedAt: allowed.submittedAt,
      pickupLocationID: allowed.pickupLocationID,
      dropoffLocationID: allowed.dropoffLocationID,
    },
    { status: 200 },
  );
}

const feedbackBody = z.object({
  rideID: z.string(),
  howLikely: z.int().min(1).max(5),
  extraFeedback: z.string().min(5).max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const data = await request.json();
  const validationResult = feedbackBody.safeParse(data);

  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Invalid body.",
      },
      { status: 400 },
    );
  }

  const { rideID, howLikely, extraFeedback } = validationResult.data;

  const accountID = authResponse.accountID!;
  const user = (await getDB()
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountID))
    .leftJoin(users, eq(accounts.userID, users.id))
    .then(([result]) => result.users))!;

  const allowed = await canProvideFeedback(user, rideID);
  if (allowed instanceof NextResponse) {
    return allowed;
  }

  await getDB().insert(feedback).values({
    rideID,
    howLikely,
    extraFeedback,
    userID: user.id,
  });

  return new NextResponse(null, { status: 204 });
}
