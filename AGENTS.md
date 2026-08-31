# AGENTS.md

이 파일은 HAMS-BAPS 저장소에서 작업하는 모든 코딩 에이전트의 기본 지침이다. 하위 디렉터리에 별도 `AGENTS.md`가 생기면 더 가까운 파일의 규칙을 함께 적용한다.

## 서비스 이해

- Next.js 16 App Router 기반 업무 자동화 포털이며 사용자·관리자 화면과 API가 한 저장소에 있다.
- 인증은 `@hams-fam/sso-client`와 중앙 HAMS OAuth/SSO를 사용한다.
- Firebase와 PostgreSQL이 공존하지만 기능별 지원 범위는 동일하지 않다.
- 챗봇은 사용자별 OpenAI/Gemini/Anthropic 설정과 시나리오 실행 엔진을 사용한다.
- `core/scenario-core`는 루트 앱이 `file:` 의존성으로 참조하는 로컬 패키지다.

## 작업 전 확인

1. `README.md`, `HISTORY.md`, 관련 `docs/pages`와 `docs/job`을 읽는다.
2. 수정 화면의 `page.tsx`, components, store, types, API route를 함께 추적한다.
3. `NEXT_PUBLIC_BACKEND` 분기와 Firebase/PostgreSQL 구현 범위를 확인한다.
4. SSO, 관리자 이메일, `aiEnabled` 검사가 필요한 경로인지 확인한다.
5. 기존 작업 트리 변경을 보존하고 관련 없는 파일을 수정하지 않는다.

## 코드 규칙

- TypeScript strict 설정과 `@/*` 경로 별칭을 유지한다.
- Server/Client Component 경계를 지키고 필요한 파일에만 `"use client"`를 둔다.
- Route Handler 입력을 검증하고 비밀값과 내부 오류를 응답에 노출하지 않는다.
- 서버 자격 증명을 `NEXT_PUBLIC_` 변수에 두거나 클라이언트에서 참조하지 않는다.
- 관리자 메뉴를 숨기는 것만으로 권한을 처리하지 말고 서버 API도 보호한다.
- 백엔드 선택 기능은 기존 `/firebase/`, `/postgres/` URL 규칙과 응답 타입을 유지한다.
- 한쪽 DB만 지원할 때는 코드와 문서에 제한을 명시한다.
- 공용 상태는 기존 Zustand store 패턴을, 화면 로컬 상태는 컴포넌트 가까이에 둔다.
- 시나리오 공용 타입과 실행 규칙은 `core/scenario-core`를 우선 검토한다.
- 레거시 JS/JSX 수정 시 무관한 전면 변환이나 포매팅을 피한다.

## 디렉터리 책임

- `app/(content)`: 공통 헤더가 필요 없는 화면
- `app/(content-header)`: 일반 사용자용 화면
- `app/(siderbar-header)`: 관리자용 화면. 기존 `siderbar` 철자를 유지한다.
- `app/api`: 서버 API와 외부 서비스 프록시
- `components`, `hooks`, `providers`: 여러 화면이 공유하는 UI와 동작
- `lib`: Firebase/PostgreSQL, SSO, AI 기반 모듈
- `core/scenario-core/src`: 시나리오 엔진 원본. `dist`는 생성 결과다.
- `docs/pages`: 화면 목적과 흐름
- `docs/job/YYYYMMDD`: 복잡한 작업의 설계·변경 기록

## 검증

```bash
pnpm lint
pnpm build
```

- 시나리오 코어 변경 시 `core/scenario-core` 빌드도 확인한다.
- 인증 변경은 미인증, 일반 사용자, 관리자 흐름을 구분해 확인한다.
- 데이터 변경은 선택 백엔드와 해당 API/화면의 CRUD 흐름을 확인한다.
- 실행하지 못한 검증은 완료 보고와 `HISTORY.md`에 이유를 남긴다.

## 문서와 변경 이력

- 모든 의미 있는 코드·설정·문서 변경은 같은 작업에서 `HISTORY.md`의 `Unreleased`에 추가한다.
- `Added`, `Changed`, `Fixed`, `Removed`, `Security` 중 알맞은 섹션에 한 줄로 쓴다.
- 화면 동작 변경은 대응하는 `docs/pages/*.md`를 갱신한다.
- 복잡한 기능은 `docs/job/YYYYMMDD/<topic>.md`에 배경, 결정, 변경 파일, 검증 결과를 기록한다.
- 환경변수 추가 시 `env.download`에는 안전한 예시만 넣고 `README.md`도 갱신한다.
- API 키, 쿠키, 세션 비밀값, 서비스 계정 키, 개인정보를 문서·로그·커밋에 남기지 않는다.

## 완료 기준

- 요청 동작이 코드와 문서에 반영되었다.
- 권한, 백엔드 분기, 타입 영향을 검토했다.
- 가능한 검증을 수행하고 결과를 보고했다.
- `HISTORY.md`를 갱신했다.
- 임시 파일, 디버그 로그, 비밀값을 남기지 않았다.
