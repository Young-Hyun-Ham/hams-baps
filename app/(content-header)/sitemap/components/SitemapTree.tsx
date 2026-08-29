"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Folder,
} from "lucide-react";

export type MenuItem = {
  id?: string;
  menu_id: string;
  label: string;
  href: string | null;
  order: number | null;
  lev: number;
  up_id: string | null;
};

type SitemapNode = MenuItem & {
  children: SitemapNode[];
};

type Props = {
  items: MenuItem[];
  query?: string;
};

const accents = [
  "bg-blue-50 text-blue-700 ring-blue-100",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-violet-50 text-violet-700 ring-violet-100",
  "bg-orange-50 text-orange-700 ring-orange-100",
  "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "bg-rose-50 text-rose-700 ring-rose-100",
];

function getAccent(menuId: string) {
  const index = Math.abs(
    [...menuId].reduce((sum, character) => sum + character.charCodeAt(0), 0),
  );
  return accents[index % accents.length];
}

function getInitial(label: string, menuId: string) {
  return (label || menuId || "?").trim().slice(0, 1).toUpperCase();
}

function buildTree(items: MenuItem[]): SitemapNode[] {
  const byId = new Map<string, SitemapNode>();
  const byMenuId = new Map<string, SitemapNode>();
  const nodes = items.map<SitemapNode>((item) => ({ ...item, children: [] }));
  const roots: SitemapNode[] = [];

  nodes.forEach((node) => {
    if (node.id) byId.set(String(node.id), node);
    byMenuId.set(node.menu_id, node);
  });

  nodes.forEach((node) => {
    const parent = node.up_id
      ? byId.get(String(node.up_id)) || byMenuId.get(node.up_id)
      : undefined;

    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const sortNodes = (list: SitemapNode[]) => {
    list.sort((a, b) => {
      const orderDifference = (a.order ?? 999) - (b.order ?? 999);
      return orderDifference || a.label.localeCompare(b.label, "ko");
    });
    list.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
}

function filterTree(nodes: SitemapNode[], query: string): SitemapNode[] {
  const keyword = query.trim().toLocaleLowerCase("ko");
  if (!keyword) return nodes;

  return nodes.flatMap((node) => {
    const isMatch = `${node.label} ${node.menu_id} ${node.href ?? ""}`
      .toLocaleLowerCase("ko")
      .includes(keyword);
    const filteredChildren = filterTree(node.children, query);

    if (isMatch) return [node];
    if (filteredChildren.length) return [{ ...node, children: filteredChildren }];
    return [];
  });
}

function countDescendants(node: SitemapNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0,
  );
}

function ChildMenu({ node }: { node: SitemapNode }) {
  const childCount = countDescendants(node);
  const content = (
    <>
      <CornerDownRight size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{node.label}</span>
      {childCount > 0 ? (
        <span className="shrink-0 text-[10px] text-slate-400">+{childCount}</span>
      ) : null}
      {node.href ? (
        <ArrowUpRight size={12} className="shrink-0 text-slate-400" aria-hidden="true" />
      ) : null}
    </>
  );

  return node.href ? (
    <Link
      href={node.href}
      className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    >
      {content}
    </Link>
  ) : (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500">
      {content}
    </div>
  );
}

export function SitemapTree({ items, query = "" }: Props) {
  const roots = useMemo(() => {
    const publicRoots = buildTree(items).filter(
      (node) => node.lev === 1 && node.menu_id.toLowerCase() !== "admin",
    );
    return filterTree(publicRoots, query);
  }, [items, query]);

  if (!roots.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        {query ? "검색 결과가 없습니다." : "표시할 일반 메뉴가 없습니다."}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {roots.map((node) => {
        const childCount = countDescendants(node);
        const card = (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ring-1 ${getAccent(node.menu_id)}`}
            >
              {getInitial(node.label, node.menu_id)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {node.label}
                </h3>
                {childCount > 0 ? (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {childCount}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                {node.href || node.menu_id}
              </p>
            </div>
            {node.href ? (
              <ArrowUpRight
                size={16}
                className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
                aria-hidden="true"
              />
            ) : null}
          </div>
        );

        return (
          <article
            key={node.id ?? node.menu_id}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_5px_18px_rgba(15,23,42,0.04)]"
          >
            {node.href ? (
              <Link
                href={node.href}
                className="group flex rounded-xl p-1 transition hover:bg-slate-50"
              >
                {card}
              </Link>
            ) : (
              <div className="flex p-1">{card}</div>
            )}

            {node.children.length > 0 ? (
              <div className="mt-2 grid gap-0.5 border-t border-slate-100 pt-2 sm:grid-cols-2">
                {node.children.map((child) => (
                  <ChildMenu key={child.id ?? child.menu_id} node={child} />
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export function AdminTree({ items, query = "" }: Props) {
  const adminRoot = useMemo(() => {
    const root = buildTree(items).find(
      (node) => node.menu_id.toLowerCase() === "admin",
    );
    return root ? filterTree([root], query)[0] : undefined;
  }, [items, query]);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["admin"]),
  );

  const toggle = (menuId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  if (!adminRoot) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        {query ? "관리자 메뉴 검색 결과가 없습니다." : "등록된 관리자 메뉴가 없습니다."}
      </div>
    );
  }

  const renderNode = (node: SitemapNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const isOpen = query.trim() ? true : expanded.has(node.menu_id);
    const rowContent = (
      <>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
          {node.label}
        </span>
        <span className="hidden truncate text-[11px] text-slate-400 sm:block">
          {node.href || node.menu_id}
        </span>
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
          L{node.lev}
        </span>
        {node.href ? (
          <ArrowUpRight size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
        ) : null}
      </>
    );

    return (
      <div key={node.id ?? node.menu_id}>
        <div
          className="group flex min-h-10 items-center gap-2 border-b border-slate-100 pr-3 last:border-0 hover:bg-slate-50"
          style={{ paddingLeft: `${12 + depth * 18}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(node.menu_id)}
              className="grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label={`${node.label} 하위 메뉴 ${isOpen ? "접기" : "펼치기"}`}
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="grid size-6 shrink-0 place-items-center text-slate-300">
              <Folder size={13} aria-hidden="true" />
            </span>
          )}

          {node.href ? (
            <Link href={node.href} className="flex min-w-0 flex-1 items-center gap-3 py-2">
              {rowContent}
            </Link>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-3 py-2">
              {rowContent}
            </div>
          )}
        </div>

        {hasChildren && isOpen
          ? node.children.map((child) => renderNode(child, depth + 1))
          : null}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(15,23,42,0.04)]">
      {renderNode(adminRoot, 0)}
    </div>
  );
}
