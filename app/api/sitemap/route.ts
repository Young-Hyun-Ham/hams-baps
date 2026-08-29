import { getSsoUserFromRequest } from "@hams-fam/sso-client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getVisibleMenus } from "@/lib/menu-access";
import { getSubMenusByBackend } from "@/lib/services";

export async function GET(request: NextRequest) {
  const backend =
    (process.env.NEXT_PUBLIC_BACKEND as
      | "postgres"
      | "firebase"
      | undefined) ?? "firebase";
  const user = getSsoUserFromRequest(request);
  const roots = await getVisibleMenus(user);
  const children = await Promise.all(
    roots.map((root) => getSubMenusByBackend(backend, root.menu_id)),
  );

  return NextResponse.json({ items: [...roots, ...children.flat()] });
}
