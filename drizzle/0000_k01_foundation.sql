CREATE TABLE "k01_audit_events" (
	"id" text PRIMARY KEY DEFAULT 'audit-' || gen_random_uuid()::text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"target_name" text,
	"description" text NOT NULL,
	"changes" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "k01_audit_events_action_check" CHECK ("k01_audit_events"."action" in ('create', 'update', 'status_change', 'document_upload', 'membership_link', 'suspend', 'archive')),
	CONSTRAINT "k01_audit_events_target_type_check" CHECK ("k01_audit_events"."target_type" in ('party', 'organization', 'membership', 'document'))
);
--> statement-breakpoint
CREATE TABLE "k01_documents" (
	"id" text PRIMARY KEY DEFAULT 'doc-' || gen_random_uuid()::text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"file_uri" text,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"uploaded_by" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "k01_documents_target_type_check" CHECK ("k01_documents"."target_type" in ('party', 'organization')),
	CONSTRAINT "k01_documents_document_type_check" CHECK ("k01_documents"."document_type" in ('national_id_card', 'guild_license', 'company_registration', 'partnership_contract', 'tax_certificate', 'warranty_certificate', 'other')),
	CONSTRAINT "k01_documents_verification_status_check" CHECK (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
	CONSTRAINT "k01_documents_file_size_check" CHECK ("k01_documents"."file_size" >= 0)
);
--> statement-breakpoint
CREATE TABLE "k01_memberships" (
	"id" text PRIMARY KEY DEFAULT 'mem-' || gen_random_uuid()::text NOT NULL,
	"party_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role_key" text NOT NULL,
	"title" text NOT NULL,
	"authorities" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "k01_memberships_status_check" CHECK (status in ('active', 'pending', 'suspended', 'archived')),
	CONSTRAINT "k01_memberships_date_range_check" CHECK ("k01_memberships"."valid_to" is null or "k01_memberships"."valid_to" >= "k01_memberships"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "k01_organizations" (
	"id" text PRIMARY KEY DEFAULT 'org-' || gen_random_uuid()::text NOT NULL,
	"legal_name" text NOT NULL,
	"display_name" text NOT NULL,
	"organization_type" text NOT NULL,
	"registration_number" text,
	"national_legal_id" text,
	"economic_code" text,
	"website" text,
	"phone" text NOT NULL,
	"email" text,
	"province" text,
	"city" text,
	"address" text,
	"postal_code" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"notes" text,
	"retailer_profile" jsonb,
	"manufacturer_profile" jsonb,
	"wholesaler_profile" jsonb,
	"supplier_profile" jsonb,
	"agent_office_profile" jsonb,
	"service_partner_profile" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "k01_organizations_type_check" CHECK ("k01_organizations"."organization_type" in ('didar', 'retailer', 'manufacturer', 'wholesaler', 'supplier', 'agent_office', 'service_partner', 'other')),
	CONSTRAINT "k01_organizations_status_check" CHECK (status in ('active', 'pending', 'suspended', 'archived')),
	CONSTRAINT "k01_organizations_verification_status_check" CHECK (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
	CONSTRAINT "k01_organizations_version_check" CHECK ("k01_organizations"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "k01_parties" (
	"id" text PRIMARY KEY DEFAULT 'party-' || gen_random_uuid()::text NOT NULL,
	"party_type" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"national_id" text,
	"mobile" text NOT NULL,
	"email" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"notes" text,
	"consumer_profile" jsonb,
	"agent_profile" jsonb,
	"internal_profile" jsonb,
	"representative_profile" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "k01_parties_party_type_check" CHECK ("k01_parties"."party_type" in ('consumer', 'field_agent', 'internal_user', 'external_representative', 'retailer_owner', 'supplier_representative', 'platform_admin')),
	CONSTRAINT "k01_parties_status_check" CHECK (status in ('active', 'pending', 'suspended', 'archived')),
	CONSTRAINT "k01_parties_verification_status_check" CHECK (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
	CONSTRAINT "k01_parties_version_check" CHECK ("k01_parties"."version" > 0),
	CONSTRAINT "k01_parties_mobile_check" CHECK (length("k01_parties"."mobile") >= 10)
);
--> statement-breakpoint
ALTER TABLE "k01_memberships" ADD CONSTRAINT "k01_memberships_party_id_k01_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."k01_parties"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "k01_memberships" ADD CONSTRAINT "k01_memberships_organization_id_k01_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."k01_organizations"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "k01_audit_events_target_idx" ON "k01_audit_events" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "k01_audit_events_occurred_at_idx" ON "k01_audit_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "k01_documents_target_idx" ON "k01_documents" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "k01_documents_verification_status_idx" ON "k01_documents" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "k01_memberships_party_id_idx" ON "k01_memberships" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "k01_memberships_organization_id_idx" ON "k01_memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "k01_memberships_party_organization_idx" ON "k01_memberships" USING btree ("party_id","organization_id");--> statement-breakpoint
CREATE INDEX "k01_memberships_status_idx" ON "k01_memberships" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "k01_organizations_national_legal_id_uidx" ON "k01_organizations" USING btree ("national_legal_id") WHERE "k01_organizations"."national_legal_id" is not null and "k01_organizations"."national_legal_id" <> '';--> statement-breakpoint
CREATE INDEX "k01_organizations_status_idx" ON "k01_organizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "k01_organizations_verification_status_idx" ON "k01_organizations" USING btree ("verification_status");--> statement-breakpoint
CREATE UNIQUE INDEX "k01_parties_mobile_uidx" ON "k01_parties" USING btree ("mobile");--> statement-breakpoint
CREATE UNIQUE INDEX "k01_parties_national_id_uidx" ON "k01_parties" USING btree ("national_id") WHERE "k01_parties"."national_id" is not null and "k01_parties"."national_id" <> '';--> statement-breakpoint
CREATE INDEX "k01_parties_status_idx" ON "k01_parties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "k01_parties_verification_status_idx" ON "k01_parties" USING btree ("verification_status");