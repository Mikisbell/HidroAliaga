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
export async function createTramoAction(data: any) {
    const supabase = await createClient()

    // Basic validation
    if (!data.nudo_origen_id || !data.nudo_destino_id || !data.proyecto_id) {
        return { error: "Faltan datos requeridos (Nudos o Proyecto)" }
    }

    // Generate code if not provided
    let codigo = data.codigo
    if (!codigo) {
        const { count } = await supabase.from('tramos').select('*', { count: 'exact', head: true }).eq('proyecto_id', data.proyecto_id)
        codigo = `T-${(count || 0) + 1}`
    }

    const { error } = await supabase
        .from('tramos')
        .insert({
            ...data,
            codigo,
            coef_hazen_williams: 150 // Default
        })

    if (error) return { error: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}

// Alias for backwards compatibility
export { createTramoAction as createTramo }

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
