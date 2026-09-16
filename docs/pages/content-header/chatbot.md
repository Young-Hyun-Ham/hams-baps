# `/chatbot`

- 파일: `app/(content-header)/chatbot/page.tsx`
- 목적: 프로젝트의 주력 챗봇 UI 화면
- 주요 동작: `ChatContainer`를 중심으로 채팅 인터페이스 전체 렌더링
- 연관 구성: `components/ChatContainer.tsx`, 관련 store/hooks/services
- 구현 메모: 실제 기능 복잡도는 하위 컴포넌트에 집중되어 있으며 페이지 파일은 컨테이너 역할만 수행
- Form 노드 시뮬레이션은 폼 빌더와 같은 요소 키 규칙과 객체형 옵션, radio, 단일/다중 dropbox, 날짜 범위·시간, 기본값·필수값, grid 표시·선택 설정을 사용합니다.
- 시나리오 시뮬레이션은 `depn_ver_id`가 가리키는 배포 버전만 실행하며, 해당 버전에 저장된 `startNodeId`를 시작점으로 사용합니다.
- 실행을 시작한 배포 버전 ID는 채팅 메시지의 실행 상태에 고정되며, 나중에 새 버전이 배포되어도 기존 실행의 다시 열기와 초기화는 당시 버전을 유지합니다.
- Slot Condition Branch는 버튼을 표시하지 않고 현재 slot 값으로 조건을 순서대로 평가하며, Form input은 빌더에서 설정한 설명 tooltip과 validation 규칙을 동일하게 적용합니다.
- Message·Delay·SetSlot node는 별도의 계속 버튼 없이 다음 node로 자동 진행하고, API node는 HTTP 응답 본문을 받을 때까지 loading 상태를 유지합니다.
- Form 시뮬레이션은 option layout, From/To 날짜·시간 행, chip형 multi dropbox, slot/API 기반 grid header와 체크박스 복수 행 선택을 지원합니다.

# `/chatbot` 패키지 구조

```bash
app/(content-header)/chatbot/
├── components/
│   ├── ChatContainer.tsx        # 챗봇 메인 컨테이너
│   ├── ChatInput.tsx            # 입력 UI
│   ├── ChatMessageItem.tsx      # 메시지 렌더러
│   ├── Icons.tsx                # 아이콘 모음
│   ├── ScenarioEmulator.tsx     # 시나리오 실행 UI
│   ├── ScenarioMenuPanel.tsx    # 메뉴 패널
│   ├── ScenarioNodeControls.tsx # 노드 제어 UI
│   ├── ScenarioPanel.tsx        # 시나리오 패널
│   ├── scenarioSamples.ts       # 샘플 시나리오 데이터
│   └── emulator/
│       ├── README.md
│       ├── ScenarioEmulator.tsx
│       ├── core/
│       │   ├── graph.ts
│       │   └── stableStringify.ts
│       ├── handlers/
│       │   └── createUiHandlers.ts
│       ├── hooks/
│       │   ├── useScenarioAutoRunner.ts
│       │   ├── useScenarioDefinition.ts
│       │   ├── useScenarioHistoryAppend.ts
│       │   ├── useScenarioHydration.ts
│       │   ├── useScenarioProgress.ts
│       │   └── useScenarioReset.ts
│       └── runners/
│           ├── runApiNode.ts
│           ├── runLlmNode.ts
│           └── runSetSlotNode.ts
├── hooks/
│   └── useChatOrchestrator.ts   # 채팅 오케스트레이션 훅
├── services/
│   └── chatbotFirebaseService.ts # Firebase 챗봇 서비스
├── store/
│   └── index.ts                 # 챗봇 Store
├── types/
│   ├── index.ts
│   └── shortcutMenu.ts
├── utils/
│   ├── engine.ts
│   ├── index.ts
│   ├── knowledge.ts
│   └── streamText.ts
└── page.tsx                     # 챗봇 메인 페이지
```
