import { Nudo, Tramo } from "@/types/models";

/**
 * Transforma los modelos de la base de datos (Nudo, Tramo)
 * al formato optimizado que espera el Worker de epanet-js.
 */
export function projectToNetwork(nudos: Nudo[], tramos: Tramo[]) {
    // Transformación de Nudos
    const nodes = nudos.map(n => {
        // Determinamos el tipo para EPANET
        let type = 'JUNCTION';
        let head = undefined; // Carga total (para reservorios)

        if (n.tipo === 'reservorio') {
            type = 'RESERVOIR';
            // Para un reservorio, la "Head" (Carga) es Cota Terreno + Altura de Agua (si existe)
            // Si altura_agua es null/0, asumimos que el nivel es la cota.
            const alturaAgua = typeof n.altura_agua === 'number' ? n.altura_agua : 0;
            head = (n.cota_terreno || 0) + alturaAgua;
        }

        return {
            id: n.codigo || n.id, // Usamos el código visible si existe, sino el ID
            type: type,
            elevation: n.cota_terreno || 0,
            demand: n.demanda_base || 0, // En LPS
            head: head
            // TODO: Agregar patrones de demanda si es necesario
        };
    });

    // Transformación de Tuberías (Links)
    const links = tramos.map(t => {
        // Buscamos los IDs de origen y destino
        // Nota: Si usamos 'codigo' en los nodos, debemos asegurar que aquí también se usen los 'codigos'.
        // Por seguridad, por ahora usaremos los IDs internos para la topología, 
        // a menos que el worker requiera strings cortos.

        // Estrategia: Usamos IDs internos para la simulación para evitar problemas con nombres duplicados o vacíos visuales.
        // El worker devolverá resultados por ID, y luego mapeamos de vuelta.

        return {
            id: t.id,
            source: t.nudo_origen_id,
            target: t.nudo_destino_id,
            length: t.longitud || 10, // Default 10m si falta
            diameter: (t.diametro_comercial || 1) * 25.4, // Convertir pulgadas a mm (EPANET usa mm internamente para LPS)
            roughness: 140, // Coeficiente C de Hazen-Williams (PVC estándar)
            status: 'OPEN'
        };
    });

    return {
        nodes,
        links,
        options: {
            units: 'LPS', // Litros por Segundo
            headloss: 'H-W', // Hazen-Williams
            trials: 40,    // Intentos máximos
            accuracy: 0.001 // Precisión de convergencia
        }
    };
}
