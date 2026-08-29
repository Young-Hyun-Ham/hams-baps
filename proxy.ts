import { getSsoUserFromRequest } from "@hams-fam/sso-client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isConfiguredAdmin(email: string) {
  const configured = process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ?? "";
  return configured
    .split(/[\s,]+/)
    .map((value) => value.replace(/[\[\]'\"]/g, "").trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export function proxy(request: NextRequest) {
  const user = getSsoUserFromRequest(request);

  if (!user) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "authentication_required" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!isConfiguredAdmin(user.email)) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, error: "admin_permission_required" },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/main", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
