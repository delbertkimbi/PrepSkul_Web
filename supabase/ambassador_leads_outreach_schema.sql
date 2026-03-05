-- Ambassador Leads & Outreach Activities
-- Lightweight CRM for ambassadors; admins get full analytics.

-- Outreach activities (groups, events, communities)
CREATE TABLE IF NOT EXISTS outreach_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'WhatsApp Community',
    'Telegram Group',
    'Discord Community',
    'Campus Event',
    'Classroom Talk',
    'Online Community'
  )),
  platform TEXT NOT NULL,
  community_link TEXT,
  estimated_audience INTEGER,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outreach_activities_ambassador_id ON outreach_activities(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_date ON outreach_activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_created_at ON outreach_activities(created_at DESC);

-- Ambassador leads (individuals spoken to)
CREATE TABLE IF NOT EXISTS ambassador_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  school TEXT NOT NULL,
  course_interest TEXT NOT NULL,
  lead_source TEXT NOT NULL CHECK (lead_source IN (
    'Campus conversation',
    'WhatsApp',
    'Instagram',
    'Telegram',
    'Friend referral',
    'Event / Community outreach'
  )),
  outreach_activity_id UUID REFERENCES outreach_activities(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Contacted' CHECK (status IN (
    'Contacted',
    'Interested',
    'Follow Up Needed',
    'Applied',
    'Enrolled'
  )),
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ambassador_leads_ambassador_id ON ambassador_leads(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_status ON ambassador_leads(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_outreach_activity_id ON ambassador_leads(outreach_activity_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_created_at ON ambassador_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_follow_up_date ON ambassador_leads(follow_up_date);

-- RLS
ALTER TABLE outreach_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_leads ENABLE ROW LEVEL SECURITY;

-- Helper: ambassador id for current user (matched by email, approved only)
-- Ambassadors see own rows; admins see all via is_admin.

DROP POLICY IF EXISTS "Ambassadors can view own outreach" ON outreach_activities;
CREATE POLICY "Ambassadors can view own outreach"
  ON outreach_activities FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Ambassadors can insert own outreach" ON outreach_activities;
CREATE POLICY "Ambassadors can insert own outreach"
  ON outreach_activities FOR INSERT
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Ambassadors can update own outreach" ON outreach_activities;
CREATE POLICY "Ambassadors can update own outreach"
  ON outreach_activities FOR UPDATE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Ambassadors can delete own outreach" ON outreach_activities;
CREATE POLICY "Ambassadors can delete own outreach"
  ON outreach_activities FOR DELETE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all outreach" ON outreach_activities;
CREATE POLICY "Admins can manage all outreach"
  ON outreach_activities FOR ALL
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Leads policies
DROP POLICY IF EXISTS "Ambassadors can view own leads" ON ambassador_leads;
CREATE POLICY "Ambassadors can view own leads"
  ON ambassador_leads FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Ambassadors can insert own leads" ON ambassador_leads;
CREATE POLICY "Ambassadors can insert own leads"
  ON ambassador_leads FOR INSERT
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Ambassadors can update own leads" ON ambassador_leads;
CREATE POLICY "Ambassadors can update own leads"
  ON ambassador_leads FOR UPDATE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Ambassadors can delete own leads" ON ambassador_leads;
CREATE POLICY "Ambassadors can delete own leads"
  ON ambassador_leads FOR DELETE
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors
      WHERE email = (auth.jwt() ->> 'email')
      AND application_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all leads" ON ambassador_leads;
CREATE POLICY "Admins can manage all leads"
  ON ambassador_leads FOR ALL
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );
