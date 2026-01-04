-- Migration: Add student_class_level column to ambassadors table
-- This column stores the class/level of students who apply as ambassadors

DO $$
BEGIN
    -- Add student_class_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ambassadors' AND column_name='student_class_level') THEN
        ALTER TABLE ambassadors ADD COLUMN student_class_level TEXT;
        RAISE NOTICE 'Column student_class_level added to ambassadors table.';
    ELSE
        RAISE NOTICE 'Column student_class_level already exists in ambassadors table.';
    END IF;
END $$;

