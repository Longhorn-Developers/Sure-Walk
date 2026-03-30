import { getDB } from "@/lib/db";
import { accounts } from "@/lib/db/schema/accounts";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accountID = request.headers.get("x-account-id")!;
  const user = await getDB()
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountID))
    .leftJoin(users, eq(accounts.userID, users.id))
    .then(([result]) => result.users);

  return NextResponse.json({ ...user! });
}
