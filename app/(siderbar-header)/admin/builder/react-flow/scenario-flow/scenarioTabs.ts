import { getScenarioType } from "../../utils/scenarioTypes";
export type ScenarioTabKind = "unit" | "multi" | "sub";

export function getScenarioTabKind(
  scenario: Record<string, unknown>,
): ScenarioTabKind {
  return getScenarioType(scenario);
}

export function getScenarioTabVersion(
  scenario: Record<string, unknown>,
): string {
  const version =
    scenario.ver_id ??
    scenario.versions ??
    scenario.ltst_ver_id ??
    scenario.latestVersion;
  if (
    version === undefined ||
    version === null ||
    String(version).trim() === ""
  )
    return "Draft";
  return `v.${String(version)
    .trim()
    .replace(/^v[.\s]*/i, "")}`;
}
