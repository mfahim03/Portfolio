import { createResourceRecord, listResource } from "../models/portfolio-model.js";
import { initialContent } from "../lib/portfolio-content.js";

for (const [resource, rows] of Object.entries(initialContent)) {
  const existing = await listResource(resource);
  const existingIds = new Set(existing.map((row) => row.id));
  let inserted = 0;
  for (const { id, ...data } of rows) {
    if (existingIds.has(id)) continue;
    await createResourceRecord(resource, data, id);
    inserted += 1;
  }
  console.log(`${resource}: added ${inserted} record(s)`);
}
