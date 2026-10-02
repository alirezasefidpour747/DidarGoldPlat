CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"token_hash" varchar(128) NOT NULL UNIQUE,
	"party_id" varchar(128) NOT NULL REFERENCES "k01_persons"("id") ON DELETE CASCADE,
	"organization_id" varchar(128) NOT NULL REFERENCES "k01_organizations"("id") ON DELETE CASCADE,
	"role_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"user_agent" text,
	"ip_address" varchar(64),
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_party" ON "auth_sessions" ("party_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_org" ON "auth_sessions" ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_token" ON "auth_sessions" ("token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_sessions_expires" ON "auth_sessions" ("expires_at");
