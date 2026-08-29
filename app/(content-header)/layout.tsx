// app/(content-header)/layout.tsx (서버컴포넌트)
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { getSsoUserFromRequest } from "@hams-fam/sso-client";

import type { NavItem } from '../../types/nav';
import HeaderNav from '../../components/HeaderNav';
import ContentLayout from "../../components/ContentLayout";
import { getVisibleMenus } from "@/lib/menu-access";

async function loadMenus(): Promise<NavItem[]> {
  try {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie");
    const request = new Request("http://hams-baps.internal/api/menus", {
      headers: cookie ? { cookie } : undefined,
    });
    const user = getSsoUserFromRequest(request);

    const menus = await getVisibleMenus(user);

    return menus.map((item) => ({
      id: String(item.id),
      label: String(item.label ?? ""),
      href: String(item.href ?? ""),
      order:
        typeof item.order === "number" ? item.order : Number(item.order ?? 0),
    }));
  } catch (error) {
    console.error("Failed to load header menus:", error);
    return [];
  }
}

export default async function MainSectionLayout({ children }: { children: ReactNode }) {
  const menus = await loadMenus();

  return (
    <ContentLayout
      scrollMode="page"
      header={<HeaderNav items={menus} />}
    >
      {children}
    </ContentLayout>
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
