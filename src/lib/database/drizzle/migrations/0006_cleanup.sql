ALTER TABLE "user_wakatime_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "Users can read their own stats" ON "user_wakatime_stats" CASCADE;--> statement-breakpoint
DROP TABLE "user_wakatime_stats" CASCADE;--> statement-breakpoint
ALTER TABLE "user_setup" ADD CONSTRAINT "unique_user_setup" UNIQUE("user_id");