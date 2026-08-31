# CLAUDE.md

Claude Code로 이 저장소를 수정할 때는 먼저 [`AGENTS.md`](./AGENTS.md)를 읽고 기본 지침으로 적용한다. 이 문서는 Claude 작업 흐름에서 특히 놓치기 쉬운 HAMS-BAPS 규칙을 보충한다.

## 시작 순서

1. 관련 화면에서 `page.tsx` → components → store/types → `app/api` 순으로 호출 흐름을 추적한다.
2. `README.md`, 관련 `docs/pages/*.md`, 최신 `docs/job/*`를 확인한다.
3. Firebase/PostgreSQL 지원 여부와 SSO·관리자·AI 권한 경계를 확인한다.
4. 기존 변경을 보존한 채 최소 범위로 수정한다.

## 핵심 주의사항

- `/`는 `/main`으로, `/builder/**`는 `/admin/builder/**`로 연결된다.
- 괄호 디렉터리는 URL이 아닌 route group이다. 기존 `siderbar` 철자를 임의로 바꾸지 않는다.
- `/admin/**`, `/api/admin/**`는 관리자 이메일 검사 대상이다.
- `/chatbot`, `/api/chatbot/**`는 `aiEnabled` 권한 검사 대상이다.
- 메뉴 노출 제어는 API 권한 검사를 대체하지 않는다.
- `NEXT_PUBLIC_BACKEND`가 있어도 모든 기능이 양쪽 DB를 지원하지는 않는다.
- 사용자별 AI 키는 서버에서만 사용한다. 키나 사용자 프로필 전체를 로그에 출력하지 않는다.
- `core/scenario-core/src` 수정 시 생성물과 소비 코드를 함께 확인한다.

## 명령

```bash
pnpm dev
pnpm lint
pnpm build
```

개발 서버 기본 포트는 3002다. 의존성 설치나 빌드가 만든 대규모 파일을 요청 없이 커밋하지 않는다.

## 문서화 의무

- 의미 있는 변경마다 `HISTORY.md`의 `Unreleased`를 갱신한다.
- 화면 변경은 `docs/pages`, 복잡한 구현 변경은 `docs/job/YYYYMMDD`에 반영한다.
- 환경변수 변경은 안전한 예시만 `env.download`와 `README.md`에 반영한다.
- 완료 응답에는 변경 요약, 검증 명령과 결과, 남은 제약을 포함한다.
