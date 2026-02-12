-- =====================================================
-- MIGRACIÓN: Aislamiento de Datos por Usuario
-- Fecha: 2025-02-12
-- =====================================================

-- 1. Hacer usuario_id NOT NULL en tabla proyectos
-- NOTA: Primero debes asignar usuarios a proyectos existentes
-- o eliminar proyectos sin usuario

-- Verificar proyectos sin usuario
SELECT id, nombre, usuario_id 
FROM proyectos 
WHERE usuario_id IS NULL;

-- Opción A: Asignar todos los proyectos huérfanos a un usuario específico
-- UPDATE proyectos 
-- SET usuario_id = '00000000-0000-0000-0000-000000000000'::uuid
-- WHERE usuario_id IS NULL;

-- Opción B: Eliminar proyectos sin usuario
-- DELETE FROM proyectos 
-- WHERE usuario_id IS NULL;

-- 2. Hacer usuario_id NOT NULL
ALTER TABLE proyectos 
ALTER COLUMN usuario_id SET NOT NULL;

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_proyectos_usuario_id 
ON proyectos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_proyectos_usuario_updated 
ON proyectos(usuario_id, updated_at);

-- 4. Verificar índices creados
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'proyectos';

-- =====================================================
-- FIN MIGRACIÓN
-- =====================================================
