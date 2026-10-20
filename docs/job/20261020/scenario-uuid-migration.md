# Firebase scenario UUID migration and editable names

## Scope

- `scenarios` documents with non-UUID keys move to new UUID keys. Their original key becomes the immutable root `scenarioId` alias. Existing UUID keys remain unchanged.
- All descendant documents (including versions and deployHistory) move with the root. Known scenario-reference fields in graphs, versions, deploy history, `chatbot-shortcut-menus` and `knowledge_projects` descendants are remapped. Node IDs, names, message contents and version numbers remain intact.
- The New Job/edit dialog permits changing Name; edit payloads include the trimmed name and reject blank names. Firebase updates the same UUID document. The legacy rename function also uses this metadata update rather than moving documents.
- List/detail return values use the physical Firestore document ID. Legacy chat links resolve via the preserved `scenarioId` alias.
- No FastAPI database migration is performed; its existing metadata patch receives the name as well. Live FastAPI rename behavior requires its external server to support that field.

## Script

```powershell
node scripts/migrate-scenario-ids.mjs
node scripts/migrate-scenario-ids.mjs --apply
node --test scripts/migrate-scenario-ids.test.mjs scripts/scenario-name.test.mjs
```

The default is read-only. The script loads `.env.local` then `.env`, verifies matching admin/client project IDs, and refuses conflicting legacy aliases or more than 450 atomic writes. Before writing it creates a local, git-ignored `.migration-backups/scenario-ids-*.json` file containing the exact before/after data and ID map. Tagged values preserve Firestore timestamps, references, bytes and geopoints. `decode` is exported for recovery tooling; backups contain private document contents and must remain local.

One transaction rereads scanned collections to detect concurrent edits, creates new documents without overwriting collisions, updates affected references, and deletes old root/descendant documents. A failure aborts the entire transaction. After commit, every target is compared with its planned contents and every moved source is checked for absence. Rerunning skips UUID documents.

Historical chat records are preserved; legacy aliases support their scenario links. Open browser tabs should reload after migration so cached old document IDs are replaced before editing. Runtime code changes must be served for legacy alias lookup to apply.

## Validation

- Initial dry-run: 20 scenario roots, 48 affected documents, 94 writes.
- Applied to the configured Firebase project: 20 roots migrated; all 48 affected documents verified against planned contents, with moved source documents confirmed deleted. Backups are stored locally under `.migration-backups/` and excluded from git.
- Post-apply dry-run: 0 scenarios, 0 documents, 0 writes (idempotency confirmed against live data).
- All five migration and real-service mock tests passed. The metadata tests verify that renaming preserves UUID, legacy alias, graph and version documents, rejects blank names, and returns the physical ID despite stale stored `id` fields.
- Full lint passed.
- Migration fixture tests passed for nested trees, graph/menu/intent references, unrelated content preservation, idempotency, conflicts and typed backup roundtrips.
- Full TypeScript check is blocked by the pre-existing `scenario-flow/scenarioTabs.ts:7` mismatch between `agent` and `ScenarioTabKind`.
- Production build compiled successfully, then failed its type-check stage at that same pre-existing mismatch.
- Authenticated browser and live FastAPI writes were not exercised.
