import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { ScenarioSchema, type Scenario } from "@dockerops/shared";

export const LEVELS_DIR = join(__dirname, "..", "levels");

export interface ScenarioValidationError {
  file: string;
  issues: string[];
}

/**
 * Loads and validates every level YAML file. Invalid scenarios are reported
 * rather than thrown, so one bad file doesn't take down the whole catalog —
 * matching the spec's "scenario validation checks ... before publication".
 */
export function loadAllScenarios(): { scenarios: Scenario[]; errors: ScenarioValidationError[] } {
  const files = readdirSync(LEVELS_DIR).filter(
    (f) => (f.endsWith(".yaml") || f.endsWith(".yml")) && !f.startsWith("_"),
  );
  const scenarios: Scenario[] = [];
  const errors: ScenarioValidationError[] = [];

  for (const file of files) {
    const raw = readFileSync(join(LEVELS_DIR, file), "utf-8");
    const parsed = parse(raw);
    const result = ScenarioSchema.safeParse(parsed);
    if (result.success) {
      scenarios.push(result.data);
    } else {
      errors.push({
        file,
        issues: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    }
  }

  scenarios.sort((a, b) => a.metadata.order - b.metadata.order);
  return { scenarios, errors };
}

export function loadScenarioById(id: string): Scenario | undefined {
  const { scenarios } = loadAllScenarios();
  return scenarios.find((s) => s.metadata.id === id);
}
