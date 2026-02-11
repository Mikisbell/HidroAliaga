-- Add numero_viviendas to nudos table
ALTER TABLE nudos 
ADD COLUMN IF NOT EXISTS numero_viviendas INTEGER DEFAULT 0;

-- Optional: Add comments
COMMENT ON COLUMN nudos.numero_viviendas IS 'Número de viviendas abastecidas por este nudo (importado de Excel)';
