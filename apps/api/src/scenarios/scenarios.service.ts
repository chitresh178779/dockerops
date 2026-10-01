import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { loadAllScenarios } from "@dockerops/scenarios";
import type { Scenario } from "@dockerops/shared";

export interface PublicPart {
  id: string;
  kind: string;
  title: string;
  objective: string;
  briefing?: string;
  docRefs: string[];
  hints: { id: string; tier: string; xpCost: number }[];
}

export interface PublicLevel {
  metadata: Scenario["metadata"];
  narrative: Scenario["narrative"];
  parts: PublicPart[];
  achievements: Scenario["achievements"];
}

@Injectable()
export class ScenariosService implements OnModuleInit {
  private readonly logger = new Logger(ScenariosService.name);
  private scenarios: Scenario[] = [];

  onModuleInit() {
    const { scenarios, errors } = loadAllScenarios();
    this.scenarios = scenarios;
    if (errors.length) {
      for (const e of errors) {
        this.logger.warn(`Scenario validation failed for ${e.file}: ${e.issues.join("; ")}`);
      }
    }
    this.logger.log(`Loaded ${scenarios.length} scenario(s): ${scenarios.map((s) => s.metadata.id).join(", ")}`);
  }

  getAll(): Scenario[] {
    return this.scenarios;
  }

  getById(id: string): Scenario {
    const found = this.scenarios.find((s) => s.metadata.id === id);
    if (!found) throw new NotFoundException(`Unknown level "${id}"`);
    return found;
  }

  /** Strips hidden state / win conditions / completion conditions so the
   * client can never read the answer out of the API response. */
  toPublic(scenario: Scenario): PublicLevel {
    return {
      metadata: scenario.metadata,
      narrative: scenario.narrative,
      achievements: scenario.achievements,
      parts: scenario.parts.map((p) => ({
        id: p.id,
        kind: p.kind,
        title: p.title,
        objective: p.objective,
        briefing: p.briefing,
        docRefs: p.docRefs,
        hints: p.hints.map((h) => ({ id: h.id, tier: h.tier, xpCost: h.xpCost })),
      })),
    };
  }
}
