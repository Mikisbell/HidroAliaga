/**
 * Validación Normativa Automática - HidroAliaga
 * Verifica presiones, velocidades, diámetros contra normativa peruana
 */

import { getLimitesNormativos } from '@/lib/constants'
import type { NudoCalc, TramoCalc } from '@/lib/engine/motor-hidraulico'

export interface AlertaValidacion {
    tipo: 'error' | 'advertencia' | 'info'
    parametro: string
    elemento: string
    codigo_elemento: string
    valor_actual: number
    valor_limite: number
    unidad: string
    mensaje: string
    norma: string
}

export interface ResultadoValidacion {
    valido: boolean
    total_alertas: number
    errores: number
    advertencias: number
    alertas: AlertaValidacion[]
}

/**
 * Valida un proyecto según la normativa peruana
 */
export function validarProyecto(
    nudos: NudoCalc[],
    tramos: TramoCalc[],
    ambito: 'urbano' | 'rural' = 'urbano'
): ResultadoValidacion {
    const limites = getLimitesNormativos(ambito)
    const alertas: AlertaValidacion[] = []

    // === VALIDAR PRESIONES EN NUDOS ===
    for (const nudo of nudos) {
        if (['cisterna', 'reservorio', 'tanque_elevado'].includes(nudo.tipo)) continue

        // Presión mínima
        if (nudo.presion_calc < limites.presion_minima) {
            alertas.push({
                tipo: 'error',
                parametro: 'presion_minima',
                elemento: 'nudo',
                codigo_elemento: nudo.codigo,
                valor_actual: nudo.presion_calc,
                valor_limite: limites.presion_minima,
                unidad: 'm.c.a.',
                mensaje: `Presión en nudo ${nudo.codigo} (${nudo.presion_calc.toFixed(2)} m.c.a.) es menor que la mínima (${limites.presion_minima} m.c.a.)`,
                norma: ambito === 'urbano' ? 'RNE OS.050' : 'RM 192-2018',
            })
        }

        // Presión máxima (estática)
        if (nudo.presion_calc > limites.presion_maxima) {
            alertas.push({
                tipo: 'error',
                parametro: 'presion_maxima',
                elemento: 'nudo',
                codigo_elemento: nudo.codigo,
                valor_actual: nudo.presion_calc,
                valor_limite: limites.presion_maxima,
                unidad: 'm.c.a.',
                mensaje: `Presión en nudo ${nudo.codigo} (${nudo.presion_calc.toFixed(2)} m.c.a.) supera la máxima estática (${limites.presion_maxima} m.c.a.)`,
                norma: 'RNE OS.050',
            })
        }
    }

    // === VALIDAR VELOCIDADES Y DIÁMETROS EN TRAMOS ===
    for (const tramo of tramos) {
        // Velocidad mínima
        if (tramo.velocidad > 0 && tramo.velocidad < limites.velocidad_minima) {
            alertas.push({
                tipo: 'advertencia',
                parametro: 'velocidad_minima',
                elemento: 'tramo',
                codigo_elemento: tramo.codigo,
                valor_actual: tramo.velocidad,
                valor_limite: limites.velocidad_minima,
                unidad: 'm/s',
                mensaje: `Velocidad en tramo ${tramo.codigo} (${tramo.velocidad.toFixed(3)} m/s) es menor que la mínima (${limites.velocidad_minima} m/s)`,
                norma: 'RNE OS.050',
            })
        }

        // Velocidad máxima
        if (tramo.velocidad > limites.velocidad_maxima) {
            alertas.push({
                tipo: 'error',
                parametro: 'velocidad_maxima',
                elemento: 'tramo',
                codigo_elemento: tramo.codigo,
                valor_actual: tramo.velocidad,
                valor_limite: limites.velocidad_maxima,
                unidad: 'm/s',
                mensaje: `Velocidad en tramo ${tramo.codigo} (${tramo.velocidad.toFixed(3)} m/s) supera la máxima (${limites.velocidad_maxima} m/s)`,
                norma: 'RNE OS.050',
            })
        }

        // Diámetro mínimo
        if (tramo.diametro < limites.diametro_minimo) {
            alertas.push({
                tipo: 'advertencia',
                parametro: 'diametro_minimo',
                elemento: 'tramo',
                codigo_elemento: tramo.codigo,
                valor_actual: tramo.diametro,
                valor_limite: limites.diametro_minimo,
                unidad: 'mm',
                mensaje: `Diámetro en tramo ${tramo.codigo} (${tramo.diametro} mm) es menor que el mínimo (${limites.diametro_minimo} mm)`,
                norma: ambito === 'urbano' ? 'RNE OS.050' : 'RM 192-2018',
            })
        }
    }

    const errores = alertas.filter(a => a.tipo === 'error').length
    const advertencias = alertas.filter(a => a.tipo === 'advertencia').length

    return {
        valido: errores === 0,
        total_alertas: alertas.length,
        errores,
        advertencias,
        alertas,
    }
}
