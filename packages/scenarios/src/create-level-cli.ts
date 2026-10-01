import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline/promises";
import { stringify } from "yaml";
import { ScenarioSchema, type Scenario } from "@dockerops/shared";

const LEVELS_DIR = join(__dirname, "..", "levels");

interface CliArgs {
  order?: number;
  id?: string;
  title?: string;
  concept?: string;
  difficulty?: "intro" | "easy" | "medium" | "hard" | "capstone";
  minutes?: number;
  xp?: number;
  incident?: string;
  nonInteractive?: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--order" && args[i + 1]) result.order = parseInt(args[++i], 10);
    else if (arg === "--id" && args[i + 1]) result.id = args[++i];
    else if (arg === "--title" && args[i + 1]) result.title = args[++i];
    else if (arg === "--concept" && args[i + 1]) result.concept = args[++i];
    else if (arg === "--difficulty" && args[i + 1])
      result.difficulty = args[++i] as CliArgs["difficulty"];
    else if (arg === "--minutes" && args[i + 1]) result.minutes = parseInt(args[++i], 10);
    else if (arg === "--xp" && args[i + 1]) result.xp = parseInt(args[++i], 10);
    else if (arg === "--incident" && args[i + 1]) result.incident = args[++i];
    else if (arg === "--yes" || arg === "-y" || arg === "--non-interactive")
      result.nonInteractive = true;
  }

  return result;
}

function getExistingScenarios(): { file: string; order: number; id: string }[] {
  if (!existsSync(LEVELS_DIR)) return [];
  const files = readdirSync(LEVELS_DIR).filter(
    (f) => (f.endsWith(".yaml") || f.endsWith(".yml")) && !f.startsWith("_"),
  );

  const list: { file: string; order: number; id: string }[] = [];
  for (const f of files) {
    try {
      const content = readFileSync(join(LEVELS_DIR, f), "utf-8");
      const orderMatch = content.match(/order:\s*(\d+)/);
      const idMatch = content.match(/id:\s*([a-zA-Z0-9_-]+)/);
      if (orderMatch && idMatch) {
        list.push({
          file: f,
          order: parseInt(orderMatch[1], 10),
          id: idMatch[1],
        });
      }
    } catch {
      // ignore
    }
  }

  return list.sort((a, b) => a.order - b.order);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function promptOrDefault(
  rl: readline.Interface | null,
  promptText: string,
  defaultValue: string,
): Promise<string> {
  if (!rl) return defaultValue;
  const answer = await rl.question(`${promptText} [${defaultValue}]: `);
  return answer.trim() ? answer.trim() : defaultValue;
}

export async function main() {
  console.log(`\n======================================================`);
  console.log(`  DOCKEROPS — LEVEL CREATION TOOL (OWNER / DEV ONLY)`);
  console.log(`======================================================\n`);

  const existing = getExistingScenarios();
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((e) => e.order)) : 0;
  const nextOrder = maxOrder + 1;

  console.log(`Current catalog: ${existing.length} scenario(s) loaded.`);
  console.log(`Suggested next order: Level ${nextOrder}\n`);

  const cliArgs = parseArgs();
  const isInteractive = !cliArgs.nonInteractive && process.stdin.isTTY;

  let rl: readline.Interface | null = null;
  if (isInteractive) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  try {
    const orderStr = await promptOrDefault(
      rl,
      "Level Order",
      String(cliArgs.order ?? nextOrder),
    );
    const order = parseInt(orderStr, 10) || nextOrder;

    const defaultTitle = cliArgs.title ?? `Level ${order} Scenario`;
    const title = await promptOrDefault(rl, "Level Title", defaultTitle);

    const defaultSlug = cliArgs.id ?? slugify(title);
    const slug = await promptOrDefault(rl, "Level ID (slug)", defaultSlug);

    const concept = await promptOrDefault(
      rl,
      "Concept (containers, images, networking, volumes, compose, troubleshooting, security, scaling)",
      cliArgs.concept ?? "networking",
    );

    const difficulty = (await promptOrDefault(
      rl,
      "Difficulty (intro, easy, medium, hard, capstone)",
      cliArgs.difficulty ?? (order <= 2 ? "intro" : order <= 5 ? "easy" : order <= 8 ? "medium" : "hard"),
    )) as "intro" | "easy" | "medium" | "hard" | "capstone";

    const minutesStr = await promptOrDefault(
      rl,
      "Estimated Minutes",
      String(cliArgs.minutes ?? 30),
    );
    const estimatedMinutes = parseInt(minutesStr, 10) || 30;

    const xpStr = await promptOrDefault(
      rl,
      "XP Reward",
      String(cliArgs.xp ?? order * 100),
    );
    const xpReward = parseInt(xpStr, 10) || 300;

    const incident = await promptOrDefault(
      rl,
      "Incident Briefing",
      cliArgs.incident ??
        `Alerts triggered on host prod-${String(order).padStart(2, "0")}. Containers require immediate maintenance.`,
    );

    // Get previous level ID as default prerequisite
    const prevScenario = existing.find((e) => e.order === order - 1);
    const prerequisites = prevScenario ? [prevScenario.id] : [];

    const paddedOrder = String(order).padStart(2, "0");
    const filename = `${paddedOrder}-${slug}.yaml`;
    const targetPath = join(LEVELS_DIR, filename);

    if (existsSync(targetPath)) {
      console.warn(`\n⚠️  Warning: File already exists: ${filename}`);
      const overwrite = await promptOrDefault(rl, "Overwrite existing file? (y/n)", "n");
      if (overwrite.toLowerCase() !== "y") {
        console.log("Operation aborted.");
        return;
      }
    }

    // Build standard high-quality scenario template
    const scenarioData: Scenario = {
      metadata: {
        id: slug,
        order,
        title,
        concept,
        difficulty,
        estimatedMinutes,
        prerequisites,
        xpReward,
        commandFamilies: ["container-lifecycle", "inspection"],
        learningGoals: [
          `Diagnose and isolate ${concept} anomalies`,
          `Deploy and configure target service components`,
          `Verify operational health and inspect system state`,
        ],
      },
      narrative: {
        role: `You are the lead on-call reliability engineer assigned to prod-${paddedOrder}.`,
        incident,
        symptoms: [
          `Services on host prod-${paddedOrder} report unreachable endpoints.`,
          `Application logs show unhandled exit or configuration mismatch.`,
        ],
        missionBrief: `Investigate the failure, resolve the misconfiguration, and verify normal system operation.`,
        timeline: [
          `09:00 — Automated monitoring detects degradation.`,
          `09:05 — Alert dispatched to incident responder (you).`,
          `09:06 — Live shell session opened on prod-${paddedOrder}.`,
        ],
      },
      environment: {
        hostName: `prod-${paddedOrder}`,
        images: [
          { repository: "nginx", tag: "1.25", pull: true },
        ],
        networks: [],
        volumes: [],
        containers: [
          {
            name: `${slug}-svc`,
            image: "nginx:1.25",
            startState: "exited",
            env: {},
            networks: [],
            volumes: [],
            ports: [{ containerPort: 80, hostPort: 8080 }],
            restartPolicy: "no",
          },
        ],
      },
      hiddenState: [
        `Service ${slug}-svc exited on startup due to missing environment or configuration flag.`,
      ],
      parts: [
        {
          id: "investigate",
          kind: "investigate",
          title: "Audit host & container state",
          objective: "Inspect all containers on the host, including stopped and exited ones.",
          briefing: "Check what containers exist on this host and inspect their exit codes and logs.",
          hints: [
            {
              id: "inv-hint-1",
              tier: "concept",
              text: "Exited containers will not show in standard 'docker ps'.",
              xpCost: 0,
            },
            {
              id: "inv-hint-2",
              tier: "command",
              text: "Run: docker ps -a",
              xpCost: 10,
            },
          ],
          docRefs: ["containers-lifecycle", "containers-inspecting"],
          completionConditions: [
            {
              type: "command_used",
              pattern: "^docker ps( .*)?-a|^docker ps( .*)?--all",
            },
          ],
        },
        {
          id: "fix",
          kind: "fix",
          title: "Restore service operation",
          objective: `Start the service container '${slug}-svc' and ensure it stays running.`,
          briefing: "Bring the container back up and ensure it is healthy and responsive.",
          hints: [
            {
              id: "fix-hint-1",
              tier: "direction",
              text: `Start the container using 'docker start ${slug}-svc' or re-create it.`,
              xpCost: 5,
            },
            {
              id: "fix-hint-2",
              tier: "command",
              text: `Run: docker start ${slug}-svc`,
              xpCost: 10,
            },
          ],
          docRefs: ["containers-lifecycle"],
          completionConditions: [
            {
              type: "container_state",
              target: `${slug}-svc`,
              equals: "running",
            },
          ],
        },
        {
          id: "verify",
          kind: "verify",
          title: "Verify health check & connectivity",
          objective: "Confirm the service container remains running without unexpected restarts.",
          briefing: "Verify that the service is running cleanly with 0 exit code.",
          hints: [
            {
              id: "ver-hint-1",
              tier: "command",
              text: `Run: docker ps to verify uptime.`,
              xpCost: 0,
            },
          ],
          docRefs: ["containers-inspecting"],
          completionConditions: [
            {
              type: "container_state",
              target: `${slug}-svc`,
              equals: "running",
            },
          ],
        },
      ],
      winCondition: [
        {
          type: "container_state",
          target: `${slug}-svc`,
          equals: "running",
        },
      ],
      failureConditions: [],
      achievements: [
        {
          id: `${slug}-master`,
          title: `${title} Resolver`,
          description: `Successfully restored service operations in ${title}.`,
        },
      ],
    };

    // Validate with zod schema
    const validation = ScenarioSchema.safeParse(scenarioData);
    if (!validation.success) {
      console.error("\n❌ Generated scenario failed validation:");
      for (const err of validation.error.issues) {
        console.error(`   - ${err.path.join(".")}: ${err.message}`);
      }
      return;
    }

    // Convert to YAML and save
    const yamlContent = stringify(scenarioData, { indent: 2 });
    writeFileSync(targetPath, yamlContent, "utf-8");

    console.log(`\n======================================================`);
    console.log(`  🎉 LEVEL CREATED SUCCESSFULLY!`);
    console.log(`======================================================`);
    console.log(`  File: packages/scenarios/levels/${filename}`);
    console.log(`  Order: ${order} | ID: ${slug}`);
    console.log(`  Title: "${title}"`);
    console.log(`  Concept: ${concept} | Difficulty: ${difficulty}`);
    console.log(`  Schema Validation: ✅ 100% VALID`);
    console.log(`\nWhat happens now:`);
    console.log(`  1. The level is automatically live in the engine.`);
    console.log(`  2. Appears on the Level Map at order ${order}.`);
    console.log(`  3. Edit parts, hints, and docker conditions anytime in ${filename}.`);
    console.log(`  4. Run 'pnpm validate-levels' to test validation at any time.`);
    console.log(`  5. Public website visitors CANNOT create levels; only you can!`);
    console.log(`======================================================\n`);
  } finally {
    rl?.close();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal error creating level:", err);
    process.exit(1);
  });
}
