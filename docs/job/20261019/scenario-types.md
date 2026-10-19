# Scenario types: Unit, Multi, Sub

## Behavior and schema

Scenario metadata has an optional scenario_type union (unit | multi | sub). A shared normalizer gives canonical scenario_type precedence over legacy kind/type aliases and defaults missing or invalid values to sub. Missing legacy records do not need a migration to display Sub.

The live New Job/edit Dialog in react-flow/scenario-list/page.tsx exposes three exclusive icon tiles below Description. Form initialization, load/reset paths, draft updates, and submit payloads all carry scenario_type. ScenarioCard renders the type badge at the upper left. The detail tab menu uses the same normalizer so changed types are consistent across screens.

## Persistence boundaries

FastAPI create, metadata patch, and definition-save requests include scenario_type. Fetch/list adapters normalize it for the UI. The external /chat/builder/scenarios server and its database schema are not present in this workspace; accepting, storing, and returning this new top-level field must be supported by that server. Live external database writes and schema support have not been verified.

Firebase creation, metadata patch, working-copy save, and immutable version data retain the type. Creation also accepts the current name argument as well as legacy newScenarioName, supplies non-undefined metadata defaults, and returns the generated document ID instead of its name. Those fixes are necessary for the list creation payload to create and reopen the correct document.

No authorization, node execution, or scenario graph layout behavior changes. The existing job field remains independent of scenario_type.

## Files

- types/types.ts and utils/scenarioTypes.ts
- components/ScenarioType.tsx and ScenarioCard.tsx
- react-flow/scenario-list/page.tsx and scenario-flow/scenarioTabs.ts
- services/fastApi.ts and firebaseApi.ts
- HISTORY.md and docs/pages/sidebar-header/admin/builder.md

## Validation

Passed default/canonical type checks and mock-backed execution of the actual Firebase create/patch/read/working-save/version-save/restore functions, including correct generated IDs and graph preservation. FastAPI create/patch/definition-save payload checks passed. These checks use in-memory adapters and do not prove remote server schema support. TypeScript, full lint, scoped diff checks, and the production build (including all 72 static pages) passed. Partial metadata patches without scenario_type were also checked to preserve the existing value. Authenticated browser and live DB checks are not performed.
