-- Offline operations table for WhatsApp/off-platform tracking
CREATE TABLE IF NOT EXISTS offline_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  source_channel TEXT NOT NULL CHECK (source_channel IN ('whatsapp_ads', 'whatsapp_direct', 'phone_call', 'walk_in', 'referral')),
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_role TEXT NOT NULL CHECK (customer_role IN ('Parent', 'Student')),
  number_of_learners INTEGER NOT NULL DEFAULT 1,
  learner_educational_level TEXT NOT NULL,
  subjects_of_interest TEXT NOT NULL,
  tutor_match_type TEXT NOT NULL CHECK (tutor_match_type IN ('platform_tutor', 'off_platform_tutor')),
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('online', 'onsite', 'hybrid')),
  onboarding_stage TEXT NOT NULL CHECK (onboarding_stage IN ('new_lead', 'qualified', 'matched', 'active_sessions', 'completed', 'dropped')),
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  payment_environment TEXT NOT NULL DEFAULT 'real' CHECK (payment_environment IN ('real', 'sandbox')),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  notes TEXT NOT NULL,
  converted_to_platform BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offline_operations_created_at ON offline_operations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_operations_whatsapp ON offline_operations (customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_offline_operations_agent_name ON offline_operations (agent_name);
CREATE INDEX IF NOT EXISTS idx_offline_operations_stage ON offline_operations (onboarding_stage);

ALTER TABLE offline_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert offline operations"
  ON offline_operations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read offline operations"
  ON offline_operations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update offline operations"
  ON offline_operations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
