// app/api/menus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSsoUserFromRequest } from "@hams-fam/sso-client";
import { getVisibleMenus } from "@/lib/menu-access";

export async function GET(req: NextRequest) {
  const user = getSsoUserFromRequest(req);
  const items = await getVisibleMenus(user);

  return NextResponse.json({ items });
}
