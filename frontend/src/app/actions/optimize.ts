"use server"

import { createClient } from "@/lib/supabase/server"
import { NudoCalc, TramoCalc } from "@/lib/engine/motor-hidraulico"
import { GeneticOptimizer, GeneticConfig } from "@/lib/optimization/genetic-algorithm"
import { revalidatePath } from "next/cache"

export async function optimizeNetwork(proyectoId: string, config?: Partial<GeneticConfig>) {
    const supabase = await createClient()

    // 1. Fetch data
    const { data: nudosDb } = await supabase.from("nudos").select("*").eq("proyecto_id", proyectoId)
    const { data: tramosDb } = await supabase.from("tramos").select("*").eq("proyecto_id", proyectoId)

    if (!nudosDb || !tramosDb || nudosDb.length === 0 || tramosDb.length === 0) {
        throw new Error("No hay datos suficientes para optimizar")
    }

    // 2. Convert to Map for Engine
    const nudosMap = new Map<string, NudoCalc>()
    const tramosMap = new Map<string, TramoCalc>()

    nudosDb.forEach(n => {
        nudosMap.set(n.id, {
            id: n.id,
            codigo: n.codigo,
            tipo: n.tipo,
            elevacion: n.elevacion || 0,
            demanda: n.demanda_base || 0,
            presion_calc: 0,
            cota_agua: 0
        })
    })

    tramosDb.forEach(t => {
        tramosMap.set(t.id, {
            id: t.id,
            codigo: t.codigo,
            nudo_origen_id: t.nudo_origen_id,
            nudo_destino_id: t.nudo_destino_id,
            longitud: t.longitud || 0,
            diametro: t.diametro_interior || 0,
            material: t.material || "PVC",
            coef_hazen_williams: t.coef_hazen_williams || 150,
            caudal: 0,
            velocidad: 0,
            perdida_carga: 0
        })
    })

    // 3. Run Optimization
    const optimizer = new GeneticOptimizer(nudosMap, tramosMap, config)
    const { bestSolution, history } = optimizer.run()

    // 4. Decode result
    // We don't save yet, just return the optimized configuration
    const optimizedDiameters = optimizer.getOptimizedDiameters(bestSolution)

    return {
        success: true,
        bestCost: bestSolution.cost,
        fitness: bestSolution.fitness,
        penalty: bestSolution.penalty,
        minPressure: bestSolution.minPressure,
        maxPressure: bestSolution.maxPressure,
        maxVelocity: bestSolution.maxVelocity,
        history,
        optimizedDiameters // Map of tramoId -> { diametro_mm, ... }
    }
}

export async function applyOptimization(proyectoId: string, optimizedDiameters: Record<string, { diametro_mm: number, diametro_pulg: number }>) {
    const supabase = await createClient()
    const updates = []

    for (const [tramoId, data] of Object.entries(optimizedDiameters)) {
        updates.push(
            supabase.from("tramos").update({
                diametro_interior: data.diametro_mm,
                diametro_comercial: data.diametro_pulg
            }).eq("id", tramoId)
        )
    }

    await Promise.all(updates)
    revalidatePath("/proyectos/[id]", "page")
    return { success: true }
}
