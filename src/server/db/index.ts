import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// import * as relations from "./relations";
import { env } from "@/env";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

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

// Execute this migration when the application starts
const addImageUrlColumnMigration = async () => {
  try {
    await db.execute(sql`
      ALTER TABLE practice_task 
      ADD COLUMN IF NOT EXISTS image_url text;
    `);
    console.log("✅ Successfully added image_url column to practice_task table (if it didn't exist)");
  } catch (error) {
    console.error("❌ Error adding image_url column:", error);
  }
};

// Run the migration
addImageUrlColumnMigration().catch(console.error);
