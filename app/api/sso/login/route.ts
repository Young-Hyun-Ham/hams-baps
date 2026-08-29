import { handleSsoLogin } from "@hams-fam/sso-client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
    const ssoUrl = new URL(process.env.HAMS_OAUTH_SERVER_URL ?? "");

    if (
      appUrl.origin === ssoUrl.origin ||
      ssoUrl.origin === request.nextUrl.origin
    ) {
      throw new Error("The service URL and SSO server URL are misconfigured.");
    }

    return handleSsoLogin(request);
  } catch (error) {
    console.error("SSO login configuration error:", error);

    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", "sso_configuration");
    errorUrl.searchParams.set(
      "returnTo",
      request.nextUrl.searchParams.get("returnTo") ?? "/main",
    );
    return NextResponse.redirect(errorUrl);
  }
}
