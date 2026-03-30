import { verifyAccessToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const authenticationHeader = request.headers.get("authorization") || "";
  const [scheme, token] = authenticationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { valid, expired, accountID } = verifyAccessToken(token);
  if (!valid) {
    return NextResponse.json(
      { message: expired ? "Token expired." : "Invalid token." },
      { status: 401 },
    );
  }

  const newHeaders = new Headers(request.headers);
  newHeaders.set("x-account-id", accountID!);
  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/me/:path*"],
};
