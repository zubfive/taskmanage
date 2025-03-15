// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration


import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const statusEnum = pgEnum("practice_status", ["Pending", "Approved"]);


export const createTable = pgTableCreator((name) => `practice_${name}`);




export const taskmanager = createTable(
  "task",
  {
    id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
    title: varchar("title"),
    description: varchar("description").notNull(),
    status: statusEnum("status").default("Pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    
  },
)
