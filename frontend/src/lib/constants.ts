/**
 * Constantes Normativas Peruanas - HidroAliaga
 * Basado en: RNE OS.050, RM 192-2018, RM 107-2025
 */

// ============ PRESIONES (m.c.a.) ============

export const PRESION_MINIMA_URBANA = 10.0    // RNE OS.050
export const PRESION_MINIMA_RURAL = 5.0      // RM 192-2018
export const PRESION_MINIMA_PILETAS = 3.5    // RM 192-2018
export const PRESION_ESTATICA_MAXIMA = 50.0  // RNE OS.050

// ============ VELOCIDADES (m/s) ============

export const VELOCIDAD_MINIMA = 0.6  // RNE OS.050
export const VELOCIDAD_MAXIMA = 3.0  // RNE OS.050

// ============ DIÁMETROS MÍNIMOS (mm) ============

export const DIAMETRO_MINIMO_URBANO = 75.0  // 3 pulgadas
export const DIAMETRO_MINIMO_RURAL = 20.0   // 3/4 pulgada (RM 192-2018 Art. 12.4.1)

// ============ DOTACIONES (lppd) RM 107-2025 ============

export const DOTACION_CLIMA_CALIDO = 169.0
export const DOTACION_CLIMA_TEMPLADO = 155.0
export const DOTACION_CLIMA_FRIO = 129.0

// ============ HAZEN-WILLIAMS ============

export const HAZEN_WILLIAMS_CONSTANT = 10.674
export const HAZEN_WILLIAMS_EXPONENT = 1.852

export const COEFICIENTES_HW: Record<string, { valor: number; descripcion: string }> = {
    pvc: { valor: 150, descripcion: 'Tuberías de PVC' },
    hdpe: { valor: 140, descripcion: 'Tuberías de HDPE' },
    hdde: { valor: 140, descripcion: 'Tuberías de HDDE' },
    concreto: { valor: 130, descripcion: 'Tuberías de concreto' },
    acero: { valor: 140, descripcion: 'Tuberías de acero' },
    cobre: { valor: 130, descripcion: 'Tuberías de cobre' },
}

// ============ DIÁMETROS COMERCIALES (mm) ============

export const DIAMETROS_COMERCIALES = [
    20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160, 200, 250, 315, 400
]

export const DIAMETROS_EQUIVALENCIAS: Record<string, number> = {
    "1/2": 21.0, // mm ext aprox
    "3/4": 26.5,
    "1": 33.0,
    "1 1/4": 42.0,
    "1 1/2": 48.0,
    "2": 60.0,
    "2 1/2": 73.0,
    "3": 88.5,
    "4": 114.0,
    "6": 168.0,
    "8": 219.0
}

// ============ MOTOR HIDRÁULICO ============

export const HARDY_CROSS_TOLERANCE = 1e-7
export const MAX_ITERATIONS = 1000

// ============ ALGORITMO GENÉTICO ============

export const GA_POBLACION_SIZE = 100
export const GA_GENERACIONES = 50
export const GA_CROSSOVER_RATE = 0.8
export const GA_MUTATION_RATE = 0.1

// ============ NORMATIVA ============

export const NORMAS = [
    {
        codigo: 'RNE-OS.050',
        nombre: 'Norma OS.050 - Redes de Distribución de Agua Potable',
        referencia: 'Reglamento Nacional de Edificaciones',
        ambito: ['urbano', 'rural'],
    },
    {
        codigo: 'RM-192-2018-VIVIENDA',
        nombre: 'Reglamento de Prestaciones del Servicio de Saneamiento',
        referencia: 'Ministerio de Vivienda',
        ambito: ['rural'],
    },
    {
        codigo: 'RM-107-2025-VIVIENDA',
        nombre: 'Actualización de Dotaciones según Clima',
        referencia: 'Ministerio de Vivienda',
        ambito: ['urbano', 'rural'],
    },
]

// ============ LIMITES POR ÁMBITO ============

export function getLimitesNormativos(ambito: 'urbano' | 'rural') {
    if (ambito === 'urbano') {
        return {
            presion_minima: PRESION_MINIMA_URBANA,
            presion_maxima: PRESION_ESTATICA_MAXIMA,
            velocidad_minima: VELOCIDAD_MINIMA,
            velocidad_maxima: VELOCIDAD_MAXIMA,
            diametro_minimo: DIAMETRO_MINIMO_URBANO,
            dotacion_calido: DOTACION_CLIMA_CALIDO,
            dotacion_templado: DOTACION_CLIMA_TEMPLADO,
            dotacion_frio: DOTACION_CLIMA_FRIO,
        }
    }
    return {
        presion_minima: PRESION_MINIMA_RURAL,
        presion_minima_piletas: PRESION_MINIMA_PILETAS,
        presion_maxima: PRESION_ESTATICA_MAXIMA,
        velocidad_minima: VELOCIDAD_MINIMA,
        velocidad_maxima: VELOCIDAD_MAXIMA,
        diametro_minimo: DIAMETRO_MINIMO_RURAL,
    }
}
