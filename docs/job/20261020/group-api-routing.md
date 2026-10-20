# Group API routing

- Fix API success to Bottom and error to Right inside selection groups.
- Resolve success and unconnected error by child order; explicit onError edges take priority for failure.
- Share resolution between the builder runner and scenario-core simulator. A final API continues through the parent group, or completes if there is no continuation.
- Preserve internal onError edges during automatic sequence rebuilding and reordering, and render them on the canvas.
- Hide context-menu input/output position settings for child nodes.

Changed: ApiNode.jsx, scenario-flow/page.tsx, useBuilderExecution.ts, scenario-core engine and groupApiRouting.ts.

Validation: core compiled using root pnpm exec tsc -p core/scenario-core/tsconfig.json (the core package alone has no local tsc binary); seven routing tests passed. UI browser interaction was not verified. Full lint/build results are recorded in HISTORY.md.

## Actual simulator regression fix

The active builder modal uses ScenarioEmulator -> useScenarioAutoRunner -> emulator/core/graph.ts, rather than useChatFlow/ChatbotEngine. The old auto runner requested onFail although canvas API handles use onError. When no exact edge matched, graph traversal selected the first outgoing edge (typically success), causing errors to continue down the group. Earlier routing changes did not cover this active path.

The auto runner now passes onSuccess/onError according to the real API result. The emulator graph uses the shared selection-group API routing function: explicit onError wins, missing failure routes continue in child order, and the last API exits the group. Legacy onFail is supported with lower priority than onError.

Seven regression tests load the actual API runner, auto-runner hook and graph code, simulate HTTP 503/network failure, and assert the chosen next node. These tests cover both edge orders, unconnected failure, successful group exit and legacy routes. No live API requests or browser interaction were performed.
