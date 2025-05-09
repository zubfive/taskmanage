DO $$ BEGIN
 CREATE TYPE "public"."practice_priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "practice_task" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_task" ADD COLUMN "priority" "practice_priority" DEFAULT 'low';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "practice_task" ADD CONSTRAINT "practice_task_user_id_practice_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."practice_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
