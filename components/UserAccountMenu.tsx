"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useStore } from "@/store";

const genderLabels = {
  male: "남성",
  female: "여성",
  other: "기타",
  prefer_not_to_say: "미공개",
} as const;

export default function UserAccountMenu() {
  const pathname = usePathname();
  const user = useStore((state: any) => state.user);
  const authChecked = useStore((state: any) => state.authChecked);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!authChecked) {
    return <span className="h-8 w-28 animate-pulse rounded-lg bg-gray-100" />;
  }

  const returnTo = pathname || "/main";
  if (!user) {
    return (
      <Link
        href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        로그인
      </Link>
    );
  }

  const name = user.nickname || user.loginId || user.email || "사용자";
  const membership = user.serviceMemberships?.[0] ?? null;
  const gender = user.gender
    ? genderLabels[user.gender as keyof typeof genderLabels]
    : "미등록";
  const profileHref = `/api/auth/profile?returnTo=${encodeURIComponent(returnTo)}`;
  const servicesHref = `/api/auth/profile?destination=services&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-gray-100"
      >
        <span className="grid size-8 place-items-center rounded-full bg-gray-900 text-sm font-semibold text-white">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden min-w-0 sm:block">
          <strong className="block max-w-32 truncate text-sm">{name}</strong>
          <small className="block max-w-40 truncate text-xs text-gray-500">{user.email}</small>
        </span>
        <svg className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/10">
          <div className="border-b border-gray-100 pb-3">
            <strong className="block truncate text-sm text-gray-900">{name}</strong>
            <span className="block truncate text-xs text-gray-500">{user.email}</span>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 py-4 text-xs">
            <dt className="text-gray-500">생년월일</dt><dd className="text-right font-medium">{user.birthDate || "미등록"}</dd>
            <dt className="text-gray-500">성별</dt><dd className="text-right font-medium">{gender}</dd>
            <dt className="text-gray-500">서비스</dt><dd className="text-right font-medium">{membership?.serviceName || "가입정보 없음"}</dd>
            <dt className="text-gray-500">사이트 등급</dt><dd className="text-right font-medium uppercase">{membership?.plan || "-"}</dd>
            <dt className="text-gray-500">AI 사용</dt><dd className={`text-right font-semibold ${user.aiEnabled ? "text-emerald-600" : "text-gray-400"}`}>{user.aiEnabled ? "AI ON" : "AI OFF"}</dd>
          </dl>
          <div className="grid gap-1 border-t border-gray-100 pt-3 text-sm">
            <a href={profileHref} className="rounded-lg px-3 py-2 hover:bg-gray-50">회원정보 수정</a>
            <a href={servicesHref} className="rounded-lg px-3 py-2 hover:bg-gray-50">사이트 등급 수정</a>
            <a href="/api/auth/logout?returnTo=%2Fmain" className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">로그아웃</a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
