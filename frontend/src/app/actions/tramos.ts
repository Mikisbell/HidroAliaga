"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { tramoCreateSchema, tramoUpdateSchema } from "@/lib/schemas"
import { ActionState } from "./types"
import { Tramo } from "@/types/models"

const idSchema = z.string().uuid()

export async function updateTramo(data: any): Promise<ActionState> {
    const supabase = await createClient()

    // Validate ID and data
    const schema = tramoUpdateSchema.extend({
        id: z.string().uuid()
    })

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
        return {
            success: false,
            message: "Datos inválidos",
            errors: parsed.error.flatten().fieldErrors as any
        }
    }

    const { id, ...updates } = parsed.data

    const { error } = await supabase
        .from('tramos')
        .update(updates)
        .eq('id', id)

    if (error) return { success: false, message: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}

// Alias for backwards compatibility if needed, but prefer direct import
export const updateTramoAction = updateTramo

export async function createTramo(input: any): Promise<ActionState<{ tramo: Tramo }>> {
    const supabase = await createClient()

    // Validate with tramoCreateSchema (includes project_id, nudos, etc.)
    const parsed = tramoCreateSchema.safeParse(input)
    if (!parsed.success) {
        return {
            success: false,
            message: "Datos inválidos",
            errors: parsed.error.flatten().fieldErrors as any
        }
    }

    const dataRaw = parsed.data

    // Generate code if not provided
    let codigo = dataRaw.codigo
    if (!codigo) {
        const { count } = await supabase.from('tramos').select('*', { count: 'exact', head: true }).eq('proyecto_id', dataRaw.proyecto_id)
        codigo = `T-${(count || 0) + 1}`
    }

    const { data: created, error } = await supabase
        .from('tramos')
        .insert({
            ...dataRaw,
            codigo,
            coef_hazen_williams: dataRaw.coef_hazen_williams || 150
        })
        .select()
        .single()

    if (error) return { success: false, message: error.message }

    // No revalidatePath — tramo is managed optimistically by the Zustand store
    return { success: true, data: { tramo: created } }
}

// Alias for backwards compatibility
export const createTramoAction = createTramo

export async function updateNudoViviendasAction(nudoId: string, viviendas: number): Promise<ActionState> {
    const supabase = await createClient()

    const parseId = idSchema.safeParse(nudoId)
    if (!parseId.success) return { success: false, message: "ID de nudo inválido" }

    if (viviendas < 0) return { success: false, message: "El número de viviendas no puede ser negativo" }

    const { error } = await supabase
        .from('nudos')
        .update({ numero_viviendas: viviendas })
        .eq('id', nudoId)

    if (error) return { success: false, message: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}

const createBatchTramosSchema = z.array(tramoCreateSchema)

export async function createBatchTramos(data: any[], proyectoId: string): Promise<ActionState<{ count: number }>> {
    const supabase = await createClient()

    // Validate input
    // Ensure all items have the project ID
    const dataWithProject = data.map(d => ({ ...d, proyecto_id: proyectoId }))
    const parsed = createBatchTramosSchema.safeParse(dataWithProject)

    if (!parsed.success) {
        return {
            success: false,
            message: "Datos de lote inválidos",
            errors: parsed.error.flatten().fieldErrors as any // Flatten on array is weird, just cast to any or Record
        }
    }

    const tramosToInsert = parsed.data

    // Get current count for code generation
    const { count, error: countError } = await supabase
        .from('tramos')
        .select('*', { count: 'exact', head: true })
        .eq('proyecto_id', proyectoId)

    if (countError) return { success: false, message: "Error al obtener conteo de tramos" }

    let currentCount = count || 0

    // Assign codes and default values
    const rows = tramosToInsert.map((t) => {
        currentCount++
        return {
            ...t,
            codigo: t.codigo || `T-${currentCount}`,
            coef_hazen_williams: t.coef_hazen_williams || 150
        }
    })

    const { error } = await supabase
        .from('tramos')
        .insert(rows)

    if (error) return { success: false, message: error.message }

    return { success: true, data: { count: rows.length } }
}

export async function deleteBatchTramos(ids: string[]): Promise<ActionState> {
    const supabase = await createClient()

    const idsSchema = z.array(z.string().uuid())
    const parsed = idsSchema.safeParse(ids)

    if (!parsed.success || parsed.data.length === 0) return { success: false, message: "IDs inválidos o vacíos" }

    const { error } = await supabase
        .from('tramos')
        .delete()
        .in('id', parsed.data)

    if (error) return { success: false, message: error.message }

    revalidatePath('/proyectos/[id]/tramos')
    return { success: true }
}

export async function deleteTramo(id: string): Promise<ActionState> {
    const supabase = await createClient()

    const parseId = idSchema.safeParse(id)
    if (!parseId.success) return { success: false, message: "ID inválido" }

    const { error } = await supabase
        .from('tramos')
        .delete()
        .eq('id', id)

    if (error) return { success: false, message: error.message }

    // No revalidatePath — store is the source of truth (optimistic)
    return { success: true }
}
