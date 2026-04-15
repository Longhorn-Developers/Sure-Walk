import { ensureAuthenticated } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }
  const accountID = authResponse.accountID!;
  const user = await getDB()
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountID))
    .leftJoin(users, eq(accounts.userID, users.id))
    .then(([result]) => result.users);

  return NextResponse.json({ ...user! });
}

const updateMeFormat = z.object({
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  requiresAssistance: z.boolean(),
  eid: z.string().min(4).optional(),
});

export async function PATCH(request: NextRequest) {
  const authResponse = ensureAuthenticated(request);
  if (!authResponse.success) {
    return authResponse.failResponse!;
  }

  const accountID = authResponse.accountID!;
  const data = await request.json();
  const validationResult = updateMeFormat.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Invalid request body.",
        errors: validationResult.error.issues,
      },
      { status: 400 },
    );
  }

  const { firstName, lastName, requiresAssistance, eid } =
    validationResult.data;

  const [updatedUser] = await getDB()
    .update(users)
    .set({
      firstName,
      lastName,
      requiresAssistance,
      eid: eid ?? null,
    })
    .where(
      eq(
        users.id,
        await getDB()
          .select()
          .from(accounts)
          .where(eq(accounts.id, accountID))
          .then(([result]) => result.userID),
      ),
    )
    .returning();

  return NextResponse.json({ ...updatedUser });
}
