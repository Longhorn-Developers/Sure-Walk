import { ensureAuthenticated } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

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
