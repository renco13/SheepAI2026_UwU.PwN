import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Copy .env.example to .env.local.");
}

const queryClient = postgres(databaseUrl, {
  max: 10,
  prepare: false
});

export const db = drizzle(queryClient, { schema });
export { schema };
