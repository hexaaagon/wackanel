CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 300000,
	"rate_limit_max" integer DEFAULT 25,
	"request_count" integer,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "user_wakatime_heartbeats" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"time_slot" integer NOT NULL,
	"project" text,
	"language" text,
	"category" text,
	"editor" text,
	"total_seconds" integer DEFAULT 0 NOT NULL,
	"heartbeat_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_wakatime_heartbeats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_wakatime_pending_heartbeats" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"instances" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"entity" text NOT NULL,
	"type" text NOT NULL,
	"category" text,
	"time" integer NOT NULL,
	"project" text,
	"project_root_count" integer,
	"branch" text,
	"language" text,
	"dependencies" text,
	"lines" text,
	"line_additions" integer,
	"line_deletions" integer,
	"lineno" integer,
	"cursorpos" text,
	"is_write" boolean
);
--> statement-breakpoint
ALTER TABLE "user_wakatime_pending_heartbeats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_wakatime_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"api_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_wakatime_instances" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_wakatime_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"total_seconds" integer NOT NULL,
	"total_seconds_including_other_language" integer NOT NULL,
	"human_readable_total" text NOT NULL,
	"human_readable_total_including_other_language" text NOT NULL,
	"best_hour" integer,
	"best_hour_total_seconds" integer,
	"best_hour_text" text,
	"categories" text,
	"projects" text,
	"languages" text,
	"editors" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_wakatime_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_wakatime_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wakatime_heartbeats" ADD CONSTRAINT "user_wakatime_heartbeats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wakatime_pending_heartbeats" ADD CONSTRAINT "user_wakatime_pending_heartbeats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wakatime_instances" ADD CONSTRAINT "user_wakatime_instances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wakatime_stats" ADD CONSTRAINT "user_wakatime_stats_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Users can read/write their own profile" ON "user_wakatime_profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING (id = current_user_id());--> statement-breakpoint
CREATE POLICY "Users can read/write their own heartbeats" ON "user_wakatime_heartbeats" AS PERMISSIVE FOR ALL TO "authenticated" USING (user_id = current_user_id());--> statement-breakpoint
CREATE POLICY "Users can read/write their own pending heartbeat" ON "user_wakatime_pending_heartbeats" AS PERMISSIVE FOR ALL TO "authenticated" USING (user_id = current_user_id());--> statement-breakpoint
CREATE POLICY "Users can read/write their own" ON "user_wakatime_instances" AS PERMISSIVE FOR ALL TO "authenticated" USING (user_id = current_user_id());--> statement-breakpoint
CREATE POLICY "Users can read their own stats" ON "user_wakatime_stats" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id = current_user_id());