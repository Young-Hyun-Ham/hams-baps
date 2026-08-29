"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { useStore } from "@/store";
import UserAccountMenu from "@/components/UserAccountMenu";

type ContentProps = {
  header?: React.ReactNode;
  children: React.ReactNode;
  scrollMode?: "layout" | "page";
};

export default function ConnectLayout({ header, children }: ContentProps) {
  const pathname = usePathname();
  const authChecked = useStore((s: any) => s.authChecked);

  const isPageScroll = useMemo(() => {
    if (!pathname) return false;

    return (
      pathname === "/board" ||
      pathname.startsWith("/board/") ||
      pathname === "/ai-chat" ||
      pathname.startsWith("/ai-chat/") ||
      pathname === "/link"
    );
  }, [pathname]);

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900 flex flex-col overflow-hidden">
      <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          {header}
          <UserAccountMenu />
        </div>
      </header>

      <div className="flex flex-1 min-h-0 w-full relative overflow-hidden">
        <main
          className={[
            "relative flex-1 min-w-0 bg-gray-50",
            isPageScroll ? "overflow-hidden" : "overflow-y-auto",
          ].join(" ")}
        >
          <div className={isPageScroll ? "h-full min-h-0 p-6 overflow-hidden" : "p-6"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
