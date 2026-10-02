CREATE TABLE IF NOT EXISTS "auth_credentials" (
	"party_id" varchar(128) PRIMARY KEY NOT NULL REFERENCES "k01_persons"("id") ON DELETE CASCADE,
	"password_hash" varchar(256) NOT NULL,
	"salt" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_credentials_status" ON "auth_credentials" ("status");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_otp_codes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"mobile" varchar(32) NOT NULL,
	"code_hash" varchar(128) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_otp_mobile" ON "auth_otp_codes" ("mobile");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_auth_otp_expires" ON "auth_otp_codes" ("expires_at");
