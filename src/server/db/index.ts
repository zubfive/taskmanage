import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// import * as relations from "./relations";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

export const db =
  globalForDb.db ??
  drizzle(
    postgres(env.DATABASE_URL, {
      prepare: false,
      // Turn off logging in production
      debug: process.env.NODE_ENV === "development",
    }),
    { schema },
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
