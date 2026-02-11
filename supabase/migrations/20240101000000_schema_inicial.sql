-- ========================================================
-- HIDROALIAGA - Esquema de Base de Datos
-- Para ejecutar en Supabase SQL Editor
-- ========================================================

-- 1. HABILITAR EXTENSIONES POSTGIS
-- ========================================================
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verificar instalación de PostGIS
-- SELECT PostGIS_full_version();

-- 2. CREAR TABLAS
-- ========================================================

-- Tabla: Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ambito VARCHAR(50) DEFAULT 'urbano',
    tipo_red VARCHAR(50) DEFAULT 'cerrada',
    norma_aplicable VARCHAR(100) DEFAULT 'RNE OS.050',
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    poblacion_diseno INTEGER DEFAULT 0,
    periodo_diseno INTEGER DEFAULT 20,
    dotacion_percapita FLOAT DEFAULT 169.0,
    coef_cobertura FLOAT DEFAULT 0.8,
    coef_hazen_williams FLOAT DEFAULT 150.0,
    estado VARCHAR(50) DEFAULT 'borrador',
    version INTEGER DEFAULT 1,
    usuario_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Nudos
CREATE TABLE IF NOT EXISTS nudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'union',
    coordenadas GEOMETRY(POINT, 4326),
    longitud FLOAT,
    latitud FLOAT,
    cota_terreno FLOAT,
    cota_lamina FLOAT,
    cota_source VARCHAR(50) DEFAULT 'manual',
    demanda_base FLOAT DEFAULT 0.0,
    elevacion FLOAT DEFAULT 0.0,
    presion_calc FLOAT,
    presion_minima_verificada BOOLEAN DEFAULT TRUE,
    es_critico BOOLEAN DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Tramos
CREATE TABLE IF NOT EXISTS tramos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'tuberia',
    nudo_origen_id UUID REFERENCES nudos(id),
    nudo_destino_id UUID REFERENCES nudos(id),
    geometria GEOMETRY(LINESTRING, 4326),
    longitud FLOAT DEFAULT 0.0,
    material VARCHAR(50) DEFAULT 'pvc',
    diametro_interior FLOAT DEFAULT 0.0,
    diametro_comercial FLOAT DEFAULT 0.0,
    clase_tuberia VARCHAR(20) DEFAULT 'CL-10',
    coef_hazen_williams FLOAT DEFAULT 150.0,
    perdida_carga FLOAT,
    caudal FLOAT,
    velocidad FLOAT,
    velocidad_verificada BOOLEAN DEFAULT TRUE,
    es_bombeo BOOLEAN DEFAULT FALSE,
    curva_bomba JSONB,
    coeficiente_rugosidad FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Cálculos
CREATE TABLE IF NOT EXISTS calculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    metodo VARCHAR(50) NOT NULL,
    tolerancia FLOAT DEFAULT 1e-7,
    max_iteraciones INTEGER DEFAULT 1000,
    convergencia BOOLEAN DEFAULT FALSE,
    error_final FLOAT,
    iteraciones_realizadas INTEGER,
    tiempo_calculo FLOAT,
    presion_minima FLOAT,
    presion_maxima FLOAT,
    velocidad_minima FLOAT,
    velocidad_maxima FLOAT,
    iteraciones_data JSONB,
    resultados_nudos JSONB,
    resultados_tramos JSONB,
    validacion_passed BOOLEAN DEFAULT FALSE,
    alertas JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_modelo VARCHAR(20) DEFAULT '1.0'
);

-- Tabla: Iteraciones (Transparencia Académica)
CREATE TABLE IF NOT EXISTS iteraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramo_id UUID REFERENCES tramos(id) ON DELETE CASCADE,
    iteracion_numero INTEGER NOT NULL,
    malla_id VARCHAR(50),
    delta_q FLOAT,
    error_acumulado FLOAT,
    convergencia_alcanzada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Optimizaciones
CREATE TABLE IF NOT EXISTS optimizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    algoritmo VARCHAR(50) DEFAULT 'algoritmo_genetico',
    parametros_ga JSONB,
    costo_total FLOAT,
    costo_optimizado FLOAT,
    ahorro_porcentaje FLOAT,
    convergencia BOOLEAN DEFAULT FALSE,
    generaciones INTEGER,
    mejor_individuo JSONB,
    poblacion_final INTEGER,
    tiempo_optimizacion FLOAT,
    diametros_optimizados JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Normativas
CREATE TABLE IF NOT EXISTS normativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    referencia VARCHAR(100),
    articulo VARCHAR(100),
    seccion VARCHAR(100),
    descripcion TEXT,
    contenido TEXT,
    parametros JSONB,
    ambito_aplicacion JSONB,
    parametros_validados JSONB,
    embedding JSONB,
    vigente BOOLEAN DEFAULT TRUE,
    fecha_vigencia TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Alertas
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL,
    severidad VARCHAR(20),
    parametro VARCHAR(100) NOT NULL,
    valor_actual FLOAT,
    valor_minimo FLOAT,
    valor_maximo FLOAT,
    unidad VARCHAR(20),
    mensaje TEXT NOT NULL,
    sugerencia TEXT,
    resuelta BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_nudos_proyecto ON nudos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tramos_proyecto ON tramos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_calculos_proyecto ON calculos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_nudos_coordenadas ON nudos USING GIST(coordenadas);
CREATE INDEX IF NOT EXISTS idx_tramos_geometria ON tramos USING GIST(geometria);

-- 4. INSERTAR NORMATIVAS BÁSICAS
-- ========================================================

INSERT INTO normativas (codigo, nombre, tipo, referencia, contenido, ambito_aplicacion) VALUES
(
    'RNE-OS.050',
    'Redes de Distribución de Agua Potable',
    'norma',
    'Reglamento Nacional de Edificaciones',
    'La presente Norma establece los requisitos para el diseño de redes de distribución de agua potable.
    
    PRESIONES MÍNIMAS:
    - Urbano: 10 m.c.a.
    - Rural: 5 m.c.a.
    - Piletas: 3.5 m.c.a.
    
    VELOCIDADES:
    - Mínima: 0.60 m/s
    - Máxima: 3.00 m/s
    
    DIÁMETROS MÍNIMOS:
    - Urbano: 75 mm (3 pulgadas)
    - Rural: 25 mm (1 pulgada)',
    '["urbano", "rural"]'
),
(
    'RM-192-2018-VIVIENDA',
    'Reglamento de Prestaciones del Servicio de Saneamiento',
    'resolucion',
    'Ministerio de Vivienda',
    'PARÁMETROS PARA ÁMBITO RURAL:
    - Presión mínima: 5.00 m.c.a.
    - En piletas: 3.50 m.c.a.
    - Velocidad máxima: 3.00 m/s
    
    DOTACIONES:
    - Urbano Rural: 50 l/hab/día
    - Periurbano: 60 l/hab/día',
    '["rural"]'
),
(
    'RM-107-2025-VIVIENDA',
    'Actualización de Dotaciones según Clima',
    'resolucion',
    'Ministerio de Vivienda',
    'DOTACIONES PER CÁPITA POR CLIMA:
    - Clima cálido: 169 lppd
    - Clima templado: 155 lppd
    - Clima frío: 129 lppd',
    '["urbano", "rural"]'
) ON CONFLICT (codigo) DO NOTHING;

-- 5. POLÍTICAS DE SEGURIDAD (RLS)
-- ========================================================

-- Habilitar RLS en TODAS las tablas
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramos ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE iteraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE normativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS PERMISIVAS PARA DESARROLLO
-- TODO: En producción, reemplazar con:
--   USING (auth.uid() = usuario_id) para proyectos
--   USING (EXISTS (SELECT 1 FROM proyectos p WHERE p.id = proyecto_id AND p.usuario_id = auth.uid()))
--   para tablas hijas (nudos, tramos, calculos, etc.)
-- ============================================================

CREATE POLICY "dev_allow_all" ON proyectos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON nudos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON tramos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON calculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON iteraciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON optimizaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON normativas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all" ON alertas FOR ALL USING (true) WITH CHECK (true);

-- 6. FUNCIONES ÚTILES
-- ========================================================

-- Función para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_nudos_updated_at
    BEFORE UPDATE ON nudos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tramos_updated_at
    BEFORE UPDATE ON tramos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================================
-- FIN DEL ESQUEMA
-- ========================================================
