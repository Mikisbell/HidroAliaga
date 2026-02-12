import { Project, Nudo, Tramo, ProjectSettings, Alerta } from "@/types/models";

export interface ValidationResult {
    elementId: string;
    elementType: 'node' | 'link';
    ruleId: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    value: number;
    threshold: number;
    unit: string;
}

/**
 * EL ÁRBITRO: Motor de Validación Normativa
 * Valida el diseño hidráulico contra normativas peruanas (RNE OS.050 / RM 192)
 */
export function validateHydraulics(
    project: Project,
    nodes: Nudo[],
    pipes: Tramo[]
): ValidationResult[] {
    const results: ValidationResult[] = [];
    const settings = project.settings || { normativa: 'urbano', dotacion: 150 }; // Default
    const isRural = settings.normativa === 'rural';

    // === CONFIGURACIÓN DE REGLAS ===
    const rules = {
        pressureMin: isRural ? 5.0 : 10.0, // 5m (Rural - Conexiones) vs 10m (Urbano)
        pressureMax: isRural ? 60.0 : 50.0, // 60m (Rural) vs 50m (Urbano)
        velocityMin: 0.6, // 0.6 m/s (Ambas - Sedimentación)
        velocityMax: 3.0, // 3.0 m/s (Ambas - Erosión PVC)
    };

    // 1. VALIDAR NUDOS (Presiones)
    nodes.forEach(node => {
        // Ignorar nudos sin resultados o que sean reservorios/tanques (fuentes)
        // Las fuentes tienen presión 0 o calculada diferente, nos enfocamos en nudos de consumo/unión
        if (node.tipo === 'reservorio' || node.tipo === 'cisterna') return;
        if (node.presion_calc === undefined || node.presion_calc === null) return;

        const p = node.presion_calc;

        // Regla: Presión Mínima
        if (p < rules.pressureMin) {
            results.push({
                elementId: node.id,
                elementType: 'node',
                ruleId: 'min_pressure',
                level: 'error',
                message: `Presión insuficiente (${p.toFixed(2)}m < ${rules.pressureMin}m)`,
                value: p,
                threshold: rules.pressureMin,
                unit: 'm'
            });
        }

        // Regla: Presión Máxima
        if (p > rules.pressureMax) {
            results.push({
                elementId: node.id,
                elementType: 'node',
                ruleId: 'max_pressure',
                level: 'warning',
                message: `Presión excesiva (${p.toFixed(2)}m > ${rules.pressureMax}m)`,
                value: p,
                threshold: rules.pressureMax,
                unit: 'm'
            });
        }

        // Regla: Presiones Negativas (Error Crítico)
        if (p < 0) {
            results.push({
                elementId: node.id,
                elementType: 'node',
                ruleId: 'negative_pressure',
                level: 'error',
                message: `¡ALERTA CRÍTICA! Presión negativa (${p.toFixed(2)}m)`,
                value: p,
                threshold: 0,
                unit: 'm'
            });
        }
    });

    // 2. VALIDAR TUBERÍAS (Velocidades)
    pipes.forEach(pipe => {
        if (pipe.velocidad === undefined || pipe.velocidad === null) return;

        const v = pipe.velocidad;

        // Regla: Velocidad Mínima (Sedimentación)
        if (v < rules.velocityMin && v > 0.01) { // Ignorar tuberías casi vacías o cerradas
            results.push({
                elementId: pipe.id,
                elementType: 'link',
                ruleId: 'min_velocity',
                level: 'warning',
                message: `Velocidad baja - Riesgo sedimentación (${v.toFixed(2)}m/s < ${rules.velocityMin}m/s)`,
                value: v,
                threshold: rules.velocityMin,
                unit: 'm/s'
            });
        }

        // Regla: Velocidad Máxima (Erosión)
        if (v > rules.velocityMax) {
            results.push({
                elementId: pipe.id,
                elementType: 'link',
                ruleId: 'max_velocity',
                level: 'error',
                message: `Velocidad excesiva - Riesgo erosión (${v.toFixed(2)}m/s > ${rules.velocityMax}m/s)`,
                value: v,
                threshold: rules.velocityMax,
                unit: 'm/s'
            });
        }
    });

    return results;
}
