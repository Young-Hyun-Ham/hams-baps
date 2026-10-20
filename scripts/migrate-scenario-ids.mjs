import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { cert, initializeApp, deleteApp } from "firebase-admin/app";
import {
  getFirestore,
  Timestamp,
  GeoPoint,
  DocumentReference,
} from "firebase-admin/firestore";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const referenceKeys = new Set([
  "scenarioId",
  "scenario_id",
  "snro_id",
  "scenarioKey",
  "selectedScenarioId",
  "targetScenarioId",
  "subScenarioId",
  "clone_from_id",
]);

// Tagged tuples preserve Firestore values and cannot collide with user map keys.
export function encode(value) {
  if (value instanceof Timestamp)
    return ["timestamp", value.seconds, value.nanoseconds];
  if (value instanceof GeoPoint)
    return ["geopoint", value.latitude, value.longitude];
  if (value instanceof DocumentReference) return ["reference", value.path];
  if (Buffer.isBuffer(value) || value instanceof Uint8Array)
    return ["bytes", Buffer.from(value).toString("base64")];
  if (value instanceof Date) return ["date", value.toISOString()];
  if (Array.isArray(value)) return ["array", value.map(encode)];
  if (value && typeof value === "object")
    return [
      "map",
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, encode(item)]),
    ];
  if (typeof value === "number" && !Number.isFinite(value))
    return ["number", String(value)];
  return ["scalar", value];
}

export function decode(value, db) {
  const [type, data, extra] = value;
  switch (type) {
    case "timestamp":
      return new Timestamp(data, extra);
    case "geopoint":
      return new GeoPoint(data, extra);
    case "reference":
      return db.doc(data);
    case "bytes":
      return Buffer.from(data, "base64");
    case "date":
      return new Date(data);
    case "array":
      return data.map((item) => decode(item, db));
    case "map":
      return Object.fromEntries(
        data.map(([key, item]) => [key, decode(item, db)]),
      );
    case "number":
      return Number(data);
    case "scalar":
      return data;
    default:
      throw new Error("Invalid backup value tag.");
  }
}

export function remapPath(path, ids) {
  const segments = path.split("/");
  if (segments[0] === "scenarios" && ids.has(segments[1]))
    segments[1] = ids.get(segments[1]);
  return segments.join("/");
}

export function rewrite(value, ids, db, key = "") {
  if (typeof value === "string")
    return referenceKeys.has(key) ? (ids.get(value) ?? value) : value;
  if (value instanceof DocumentReference)
    return db.doc(remapPath(value.path, ids));
  if (Array.isArray(value))
    return value.map((item) => rewrite(item, ids, db, key));
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([field, item]) => [
        field,
        rewrite(item, ids, db, field),
      ]),
    );
  }
  return value;
}

export function buildPlan(documents, db, newId = randomUUID) {
  const roots = documents.filter(
    ({ path }) => path.split("/").length === 2 && path.startsWith("scenarios/"),
  );
  const ids = new Map();
  for (const { path, data } of roots) {
    const id = path.split("/")[1];
    // A completed migration is identifiable without renaming UUIDs again on rerun.
    if (uuid.test(id)) continue;
    if (data.scenarioId !== undefined && data.scenarioId !== id) {
      throw new Error(
        "Existing scenarioId conflicts with the old document ID; no changes made.",
      );
    }
    ids.set(id, newId());
  }
  const operations = [];
  for (const document of documents) {
    const { path, data } = document;
    const parts = path.split("/");
    const root = parts[0] === "scenarios" && parts.length === 2;
    let next = rewrite(data, ids, db);
    if (root) {
      next = { ...next };
      // scenarioId on a root is a permanent legacy alias, not a foreign key.
      if (ids.has(parts[1])) {
        next.scenarioId = parts[1];
        next.name = data.name || parts[1];
      } else if (data.scenarioId !== undefined)
        next.scenarioId = data.scenarioId;
      if (data.id !== undefined) next.id = ids.get(parts[1]) ?? parts[1];
    }
    const target = remapPath(path, ids);
    if (
      target !== path ||
      JSON.stringify(encode(next)) !== JSON.stringify(encode(data))
    ) {
      operations.push({ ...document, target, next });
    }
  }
  return {
    ids,
    operations,
    writes: operations.reduce(
      (n, op) => n + (op.target === op.path ? 1 : 2),
      0,
    ),
  };
}

async function scan(db) {
  const documents = [];
  const collections = [];
  async function visit(collection) {
    const snapshot = await collection.get();
    collections.push({
      path: collection.path,
      versions: snapshot.docs.map((doc) => [
        doc.ref.path,
        encode(doc.updateTime),
      ]),
    });
    // listDocuments includes missing parent documents that still have children.
    const refs = await collection.listDocuments();
    for (const ref of refs) {
      const snapshotDoc = snapshot.docs.find(
        (doc) => doc.ref.path === ref.path,
      );
      if (snapshotDoc)
        documents.push({
          path: ref.path,
          data: snapshotDoc.data(),
          updateTime: snapshotDoc.updateTime,
        });
      else if (collection.path === "scenarios")
        throw new Error(
          "Orphaned scenario subcollections found; no changes made.",
        );
      for (const child of await ref.listCollections()) await visit(child);
    }
  }
  // Preserve graph references, menu launches and knowledge intent links.
  for (const name of [
    "scenarios",
    "chatbot-shortcut-menus",
    "knowledge_projects",
  ])
    await visit(db.collection(name));
  return { documents, collections };
}

export async function main(args = process.argv.slice(2)) {
  if (args.some((arg) => arg !== "--apply"))
    throw new Error("Usage: node scripts/migrate-scenario-ids.mjs [--apply]");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  dotenv.config({ path: resolve(root, ".env.local"), quiet: true });
  dotenv.config({ path: resolve(root, ".env"), quiet: true });
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey)
    throw new Error("Missing FIREBASE_* admin credentials.");
  if (clientProject && projectId !== clientProject)
    throw new Error("Admin and client Firebase project IDs differ.");
  const app = initializeApp(
    { credential: cert({ projectId, clientEmail, privateKey }), projectId },
    "scenario-uuid-migration",
  );
  const db = getFirestore(app);
  try {
    const { documents, collections } = await scan(db);
    const plan = buildPlan(documents, db);
    console.log(
      JSON.stringify({
        mode: args.includes("--apply") ? "apply" : "dry-run",
        projectId,
        scenariosToMove: plan.ids.size,
        documentsAffected: plan.operations.length,
        writes: plan.writes,
      }),
    );
    if (plan.writes > 450)
      throw new Error(
        "Plan exceeds the conservative 450-write atomic limit; split migration support is required. No changes made.",
      );
    if (!args.includes("--apply") || !plan.writes) return;
    const backupDir = resolve(root, ".migration-backups");
    await mkdir(backupDir, { recursive: true });
    const backup = resolve(
      backupDir,
      `scenario-ids-${Date.now()}-${randomUUID()}.json`,
    );
    await writeFile(
      backup,
      JSON.stringify(
        {
          format: 1,
          projectId,
          createdAt: new Date().toISOString(),
          ids: [...plan.ids],
          documents: plan.operations.map(({ path, target, data, next }) => ({
            path,
            target,
            before: encode(data),
            after: encode(next),
          })),
        },
        null,
        2,
      ),
      { flag: "wx", mode: 0o600 },
    );
    console.log(`Backup saved: ${backup}`);
    await db.runTransaction(async (transaction) => {
      // Detect edits/additions/deletions since the backup instead of overwriting them.
      for (const collection of collections) {
        const current = await transaction.get(db.collection(collection.path));
        const versions = current.docs.map((doc) => [
          doc.ref.path,
          encode(doc.updateTime),
        ]);
        if (JSON.stringify(versions) !== JSON.stringify(collection.versions))
          throw new Error(
            "Data changed during migration; rerun from a fresh snapshot. No changes committed.",
          );
      }
      for (const op of plan.operations) {
        if (op.target !== op.path) {
          transaction.create(db.doc(op.target), op.next);
          transaction.delete(db.doc(op.path));
        } else transaction.update(db.doc(op.path), op.next);
      }
    });
    // Read back exact values (including timestamps, references, bytes) and old paths.
    for (const op of plan.operations) {
      const migrated = await db.doc(op.target).get();
      if (
        !migrated.exists ||
        JSON.stringify(encode(migrated.data())) !==
          JSON.stringify(encode(op.next))
      )
        throw new Error(
          "Post-migration verification failed; retain the backup for recovery.",
        );
      if (op.target !== op.path && (await db.doc(op.path).get()).exists)
        throw new Error("Old document still exists after migration.");
    }
    console.log(
      JSON.stringify({
        status: "verified",
        scenariosMoved: plan.ids.size,
        documentsVerified: plan.operations.length,
      }),
    );
  } finally {
    await db.terminate();
    await deleteApp(app);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    // Avoid credentials / document contents in CLI errors.
    console.error(`Migration failed: ${error.code ?? error.message}`);
    process.exitCode = 1;
  });
}
