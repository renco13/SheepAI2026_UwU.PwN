import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const sql = postgres(databaseUrl, { max: 1, prepare: false });

async function main() {
  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const content = await readFile(fullPath, "utf8");
    console.log(`Applying ${file}`);
    await sql.unsafe(content);
  }

  await sql.end();
  console.log("Migrations applied.");
}

main().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
