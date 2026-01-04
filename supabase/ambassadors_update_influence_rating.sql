-- Migration: Update ambassadors table to replace reach_range with social_media_influence_rating
-- This changes from text-based reach ranges to a numeric influence rating (0-100)

DO $$
BEGIN
    -- Add new column for social media influence rating
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ambassadors' AND column_name='social_media_influence_rating') THEN
        ALTER TABLE ambassadors ADD COLUMN social_media_influence_rating INTEGER CHECK (social_media_influence_rating >= 0 AND social_media_influence_rating <= 100);
        RAISE NOTICE 'Column social_media_influence_rating added to ambassadors table.';
    ELSE
        RAISE NOTICE 'Column social_media_influence_rating already exists in ambassadors table.';
    END IF;

    -- Drop the old reach_range column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ambassadors' AND column_name='reach_range') THEN
        ALTER TABLE ambassadors DROP COLUMN reach_range;
        RAISE NOTICE 'Column reach_range removed from ambassadors table.';
    ELSE
        RAISE NOTICE 'Column reach_range does not exist in ambassadors table.';
    END IF;

    -- Create index for better query performance on the new column
    CREATE INDEX IF NOT EXISTS idx_ambassadors_influence_rating ON ambassadors(social_media_influence_rating);
    RAISE NOTICE 'Index idx_ambassadors_influence_rating created or already exists.';

END $$;

