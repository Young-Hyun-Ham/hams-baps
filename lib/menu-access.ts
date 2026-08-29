import type { SsoSessionUser } from "@hams-fam/sso-client";

import { getMenusByBackend } from "@/lib/services";

function getAdminAccounts() {
  return (process.env.NEXT_PUBLIC_ADMIN_ACCOUNT ?? "")
    .split(/[\s,]+/)
    .map((value) => value.replace(/[\[\]'\"]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

export async function getVisibleMenus(user: SsoSessionUser | null) {
  const backend =
    (process.env.NEXT_PUBLIC_BACKEND as
      | "postgres"
      | "firebase"
      | undefined) ?? "firebase";
  const isAdmin = user
    ? getAdminAccounts().includes(user.email.toLowerCase())
    : false;
  const items = await getMenusByBackend(backend);

  return items.filter((item) => {
    const menuId = String(item.menu_id ?? "").toLowerCase();
    const href = String(item.href ?? "").toLowerCase();
    const isAdminMenu =
      menuId === "admin" ||
      href.startsWith("/admin") ||
      href === "/builder" ||
      href.startsWith("/builder/");
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
}
