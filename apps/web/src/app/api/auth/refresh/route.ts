import { rotateRefreshToken, verifyRefreshToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const refreshTokenFormat = z.object({
  refreshToken: z.string(),
});

export async function POST(request: NextRequest) {
  const data = await request.json();
  const validationResult = refreshTokenFormat.safeParse(data);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        message: "Invalid request body.",
        errors: validationResult.error.issues,
      },
      { status: 400 },
    );
  }

  const { refreshToken: oldRefreshToken } = validationResult.data;
  const res = await verifyRefreshToken(oldRefreshToken);
  if (!res) {
    return NextResponse.json(
      { message: "Invalid refresh token." },
      { status: 401 },
    );
  }
  const { refreshToken: refreshTokenData, account } = res;
  const { accessToken, refreshToken } = await rotateRefreshToken(
    refreshTokenData.jti,
    account!,
  );
  return NextResponse.json({ accessToken, refreshToken });
}
