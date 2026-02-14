"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Nudo } from "@/types/models"
import { nudoCreateSchema, nudoUpdateSchema } from "@/lib/schemas"
import { ActionState } from "./types"
import { z } from "zod"

const idSchema = z.string().uuid()

export async function updateNudoCoordinates(id: string, latitud: number, longitud: number): Promise<ActionState> {
    const supabase = await createClient()

    const parseId = idSchema.safeParse(id)
    if (!parseId.success) return { success: false, message: "ID inválido" }

    const { error } = await supabase
        .from("nudos")
        .update({ latitud, longitud, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) {
        return { success: false, message: `Error updating nudo ${id}: ${error.message}` }
    }

    // No revalidatePath — position is managed optimistically by the Zustand store
    return { success: true }
}

export async function updateNudo(id: string, data: Partial<Nudo>): Promise<ActionState> {
    const supabase = await createClient()

    const parseId = idSchema.safeParse(id)
    if (!parseId.success) return { success: false, message: "ID inválido" }

    const parsedData = nudoUpdateSchema.safeParse(data)
    if (!parsedData.success) {
        return {
            success: false,
            message: "Datos inválidos",
            errors: parsedData.error.flatten().fieldErrors
        }
    }

    const updates = {
        ...parsedData.data,
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from("nudos")
        .update(updates)
        .eq("id", id)

    if (error) {
        return { success: false, message: `Error updating nudo ${id}: ${error.message}` }
    }

    revalidatePath("/proyectos/[id]", "page")
    return { success: true }
}

export async function createNudo(proyectoId: string, latitud: number, longitud: number, tipo: Nudo['tipo'] = 'union'): Promise<ActionState<{ nudo: Nudo }>> {
    const supabase = await createClient()

    const parseProject = idSchema.safeParse(proyectoId)
    if (!parseProject.success) return { success: false, message: "ID de proyecto inválido" }

    // Validate inputs
    // We construct a specific schema for this action's args since it constructs the full object internally
    const inputSchema = z.object({
        latitud: z.number(),
        longitud: z.number(),
        tipo: z.enum(['cisterna', 'tanque_elevado', 'union', 'consumo', 'valvula', 'bomba', 'reservorio', 'camara_rompe_presion'])
    })

    const parsedInput = inputSchema.safeParse({ latitud, longitud, tipo })
    if (!parsedInput.success) {
        return { success: false, message: "Datos de entrada inválidos", errors: parsedInput.error.flatten().fieldErrors }
    }

    // Generar código automático (N-X)
    const { count } = await supabase.from("nudos").select("*", { count: "exact", head: true }).eq("proyecto_id", proyectoId)
    const codigo = `N-${(count || 0) + 1}`

    const { data, error } = await supabase.from("nudos").insert({
        proyecto_id: proyectoId,
        codigo,
        tipo: parsedInput.data.tipo,
        latitud: parsedInput.data.latitud,
        longitud: parsedInput.data.longitud,
        cota_terreno: 0,
        demanda_base: 0,
        elevacion: 0,
        numero_viviendas: 0,
        altura_agua: 0
    }).select().single()

    if (error) {
        return { success: false, message: `Error creating nudo: ${error.message}` }
    }

    // No revalidatePath — node is managed optimistically by the Zustand store.
    return { success: true, data: { nudo: data } }
}

export async function deleteNudo(id: string): Promise<ActionState> {
    const supabase = await createClient()

    const parseId = idSchema.safeParse(id)
    if (!parseId.success) return { success: false, message: "ID inválido" }

    // CASCADE: Delete all tramos connected to this nudo first
    const { error: tramoError } = await supabase
        .from("tramos")
        .delete()
        .or(`nudo_origen_id.eq.${id},nudo_destino_id.eq.${id}`)

    if (tramoError) {
        return { success: false, message: `Error deleting connected tramos: ${tramoError.message}` }
    }

    // Now delete the nudo itself
    const { error } = await supabase
        .from("nudos")
        .delete()
        .eq("id", id)

    if (error) {
        return { success: false, message: `Error deleting nudo: ${error.message}` }
    }

    return { success: true }
}
