-- Migration script to add application_status and related fields to existing ambassadors table
-- Run this if you've already created the ambassadors table without these fields

-- Add application_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ambassadors' AND column_name = 'application_status'
  ) THEN
    ALTER TABLE ambassadors 
    ADD COLUMN application_status TEXT DEFAULT 'pending';
    
    -- Add check constraint
    ALTER TABLE ambassadors 
    ADD CONSTRAINT ambassadors_application_status_check 
    CHECK (application_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Add approved_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ambassadors' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE ambassadors 
    ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add approved_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ambassadors' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE ambassadors 
    ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for application_status if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_ambassadors_application_status ON ambassadors(application_status);

-- Create index for approved_at if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_ambassadors_approved_at ON ambassadors(approved_at DESC);

-- Update existing records to have 'pending' status if application_status is NULL
UPDATE ambassadors 
SET application_status = 'pending' 
WHERE application_status IS NULL;
