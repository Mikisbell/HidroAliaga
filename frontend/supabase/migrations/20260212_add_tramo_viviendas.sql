-- Add numero_viviendas column to tramos table
ALTER TABLE tramos 
ADD COLUMN IF NOT EXISTS numero_viviendas INTEGER DEFAULT 0;

-- Comment for documentation
COMMENT ON COLUMN tramos.numero_viviendas IS 'Cantidad de viviendas abastecidas directamente por este tramo (demanda distribuida)';
