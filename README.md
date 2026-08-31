# HAMS-BAPS

HAMS-BAPS(Business Automation Portal Service)는 사내 업무 콘텐츠와 AI 자동화를 한곳에서 제공하는 Next.js 풀스택 포털입니다. 일반 사용자는 게시판, FAQ, 링크, 사이트맵과 AI 챗봇을 이용하고, 관리자는 콘텐츠·사용자·지식 데이터와 챗봇 시나리오를 운영합니다.

> 현재 저장소 구현을 기준으로 작성한 문서입니다. 화면별 설명은 [`docs/pages`](./docs/pages/README.md), 상세 작업 기록은 [`docs/job`](./docs/job), 변경 이력은 [`HISTORY.md`](./HISTORY.md)를 참고하세요.

## 주요 기능

### 사용자 포털

- 중앙 SSO 로그인과 세션 기반 사용자 식별
- 동적 메뉴, 사이트맵, 링크와 외부 페이지 임베드
- 카테고리별 게시판, 답글, FAQ
- AI Chat과 시나리오 기반 Chatbot
- Todo와 독립 Form Builder 실험 화면

### 관리자 포털

- 게시글, 답글, 카테고리, FAQ, 메뉴 관리
- 사용자 정보, 통계, AI 토큰 충전·사용 이력 관리
- 지식 프로젝트, 인텐트, 엔티티와 학습 작업 관리
- React Flow 기반 챗봇 시나리오 작성·조회·배포 이력 관리
- Form.io/RJSF 기반 폼 빌더와 운영 설정

### AI와 시나리오

- OpenAI, Google Gemini, Anthropic 모델 스트리밍 연동
- 사용자 프로필별 AI 공급자·모델·API 키 설정과 환경변수 대체 설정
- 메시지, 분기, API, LLM, 슬롯, 폼, 링크, iframe 등 노드 기반 흐름
- 로컬 패키지 `core/scenario-core`를 통한 시나리오 실행 엔진 공유
- Ollama 프록시와 지식 검색/임베딩 연계

## 기술 구성

| 영역 | 구성 |
| --- | --- |
| 애플리케이션 | Next.js 16 App Router, React 19, TypeScript |
| 상태/UI | Zustand, MUI, Tailwind CSS, Bootstrap |
| 빌더 | React Flow / XYFlow, Form.io, RJSF, dnd-kit |
| 데이터 | Firebase Client/Admin SDK, PostgreSQL (`pg`) |
| AI | OpenAI, Gemini, Anthropic 호환 스트리밍, Ollama |
| 인증 | `@hams-fam/sso-client`, 중앙 HAMS OAuth/SSO |
| 패키지 관리 | pnpm |

## 구조

```text
app/
├─ (content)/             # 헤더 없는 로그인·도구 화면
├─ (content-header)/      # 일반 사용자용 헤더 레이아웃
├─ (siderbar-header)/     # 관리자용 헤더+사이드바 레이아웃
└─ api/                   # 인증, 콘텐츠, 챗봇, 관리자 Route Handlers
components/               # 공용 레이아웃과 UI
core/scenario-core/       # 로컬 시나리오 실행 패키지
docs/                     # PM, 화면, 날짜별 작업 문서
lib/                      # DB, Firebase, AI, 인증 보조 모듈
store/                    # 공용 Zustand 스토어
scripts/                  # 메뉴 마이그레이션과 DB DDL
```

괄호로 감싼 App Router 그룹명은 URL에 포함되지 않습니다. `/`는 `/main`으로 이동하고 `/builder` 계열은 `/admin/builder` 계열로 리다이렉트됩니다.

## 주요 URL

| 구분 | URL | 설명 |
| --- | --- | --- |
| 공용 | `/login` | 중앙 SSO 로그인 진입점 |
| 사용자 | `/main`, `/sitemap`, `/link` | 포털 홈과 서비스 탐색 |
| 사용자 | `/board/[slug]`, `/faq` | 게시판과 FAQ |
| AI | `/ai-chat`, `/chatbot` | 일반 AI 대화와 시나리오 챗봇 |
| 관리자 | `/admin` | 관리자 포털 진입점 |
| 관리자 | `/admin/builder/react-flow/*` | 시나리오 목록·편집·조회 |
| 관리자 | `/admin/knowledge`, `/admin/train` | 지식 데이터와 학습 작업 |
| 관리자 | `/admin/user-info`, `/admin/user-stats`, `/admin/token-manage` | 사용자와 AI 사용량 관리 |

전체 화면은 [`docs/pages/README.md`](./docs/pages/README.md)에서 확인할 수 있습니다.

## 로컬 실행

### 요구 사항

- Node.js 20 이상 권장
- pnpm
- 중앙 SSO 애플리케이션 등록 정보
- Firebase 프로젝트(기본 구성) 또는 대상 기능에 필요한 PostgreSQL
- AI 기능을 사용할 경우 해당 공급자의 API 키

```bash
pnpm install
pnpm dev
```

개발 서버는 `http://localhost:3002`에서 실행됩니다.

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 3002 포트에서 개발 서버 실행 |
| `pnpm dev:turbo` | Turbopack 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 및 타입 검사 |
| `pnpm start` | 3002 포트에서 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 검사 |

## 환경변수

`env.download`는 값의 형태를 보여 주는 시작 템플릿입니다. `.env.local`로 복사한 뒤 실제 값으로 교체하고, 아래 표의 선택 기능에 필요한 변수를 추가하세요. 실제 키, 개인 이메일, 서비스 계정 비밀키는 커밋하지 않습니다.

### 기반 및 인증

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | 서비스 공개 주소. 로컬은 `http://localhost:3002` |
| `NEXT_PUBLIC_BACKEND` | 기본 데이터 백엔드: `firebase` 또는 `postgres` |
| `NEXT_PUBLIC_ADMIN_ACCOUNT` | 관리자 이메일 목록(쉼표/공백 구분) |
| `HAMS_OAUTH_SERVER_URL` | 중앙 SSO 주소. 앱과 다른 origin이어야 함 |
| `HAMS_OAUTH_CLIENT_ID`, `HAMS_OAUTH_CLIENT_SECRET` | SSO 클라이언트 자격 증명 |
| `HAMS_SESSION_SECRET`, `HAMS_COOKIE_PREFIX` | 세션 서명 비밀값과 쿠키 접두사 |

### 데이터 저장소

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | 브라우저용 Firebase 설정 |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase Admin 자격 증명 |
| `DATABASE_URL` | PostgreSQL 연결 문자열 (`postgresql://...`) |
| `BCRYPT_ROUNDS` | 비밀번호 해시 비용(미설정 시 `12`) |
| `HAMS_SSO_SERVER_API_KEY_SECRET` | 사용자 AI 키 암호화/복호화용 서버 비밀값 |

### AI

| 변수 | 용도 |
| --- | --- |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI 키와 기본 모델 |
| `GOOGLE_GEMINI_API_KEY`, `GOOGLE_GEMINI_MODEL` | Gemini 키와 기본 모델 |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Anthropic 키와 기본 모델 |
| `OLLAMA_URL` | Ollama 서버 주소 |
| `GOOGLE_GEMINI_EMBEDDING_MODEL`, `GOOGLE_GEMINI_EMBEDDING_DIM` | 지식 임베딩 설정 |
| `NEXT_PUBLIC_KNOWLEDGE_PROJECT_ID` | 챗봇 기본 지식 프로젝트 |
| `NEXT_PUBLIC_SCENARIO_ENGINE_URL`, `NEXT_PUBLIC_ENGINE_BASE` | 외부 시나리오 엔진 주소(사용 시) |

## 인증과 권한

- `/login`은 `/api/sso/login`을 거쳐 중앙 SSO로 이동합니다.
- `/admin/**`, `/api/admin/**`는 인증된 사용자 중 관리자 이메일 목록에 포함된 계정만 접근합니다.
- `/chatbot`, `/api/chatbot/**`는 사용자 프로필의 `aiEnabled` 권한이 필요합니다.
- 보호 API는 미인증 시 `401`, 권한 부족 시 `403`을 반환합니다.
- 메뉴 노출과 서버 권한은 별개이므로 새 관리자 기능에는 두 경로를 모두 점검합니다.

## 데이터 백엔드 주의사항

Firebase와 PostgreSQL 구현은 완전히 대칭적이지 않습니다. 메뉴, 게시판, FAQ 등은 백엔드 선택을 지원하지만 사용자 통계, 학습, 일부 답글·토큰 기능은 Firebase 경로를 직접 사용합니다.

새 기능을 추가할 때는 다음을 확인합니다.

1. Firebase 전용, PostgreSQL 전용, 양쪽 지원 중 범위를 정합니다.
2. 클라이언트 store의 API 경로와 서버 Route Handler를 함께 수정합니다.
3. 백엔드별 응답이 기존 화면 타입과 호환되는지 확인합니다.
4. 동작 차이를 README, 화면 문서 또는 작업 문서에 기록합니다.

PostgreSQL 초기 스키마 참고 파일은 [`scripts/postgre_ddl.sql`](./scripts/postgre_ddl.sql)입니다.

## 개발·문서화 규칙

- 저장소 작업 지침은 [`AGENTS.md`](./AGENTS.md)를 기준으로 합니다.
- Claude Code에서는 [`CLAUDE.md`](./CLAUDE.md)도 함께 따릅니다.
- 사용자 동작, 설정, API, 데이터 구조가 바뀌면 관련 `docs/`도 갱신합니다.
- 모든 의미 있는 변경은 같은 작업에서 [`HISTORY.md`](./HISTORY.md)의 `Unreleased`에 기록합니다.
- 제출 전 `pnpm lint`와 `pnpm build`를 실행하고, 못한 검증은 변경 설명에 남깁니다.

## 관련 문서

- [`docs/pm/project-overview.md`](./docs/pm/project-overview.md): 제품·운영 개요
- [`docs/pm/feature-map.md`](./docs/pm/feature-map.md): 기능과 경로 대응
- [`docs/pm/operations-checklist.md`](./docs/pm/operations-checklist.md): 운영 점검 항목
- [`docs/pages/README.md`](./docs/pages/README.md): 화면별 문서 인덱스
- [`docs/job`](./docs/job): 날짜별 상세 작업 기록
- [`HISTORY.md`](./HISTORY.md): 저장소 전체 변경 이력

## 배포

프로덕션 빌드가 통과한 상태에서 Next.js 서버로 배포합니다. `vercel.json`은 GitHub 연동을 활성화합니다. 배포 환경에는 서버/클라이언트 환경변수를 구분해 등록하고 SSO 콜백 URL, 서비스 URL, 쿠키 정책을 실제 도메인 기준으로 검증하세요.
