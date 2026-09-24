-- REAL ESTATE ANALYTICS HUB OS — Seed Data
INSERT INTO financial_covenants (covenant_code, rule_title, threshold_spec, is_mandatory) VALUES
('COV-DSCR', 'Minimum Senior Debt Service Coverage', '≥ 1.25x Underwritten NOI', true),
('COV-LTV', 'Maximum Permitted Loan-To-Value', '≤ 65.0% As-Stabilized Appraisal', true),
('COV-DY', 'Debt Yield Floor at Securitization', '≥ 9.00% NOI / Total Debt', true),
('COV-STRESS', 'Benchmark Rate Stress Testing', '+250 bps SOFR Rate Shift', true)
ON CONFLICT (covenant_code) DO NOTHING;

INSERT INTO underwritten_deals (deal_id, asset_name, metropolitan_market, sponsor_name, gross_revenue, operating_expenses, net_operating_income, annual_debt_service, loan_amount, initial_equity, dscr_calculated, cap_rate_exit, status) VALUES
('UW-8801', 'Hudson Yards Class-A Office', 'New York City', 'Blackstone RE Partner', 14500000, 4800000, 9700000, 6830000, 78000000, 42000000, 1.42, 6.2, 'approved'),
('UW-8802', 'Austin Innovation Tech Campus', 'Austin, TX', 'Cypress Point Capital', 9800000, 3600000, 6200000, 4840000, 55000000, 30000000, 1.28, 5.8, 'in-committee'),
('UW-8803', 'Miami Brickell Luxury Multi-Family', 'Miami, FL', 'Starwood Debt Fund', 8200000, 2900000, 5300000, 3925000, 41600000, 22400000, 1.35, 5.4, 'approved')
ON CONFLICT (deal_id) DO NOTHING;
