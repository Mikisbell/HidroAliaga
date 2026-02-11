-- =====================================================
-- Migration: Fix proyectos schema alignment
-- Adds missing columns: estado, version, norma_aplicable
-- =====================================================

-- 1. Add estado column (default: borrador)
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS estado VARCHAR DEFAULT 'borrador';

-- 2. Add version column (default: 1)
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 3. Add norma_aplicable column (default: OS.050)
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS norma_aplicable VARCHAR DEFAULT 'OS.050';

-- 4. Update existing rows that have NULL estado
UPDATE proyectos SET estado = 'borrador' WHERE estado IS NULL;
UPDATE proyectos SET version = 1 WHERE version IS NULL;
UPDATE proyectos SET norma_aplicable = 'OS.050' WHERE norma_aplicable IS NULL;
