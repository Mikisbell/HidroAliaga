-- Add clase_tuberia column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tramos' AND column_name = 'clase_tuberia') THEN
        ALTER TABLE tramos ADD COLUMN clase_tuberia TEXT DEFAULT 'CL-10';
    END IF;
END $$;
