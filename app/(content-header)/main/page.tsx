"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  FileQuestion,
  LockKeyhole,
  MessagesSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { useStore } from "@/store";

type Feature = {
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  action?: string;
  icon: LucideIcon;
  tone: string;
  iconTone: string;
};

const publicFeatures: Feature[] = [
  {
    eyebrow: "KNOWLEDGE",
    title: "지식과 FAQ",
    description:
      "자주 묻는 질문과 업무 지식을 한곳에서 찾아보고 정확한 정보를 빠르게 확인합니다.",
    href: "/faq",
    action: "FAQ 둘러보기",
    icon: Database,
    tone: "bg-[#f1f9f4]",
    iconTone: "bg-emerald-600 text-white",
  },
  {
    eyebrow: "CONNECTED",
    title: "연결된 서비스",
    description:
      "HAMS의 여러 서비스로 자연스럽게 이동하며 하나의 계정으로 업무 흐름을 이어갑니다.",
    href: "/link",
    action: "서비스 보기",
    icon: Network,
    tone: "bg-[#fff7ed]",
    iconTone: "bg-orange-500 text-white",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "질문과 요청을 이해합니다",
    description: "자연어 질문에서 의도와 필요한 업무 정보를 파악합니다.",
  },
  {
    number: "02",
    title: "지식과 시나리오를 연결합니다",
    description: "검증된 FAQ, 지식 데이터와 업무 시나리오를 함께 탐색합니다.",
  },
  {
    number: "03",
    title: "답변과 업무로 완성합니다",
    description: "알맞은 답변을 제공하고 다음 업무 단계까지 자연스럽게 안내합니다.",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const content = (
    <>
      <div className="flex items-start justify-between gap-5">
        <span
          className={`grid size-11 place-items-center rounded-2xl shadow-sm ${feature.iconTone}`}
        >
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        </span>
        {feature.href ? (
          <ChevronRight
            size={19}
            className="text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-900"
            aria-hidden="true"
          />
        ) : (
          <LockKeyhole size={17} className="text-slate-400" aria-hidden="true" />
        )}
      </div>
      <p className="mt-8 text-[11px] font-bold tracking-[0.18em] text-slate-500">
        {feature.eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
        {feature.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {feature.description}
      </p>
      <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        {feature.action ?? "관리자 권한 기능"}
        {feature.href ? <ArrowRight size={15} aria-hidden="true" /> : null}
      </span>
    </>
  );

  const className = `group flex min-h-72 flex-col rounded-[28px] border border-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 ${feature.tone} ${
    feature.href ? "hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]" : ""
  }`;

  return feature.href ? (
    <Link href={feature.href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

export default function MainPage() {
  const user = useStore((state: any) => state.user);
  const isAdmin = Boolean(user?.roles?.includes("admin"));
  const canUseAi = user?.aiEnabled === true;
  const displayName =
    user?.nickname ||
    user?.displayName ||
    user?.loginId ||
    user?.email?.split("@")[0] ||
    "방문자";

  const builderFeature: Feature = {
    eyebrow: "AUTOMATION",
    title: "시나리오 빌더",
    description:
      "업무 단계를 시각적인 노드로 설계하고 테스트와 배포까지 하나의 흐름으로 관리합니다.",
    href: isAdmin ? "/admin/builder/react-flow/scenario-list" : undefined,
    action: isAdmin ? "빌더 열기" : undefined,
    icon: Workflow,
    tone: "bg-[#f5f1ff]",
    iconTone: "bg-violet-600 text-white",
  };

  const chatbotFeature: Feature = {
    eyebrow: "CONVERSATION",
    title: "AI 챗봇",
    description:
      "질문의 맥락을 이해하고 등록된 지식과 시나리오를 연결해 필요한 답변을 제공합니다.",
    href: canUseAi
      ? "/chatbot"
      : user
        ? "/api/auth/profile?destination=services&returnTo=%2Fmain"
        : "/login?returnTo=%2Fmain",
    action: canUseAi ? "챗봇 시작" : user ? "AI 권한 설정" : "로그인 후 이용",
    icon: MessagesSquare,
    tone: "bg-[#eef6ff]",
    iconTone: "bg-blue-600 text-white",
  };

  const primaryHref = canUseAi
    ? "/chatbot"
    : user
      ? "/api/auth/profile?destination=services&returnTo=%2Fmain"
      : "/login?returnTo=%2Fmain";
  const primaryLabel = canUseAi
    ? "AI 워크스페이스 열기"
    : user
      ? "AI 권한 설정"
      : "통합 로그인";

  return (
    <div className="relative isolate overflow-hidden rounded-[32px] bg-[#f7f9fc] text-slate-950">
      <div
        className="pointer-events-none absolute -left-36 -top-40 size-[34rem] rounded-full bg-blue-300/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 top-64 size-[32rem] rounded-full bg-violet-300/20 blur-3xl"
        aria-hidden="true"
      />

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <section className="grid items-center gap-12 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-blue-700 shadow-sm backdrop-blur">
              <Sparkles size={14} aria-hidden="true" />
              BUSINESS AUTOMATION PLATFORM
            </div>

            <h1 className="mt-7 max-w-3xl text-[2.6rem] font-black leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[4.25rem]">
              대화에서 시작해
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                업무의 완성까지.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              HAMS BAPS는 AI 대화, 지식 데이터와 업무 시나리오를 연결합니다.
              반복되는 문의는 더 빠르게 답하고, 복잡한 업무는 더 단순한 흐름으로
              바꿔보세요.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {primaryLabel}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 text-sm font-bold text-slate-800 shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white"
              >
                로그인 없이 둘러보기
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              {["통합 계정", "AI 기반 응답", "시나리오 자동화"].map((label) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-blue-400/20 via-transparent to-violet-400/25 blur-xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0c172c] p-5 text-white shadow-[0_35px_90px_rgba(15,23,42,0.28)] sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.22em] text-blue-300">
                    LIVE WORKFLOW
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/90">
                    고객 문의 자동 처리
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                  <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
                  연결됨
                </span>
              </div>

              <div className="relative mt-7 space-y-4">
                <div className="absolute bottom-8 left-6 top-8 w-px bg-gradient-to-b from-blue-400 via-violet-400 to-emerald-400" />

                <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <span className="z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-950/40">
                    <MessagesSquare size={21} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-blue-200">INPUT</p>
                    <p className="mt-1 truncate text-sm font-semibold">사용자 질문과 요청</p>
                  </div>
                  <span className="ml-auto rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white/60">
                    실시간
                  </span>
                </div>

                <div className="relative ml-7 flex items-center gap-4 rounded-2xl border border-violet-300/20 bg-violet-400/10 p-4 backdrop-blur sm:ml-12">
                  <span className="z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-950/40">
                    <Bot size={22} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-violet-200">INTELLIGENCE</p>
                    <p className="mt-1 truncate text-sm font-semibold">AI 분석 · 지식 검색</p>
                  </div>
                  <Sparkles className="ml-auto text-violet-200" size={18} aria-hidden="true" />
                </div>

                <div className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <span className="z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/40">
                    <Boxes size={21} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-emerald-200">ACTION</p>
                    <p className="mt-1 truncate text-sm font-semibold">답변 제공 · 업무 연결</p>
                  </div>
                  <ShieldCheck className="ml-auto text-emerald-200" size={18} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center">
                <div>
                  <p className="text-lg font-black text-white">AI</p>
                  <p className="mt-0.5 text-[10px] text-white/45">대화 이해</p>
                </div>
                <div className="border-x border-white/10">
                  <p className="text-lg font-black text-white">DATA</p>
                  <p className="mt-0.5 text-[10px] text-white/45">지식 연결</p>
                </div>
                <div>
                  <p className="text-lg font-black text-white">FLOW</p>
                  <p className="mt-0.5 text-[10px] text-white/45">업무 실행</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20" aria-labelledby="features-heading">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-blue-700">WHAT YOU CAN DO</p>
              <h2 id="features-heading" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                하나의 플랫폼, 이어지는 업무
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-600 sm:text-right">
              공개 기능은 로그인 없이 미리볼 수 있으며, 계정 권한에 따라 AI와 관리자
              도구가 자연스럽게 확장됩니다.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[chatbotFeature, ...publicFeatures, builderFeature].map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch lg:py-20">
          <div className="flex flex-col justify-between rounded-[30px] bg-blue-700 p-7 text-white shadow-[0_25px_60px_rgba(29,78,216,0.2)] sm:p-9">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Sparkles size={22} aria-hidden="true" />
              </span>
              <p className="mt-8 text-xs font-bold tracking-[0.2em] text-blue-200">HOW IT WORKS</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                복잡한 업무를
                <br />세 단계로 단순하게
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-blue-100">
                사용자는 대화에 집중하고, HAMS BAPS는 뒤에서 지식과 업무 흐름을
                연결합니다.
              </p>
            </div>
            <Link href="/faq" className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-white">
              자주 묻는 질문 확인
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.06)] sm:p-9">
            <div className="divide-y divide-slate-100">
              {workflowSteps.map((step) => (
                <article key={step.number} className="grid gap-4 py-7 first:pt-0 last:pb-0 sm:grid-cols-[72px_1fr] sm:gap-6">
                  <span className="font-mono text-sm font-bold text-blue-600">{step.number}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="absolute right-0 top-0 size-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-blue-300">
                {user ? "YOUR WORKSPACE" : "PREVIEW AVAILABLE"}
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                {user
                  ? `${displayName}님, 오늘의 업무를 이어가세요.`
                  : "로그인 없이 먼저 살펴보고 시작하세요."}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {user
                  ? user.aiEnabled
                    ? "AI 사용 권한이 활성화되어 있습니다. 챗봇과 연결된 업무를 바로 시작할 수 있습니다."
                    : "공개 콘텐츠를 둘러볼 수 있습니다. AI 기능은 회원정보의 사이트 설정에서 활성화할 수 있습니다."
                  : "메인, FAQ와 서비스 안내는 공개되어 있습니다. 통합 로그인 후 계정에 허용된 기능을 이어서 사용할 수 있습니다."}
              </p>
            </div>
            <div className="relative mt-7 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                href={canUseAi ? "/chatbot" : user ? "/api/auth/profile?destination=services&returnTo=%2Fmain" : "/faq"}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
              >
                {canUseAi ? "챗봇 시작" : user ? "AI 권한 설정" : "공개 화면 둘러보기"}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {!user ? (
                <Link
                  href="/login?returnTo=%2Fmain"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  통합 로그인
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-slate-200 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold tracking-[0.16em] text-slate-700">
            <span className="grid size-7 place-items-center rounded-lg bg-slate-950 text-white">
              <Boxes size={14} aria-hidden="true" />
            </span>
            HAMS BAPS
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/faq" className="transition hover:text-slate-900">
              FAQ
            </Link>
            <Link href="/link" className="transition hover:text-slate-900">
              연결 서비스
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <FileQuestion size={13} aria-hidden="true" />
              Business Automation Portal Service
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
