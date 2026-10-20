import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadService() {
  const store = new Map([
    [
      "scenarios/uuid",
      {
        id: "stale-id",
        name: "Before",
        scenarioId: "Legacy",
        nodes: [{ id: "node" }],
        ltst_ver_id: 2,
      },
    ],
    [
      "scenarios/uuid/versions/2",
      { name: "Published", nodes: [{ id: "node" }] },
    ],
  ]);
  const snapshot = (ref) => ({
    exists: () => store.has(ref.path),
    id: ref.path.split("/").at(-1),
    data: () => store.get(ref.path),
  });
  const firestore = {
    doc: (_, ...parts) => ({ path: parts.join("/") }),
    getDoc: async (ref) => snapshot(ref),
    updateDoc: async (ref, values) =>
      store.set(ref.path, { ...store.get(ref.path), ...values }),
    serverTimestamp: () => "server-time",
  };
  const exports = {};
  const source = readFileSync(
    new URL(
      "../app/(siderbar-header)/admin/builder/services/firebaseApi.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  vm.runInNewContext(output, {
    exports,
    require: (name) => {
      if (name === "firebase/firestore") return firestore;
      if (name === "@/lib/firebase") return { db: {} };
      if (name === "@/lib/firebaseScenarioRef")
        return { resolveScenarioRef: async () => ({ path: "scenarios/uuid" }) };
      if (name === "uuid") return { v4: () => "new-uuid" };
      if (name === "../utils/scenarioTypes")
        return { getScenarioType: () => "sub" };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return { service: exports, store };
}

test("renaming updates the name on the same UUID and retains graph, alias and version tree", async () => {
  const { service, store } = loadService();
  const result = await service.patchScenario({ id: "uuid", name: "  After  " });
  assert.equal(result.id, "uuid");
  assert.equal(result.name, "After");
  assert.equal(store.size, 2);
  assert.equal(store.get("scenarios/uuid").name, "After");
  assert.equal(store.get("scenarios/uuid").scenarioId, "Legacy");
  assert.equal(store.get("scenarios/uuid").nodes[0].id, "node");
  assert.equal(store.get("scenarios/uuid/versions/2").name, "Published");
  await service.renameScenario({
    oldScenario: { id: "uuid" },
    newName: "Again",
  });
  assert.equal(store.get("scenarios/uuid").name, "Again");
  assert.equal(store.size, 2);
  await assert.rejects(
    service.patchScenario({ id: "uuid", name: "  " }),
    /required/,
  );
  assert.equal(store.get("scenarios/uuid").name, "Again");
});

test("detail reads return the physical UUID rather than a stored stale id", async () => {
  const { service } = loadService();
  assert.equal(
    (await service.fetchScenarioData({ scenarioId: "Legacy" })).id,
    "uuid",
  );
});
