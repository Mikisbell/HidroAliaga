'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateTramoSchema = z.object({
    id: z.string().uuid(),
    longitud: z.number().positive().optional(),
    diametro_comercial: z.number().positive().optional(),
    material: z.string().optional(),
    diametro_interior: z.number().positive().optional(),
})

const updateNudoSchema = z.object({
    id: z.string().uuid(),
    numero_viviendas: z.number().int().min(0).optional(),
})

export async function updateTramoAction(data: any) {
    const supabase = await createClient()

    // Validate
    const parsed = updateTramoSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Datos inválidos: " + parsed.error.issues.map(i => i.message).join(", ") }
    }

    const { id, ...updates } = parsed.data

    const { error } = await supabase
        .from('tramos')
        .update(updates)
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}

// Create a new Tramo
export async function createTramoAction(input: any) {
    const supabase = await createClient()

    // Basic validation
    if (!input.nudo_origen_id || !input.nudo_destino_id || !input.proyecto_id) {
        return { error: "Faltan datos requeridos (Nudos o Proyecto)" }
    }

    // Generate code if not provided
    let codigo = input.codigo
    if (!codigo) {
        const { count } = await supabase.from('tramos').select('*', { count: 'exact', head: true }).eq('proyecto_id', input.proyecto_id)
        codigo = `T-${(count || 0) + 1}`
    }

    const { data: created, error } = await supabase
        .from('tramos')
        .insert({
            ...input,
            codigo,
            coef_hazen_williams: 150 // Default
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // No revalidatePath — tramo is managed optimistically by the Zustand store
    return { success: true, tramo: created }
}

// Alias for backwards compatibility
export { createTramoAction as createTramo }
export { updateTramoAction as updateTramo }

export async function updateNudoViviendasAction(nudoId: string, viviendas: number) {
    const supabase = await createClient()

    // Simple validation
    if (!nudoId || viviendas < 0) return { error: "Datos inválidos" }

    const { error } = await supabase
        .from('nudos')
        .update({ numero_viviendas: viviendas })
        .eq('id', nudoId)

    if (error) return { error: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}
// ... existing exports

const createTramoSchema = z.object({
    nudo_origen_id: z.string().uuid(),
    nudo_destino_id: z.string().uuid(),
    proyecto_id: z.string().uuid(),
    longitud: z.number().nonnegative().default(0),
    diametro_comercial: z.number().positive().default(0.75),
    material: z.string().default("pvc"),
    clase_tuberia: z.string().default("CL-10"),
    codigo: z.string().optional(),
})

const createBatchTramosSchema = z.array(createTramoSchema)

export async function createBatchTramos(data: any[], proyectoId: string) {
    const supabase = await createClient()

    // Validate input
    // Ensure all items have the project ID
    const dataWithProject = data.map(d => ({ ...d, proyecto_id: proyectoId }))
    const parsed = createBatchTramosSchema.safeParse(dataWithProject)

    if (!parsed.success) {
        return { error: "Datos inválidos: " + parsed.error.issues.map(i => i.message).join(", ") }
    }

    const tramosToInsert = parsed.data

    // Get current count for code generation
    const { count, error: countError } = await supabase
        .from('tramos')
        .select('*', { count: 'exact', head: true })
        .eq('proyecto_id', proyectoId)

    if (countError) return { error: "Error al obtener conteo de tramos" }

    let currentCount = count || 0

    // Assign codes and default values
    const rows = tramosToInsert.map((t) => {
        currentCount++
        return {
            ...t,
            codigo: t.codigo || `T-${currentCount}`,
            coef_hazen_williams: 150
        }
    })

    const { error } = await supabase
        .from('tramos')
        .insert(rows)

    if (error) return { error: error.message }

    // No revalidatePath — tramos managed optimistically by the Zustand store
    return { success: true, count: rows.length }
}

export async function deleteBatchTramos(ids: string[]) {
    const supabase = await createClient()

    if (!ids || ids.length === 0) return { error: "No se seleccionaron tramos" }

    const { error } = await supabase
        .from('tramos')
        .delete()
        .in('id', ids)

    if (error) return { error: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}
