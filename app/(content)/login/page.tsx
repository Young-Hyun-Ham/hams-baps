import { redirect } from "next/navigation";

import { normalizeReturnTo } from "@hams-fam/sso-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { error, returnTo } = await searchParams;
  const normalizedReturnTo = normalizeReturnTo(returnTo);
  const isConfigurationError = error === "sso_configuration";

  if (!error) {
    redirect(`/api/sso/login?returnTo=${encodeURIComponent(normalizedReturnTo)}`);
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          {isConfigurationError
            ? "통합 로그인 설정을 확인해 주세요."
            : "로그인을 완료하지 못했습니다."}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {isConfigurationError
            ? "서비스 주소와 중앙 SSO 서버 주소가 올바르게 설정되지 않았습니다."
            : "인증 요청을 다시 시작해 주세요."}
        </p>
        {isConfigurationError ? (
          <a
            className="mt-6 inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800"
            href="/main"
          >
            서비스 메인으로 돌아가기
          </a>
        ) : (
          <a
            className="mt-6 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            href={`/api/sso/login?returnTo=${encodeURIComponent(normalizedReturnTo)}`}
          >
            통합 로그인 다시 시도
          </a>
        )}
      </section>
    </main>
  );
}
