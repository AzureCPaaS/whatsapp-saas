CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"contact_phone" text NOT NULL,
	"direction" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"content" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"meta_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messages_meta_message_id_unique" UNIQUE("meta_message_id")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_workspace_id_users_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;