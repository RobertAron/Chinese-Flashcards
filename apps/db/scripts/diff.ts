import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type Row = Record<string, unknown>;

const dbPath = "apps/db/local.db";
const ref = process.argv[2] ?? "HEAD";

const committed = Bun.spawnSync(["git", "show", `${ref}:${dbPath}`]);
if (committed.exitCode !== 0) {
  console.error(committed.stderr.toString());
  process.exit(1);
}

const tempDir = mkdtempSync(join(tmpdir(), "db-diff-"));
const committedPath = join(tempDir, "committed.db");
await Bun.write(committedPath, committed.stdout);

const before = new Database(committedPath, { readonly: true });
const after = new Database(dbPath, { readonly: true });

const tableNames = (db: Database) =>
  db
    .query<{ name: string }, []>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations' ORDER BY name",
    )
    .all()
    .map(({ name }) => name);

const keyColumns = (db: Database, table: string) => {
  const columns = db.query<{ name: string; pk: number }, []>(`PRAGMA table_info("${table}")`).all();
  const primaryKey = columns.filter(({ pk }) => pk > 0).map(({ name }) => name);
  return primaryKey.length > 0 ? primaryKey : columns.map(({ name }) => name);
};

const rowsByKey = (db: Database, table: string, keys: string[]) =>
  new Map(
    db
      .query<Row, []>(`SELECT * FROM "${table}"`)
      .all()
      .map((row) => [keys.map((key) => `${key}=${row[key]}`).join(" "), row]),
  );

const format = (value: unknown) => JSON.stringify(value);

const beforeTables = tableNames(before);
const afterTables = tableNames(after);
let changeCount = 0;

for (const table of beforeTables.filter((name) => !afterTables.includes(name))) {
  console.log(`- table ${table}`);
  changeCount++;
}
for (const table of afterTables.filter((name) => !beforeTables.includes(name))) {
  console.log(`+ table ${table}`);
  changeCount++;
}

for (const table of afterTables.filter((name) => beforeTables.includes(name))) {
  const keys = keyColumns(after, table);
  const beforeRows = rowsByKey(before, table, keys);
  const afterRows = rowsByKey(after, table, keys);
  const lines: string[] = [];

  for (const [key, row] of beforeRows) {
    if (!afterRows.has(key)) lines.push(`  - ${key} ${format(row)}`);
  }
  for (const [key, row] of afterRows) {
    const previous = beforeRows.get(key);
    if (!previous) {
      lines.push(`  + ${key} ${format(row)}`);
      continue;
    }
    const changed = Object.keys(row).filter((column) => previous[column] !== row[column]);
    if (changed.length === 0) continue;
    lines.push(`  ~ ${key}`);
    for (const column of changed) {
      lines.push(`      ${column}: ${format(previous[column])} → ${format(row[column])}`);
    }
  }

  if (lines.length > 0) {
    console.log(table);
    console.log(lines.join("\n"));
    changeCount += lines.filter((line) => /^ {2}[-+~]/.test(line)).length;
  }
}

if (changeCount === 0) console.log(`No differences from ${ref}.`);

before.close();
after.close();
rmSync(tempDir, { recursive: true });
