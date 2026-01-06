-- Manual Migration to Fix Finance Balance Calculations
-- Run this directly on your Render PostgreSQL database

-- Step 1: Add fee columns if they don't exist (with DEFAULT 0)
ALTER TABLE students ADD COLUMN IF NOT EXISTS fees NUMERIC DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS translation_total_fee NUMERIC DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS interpretation_total_fee NUMERIC DEFAULT 0;

-- Step 2: Update all NULL values to 0
UPDATE students SET fees = 0 WHERE fees IS NULL;
UPDATE prospects SET translation_total_fee = 0 WHERE translation_total_fee IS NULL;
UPDATE prospects SET interpretation_total_fee = 0 WHERE interpretation_total_fee IS NULL;

-- Step 3: Verify the fix
SELECT 'Students with NULL fees:' as check_name, COUNT(*) as count FROM students WHERE fees IS NULL
UNION ALL
SELECT 'Prospects with NULL translation_total_fee:', COUNT(*) FROM prospects WHERE translation_total_fee IS NULL
UNION ALL
SELECT 'Prospects with NULL interpretation_total_fee:', COUNT(*) FROM prospects WHERE interpretation_total_fee IS NULL;

-- Expected result: All counts should be 0
