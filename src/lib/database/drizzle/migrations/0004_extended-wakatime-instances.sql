ALTER TABLE "user_wakatime_instances" ADD COLUMN "api_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_wakatime_instances" ADD COLUMN "options" jsonb DEFAULT '{}'::jsonb;