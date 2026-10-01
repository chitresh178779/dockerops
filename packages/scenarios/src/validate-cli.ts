import { loadAllScenarios } from "./loader";

const { scenarios, errors } = loadAllScenarios();

console.log(`Loaded ${scenarios.length} valid scenario(s):`);
for (const s of scenarios) {
  console.log(`  [${s.metadata.order}] ${s.metadata.id} — "${s.metadata.title}" (${s.parts.length} parts)`);
}

if (errors.length) {
  console.error(`\n${errors.length} scenario file(s) failed validation:`);
  for (const e of errors) {
    console.error(`  ${e.file}:`);
    for (const issue of e.issues) console.error(`    - ${issue}`);
  }
  process.exit(1);
}
