-- Migration: Add handle columns to tramos
-- Description: Stores the specific node handle (top, right, bottom, left) for connections

ALTER TABLE tramos 
ADD COLUMN IF NOT EXISTS source_handle TEXT,
ADD COLUMN IF NOT EXISTS target_handle TEXT;

-- Optional: Add constraint to ensure one pipe per handle?
-- Unique constraint on (nudo_origen_id, source_handle) and (nudo_destino_id, target_handle)?
-- Maybe too strict at DB level for now, let's enforce in UI first.
