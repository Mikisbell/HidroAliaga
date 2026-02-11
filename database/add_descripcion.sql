
-- Add missing descripcion column
ALTER TABLE proyectos 
ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Just in case, grant permissions again (harmless)
GRANT ALL ON TABLE proyectos TO postgres, anon, authenticated, service_role;
