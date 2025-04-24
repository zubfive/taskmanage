import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from ".";
import postgres from "postgres";
import { env } from "@/env";

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migrations ran successfully!");
