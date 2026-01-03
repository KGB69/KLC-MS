-- Migration: Change assigned_to from UUID to TEXT
ALTER TABLE follow_up_actions 
DROP CONSTRAINT IF EXISTS follow_up_actions_assigned_to_fkey;

ALTER TABLE follow_up_actions 
ALTER COLUMN assigned_to TYPE TEXT;
