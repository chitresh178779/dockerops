# Developer Guide: Adding New Levels to DockerOps

This guide explains how **you (the project owner)** can add new levels to DockerOps easily and securely.

---

## 🔒 Security: Why Visitors Cannot Add Levels

DockerOps is built with a **declarative, repository-driven scenario engine**.
- **No public submission endpoints exist**: Users visiting your deployed website have read-only access to scenario definitions.
- **Sandboxes run real Docker commands**: Allowing unauthenticated web users to inject custom containers or commands could pose severe security risks.
- **Only repository maintainers can publish levels**: You add levels as YAML files in the repository. Once committed and deployed, the game engine loads and validates them automatically.

---

## 🚀 Method 1: The Interactive CLI (Recommended)

Run the level creator from the repository root:

```bash
pnpm new-level
```

The CLI will:
1. Automatically detect the next order number (e.g., Level `11`).
2. Prompt you for title, concept, difficulty, XP reward, and incident story.
3. Generate a complete, ready-to-play scenario file with 3 default parts (`investigate`, `fix`, `verify`).
4. Validate the scenario against the schema instantly (`ScenarioSchema.safeParse`).
5. Save the file to `packages/scenarios/levels/<order>-<slug>.yaml`.

### Non-Interactive One-Liner

You can also pass arguments directly:

```bash
pnpm new-level --title "Swarm Mesh Routing" --concept "networking" --difficulty "hard" --xp 400 --yes
```

---

## 📄 Method 2: Manual YAML Creation

1. Copy the reference template:
   ```bash
   cp packages/scenarios/templates/scenario-template.yaml packages/scenarios/levels/11-my-scenario.yaml
   ```
2. Edit the fields in `11-my-scenario.yaml`:
   - `metadata.order`: Unique number determining map placement and sequence.
   - `metadata.concept`: `containers` | `images` | `networking` | `volumes` | `dockerfile` | `compose` | `troubleshooting` | `security` | `scaling`
   - `metadata.difficulty`: `intro` | `easy` | `medium` | `hard` | `capstone`
   - `environment`: Declare initial containers, images, networks, and volumes.
   - `parts`: Define objectives, hints, and completion conditions.
   - `winCondition`: What must be true for the level to pass.

---

## 🧪 Validating Scenarios

Before deploying, verify all scenario files:

```bash
pnpm validate-levels
```

If any required field is missing or invalid, the validator gives exact file and line error feedback.

---

## 🚢 Publishing to Your Deployed Website

Because scenarios are statically validated and dynamically parsed by the engine:
1. `git add packages/scenarios/levels/`
2. `git commit -m "feat: add level 11 scenario"`
3. `git push`

When your app builds/starts up, the new level automatically appears on:
- The **Level Map** (`/levels`)
- The **Track Slider**
- The **Mission Runner** (`/level/<id>`)
- The **User Mission History** (`/history`)
- The **Field Manual** (`/manual`)
