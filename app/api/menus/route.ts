// app/api/menus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSsoUserFromRequest } from "@hams-fam/sso-client";
import { getMenusByBackend } from "@/lib/services";

export async function GET(req: NextRequest) {
  const backend = (process.env.NEXT_PUBLIC_BACKEND as "postgres" | "firebase" | undefined) ?? "firebase";
  const user = getSsoUserFromRequest(req);
  const adminAccounts = (process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ?? "")
    .split(/[\s,]+/)
    .map((value) => value.replace(/[\[\]'\"]/g, "").trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = user ? adminAccounts.includes(user.email.toLowerCase()) : false;

  const items = await getMenusByBackend(backend);

  const filteredItems = items.filter((item) => {
    const menuId = String(item.menu_id ?? "").toLowerCase();
    const href = String(item.href ?? "").toLowerCase();
    const isAdminMenu = menuId === "admin" || href.startsWith("/admin");
    const isChatbotMenu =
      menuId === "chat" ||
      menuId === "chatbot" ||
      href === "chat" ||
      href === "/chatbot" ||
      href.startsWith("/chatbot/");

    if (isAdminMenu && !isAdmin) return false;
    if (isChatbotMenu && user?.aiEnabled !== true) return false;
    return true;
  });

  return NextResponse.json({ items: filteredItems });
}
