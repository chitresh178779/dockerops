import { PrismaClient } from "@prisma/client";
import { loadAllScenarios } from "@dockerops/scenarios";

const prisma = new PrismaClient();

async function main() {
  const { scenarios, errors } = loadAllScenarios();
  if (errors.length) {
    console.warn("Scenario validation warnings during seed:");
    for (const e of errors) console.warn(`  ${e.file}: ${e.issues.join("; ")}`);
  }

  const achievements = scenarios.flatMap((s) => s.achievements);
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: a.id },
      update: { title: a.title, description: a.description },
      create: { id: a.id, title: a.title, description: a.description },
    });
  }

  await prisma.user.upsert({
    where: { email: "player@dockerops.local" },
    update: {},
    create: { displayName: "Player One", email: "player@dockerops.local" },
  });

  console.log(`Seeded ${achievements.length} achievements from ${scenarios.length} scenario(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
