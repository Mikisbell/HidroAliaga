-- Add reference/design columns to store Excel values

-- NUDOS: Presión y Cota Piezométrica de diseño (Excel)
ALTER TABLE nudos 
ADD COLUMN IF NOT EXISTS presion_diseno NUMERIC,
ADD COLUMN IF NOT EXISTS cota_piezometrica_diseno NUMERIC;

COMMENT ON COLUMN nudos.presion_diseno IS 'Presión importada del diseño original (m.c.a.)';
COMMENT ON COLUMN nudos.cota_piezometrica_diseno IS 'Cota piezométrica importada del diseño original (m)';

-- TRAMOS: Velocidad, Hf, Caudal, Pendiente de diseño (Excel)
ALTER TABLE tramos
ADD COLUMN IF NOT EXISTS velocidad_diseno NUMERIC,
ADD COLUMN IF NOT EXISTS hf_diseno NUMERIC,
ADD COLUMN IF NOT EXISTS caudal_diseno NUMERIC,
ADD COLUMN IF NOT EXISTS pendiente_diseno NUMERIC;

COMMENT ON COLUMN tramos.velocidad_diseno IS 'Velocidad de flujo calculada en diseño original (m/s)';
COMMENT ON COLUMN tramos.hf_diseno IS 'Pérdida de carga calculada en diseño original (m)';
COMMENT ON COLUMN tramos.caudal_diseno IS 'Caudal de diseño original (L/s)';
COMMENT ON COLUMN tramos.pendiente_diseno IS 'Pendiente del tramo en diseño original (m/km)';
