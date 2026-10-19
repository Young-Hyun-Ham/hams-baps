# Scenario detail editor publishing

## Approach

Apply the supplied reference layout: white header with compact tools and Save/Publish actions, categorized node palette, dotted canvas, and small minimap. Merge page-specific CSS with existing Detail styles without changing shared CSS. Add an opt-in scenario variant to NodesTreeUI/NodesTree and reuse existing data and event handlers.

Keep search, Flow/Orkes switching, custom node settings, drag/click mode, execution, interaction lock, and simulator access. Search expands from the toolbar. Scenario tabs appear when multiple tabs are open. Narrow screens move tools to a separate row with horizontal scrolling. No dummy node is introduced for the reference image's blank white area.

## Files and boundaries

- scenario-flow/page.tsx: header/tools, original save/version-save actions, background, viewport controls.
- scenario-flow/ScenarioFlow.module.css: isolated layout and palette styles.
- components/NodesTreeUI.tsx and NodesTree.tsx: opt-in palette presentation.
- HISTORY.md and docs/pages/sidebar-header/admin/builder.md: change log and usage.

Store mutations, save payloads, APIs, backend selection, authorization, execution engine, and node/edge editing handlers are unchanged. Publish invokes the original Push Scenario version-save action and does not add a deployment API. No fixed Unsaved changes message is shown because existing state does not provide reliable change tracking.

## Validation

- Full lint passed.
- Final TypeScript check passed.
- Production build passed, including compilation, TypeScript, and all 72 static pages. Final interaction-lock restoration was additionally checked by TypeScript.
- Authenticated browser visual comparison and live drag/save/version-save smoke checks have not been performed.

## Preview toggle correction

The final toolbar button toggles the bottom-right minimap using local visibility state (visible by default). Its tooltip, accessible pressed state, and active color reflect visibility. Removed the obsolete alignment handler from this page; the button does not mutate nodes, edges, or edit history. Validation: pnpm exec tsc --noEmit --pretty false passed after this correction. Browser interaction has not been checked.

## Toolbar grouping

All three groups use a 30px border-box height. React Flow interaction buttons also use border-box sizing so their padding does not enlarge zoomTools. CSS values checked; no browser visual verification or full build was run for this CSS-only adjustment.

Wrapped editing tools through StickyNote and scenario tools through Search in separate presentation groups, followed by zoomTools. All three use matching borders with an 8px gap. Removed internal text separators; handlers and button ordering remain unchanged. This markup/CSS change is checked with Prettier and diff validation; browser visual verification has not been performed.

## Shared node icons

Added components/icons/NodeTypeIcon.tsx as the shared icon mapping. The palette and all NodeWrapper callers use this mapping, including the Boxes fallback. The separate ScenarioNode header uses the Bot mapping for Sub Agent. Existing NodeWrapper modifications and configured colors are preserved. No node content, store actions, or execution behavior was changed. TypeScript and diff checks passed. Full lint found one static-components issue in the new icon component; after replacing its lookup helper with a module-level mapping lookup, lint passed for both affected files. Other files had no lint findings. Production build and browser visual checks were not repeated for this icon-only change.

## Explicit node editing

Follow-up: NodeWrapper's Edit button now sits inside the nodeBody div. The body collapse uses display:none on that div, so both content and Edit hide together without unmounting input state. A Fragment around sibling elements does not propagate the div's hidden style. JSX nesting was checked; browser checks and full build were not repeated for this markup-only adjustment.

Added a page-scoped NodeEditContext and a shared footer Edit button. NodeWrapper and standalone Scenario/Delay/YN nodes expose Edit; embedded Orkes wrappers also expose it so settings remain accessible. Outside this page the context is absent and no button is injected. The context callback checks existing unuseNodes modification permissions, confirms the original node still exists, selects it, then explicitly opens the panel. Existing NodeWrapper changes are preserved.

Selection state remains available to history, clipboard, multi-select, search, and execution. The options panel is independently gated and mounted only for an explicitly edited node. Canvas/node clicks, a different selection, scenario/tab/view switches, and deletion close or invalidate it. Buttons stop propagation and use nodrag/nopan classes. Footer sizing preserves expanded selection-group minimum heights; compact circle nodes use an external Edit button to preserve handle geometry. The provider wraps only the canvas, keeping nested editor modals outside its scope. Final TypeScript, full lint, and diff checks passed. The production build passed compilation, TypeScript, and generation of all 72 static pages. Browser interaction checks have not been performed.

## Header action palette

NodeWrapper now exposes its existing header actions through a right-aligned ellipsis button. A MUI Popover portals the palette outside transformed/clipped React Flow node containers, anchors it to the trigger, restores focus, and handles outside click and Escape. Existing start, anchor, delete, API test, and group button handlers remain unchanged. Selection/drag events are stopped, enabled action clicks close the palette, and disabled actions remain disabled. Body collapse and Edit stay independent. Action dismissal is deferred to the next task so custom handlers receive their click before the palette unmounts. NodeWrapper lint, Prettier parsing/formatting, and diff checks passed. Browser interaction and full build were not repeated for this JSX/CSS change.

## Persistent node titles

Added shared NodeTitleData metadata and nodeTitles helpers. Factories seed data.title using the node type label; save sanitization fills missing/blank legacy titles without mutating input nodes. Existing non-empty titles, including form headings, remain intact. The FastAPI payload forwards full data.nodes, and Firebase saves the same definition, so no separate database column or execution-engine change is needed.

NodeTitle provides Pencil editing with modification-permission checks, Enter/blur commit, Escape cancel, IME composition protection, and empty-value fallback. It updates data.title through the existing history-aware updateNodeData action. NodeWrapper shows title + Pencil on the left and a small gray type label before the ellipsis. Standalone Scenario/Delay/YN nodes and the Orkes wrapper share title editing. Group metadata is decoupled from its type label; the options editor follows externally committed title changes to avoid overwriting them with stale data. Save/Publish persists the current definition through existing backend services. The form editor title store also follows committed header changes without resetting form elements. Validation: default-title checks for 15 node types, legacy normalization, existing form-title preservation, input immutability, renamed-title JSON round trip, TypeScript, and full lint passed. Production build passed compilation, TypeScript, and all 72 static pages. Browser interaction and live database writes were not performed.

## Scenario tab palette

Replaced the old tab strip with a MUI Menu below the top-left scenario badge. Rows display type icon, scenario title, current version, and existing close controls. Sub is the default per user clarification; explicit unit/multi metadata is respected. The bottom Back list uses the existing list-navigation handler.

Tab selection preserves the live graph and scenario metadata before restoring the target snapshot. Choosing the current tab is a no-op, avoiding stale-snapshot replacement. Metadata refresh follows Save/Publish version changes. Sub-scenario payloads retain the source ID and name even if omitted by the backend; Firebase receives {scenarioId} while FastAPI receives its existing string ID. Tab state and graphs remain local and no database write is performed by menu navigation. Checks passed for default Sub classification, Unit/Multi icon metadata, version labels, preservation of unsaved source nodes/edges and latest metadata, restoration of target nodes/edges, and active-tab no-op. TypeScript, full lint, and diff checks passed. Production build passed compilation, TypeScript, and all 72 static pages. Authenticated browser interaction has not been verified.
