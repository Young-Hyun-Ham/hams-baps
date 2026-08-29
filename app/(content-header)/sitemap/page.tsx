"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  LayoutGrid,
  Map as MapIcon,
  Search,
  ShieldCheck,
} from "lucide-react";

import { AdminTree, MenuItem, SitemapTree } from "./components/SitemapTree";

export default function SitemapPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/sitemap", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as { items?: MenuItem[] };
        setItems(data.items ?? []);
      } catch (loadError) {
        console.error("Failed to load sitemap menus:", loadError);
        setError("메뉴 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    void loadMenus();
  }, []);

  const summary = useMemo(() => {
    const rootCount = items.filter(
      (item) => item.lev === 1 && item.menu_id.toLowerCase() !== "admin",
    ).length;
    const hasAdmin = items.some(
      (item) => item.menu_id.toLowerCase() === "admin",
    );

    return { rootCount, hasAdmin };
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-1 py-2 sm:px-2">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
            <MapIcon size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-950">
                사이트맵
              </h1>
              {!loading ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {summary.rootCount}개 메뉴
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              원하는 메뉴를 검색하거나 바로 이동할 수 있습니다.
            </p>
          </div>
        </div>

        <label className="relative block w-full sm:w-72">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <span className="sr-only">메뉴 검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="메뉴명 또는 주소 검색"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </header>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="사이트맵 불러오는 중">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[74px] animate-pulse rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-xl bg-slate-100" />
                <span className="h-3 w-28 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error && !loading ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-5">
          <section aria-labelledby="general-menu-heading">
            <div className="mb-3 flex items-center gap-2 px-1">
              <LayoutGrid size={16} className="text-blue-600" aria-hidden="true" />
              <h2 id="general-menu-heading" className="text-sm font-bold text-slate-800">
                일반 메뉴
              </h2>
              <span className="text-xs text-slate-400">서비스 바로가기</span>
            </div>
            <SitemapTree items={items} query={query} />
          </section>

          {summary.hasAdmin ? (
            <section aria-labelledby="admin-menu-heading">
              <button
                type="button"
                onClick={() => setShowAdmin((current) => !current)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
                aria-expanded={showAdmin}
              >
                <span className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-700">
                  <ShieldCheck size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span id="admin-menu-heading" className="block text-sm font-bold text-slate-800">
                    관리자 메뉴 구조
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    하위 메뉴를 단계별로 확인합니다.
                  </span>
                </span>
                <ChevronDown
                  size={17}
                  className={`text-slate-400 transition-transform ${showAdmin ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {showAdmin ? (
                <div className="mt-3">
                  <AdminTree items={items} query={query} />
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
