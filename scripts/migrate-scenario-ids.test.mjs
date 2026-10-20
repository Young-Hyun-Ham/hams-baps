import { test } from "node:test";
import assert from "node:assert/strict";
import { Timestamp, GeoPoint } from "firebase-admin/firestore";
import { buildPlan, encode, decode } from "./migrate-scenario-ids.mjs";

const first = "10000000-0000-4000-8000-000000000001";
const second = "20000000-0000-4000-8000-000000000002";
const db = { doc: (path) => ({ path }) };

test("moves complete trees and remaps graph, history, menu and intent references", () => {
  const original = [
    {
      path: "scenarios/Old A",
      data: {
        id: "Old A",
        name: "Display A",
        nodes: [
          { id: "node-1", data: { scenarioId: "Old B", content: "Old B" } },
        ],
        updatedAt: new Timestamp(123, 456),
      },
    },
    { path: "scenarios/Old B", data: { name: "B" } },
    {
      path: "scenarios/Old A/versions/1",
      data: { snro_id: "Old A", nodes: [{ data: { scenarioId: "Old B" } }] },
    },
    {
      path: "scenarios/Old A/deployHistory/entry",
      data: { snro_id: "Old A", ver_id: 1 },
    },
    {
      path: "chatbot-shortcut-menus/menu",
      data: { scenarioKey: "Old A", label: "Old A" },
    },
    {
      path: "knowledge_projects/project/intents/intent",
      data: { scenarioKey: "Old B" },
    },
  ];
  const before = encode(original);
  const generated = [first, second];
  const plan = buildPlan(original, db, () => generated.shift());
  assert.equal(plan.ids.size, 2);
  assert.equal(plan.writes, 10);
  const root = plan.operations[0];
  assert.equal(root.target, `scenarios/${first}`);
  assert.equal(root.next.scenarioId, "Old A");
  assert.equal(root.next.id, first);
  assert.equal(root.next.name, "Display A");
  assert.equal(root.next.nodes[0].id, "node-1");
  assert.equal(root.next.nodes[0].data.scenarioId, second);
  assert.equal(root.next.nodes[0].data.content, "Old B");
  assert.equal(plan.operations[2].target, `scenarios/${first}/versions/1`);
  assert.equal(plan.operations[2].next.snro_id, first);
  assert.equal(plan.operations[4].next.scenarioKey, first);
  assert.equal(plan.operations[4].next.label, "Old A");
  assert.deepEqual(encode(original), before);
  const migrated = plan.operations.map(({ target, next }) => ({
    path: target,
    data: next,
  }));
  assert.equal(buildPlan(migrated, db).writes, 0);
});

test("keeps UUID keys, preserves legacy aliases and rejects conflicting legacy fields", () => {
  assert.equal(
    buildPlan([{ path: `scenarios/${first}`, data: { name: "new" } }], db)
      .writes,
    0,
  );
  assert.throws(
    () =>
      buildPlan(
        [{ path: "scenarios/Old", data: { scenarioId: "different" } }],
        db,
      ),
    /conflicts/,
  );
  const plan = buildPlan(
    [{ path: "scenarios/Old", data: {} }],
    db,
    () => first,
  );
  assert.equal(plan.operations[0].next.name, "Old");
});

test("backup roundtrip preserves timestamps, geopoints, bytes, scalar types and map order", () => {
  const data = {
    stamp: new Timestamp(123, 987654321),
    point: new GeoPoint(37.5, 127),
    bytes: Buffer.from([0, 255]),
    nested: { scenarioId: "old", list: [null, false, Infinity, NaN] },
  };
  const saved = JSON.parse(JSON.stringify(encode(data)));
  assert.deepEqual(encode(decode(saved, db)), saved);
  assert.deepEqual(encode({ b: 1, a: 2 }), encode({ a: 2, b: 1 }));
});
