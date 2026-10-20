import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const base = "../app/(content-header)/chatbot/components/emulator/";
function load(path, dependencies = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, console: { error() {} }, ...globals,
    require: (name) => {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
const routing = load("../core/scenario-core/src/engine/groupApiRouting.ts");
const graph = load(`${base}core/graph.ts`, {
  "@/core/scenario-core/src/engine/groupApiRouting": routing,
});

async function simulate({ success = false, errorHandle = "onError", errorFirst = false, last = false, networkError = false } = {}) {
  const nodes = [
    { id: "group", type: "selectionGroup", data: {} },
    { id: "api", type: "api", parentNode: "group", data: { url: "/mock", method: "GET", groupOrder: 1 } },
    ...(!last ? [{ id: "below", type: "message", parentNode: "group", data: { groupOrder: 2 } }] : []),
    { id: "recovery", type: "message", data: {} },
    { id: "after", type: "message", data: {} },
  ];
  const edges = [
    ...(!last ? [{ id: "success", source: "api", sourceHandle: "onSuccess", target: "below" }] : []),
    { id: "exit", source: "group", target: "after" },
  ];
  if (errorHandle) {
    const error = { id: "failure", source: "api", sourceHandle: errorHandle, target: "recovery" };
    if (errorFirst) edges.unshift(error); else edges.push(error);
  }
  const runner = load(`${base}runners/runApiNode.ts`, {
    "../../../utils": { resolveTemplate: (value) => value },
  }, { fetch: async () => {
    if (networkError) throw new Error("Network failure");
    return { ok: success, status: success ? 200 : 503, json: async () => ({}) };
  } });
  const hook = load(`${base}hooks/useScenarioAutoRunner.ts`, {
    react: { useEffect: (effect) => effect() },
    "../core/graph": graph,
    "../core/formNode": {},
    "../core/conditions": {},
  });
  const selected = [];
  const finished = [];
  hook.useScenarioAutoRunner({
    currentNode: nodes[1], nodes, edges, slotValues: {}, finished: false,
    runApiNode: (node) => runner.runApiNode(node, { slotValues: {}, formValues: {}, setSlotValues() {} }),
    setCurrentNodeId: (id) => selected.push(id),
    setFinished: (value) => finished.push(value),
  });
  await new Promise(setImmediate);
  return { selected, finished, nodes, edges };
}

test("actual simulator follows Error after HTTP 503 even when Success is first", async () => {
  assert.deepEqual((await simulate()).selected, ["recovery"]);
});
test("network failure also follows the explicit Error edge", async () => {
  assert.deepEqual((await simulate({ networkError: true })).selected, ["recovery"]);
});
test("failure without Error continues to the next child", async () => {
  assert.deepEqual((await simulate({ errorHandle: null })).selected, ["below"]);
});
test("success continues below even when the Error edge is first", async () => {
  assert.deepEqual((await simulate({ success: true, errorFirst: true })).selected, ["below"]);
});
test("legacy onFail edges remain supported", async () => {
  assert.deepEqual((await simulate({ errorHandle: "onFail" })).selected, ["recovery"]);
});
test("last API does not follow its Error edge after success", async () => {
  assert.deepEqual((await simulate({ success: true, last: true })).selected, ["after"]);
});
test("onError takes precedence over legacy onFail when both are present", async () => {
  const { nodes, edges } = await simulate();
  edges.unshift({ id: "legacy", source: "api", sourceHandle: "onFail", target: "below" });
  assert.equal(graph.findNextExecutableNode(nodes, edges, "api", "onError").id, "recovery");
});
