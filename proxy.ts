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
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isChatbotRoute =
    pathname.startsWith("/chatbot") || pathname.startsWith("/api/chatbot");

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json(
        { ok: false, error: "authentication_required" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isChatbotRoute && user.aiEnabled !== true) {
    if (isApiRoute) {
      return NextResponse.json(
        { ok: false, error: "ai_permission_required" },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/main", request.url));
  }

  if (isAdminRoute && !isConfiguredAdmin(user.email)) {
    if (isApiRoute) {
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
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/chatbot/:path*",
    "/api/chatbot/:path*",
  ],
};
