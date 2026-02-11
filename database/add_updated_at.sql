-- =====================================================
-- Migration: Add updated_at to proyectos table
-- =====================================================

-- 1. Add updated_at column (defaults to created_at for existing rows)
ALTER TABLE proyectos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Set existing rows' updated_at to their created_at
UPDATE proyectos SET updated_at = created_at WHERE updated_at IS NULL OR updated_at = now();

-- 3. Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on proyectos table
DROP TRIGGER IF EXISTS update_proyectos_updated_at ON proyectos;
CREATE TRIGGER update_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
