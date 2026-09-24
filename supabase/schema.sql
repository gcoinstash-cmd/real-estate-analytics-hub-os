-- REAL ESTATE ANALYTICS HUB OS — Supabase Schema | Ghost Factory™
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS underwritten_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id TEXT UNIQUE NOT NULL,
  asset_name TEXT NOT NULL,
  metropolitan_market TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  gross_revenue NUMERIC(14,2) NOT NULL,
  operating_expenses NUMERIC(14,2) NOT NULL,
  net_operating_income NUMERIC(14,2) NOT NULL,
  annual_debt_service NUMERIC(14,2) NOT NULL,
  loan_amount NUMERIC(14,2) NOT NULL,
  initial_equity NUMERIC(14,2) NOT NULL,
  dscr_calculated NUMERIC(5,2) NOT NULL,
  cap_rate_exit NUMERIC(5,2),
  status TEXT DEFAULT 'in-committee' CHECK (status IN ('draft', 'in-committee', 'approved', 'funding-ready', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE underwritten_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert deals" ON underwritten_deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage deals" ON underwritten_deals FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS financial_covenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  covenant_code TEXT UNIQUE NOT NULL,
  rule_title TEXT NOT NULL,
  threshold_spec TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  risk_category TEXT DEFAULT 'SENIOR_CREDIT'
);
ALTER TABLE financial_covenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read covenants" ON financial_covenants FOR SELECT USING (true);
CREATE POLICY "Admin update covenants" ON financial_covenants FOR ALL USING (auth.role() = 'authenticated');
