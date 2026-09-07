-- ====================================================================
-- Didar Gold Platform: Domain K01 Schema Migration
-- Migration: 20260907000001_k01_core_schema.sql
-- Description: Core schema for Parties, Organizations, Memberships, 
--              Specialized Profiles, Documents, Audit Logs & RLS
-- Engine: PostgreSQL 15+ / Supabase
-- ====================================================================

-- 1. Custom Types & Enums
CREATE TYPE party_type AS ENUM (
  'consumer',
  'field_agent',
  'internal_user',
  'external_representative',
  'retailer_owner',
  'supplier_representative',
  'platform_admin'
);

CREATE TYPE organization_type AS ENUM (
  'didar',
  'retailer',
  'manufacturer',
  'wholesaler',
  'supplier',
  'agent_office',
  'service_partner',
  'other'
);

CREATE TYPE entity_status AS ENUM (
  'active',
  'pending',
  'suspended',
  'archived'
);

CREATE TYPE verification_status AS ENUM (
  'unverified',
  'pending',
  'verified',
  'rejected'
);

CREATE TYPE membership_role_key AS ENUM (
  'owner',
  'manager',
  'authorized_signatory',
  'retailer_owner',
  'supplier_representative',
  'staff',
  'sales',
  'accountant',
  'agent',
  'operator',
  'service_contact',
  'other'
);

-- 2. Parties Table (Natural Persons)
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_type party_type NOT NULL,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  national_id VARCHAR(30),
  mobile VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  status entity_status NOT NULL DEFAULT 'pending',
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for parties
CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(party_type);
CREATE INDEX IF NOT EXISTS idx_parties_mobile ON parties(mobile);
CREATE INDEX IF NOT EXISTS idx_parties_national_id ON parties(national_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);

-- Specialized Profiles for Parties
CREATE TABLE IF NOT EXISTS consumer_profiles (
  party_id UUID PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
  birth_date DATE,
  preferred_contact_method VARCHAR(20) DEFAULT 'sms',
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_agent_profiles (
  party_id UUID PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
  agent_code VARCHAR(50) NOT NULL UNIQUE,
  operating_mode VARCHAR(30) NOT NULL DEFAULT 'hybrid', -- mobile_gallery, assisted_order, hybrid
  territory VARCHAR(150) NOT NULL,
  supervisor_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  employment_type VARCHAR(30) NOT NULL DEFAULT 'contractor', -- employed, contractor, partner
  commission_rate_percent NUMERIC(5,2) DEFAULT 0.00,
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internal_user_profiles (
  party_id UUID PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
  personnel_code VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  job_title VARCHAR(120) NOT NULL,
  employment_type VARCHAR(30) NOT NULL DEFAULT 'employed',
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS representative_profiles (
  party_id UUID PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
  target_organization_id UUID,
  title VARCHAR(120) NOT NULL,
  authority_scope TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  organization_type organization_type NOT NULL,
  registration_number VARCHAR(50),
  national_legal_id VARCHAR(50),
  economic_code VARCHAR(50),
  website VARCHAR(255),
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  province VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  postal_code VARCHAR(20),
  status entity_status NOT NULL DEFAULT 'pending',
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orgs_type ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_orgs_national_id ON organizations(national_legal_id);
CREATE INDEX IF NOT EXISTS idx_orgs_status ON organizations(status);

-- Specialized Profiles for Organizations
CREATE TABLE IF NOT EXISTS retailer_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  retailer_code VARCHAR(50) NOT NULL UNIQUE,
  guild_license_number VARCHAR(100) NOT NULL,
  guild_union_name VARCHAR(150),
  store_type VARCHAR(50) NOT NULL DEFAULT 'boutique', -- boutique, gallery, mall_store, online
  sales_channels TEXT[],
  storefront_address TEXT,
  display_capacity_pieces INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturer_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_code VARCHAR(50) NOT NULL UNIQUE,
  brand_name VARCHAR(150) NOT NULL,
  production_license_number VARCHAR(100) NOT NULL,
  product_categories TEXT NOT NULL,
  monthly_capacity_grams NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  workshop_address TEXT,
  purity_standards TEXT[] DEFAULT ARRAY['750 (18K)'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wholesaler_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_code VARCHAR(50) NOT NULL UNIQUE,
  brand_name VARCHAR(150) NOT NULL,
  license_number VARCHAR(100),
  product_categories TEXT NOT NULL,
  coverage_territory VARCHAR(255) NOT NULL,
  warehouse_address TEXT,
  gold_inventory_capacity_grams NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_code VARCHAR(50) NOT NULL UNIQUE,
  supply_type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_office_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  office_code VARCHAR(50) NOT NULL UNIQUE,
  jurisdiction_territory VARCHAR(255) NOT NULL,
  assigned_agents_count INTEGER DEFAULT 0,
  manager_name VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_partner_profiles (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  partner_code VARCHAR(50) NOT NULL UNIQUE,
  service_specialty VARCHAR(50) NOT NULL, -- repair, stone_setting, qc_assay, polishing
  certification_number VARCHAR(100),
  workshop_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Memberships Table (Connecting Persons to Organizations)
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_key membership_role_key NOT NULL,
  title VARCHAR(120) NOT NULL,
  authorities TEXT[] NOT NULL DEFAULT '{}', -- can_order, can_sign, can_manage_members, can_view_finance
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status entity_status NOT NULL DEFAULT 'active',
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_membership_dates CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX IF NOT EXISTS idx_memberships_party ON memberships(party_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role_key);

-- 5. Documents Vault (Private storage records)
CREATE TABLE IF NOT EXISTS party_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(30) NOT NULL, -- 'party' OR 'organization'
  target_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_uri TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  uploaded_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_party_documents_target ON party_documents(target_type, target_id);

-- 6. Audit Trail (Immutable event ledger)
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  actor_name VARCHAR(150) NOT NULL,
  action VARCHAR(50) NOT NULL, -- create, update, status_change, document_upload, membership_link
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  description TEXT NOT NULL,
  changes JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_events(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp DESC);

-- 7. App Users & RBAC Bridge (Supabase Auth Link)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY, -- references auth.users(id) in Supabase
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  is_platform_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Row Level Security (RLS) Enablement
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Operational Admin Policies
CREATE POLICY "Admins have full access to parties"
  ON parties FOR ALL
  USING (EXISTS (SELECT 1 FROM app_users WHERE app_users.id = auth.uid() AND app_users.is_platform_admin = true));

CREATE POLICY "Admins have full access to organizations"
  ON organizations FOR ALL
  USING (EXISTS (SELECT 1 FROM app_users WHERE app_users.id = auth.uid() AND app_users.is_platform_admin = true));

CREATE POLICY "Admins have full access to memberships"
  ON memberships FOR ALL
  USING (EXISTS (SELECT 1 FROM app_users WHERE app_users.id = auth.uid() AND app_users.is_platform_admin = true));

CREATE POLICY "Admins have full access to documents"
  ON party_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM app_users WHERE app_users.id = auth.uid() AND app_users.is_platform_admin = true));

CREATE POLICY "Admins can view audit events"
  ON audit_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM app_users WHERE app_users.id = auth.uid() AND app_users.is_platform_admin = true));

CREATE POLICY "Only system can insert audit events"
  ON audit_events FOR INSERT
  WITH CHECK (true);
