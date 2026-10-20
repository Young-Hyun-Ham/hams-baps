# Group API routing

- Fix API success to Bottom and error to Right inside selection groups.
- Resolve success and unconnected error by child order; explicit onError edges take priority for failure.
- Share resolution between the builder runner and scenario-core simulator. A final API continues through the parent group, or completes if there is no continuation.
- Preserve internal onError edges during automatic sequence rebuilding and reordering, and render them on the canvas.
- Hide context-menu input/output position settings for child nodes.

Changed: ApiNode.jsx, scenario-flow/page.tsx, useBuilderExecution.ts, scenario-core engine and groupApiRouting.ts.

Validation: core compiled using root pnpm exec tsc -p core/scenario-core/tsconfig.json (the core package alone has no local tsc binary); seven routing tests passed. UI browser interaction was not verified. Full lint/build results are recorded in HISTORY.md.
