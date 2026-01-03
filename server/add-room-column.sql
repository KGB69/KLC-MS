-- Add room_number column to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_number TEXT;
