-- Migration: 001_initial_schema.sql
-- Run this in the Supabase SQL editor or via supabase CLI

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- for lat/lng distance queries (optional)

-- ============================================================
-- Enums
-- ============================================================
CREATE TYPE saved_status AS ENUM (
  'new', 'interested', 'contacted', 'viewed',
  'offer_made', 'under_contract', 'passed'
);

CREATE TYPE scrape_status AS ENUM ('running', 'completed', 'failed');

-- ============================================================
-- properties
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source             TEXT NOT NULL,
  source_id          TEXT NOT NULL,
  source_url         TEXT NOT NULL,

  address            TEXT NOT NULL DEFAULT '',
  normalized_address TEXT NOT NULL DEFAULT '',
  city               TEXT NOT NULL DEFAULT '',
  state              TEXT NOT NULL DEFAULT '',
  zip                TEXT NOT NULL DEFAULT '',

  lat                NUMERIC(10, 7),
  lng                NUMERIC(10, 7),

  beds               INT,
  baths              NUMERIC(4, 1),
  sqft               INT,
  lot_size_sqft      INT,
  year_built         INT,

  price              NUMERIC(12, 2),
  financing_types    TEXT[] NOT NULL DEFAULT '{}',

  down_payment       NUMERIC(12, 2),
  monthly_payment    NUMERIC(10, 2),
  option_fee         NUMERIC(12, 2),
  lease_term_months  INT,
  interest_rate      NUMERIC(6, 3),
  balloon_months     INT,

  raw_description    TEXT,
  parsed_terms       JSONB,
  photos             TEXT[] NOT NULL DEFAULT '{}',

  contact_name       TEXT,
  contact_phone      TEXT,
  contact_email      TEXT,

  first_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,

  UNIQUE(source, source_id)
);

CREATE INDEX IF NOT EXISTS properties_city_state_idx ON properties(city, state);
CREATE INDEX IF NOT EXISTS properties_financing_types_idx ON properties USING GIN(financing_types);
CREATE INDEX IF NOT EXISTS properties_is_active_idx ON properties(is_active);
CREATE INDEX IF NOT EXISTS properties_price_idx ON properties(price);
CREATE INDEX IF NOT EXISTS properties_lat_lng_idx ON properties(lat, lng);

-- ============================================================
-- saved_properties
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_properties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status      saved_status NOT NULL DEFAULT 'new',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS saved_properties_user_idx ON saved_properties(user_id);

-- ============================================================
-- share_links
-- ============================================================
CREATE TABLE IF NOT EXISTS share_links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS share_links_slug_idx ON share_links(slug);

-- ============================================================
-- scrape_runs
-- ============================================================
CREATE TABLE IF NOT EXISTS scrape_runs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source              TEXT NOT NULL,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at         TIMESTAMPTZ,
  properties_found    INT NOT NULL DEFAULT 0,
  properties_new      INT NOT NULL DEFAULT 0,
  properties_updated  INT NOT NULL DEFAULT 0,
  errors              JSONB NOT NULL DEFAULT '[]',
  status              scrape_status NOT NULL DEFAULT 'running'
);

-- ============================================================
-- sources
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  base_url    TEXT NOT NULL DEFAULT '',
  last_run_at TIMESTAMPTZ
);

-- Seed known sources
INSERT INTO sources (name, enabled, base_url) VALUES
  ('craigslist', TRUE, 'https://wyoming.craigslist.org'),
  ('zillow', TRUE, 'https://www.zillow.com'),
  ('fsbo', TRUE, 'https://www.fsbo.com'),
  ('facebook_marketplace', FALSE, 'https://www.facebook.com/marketplace')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- properties: readable by everyone
CREATE POLICY "properties_select_all" ON properties
  FOR SELECT USING (TRUE);

-- properties: insert/update only via service role (scrapers)
CREATE POLICY "properties_insert_service" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "properties_update_service" ON properties
  FOR UPDATE USING (auth.role() = 'service_role');

-- saved_properties: owner only
CREATE POLICY "saved_select_own" ON saved_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_insert_own" ON saved_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_update_own" ON saved_properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_delete_own" ON saved_properties
  FOR DELETE USING (auth.uid() = user_id);

-- share_links: readable by everyone; insert by authenticated users
CREATE POLICY "share_links_select_all" ON share_links
  FOR SELECT USING (TRUE);

CREATE POLICY "share_links_insert_authed" ON share_links
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- scrape_runs: service role + authenticated (read)
CREATE POLICY "scrape_runs_select_authed" ON scrape_runs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "scrape_runs_insert_service" ON scrape_runs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "scrape_runs_update_service" ON scrape_runs
  FOR UPDATE USING (auth.role() = 'service_role');

-- sources: readable by authenticated users
CREATE POLICY "sources_select_authed" ON sources
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- Storage bucket for property photos
-- ============================================================
-- Run this separately in the Supabase dashboard or via the API:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('property-photos', 'property-photos', TRUE)
-- ON CONFLICT DO NOTHING;
