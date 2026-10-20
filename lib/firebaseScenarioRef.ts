import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

/** Old saved chat links can still use the pre-migration ID. */
export async function resolveScenarioRef(id: string) {
  const direct = doc(db, "scenarios", id);
  if ((await getDoc(direct)).exists()) return direct;
  const aliases = await getDocs(
    query(collection(db, "scenarios"), where("scenarioId", "==", id), limit(2)),
  );
  if (aliases.size > 1) throw new Error("Ambiguous legacy scenario ID.");
  return aliases.docs[0]?.ref ?? direct;
}
