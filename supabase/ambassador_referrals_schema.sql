-- Ambassador Referral Track: referrals submitted by ambassadors (people they talked to)
-- Public insert; admin view only.

CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  contact_date DATE NOT NULL,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_customer_whatsapp ON ambassador_referrals(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_contact_date ON ambassador_referrals(contact_date DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_ambassador_name ON ambassador_referrals(ambassador_name);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_created_at ON ambassador_referrals(created_at DESC);

ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ambassador referrals"
  ON ambassador_referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view ambassador referrals"
  ON ambassador_referrals FOR SELECT
  TO authenticated
  USING (true);
