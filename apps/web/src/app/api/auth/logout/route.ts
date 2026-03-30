import { hashToken } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema/refresh-tokens";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const logoutFormat = z.object({
  refreshToken: z.string(),
});

export async function POST(request: NextRequest) {
  const data = await request.json();
  const validationResult = logoutFormat.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Invalid request body.",
        errors: validationResult.error.issues,
      },
      { status: 400 },
    );
  }

  const { refreshToken } = validationResult.data;
  await getDB()
    .delete(refreshTokens)
    .where(eq(refreshTokens.hash, hashToken(refreshToken)));

  return NextResponse.json({ message: "Logged out successfully." });
}
