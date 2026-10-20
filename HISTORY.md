# 변경 이력

HAMS-BAPS의 사용자 동작, API, 데이터 구조, 설정, 운영 문서 변경을 기록합니다. [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 분류를 따르며 아직 릴리스되지 않은 작업은 `Unreleased`에 누적합니다.

## 작성 규칙

- 가장 최근 변경을 각 분류의 위에 추가합니다.
- 구현 내용보다 사용자·운영자에게 달라진 결과를 간결히 적습니다.
- 관련 작업 문서가 있으면 상대 링크를 덧붙입니다.
- 릴리스 시 `Unreleased` 항목을 `YYYY-MM-DD` 날짜 섹션으로 이동합니다.
- 버전 정책이 정해지면 날짜 제목에 버전도 함께 표기합니다.

## [Unreleased]

### Added

- 2026-08-31: 저장소 변경을 지속적으로 추적할 `HISTORY.md`와 작성 규칙을 추가했습니다.
- 2026-08-31: 코딩 도구가 서비스 구조, 권한, 이중 백엔드와 문서화 원칙을 따르도록 `AGENTS.md`, `CLAUDE.md`를 추가했습니다.

### Changed

- 2026-10-20: Fixed the active builder simulator requesting onFail instead of onError and falling back to the first outgoing edge after API failure. Its auto runner and graph resolver now share selection-group API routing: explicit Error wins; unconnected failures continue below; success follows child order. Legacy onFail remains supported. Lint, core compilation and 14 routing tests passed, including seven tests exercising the actual emulator runner/hook/graph with simulated HTTP 503 and network failures. Full build compilation passed but type checking failed on the existing scenarioTabs.ts:7 mismatch. Browser interaction and live API calls were not verified. See [routing work log](docs/job/20261020/group-api-routing.md).

- 2026-10-20: Hid input/ordinary output connectors for selection-group children while retaining sequence edges and execution. API Error and Branch/Y-N outputs remain visible on the right. Explicit branch edges now survive group sequence rebuilding and remain visible alongside API failure routes. Lint and diff checks passed; type checking reported only the existing scenarioTabs.ts:7 mismatch. Browser visual validation and full build were not repeated for this presentation/filter change.

- 2026-10-20: Limited Delay Value to four integer digits (maximum 9999, decimals retained), narrowed its input and widened Unit to avoid clipping. Targeted lint, diff checks and six duration tests passed. Browser visual validation and full build were not repeated for this input/layout adjustment.

- 2026-10-20: Delay nodes now open a numeric S/M/H duration editor on double-click, with preview, validation, Apply/Cancel, Enter/Escape and undo/redo. Millisecond execution values remain compatible; the selected display unit is retained. Lint, diff checks and five conversion/validation tests passed. Full build compiled successfully but type checking failed on the existing scenarioTabs.ts:7 mismatch. Browser interaction and live database writes were not verified. See [work log](docs/job/20261020/delay-duration-editor.md).

- 2026-10-20: Canvas context menus now use measured dimensions and open upward with the pointer at their bottom when space below is insufficient. Right-side overflow opens left; an 8px viewport margin and internal scrolling keep menus accessible on small screens. Applied to canvas, node, edge and selection menus, including resize/content-size updates. Targeted lint and diff checks passed. Browser validation and full build were not repeated for this positioning change.

- 2026-10-20: Added Add Delay Node to the edge context menu. It inserts a default 1-second Delay between the original endpoints, preserving handles and group sequence membership, with undo history. Increased edge-menu boundary spacing. Targeted lint and diff checks passed; TypeScript reported only the existing scenarioTabs.ts:7 mismatch. Browser interaction and full build were not repeated.

- 2026-10-20: Removed canvas titles, title editing and floating Edit buttons from Y/N Branch and Delay nodes. Y/N, slot badges, duration labels and connection handles remain. Browser validation and full build were not repeated for this display-only change.

- 2026-10-20: Group API success handles now use Bottom and error handles Right. Failure follows an explicit error edge or continues to the next child when unconnected; success continues below. Internal error edges survive sequence rebuilding and remain visible. Child-node context menus hide input/output position controls. Lint, core build and seven routing tests passed. Full build compilation passed; type checking remains blocked by the existing scenarioTabs.ts:7 mismatch. Browser interaction was not verified. See [work log](docs/job/20261020/group-api-routing.md).

- 2026-10-20: Aligned group Edit with the description row. Standalone regular nodes now use 250px when collapsed and 420px when expanded, preserving group child sizes. Lint and diff checks passed. Browser visual validation and full build were not repeated for this layout change.

- 2026-10-20: G now creates an empty expanded selection group without a minimum selection count. Group Edit is right-aligned; the header toggle collapses the body, children and canvas area together, and manual resizing is removed. Lint and diff checks passed. Build compilation passed, but type checking failed on the existing scenarioTabs.ts:7 ScenarioType/ScenarioTabKind mismatch. Browser interaction was not verified.

- 2026-10-20: 시나리오 목록의 기본 정렬을 `lastUsedAt` 내림차순으로 변경했습니다. Firebase Timestamp와 API의 `last_used_at`을 처리하고 최근 사용일이 없는 항목은 뒤에 배치합니다. 정렬 선택 기본값도 Last Used Date로 변경했으며 브라우저 검증과 전체 빌드는 반복하지 않았습니다.
- 2026-10-20: Firebase 시나리오 최초 생성 시 `lastUsedAt`을 서버 저장 시각으로 초기화하고 생성 응답에도 시각을 포함하도록 변경했습니다. 생성 경로와 diff를 확인했으며, 소규모 초기값 변경으로 전체 빌드와 실제 DB 쓰기 검증은 반복하지 않았습니다.
- 2026-10-20: 시나리오 모달 헤더에 타입 배지·이름·최신 버전을 표시하고 오른쪽 X 닫기 버튼을 추가했습니다. 이름·타입은 폼 변경을 반영하며 X·CLOSE·ESC·배경 닫기는 공통 처리로 임시 생성 항목을 정리합니다. 브라우저 시각 검증과 전체 빌드는 이 헤더 변경에서 반복하지 않았습니다.
- 2026-10-20: Flow edit 및 버전 조회로 이동하는 동안 편집 모달의 모드를 유지해 생성 폼으로 바뀌는 현상을 수정했습니다. 이동 함수의 상태 변경과 diff를 확인했으며, 브라우저 검증과 전체 빌드는 수행하지 않았습니다.
- 2026-10-20: Firebase 시나리오 20개의 기존 문서 키를 UUID로 이전하고 이전 키를 `scenarioId`에 보존했습니다. 백업 후 하위 문서·연결 참조를 포함한 48개 문서와 기존 문서 삭제를 검증했습니다. 편집 모달에서 Name을 변경할 수 있으며 문서 ID와 버전 이력을 유지합니다. 테스트 5개와 lint는 통과했으며 빌드·타입 검사는 기존 `scenarioTabs.ts:7` 타입 불일치로 실패했습니다. [작업 및 검증 기록](docs/job/20261020/scenario-uuid-migration.md).
- 2026-10-20: 시나리오 편집 모달 상단에 실제 노드·연결선 기반 흐름 섬네일과 최근 사용일, 변경 사용자 ID, 최신·배포 버전, 버전 조회 및 Flow edit 버튼을 배치했습니다. 변경 사용자 정보가 응답에 없으면 `-`로 표시합니다. lint와 빌드 컴파일은 통과했으며 타입 검사와 빌드의 타입 검증은 기존 `scenarioTabs.ts:7`의 `agent`/`ScenarioTabKind` 불일치로 실패했습니다. 브라우저 시각 검증은 수행하지 않았습니다.

- 2026-10-19: Added Unit/Multi/Sub selection below Description in the New Job/edit dialog, defaulting legacy and new scenarios to Sub. Cards show the type at the upper left; creation, metadata edits, and definition-save payloads retain scenario_type. Live backend validation limits are recorded in the work log.

- 2026-10-19: Moved scenario tabs into the top-left scenario menu with a Sub default icon, title/version rows, tab close controls, and a bottom Back list action. Switching restores cached graphs and preserves current scenario metadata; Firebase sub-scenario loading now receives its expected identifier shape.

- 2026-10-19: Added persistent per-node titles with type-label defaults, inline Pencil editing, and a small gray type label before the header action menu. Save serialization fills missing legacy titles, and open node options preserve externally renamed titles. Validation is recorded in the scenario publishing work log.

- 2026-10-19: Moved NodeWrapper header actions into an ellipsis-triggered layer palette, preserving start/anchor/delete and custom node actions with outside-click/Escape dismissal. Validation is recorded in the scenario publishing work log.

- 2026-10-19: Moved NodeWrapper's Edit button inside nodeBody so it hides with collapsed body content while preserving mounted input state. Verified JSX nesting; browser checks and full build were not repeated for this markup-only adjustment.

- 2026-10-19: Scenario node selection no longer opens the right options panel; explicit footer Edit buttons open it after the existing modification-permission check. Selection, search, multi-select, and editing in other screens remain independent. Validation details are in the scenario publishing work log.

- 2026-10-19: Shared node-type icons between the node palette and canvas headers, passing matching icons to NodeWrapper and the Sub Agent header while preserving node behavior and configured colors.

- 2026-10-19: Matched all three scenario toolbar groups to a 30px outer height and included interaction-control padding within its button height. CSS values checked; browser visual verification was not performed.

- 2026-10-19: Split the scenario header toolbar into three bordered groups: editing through StickyNote, scenario tools through Search, and viewport tools. Button behavior is unchanged.

- 2026-10-19: Corrected the last scenario toolbar button to toggle the bottom-right preview (minimap) without changing node positions or edit history.

- 2026-10-19: Restyled the scenario detail editor with a compact header, categorized node palette, dotted canvas, and minimap while preserving existing editor and save handlers. See [validation notes](docs/job/20261019/scenario-flow-publishing.md).

- 2026-10-16: API 노드 설정의 기본 Headers를 Content-Type과 Accept가 application/json인 들여쓰기 JSON으로 통일하고 잘못된 후행 쉼표를 제거했습니다. 전체 빌드와 브라우저 실행 검증은 수행하지 않았습니다.
- 2026-10-16: API 노드 설정에서 Templates, Router/API 모달 버튼과 ID 필드 및 관련 로직을 제거하고 단일/Multi API URL을 한 줄 입력으로 변경했습니다. 전체 빌드와 브라우저 실행 검증은 수행하지 않았습니다.
- 2026-10-16: 시나리오 시뮬레이터 초기화 버튼을 확장/축소와 같은 작은 IconButton 스타일로 통일했습니다. 스타일 변경으로 전체 빌드 및 브라우저 시각 검증은 수행하지 않았습니다.
- 2026-10-16: 시뮬레이터 모달의 확장/축소 아이콘을 lucide-react의 Maximize2/Minimize2로 교체했습니다. 아이콘 교체로 전체 빌드 및 브라우저 시각 검증은 수행하지 않았습니다.
- 2026-10-16: 캔버스 공통 노드 헤더의 타입 라벨 옆에 본문 접기/펼치기 버튼을 추가했습니다. 본문 상태를 유지하며 핸들 위치를 다시 계산합니다. 브라우저 실행 및 전체 빌드는 수행하지 않았습니다.
- 2026-10-16: 시뮬레이터 모달의 기본 너비를 780px로 늘려 오른쪽 패널을 100px 넓혔습니다. 너비 설정을 확인했으며 스타일 수치 변경으로 전체 빌드 및 브라우저 시각 검증은 수행하지 않았습니다.
- 2026-10-16: 시뮬레이터 모달의 축소/확장 아이콘을 대각선 안쪽/바깥쪽으로 향하는 두 화살표로 변경했습니다. 브라우저 시각 검증은 수행하지 않았습니다.
- 2026-10-16: 시뮬레이터 모달을 좌우 각 340px로 열고 초기화 옆 화살표로 기존 최대 너비까지 확장하거나 축소할 수 있도록 변경했습니다. 브라우저 시각 검증과 전체 빌드는 수행하지 않았습니다.
- 2026-10-16: 시나리오 시뮬레이터 모달의 패널 구분선을 그림자로 바꾸고, 헤더 높이와 여백을 줄여 하단 그림자를 적용했습니다. 스타일 변경으로 전체 빌드 및 브라우저 시각 검증은 수행하지 않았습니다.
- 2026-10-16: 시나리오 빌더 시뮬레이터를 모달로 이동하고, 왼쪽에 실행 slot 값을 표시하며 오른쪽에서 시나리오를 실행하도록 변경했습니다.
  - 검증: `pnpm exec tsc --noEmit --pretty false` 통과. 전체 빌드와 브라우저 실행 검증은 수행하지 않았습니다.

- 2026-09-22: 시나리오 Flow의 Selection Group에 노드를 드래그 앤 드롭하여 그룹 안으로 넣거나 밖으로 분리하고, 다른 그룹으로 이동할 수 있도록 변경했습니다.
- 2026-09-22: Selection Group에 마우스를 올리면 그룹 하단 바깥에 `+ Add Node` 버튼이 표시되며, 노드 선택 모달에서 고른 노드가 해당 그룹 내부에 추가되도록 변경했습니다.
- 2026-09-22: Selection Group 테두리를 흐린 점선으로 변경하고 그룹 하단 노드 추가 버튼을 가로형 UI로 조정했습니다.
- 2026-09-22: 공통 `NodeWrapper` 헤더 배경을 흰색으로 변경하고, 설정한 `nodeColor`가 아이콘 배경 또는 아이콘이 없는 노드의 라벨 앞 컬러 표시로 나타나도록 변경했습니다. 헤더와 본문 사이에는 구분선을 추가했습니다.

- 2026-09-22: 시나리오 Flow 빌더에서 좌측 패널의 노드를 기존 캔버스 노드 위에 드롭하면 Selection Group을 생성하고, 기존 그룹에 드롭하면 세로 실행 순서의 마지막 위치에 노드를 추가하도록 변경했습니다.
- 2026-09-22: 그룹 내부 노드는 Y축 드래그 위치를 기준으로 순번과 실행용 내부 edge를 자동 재구성하되 내부 edge 선은 표시하지 않으며, Branch 노드는 항상 마지막 순서에 배치되도록 변경했습니다.
- 2026-09-22: 그룹 내부의 일반 Branch와 Y/N Branch 출력 핸들을 오른쪽에 표시하고, Branch가 마지막인 그룹에 새 노드를 추가하면 Branch 바로 위에 삽입되도록 변경했습니다.
- 2026-09-22: 그룹 내부 노드 폭을 Form 기준 520px로 통일하고 iFrame 콘텐츠도 그룹 폭을 넘지 않도록 조정했습니다.

- 2026-09-04: 챗봇 시뮬레이터에서 폼 빌더 요소 옵션이 일관되게 동작하며, 시나리오 캔버스의 Form 노드는 폼 빌더 미리보기 UI를 재사용합니다.

- 2026-08-31: 손상되고 오래된 루트 README를 현재 구현 기준의 서비스 개요, 기능, 구조, 실행법, 환경변수, 권한 및 운영 주의사항으로 전면 개정했습니다.

### Fixed

- 2026-10-16: API 노드 생성 시 Headers가 '{}'로 설정되어 기본 JSON이 표시되지 않던 문제를 수정했습니다. 기존 빈 Headers도 편집 시작 시 기본값으로 초기화합니다. 전체 빌드 및 브라우저 검증은 수행하지 않았습니다.
- 2026-09-22: Selection Group에서 특정 노드를 밖으로 분리하거나 다른 그룹으로 이동할 때 해당 노드의 기존 edge를 제거하고, 이전 노드와 다음 노드를 직접 연결하여 그룹 실행 흐름이 끊기지 않도록 수정했습니다.

- 2026-09-22: 그룹 내부 노드 삭제 또는 Form, Branch, iFrame, API, Link 등 동적 높이 노드의 크기 변경 시 실제 측정 높이로 자식 위치와 그룹 높이를 다시 계산하여 노드가 그룹 영역을 벗어나거나 불필요한 빈 공간이 남는 문제를 수정했습니다.
- 2026-09-22: 펼쳐진 Selection Group의 자식 노드가 캔버스에서 제외되어 그룹 내부 노드와 실행 순서를 확인할 수 없던 문제를 수정했습니다.

- 2026-09-16: 숫자 key 기반 Grid 원본 행과 정규화된 선택 행의 식별값이 달라 체크 표시가 유지되지 않고 같은 행이 중복 추가되던 문제를 수정했습니다.
- 2026-09-16: 챗봇 Form의 저장형 Grid 행 선택값에서 숫자 순번 key 대신 Grid `displayKeys`에 설정된 컬럼 key로 객체를 구성하도록 수정했습니다.
- 2026-09-16: 챗봇 Form의 selectable Grid 제출 메시지에 첫 번째 컬럼 값만 표시하지 않고 선택한 행 객체의 모든 필드를 표시하도록 수정했습니다.
- 2026-09-16: 완료된 챗봇 시나리오 실행 이력을 열 때 hydration 상태를 다시 저장하면서 메시지 PATCH 요청이 발생하던 문제를 수정했습니다.
- 2026-09-15: selectable grid의 선택 안내와 Form 제출 채팅 메시지에 객체 문자열 대신 선택 행의 첫 번째 데이터 열 값을 표시하도록 수정했습니다.
- 2026-09-15: 챗봇 Form 시뮬레이터에 checkbox/radio option layout, 날짜·시간의 From/To 행 배치, chip/checkbox 방식의 multi dropbox, data slot·요소 API 기반 grid header 및 selectable grid 복수 행 저장을 반영했습니다.
- 2026-09-15: 챗봇 시뮬레이터의 Message·Delay·SetSlot node가 사용자 계속 버튼 없이 자동 진행되도록 수정하고, API node는 응답 본문 수신 완료까지 loading을 표시한 뒤 다음 경로로 진행하도록 수정했습니다.
- 2026-09-15: 챗봇 시뮬레이터의 Form 제출값을 빌더 실행기와 동일하게 각 input 이름의 최상위 slot에도 저장하여, 바로 다음 Slot Condition Branch가 입력값을 정상 평가하도록 수정했습니다.
- 2026-09-15: 챗봇 시뮬레이터에서 Slot Condition Branch가 버튼을 노출하지 않고 slot 조건을 자동 평가하도록 수정하고, Form 라벨 tooltip과 input 필수·이메일·숫자·길이·정규식 validation 및 텍스트 변환을 반영했습니다.
- 2026-09-15: 채팅 시나리오 실행에 최초 실행 당시의 배포 버전을 저장하고, 기존 실행을 다시 열거나 초기화해도 현재 배포 버전으로 바뀌지 않도록 수정했습니다.
- 2026-09-15: 챗봇 시나리오 시뮬레이터가 작업본 대신 현재 배포 버전(`depn_ver_id`)을 조회하고, 배포 버전의 `startNodeId`부터 실행하며 시작 Message node의 메시지를 즉시 표시하도록 수정했습니다.
- 2026-09-15: 챗봇 바로가기 메뉴의 시나리오 키/preset key 목록에 배포 버전이 있는 시나리오만 표시되도록 수정했습니다.
- 2026-09-15: 챗봇 시나리오 시뮬레이션이 캔버스형 및 저장 문서형 Form node 구조를 모두 정규화하고, 현재 폼 스펙의 input과 객체형 옵션, radio, 다중 선택, 날짜 범위/시간, 기본값, 필수 입력 및 grid 설정을 반영하도록 수정했습니다.
- 2026-09-04: 챗봇 시뮬레이터의 다중 선택 드롭다운에서 선택된 값은 칩으로, 옵션은 체크박스 드롭다운으로 표시되어 폼 빌더와 일치합니다.
- 2026-09-04: Form 챗봇 메시지는 사용 가능한 대화 폭을 활용해 드롭다운 필드가 더 이상 압축되지 않습니다.

### Removed

### Security

[Unreleased]: https://github.com/Young-Hyun-Ham/hams-baps/compare/HEAD...HEAD
