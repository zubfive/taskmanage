import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  try {
    // Add the image_url column to the taskmanager table
    await db.execute(sql`ALTER TABLE practice_task ADD COLUMN IF NOT EXISTS image_url text;`);
    console.log("Added image_url column to practice_task table");
  } catch (error) {
    console.error("Error adding column:", error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 