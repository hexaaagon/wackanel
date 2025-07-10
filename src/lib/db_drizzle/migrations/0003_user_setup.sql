CREATE TABLE "user_setup" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"last_updated" timestamp,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "user_setup" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_wakatime_heartbeats" ALTER COLUMN "total_seconds" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_heartbeats" ALTER COLUMN "heartbeat_count" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_heartbeats" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_heartbeats" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_pending_heartbeats" ALTER COLUMN "instances" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_profiles" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_profiles" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_stats" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_setup" ADD CONSTRAINT "user_setup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Users can read/write their own profile" ON "user_setup" AS PERMISSIVE FOR ALL TO "authenticated" USING (id = current_user_id());