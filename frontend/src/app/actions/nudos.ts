"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Nudo } from "@/types/models"

export async function updateNudoCoordinates(id: string, latitud: number, longitud: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("nudos")
        .update({ latitud, longitud, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) {
        throw new Error(`Error updating nudo ${id}: ${error.message}`)
    }

    revalidatePath("/proyectos/[id]", "page")
    return { success: true }
}

export async function updateNudo(id: string, data: Partial<Nudo>) {
    const supabase = await createClient()

    // Filter allowed fields
    const updates: any = { updated_at: new Date().toISOString() }
    if (data.cota_terreno !== undefined) updates.cota_terreno = data.cota_terreno
    if (data.demanda_base !== undefined) updates.demanda_base = data.demanda_base
    if (data.elevacion !== undefined) updates.elevacion = data.elevacion
    if (data.cota_lamina !== undefined) updates.cota_lamina = data.cota_lamina
    if (data.tipo !== undefined) updates.tipo = data.tipo
    if (data.nombre !== undefined) updates.nombre = data.nombre
    if (data.notas !== undefined) updates.notas = data.notas
    if (data.es_critico !== undefined) updates.es_critico = data.es_critico
    if (data.numero_viviendas !== undefined) updates.numero_viviendas = data.numero_viviendas
    if (data.altura_agua !== undefined) updates.altura_agua = data.altura_agua

    const { error } = await supabase
        .from("nudos")
        .update(updates)
        .eq("id", id)

    if (error) {
        throw new Error(`Error updating nudo ${id}: ${error.message}`)
    }

    revalidatePath("/proyectos/[id]", "page")
    return { success: true }
}

export async function createNudo(proyectoId: string, latitud: number, longitud: number, tipo: Nudo['tipo'] = 'union') {
    const supabase = await createClient()

    // Generar código automático (N-X)
    const { count } = await supabase.from("nudos").select("*", { count: "exact", head: true }).eq("proyecto_id", proyectoId)
    const codigo = `N-${(count || 0) + 1}`

    const { data, error } = await supabase.from("nudos").insert({
        proyecto_id: proyectoId,
        codigo,
        tipo, // Use passed type or default to union
        latitud,
        longitud,
        cota_terreno: 0, // Default, usuario debe editar
        demanda_base: 0,
        elevacion: 0,
        numero_viviendas: 0,
        altura_agua: 0
    }).select().single()

    if (error) {
        throw new Error(`Error creating nudo: ${error.message}`)
    }

    revalidatePath("/proyectos/[id]", "page")
    return { success: true, nudo: data }
}
