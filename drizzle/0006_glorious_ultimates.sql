ALTER TABLE "practice_task" DROP CONSTRAINT "practice_task_user_id_practice_users_id_fk";
--> statement-breakpoint
ALTER TABLE "practice_task" DROP COLUMN IF EXISTS "user_id";