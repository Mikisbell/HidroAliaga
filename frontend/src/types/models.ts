/**
 * Tipos del Dominio Hidráulico - HidroAliaga
 */

// ============ ENUMS ============

export type TipoRed = 'abierta' | 'cerrada' | 'mixta'
export type Ambito = 'urbano' | 'rural'
export type TipoNudo = 'cisterna' | 'tanque_elevado' | 'union' | 'consumo' | 'valvula' | 'bomba' | 'reservorio' | 'camara_rompe_presion'
export type TipoTramo = 'tuberia' | 'valvula' | 'bomba' | 'accesorio'
export type Material = 'pvc' | 'hdpe' | 'hdde' | 'concreto' | 'acero' | 'cobre'

// ============ CONFIGURACION NORMATIVA ============

export interface ProjectSettings {
    normativa: 'urbano' | 'rural';
    dotacion: number;
    k1?: number;
    k2?: number;
    // Order of tramos in the calculation table
    tramo_order?: string[];
    scenarios?: Scenario[];
    active_scenario_id?: string;
    // Futuros ajustes
}

// ============ PATRONES DE DEMANDA ============

export interface PatronDemanda {
    id: string
    proyecto_id: string
    nombre: string
    descripcion?: string
    multiplicadores: number[] // Array of 24 floats
    created_at: string
    updated_at: string
}

export interface PatronDemandaCreate {
    nombre: string
    descripcion?: string
    multiplicadores?: number[]
}

// ============ PROYECTO ============

export interface Proyecto {
    id: string
    nombre: string
    descripcion?: string
    ambito: Ambito
    tipo_red: TipoRed
    norma_aplicable: string
    departamento?: string
    provincia?: string
    distrito?: string
    poblacion_diseno: number
    periodo_diseno: number
    dotacion_percapita: number
    coef_cobertura: number
    coef_hazen_williams: number
    estado: string
    version: number
    usuario_id?: string
    created_at: string
    updated_at: string
    settings?: ProjectSettings; // JSONB
    configuracion_plano?: {
        url: string
        opacity: number
        rotation?: number
        bounds: [[number, number], [number, number]] | null
    }
}

// Interfaz simplificada que usamos en el frontend a veces como 'Project'
export interface Project {
    id: string;
    nombre: string;
    ambito: string;
    descripcion?: string;
    estado: string;
    settings: ProjectSettings;
    created_at?: string;
    updated_at?: string;
    usuario_id?: string;
}

export interface ProyectoCreate {
    nombre: string
    descripcion?: string
    ambito?: Ambito
    tipo_red?: TipoRed
    departamento?: string
    provincia?: string
    distrito?: string
    poblacion_diseno?: number
    periodo_diseno?: number
    dotacion_percapita?: number
    coef_cobertura?: number
    settings?: ProjectSettings;
}

// ============ NUDO ============

export interface Nudo {
    id: string
    proyecto_id: string
    codigo: string
    nombre?: string
    tipo: TipoNudo
    longitud?: number
    latitud?: number
    cota_terreno?: number
    cota_lamina?: number
    cota_source: string
    demanda_base: number
    elevacion: number
    presion_calc?: number
    presion_minima_verificada: boolean
    es_critico: boolean
    notas?: string
    numero_viviendas?: number // Manual input for demand calculation
    altura_agua?: number // For Reservoirs (Water Level)
    patron_demanda_id?: string | null
    created_at: string
    updated_at: string
}

export interface NudoCreate {
    codigo: string
    nombre?: string
    tipo?: TipoNudo
    longitud?: number
    latitud?: number
    cota_terreno?: number
    cota_lamina?: number
    demanda_base?: number
    elevacion?: number
    es_critico?: boolean
    numero_viviendas?: number
    altura_agua?: number
    patron_demanda_id?: string | null
}

// ============ CURVAS CARACTERISTICAS ============

export type TipoCurva = 'bomba' | 'volumen' | 'eficiencia'

export interface CurvaCaracteristica {
    id: string
    proyecto_id: string
    nombre: string
    tipo: TipoCurva
    puntos: { x: number; y: number }[] // x=Caudal, y=Altura/Eficiencia
    created_at: string
    updated_at: string
}

export interface CurvaCaracteristicaCreate {
    nombre: string
    tipo?: TipoCurva
    puntos?: { x: number; y: number }[]
}

// ============ TRAMO ============

export type TipoValvulaControl = 'PRV' | 'PSV' | 'FCV' | 'TCV' | 'GPV'
export type EstadoValvula = 'open' | 'closed' | 'active'

export interface Tramo {
    id: string
    proyecto_id: string
    codigo: string
    nombre?: string
    tipo: TipoTramo
    nudo_origen_id: string
    nudo_destino_id: string
    longitud: number
    material: Material
    diametro_interior: number
    diametro_comercial: number
    clase_tuberia: string
    coef_hazen_williams: number
    perdida_carga?: number
    caudal?: number
    velocidad?: number
    velocidad_verificada: boolean
    es_bombeo: boolean
    coeficiente_rugosidad?: number
    source_handle?: string
    target_handle?: string
    numero_viviendas?: number
    created_at: string
    updated_at: string
    // Bombas y Válvulas
    curva_bomba_id?: string | null
    estado_inicial?: EstadoValvula
    consigna_valvula?: number // Setting (e.g. Pressure in m)
    tipo_valvula?: TipoValvulaControl
}

export interface TramoCreate {
    codigo: string
    nombre?: string
    tipo?: TipoTramo
    nudo_origen_id: string
    nudo_destino_id: string
    longitud: number
    material?: Material
    diametro_interior: number
    clase_tuberia?: string
    coef_hazen_williams?: number
    source_handle?: string
    target_handle?: string
    numero_viviendas?: number
    // Bombas y Válvulas
    curva_bomba_id?: string | null
    estado_inicial?: EstadoValvula
    consigna_valvula?: number
    tipo_valvula?: TipoValvulaControl
}

// ============ RESULTADOS DETALLADOS ============

export interface DetalleMallaIteracion {
    malla_id: string
    suma_hf: number
    suma_denom: number
    delta_q: number
}

export interface ResultadoIteracion {
    iteracion: number
    delta_q_total: number
    error_maximo: number
    convergencia_alcanzada: boolean
    detalles_mallas: DetalleMallaIteracion[]
}

// ============ CALCULO ============

export interface Calculo {
    id: string
    proyecto_id: string
    metodo: string
    tolerancia: number
    max_iteraciones: number
    convergencia: boolean
    error_final?: number
    iteraciones_realizadas?: number
    tiempo_calculo?: number
    presion_minima?: number
    presion_maxima?: number
    velocidad_minima?: number
    velocidad_maxima?: number
    iteraciones_data?: ResultadoIteracion[]
    resultados_nudos?: unknown
    resultados_tramos?: unknown
    validacion_passed: boolean
    alertas?: unknown
    created_at: string
    version_modelo: string
}

// ============ OPTIMIZACION ============

export interface Optimizacion {
    id: string
    proyecto_id: string
    algoritmo: string
    parametros_ga?: unknown
    costo_total?: number
    costo_optimizado?: number
    ahorro_porcentaje?: number
    convergencia: boolean
    generaciones?: number
    mejor_individuo?: unknown
    poblacion_final?: number
    tiempo_optimizacion?: number
    diametros_optimizados?: unknown
    created_at: string
}

// ============ ALERTA ============

export interface Alerta {
    id: string
    proyecto_id: string
    tipo_alerta: string
    severidad?: string
    parametro: string
    valor_actual?: number
    valor_minimo?: number
    valor_maximo?: number
    unidad?: string
    mensaje: string
    sugerencia?: string
    resuelta: boolean
    created_at: string
}

// ============ INTERFACES ESPECÍFICAS DE FE ============

export interface JunctionData extends Record<string, unknown> {
    label?: string;
    nombre?: string;
    codigo?: string;
    cota_terreno?: number;
    demanda_base?: number;
    numero_viviendas?: number;
    color?: string;
    diffStatus?: 'added' | 'modified' | 'removed' | 'unchanged';
}

export interface ReservoirData extends Record<string, unknown> {
    label?: string;
    nombre?: string;
    codigo?: string;
    cota_terreno?: number;
    altura_agua?: number;
    diffStatus?: 'added' | 'modified' | 'removed' | 'unchanged';
}

export interface Scenario {
    id: string;
    name: string;
    description?: string;
    parent_id: string | null;
    is_base: boolean;
    created_at: string;
    snapshot?: {
        nudos: Nudo[];
        tramos: Tramo[];
        patrones?: PatronDemanda[];
    };
}
