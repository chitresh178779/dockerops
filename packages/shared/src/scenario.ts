import { z } from "zod";

/**
 * Everything a level author writes is DATA. The engine never hard-codes
 * level-specific UI or logic — it interprets these YAML documents at
 * runtime, validates them with this schema, and drives sandbox
 * provisioning + objective checking generically.
 */

export const HintTierSchema = z.enum(["concept", "direction", "command", "explanation"]);

export const HintSchema = z.object({
  id: z.string(),
  tier: HintTierSchema,
  text: z.string(),
  xpCost: z.number().int().min(0).default(0),
});

/** A single verifiable assertion against the sandbox's real Docker state. */
export const ConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("container_state"),
    target: z.string(),
    equals: z.enum(["running", "exited", "restarting", "paused", "dead", "created", "absent"]),
  }),
  z.object({
    type: z.literal("container_health"),
    target: z.string(),
    equals: z.enum(["healthy", "unhealthy", "starting", "none"]),
  }),
  z.object({
    type: z.literal("container_exit_code"),
    target: z.string(),
    equals: z.number().int(),
  }),
  z.object({
    type: z.literal("container_image"),
    target: z.string(),
    equals: z.string(),
  }),
  z.object({
    type: z.literal("container_restart_count_max"),
    target: z.string(),
    max: z.number().int(),
  }),
  z.object({
    type: z.literal("port_published"),
    target: z.string(),
    containerPort: z.number().int(),
    hostPort: z.number().int().optional(),
  }),
  z.object({
    type: z.literal("network_exists"),
    target: z.string(),
  }),
  z.object({
    type: z.literal("network_connected"),
    container: z.string(),
    network: z.string(),
    connected: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("volume_exists"),
    target: z.string(),
  }),
  z.object({
    type: z.literal("volume_mounted"),
    container: z.string(),
    volume: z.string(),
    mountPath: z.string().optional(),
  }),
  z.object({
    type: z.literal("image_exists"),
    repository: z.string(),
    tag: z.string(),
  }),
  z.object({
    type: z.literal("exec_output_contains"),
    target: z.string(),
    command: z.array(z.string()),
    contains: z.string(),
  }),
  z.object({
    /** Curls http://localhost:<hostPort><path> FROM the sandbox shell — this
     * only works for a port actually published to the sandbox's own network
     * namespace (environment.containers[].ports[].hostPort). It canNOT
     * resolve a container by NAME (the sandbox shell isn't itself attached
     * to the inner user-defined bridge network, so Docker's embedded DNS
     * doesn't apply to it) — for "can container A reach container B"
     * checks, use `network_connected` instead. */
    type: z.literal("http_status"),
    hostPort: z.number().int(),
    path: z.string().default("/"),
    equals: z.number().int(),
  }),
  z.object({
    /** Matches against the session's recorded command history — for
     * investigate-style objectives ("run docker ps -a") that don't mutate
     * state but demonstrate the player looked in the right place. */
    type: z.literal("command_used"),
    pattern: z.string(),
  }),
]);

export const LevelPartKindSchema = z.enum(["investigate", "fix", "verify"]);

export const LevelPartSchema = z.object({
  id: z.string(),
  kind: LevelPartKindSchema,
  title: z.string(),
  objective: z.string(),
  briefing: z.string().optional(),
  hints: z.array(HintSchema).default([]),
  docRefs: z.array(z.string()).default([]),
  completionConditions: z.array(ConditionSchema).min(1),
});

export const AllowedCommandFamilySchema = z.enum([
  "container-lifecycle",
  "inspection",
  "images",
  "networking",
  "storage",
  "compose",
  "build",
  "system",
]);

/** Declarative initial environment, realized as REAL docker resources inside the player's sandbox. */
export const InitContainerSchema = z.object({
  name: z.string(),
  image: z.string(),
  command: z.array(z.string()).optional(),
  env: z.record(z.string()).default({}),
  networks: z.array(z.string()).default([]),
  volumes: z
    .array(z.object({ name: z.string(), mountPath: z.string(), readOnly: z.boolean().default(false) }))
    .default([]),
  ports: z.array(z.object({ containerPort: z.number().int(), hostPort: z.number().int().optional() })).default([]),
  healthcheck: z
    .object({ test: z.array(z.string()), intervalSeconds: z.number().default(2), retries: z.number().default(3) })
    .optional(),
  /** Start the container already stopped/exited, to simulate the incident. */
  startState: z.enum(["running", "exited", "created"]).default("running"),
  restartPolicy: z.enum(["no", "on-failure", "always", "unless-stopped"]).default("no"),
});

export const InitEnvironmentSchema = z.object({
  hostName: z.string().default("prod-01"),
  images: z.array(z.object({ repository: z.string(), tag: z.string(), pull: z.boolean().default(true) })).default([]),
  networks: z.array(z.object({ name: z.string(), driver: z.string().default("bridge") })).default([]),
  volumes: z.array(z.object({ name: z.string() })).default([]),
  containers: z.array(InitContainerSchema).default([]),
  /** Raw shell run inside the sandbox after resources are created, for fault injection that's awkward to express declaratively. */
  setupScript: z.string().optional(),
});

export const ScenarioMetadataSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  title: z.string(),
  concept: z.string(),
  difficulty: z.enum(["intro", "easy", "medium", "hard", "capstone"]),
  estimatedMinutes: z.number().int(),
  prerequisites: z.array(z.string()).default([]),
  xpReward: z.number().int(),
  commandFamilies: z.array(AllowedCommandFamilySchema),
  /** Short "you will learn" bullets shown on the level map card. Falls back
   * to the parts' titles if an author doesn't provide these. */
  learningGoals: z.array(z.string()).default([]),
});

export const NarrativeSchema = z.object({
  role: z.string(),
  incident: z.string(),
  symptoms: z.array(z.string()),
  missionBrief: z.string(),
  timeline: z.array(z.string()).default([]),
});

export const AchievementRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ScenarioSchema = z.object({
  metadata: ScenarioMetadataSchema,
  narrative: NarrativeSchema,
  environment: InitEnvironmentSchema,
  hiddenState: z.array(z.string()).default([]),
  parts: z.array(LevelPartSchema).min(1),
  winCondition: z.array(ConditionSchema).min(1),
  failureConditions: z.array(ConditionSchema).default([]),
  achievements: z.array(AchievementRefSchema).default([]),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
export type LevelPart = z.infer<typeof LevelPartSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Hint = z.infer<typeof HintSchema>;
export type InitEnvironment = z.infer<typeof InitEnvironmentSchema>;
export type InitContainer = z.infer<typeof InitContainerSchema>;
