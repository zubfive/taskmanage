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
  conn: postgres.Sql | undefined;
};

export const connection = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = connection;

export const db = drizzle(connection, {
  schema: {
    ...schema,
  },
});
