CREATE TABLE IF NOT EXISTS "b2b_categories" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"parent_id" varchar(128),
	"level" integer NOT NULL,
	"code" varchar(128) NOT NULL,
	"name_fa" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description_fa" text,
	"image_url" text,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fk_b2b_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "b2b_categories"("id") ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_b2b_categories_code" ON "b2b_categories" ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_categories_parent_id" ON "b2b_categories" ("parent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_categories_level" ON "b2b_categories" ("level");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_categories_status" ON "b2b_categories" ("status");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "b2b_products" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"subcategory_id" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"product_code" varchar(64) NOT NULL,
	"description" text,
	"technical_description" text,
	"primary_image" text,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"karat" integer DEFAULT 18 NOT NULL,
	"material" varchar(64) DEFAULT 'gold' NOT NULL,
	"status" varchar(32) DEFAULT 'DRAFT' NOT NULL,
	"created_by" varchar(128) NOT NULL,
	"created_by_org_id" varchar(128) NOT NULL,
	"updated_by" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fk_b2b_products_subcategory" FOREIGN KEY ("subcategory_id") REFERENCES "b2b_categories"("id") ON DELETE RESTRICT,
	CONSTRAINT "fk_b2b_products_created_by_org" FOREIGN KEY ("created_by_org_id") REFERENCES "k01_organizations"("id") ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_b2b_products_slug" ON "b2b_products" ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_b2b_products_product_code" ON "b2b_products" ("product_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_products_subcategory_id" ON "b2b_products" ("subcategory_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_products_status" ON "b2b_products" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_products_created_by_org_id" ON "b2b_products" ("created_by_org_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "b2b_supplier_offers" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"product_id" varchar(128) NOT NULL,
	"supplier_id" varchar(128) NOT NULL,
	"supplier_product_code" varchar(128),
	"weight_type" varchar(32) NOT NULL,
	"weight_min" double precision,
	"weight_max" double precision,
	"exact_weight" double precision,
	"making_fee_type" varchar(32) NOT NULL,
	"making_fee_value" double precision,
	"making_fee_min" double precision,
	"making_fee_max" double precision,
	"availability_type" varchar(32) DEFAULT 'AVAILABLE' NOT NULL,
	"lead_time_days" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"created_by" varchar(128) NOT NULL,
	"updated_by" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fk_b2b_supplier_offers_product" FOREIGN KEY ("product_id") REFERENCES "b2b_products"("id") ON DELETE CASCADE,
	CONSTRAINT "fk_b2b_supplier_offers_supplier" FOREIGN KEY ("supplier_id") REFERENCES "k01_organizations"("id") ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_supplier_offers_product_id" ON "b2b_supplier_offers" ("product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_supplier_offers_supplier_id" ON "b2b_supplier_offers" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_supplier_offers_status" ON "b2b_supplier_offers" ("status");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "b2b_product_lifecycle_history" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"product_id" varchar(128) NOT NULL,
	"from_status" varchar(32) NOT NULL,
	"to_status" varchar(32) NOT NULL,
	"changed_by" varchar(128) NOT NULL,
	"changed_by_org_id" varchar(128) NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fk_b2b_lifecycle_product" FOREIGN KEY ("product_id") REFERENCES "b2b_products"("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_lifecycle_product_id" ON "b2b_product_lifecycle_history" ("product_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "b2b_product_audit_logs" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" varchar(128) NOT NULL,
	"action" varchar(64) NOT NULL,
	"actor_id" varchar(128) NOT NULL,
	"actor_org_id" varchar(128) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_product_audit_entity" ON "b2b_product_audit_logs" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_b2b_product_audit_actor" ON "b2b_product_audit_logs" ("actor_id");
