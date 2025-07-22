CREATE TABLE "editor_apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prefix" text DEFAULT 'editor_',
	"key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"last_request_at" timestamp NOT NULL,
	CONSTRAINT "editor_apikey_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "editor_apikey" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "apikey" CASCADE;--> statement-breakpoint
ALTER TABLE "editor_apikey" ADD CONSTRAINT "editor_apikey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Users can read/write their own API keys" ON "editor_apikey" AS PERMISSIVE FOR ALL TO "authenticated" USING (user_id = current_user_id());