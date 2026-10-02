CREATE TABLE "k01_audit_logs" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"actor_id" varchar(128) NOT NULL,
	"actor_name" varchar(128) NOT NULL,
	"action" varchar(64) NOT NULL,
	"target_type" varchar(64) NOT NULL,
	"target_id" varchar(128) NOT NULL,
	"target_name" varchar(255),
	"description" text NOT NULL,
	"changes" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "k01_documents" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"target_type" varchar(32) NOT NULL,
	"target_id" varchar(128) NOT NULL,
	"document_type" varchar(64) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"mime_type" varchar(128) DEFAULT 'application/pdf' NOT NULL,
	"file_uri" text,
	"verification_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"uploaded_by" varchar(128) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "k01_memberships" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"party_id" varchar(128) NOT NULL,
	"organization_id" varchar(128) NOT NULL,
	"role_key" varchar(64) NOT NULL,
	"title" varchar(128) NOT NULL,
	"authorities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"valid_from" varchar(32) NOT NULL,
	"valid_to" varchar(32),
	"notes" text,
	"party_name" varchar(255),
	"organization_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "k01_organizations" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"organization_type" varchar(64) NOT NULL,
	"registration_number" varchar(64),
	"national_legal_id" varchar(64),
	"economic_code" varchar(64),
	"website" varchar(255),
	"phone" varchar(64) NOT NULL,
	"email" varchar(255),
	"province" varchar(64),
	"city" varchar(64),
	"address" text,
	"postal_code" varchar(32),
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"verification_status" varchar(32) DEFAULT 'unverified' NOT NULL,
	"notes" text,
	"retailer_profile" jsonb,
	"manufacturer_profile" jsonb,
	"wholesaler_profile" jsonb,
	"supplier_profile" jsonb,
	"agent_office_profile" jsonb,
	"service_partner_profile" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "k01_persons" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"party_type" varchar(64) NOT NULL,
	"first_name" varchar(128) NOT NULL,
	"last_name" varchar(128) NOT NULL,
	"national_id" varchar(32),
	"mobile" varchar(32) NOT NULL,
	"email" varchar(255),
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"verification_status" varchar(32) DEFAULT 'unverified' NOT NULL,
	"notes" text,
	"consumer_profile" jsonb,
	"agent_profile" jsonb,
	"internal_profile" jsonb,
	"representative_profile" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "k01_persons_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
CREATE TABLE "rbac_assignments" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"membership_id" varchar(128) NOT NULL,
	"party_id" varchar(128) NOT NULL,
	"organization_id" varchar(128) NOT NULL,
	"role_key" varchar(128) NOT NULL,
	"scope_type" varchar(32) NOT NULL,
	"scope_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scope_label_fa" varchar(255),
	"valid_from" varchar(32) NOT NULL,
	"valid_to" varchar(32),
	"reason" text NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"approval_request_id" varchar(128),
	"assigned_by_party_id" varchar(128) NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_by_party_id" varchar(128),
	"revocation_reason" text
);
--> statement-breakpoint
CREATE TABLE "rbac_grant_authority_rules" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"assigner_role_key" varchar(128) NOT NULL,
	"target_organization_type" varchar(64),
	"allowed_assignable_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allowed_scope_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requires_four_eyes_approval" boolean DEFAULT false NOT NULL,
	"max_validity_days" integer
);
--> statement-breakpoint
CREATE TABLE "rbac_permissions" (
	"key" varchar(128) PRIMARY KEY NOT NULL,
	"domain" varchar(32) NOT NULL,
	"action" varchar(32) NOT NULL,
	"resource" varchar(64) NOT NULL,
	"title_fa" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"description_fa" text NOT NULL,
	"is_sensitive" boolean DEFAULT false NOT NULL,
	"requires_mfa" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rbac_policy_revisions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"role_key" varchar(128) NOT NULL,
	"version" integer NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proposer_party_id" varchar(128) NOT NULL,
	"proposer_name" varchar(128) NOT NULL,
	"proposed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approver_party_id" varchar(128),
	"approver_name" varchar(128),
	"approved_at" timestamp with time zone,
	"changelog_notes" text NOT NULL,
	"affected_memberships_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rbac_role_permissions" (
	"role_key" varchar(128) NOT NULL,
	"permission_key" varchar(128) NOT NULL,
	CONSTRAINT "rbac_role_permissions_role_key_permission_key_pk" PRIMARY KEY("role_key","permission_key")
);
--> statement-breakpoint
CREATE TABLE "rbac_roles" (
	"role_key" varchar(128) PRIMARY KEY NOT NULL,
	"analysis_code" varchar(32) NOT NULL,
	"title_fa" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"category" varchar(64) NOT NULL,
	"target_environment" varchar(16) NOT NULL,
	"main_boundary_fa" text NOT NULL,
	"lifecycle" varchar(32) DEFAULT 'active' NOT NULL,
	"capability_status" varchar(32) DEFAULT 'verified' NOT NULL,
	"is_catalog_only" boolean DEFAULT false NOT NULL,
	"owner_status" varchar(64) DEFAULT 'verified' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "k01_memberships" ADD CONSTRAINT "k01_memberships_party_id_k01_persons_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."k01_persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "k01_memberships" ADD CONSTRAINT "k01_memberships_organization_id_k01_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."k01_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_assignments" ADD CONSTRAINT "rbac_assignments_membership_id_k01_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."k01_memberships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_assignments" ADD CONSTRAINT "rbac_assignments_party_id_k01_persons_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."k01_persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_assignments" ADD CONSTRAINT "rbac_assignments_organization_id_k01_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."k01_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_assignments" ADD CONSTRAINT "rbac_assignments_role_key_rbac_roles_role_key_fk" FOREIGN KEY ("role_key") REFERENCES "public"."rbac_roles"("role_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_policy_revisions" ADD CONSTRAINT "rbac_policy_revisions_role_key_rbac_roles_role_key_fk" FOREIGN KEY ("role_key") REFERENCES "public"."rbac_roles"("role_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_role_permissions" ADD CONSTRAINT "rbac_role_permissions_role_key_rbac_roles_role_key_fk" FOREIGN KEY ("role_key") REFERENCES "public"."rbac_roles"("role_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rbac_role_permissions" ADD CONSTRAINT "rbac_role_permissions_permission_key_rbac_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."rbac_permissions"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_k01_audit_actor" ON "k01_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_k01_audit_target" ON "k01_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_k01_audit_timestamp" ON "k01_audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_k01_documents_target" ON "k01_documents" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_k01_memberships_party_org" ON "k01_memberships" USING btree ("party_id","organization_id");--> statement-breakpoint
CREATE INDEX "idx_k01_memberships_party" ON "k01_memberships" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "idx_k01_memberships_org" ON "k01_memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_k01_memberships_status" ON "k01_memberships" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_k01_orgs_national_legal_id" ON "k01_organizations" USING btree ("national_legal_id");--> statement-breakpoint
CREATE INDEX "idx_k01_orgs_org_type" ON "k01_organizations" USING btree ("organization_type");--> statement-breakpoint
CREATE INDEX "idx_k01_orgs_status" ON "k01_organizations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_k01_persons_national_id" ON "k01_persons" USING btree ("national_id");--> statement-breakpoint
CREATE INDEX "idx_k01_persons_status" ON "k01_persons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_k01_persons_party_type" ON "k01_persons" USING btree ("party_type");--> statement-breakpoint
CREATE INDEX "idx_rbac_assign_party" ON "rbac_assignments" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "idx_rbac_assign_membership" ON "rbac_assignments" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_rbac_assign_org" ON "rbac_assignments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_rbac_assign_role" ON "rbac_assignments" USING btree ("role_key");--> statement-breakpoint
CREATE INDEX "idx_rbac_assign_status" ON "rbac_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_rbac_gar_assigner" ON "rbac_grant_authority_rules" USING btree ("assigner_role_key");--> statement-breakpoint
CREATE INDEX "idx_rbac_permissions_domain" ON "rbac_permissions" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_rbac_permissions_resource" ON "rbac_permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "idx_rbac_policy_role" ON "rbac_policy_revisions" USING btree ("role_key");--> statement-breakpoint
CREATE INDEX "idx_rbac_rp_role" ON "rbac_role_permissions" USING btree ("role_key");--> statement-breakpoint
CREATE INDEX "idx_rbac_rp_permission" ON "rbac_role_permissions" USING btree ("permission_key");--> statement-breakpoint
CREATE INDEX "idx_rbac_roles_category" ON "rbac_roles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_rbac_roles_environment" ON "rbac_roles" USING btree ("target_environment");