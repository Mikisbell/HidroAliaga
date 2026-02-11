"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Calculate distance between two points in meters
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

export async function createTramo(proyectoId: string, origenId: string, destinoId: string) {
    const supabase = await createClient()

    // 1. Validation: Self-loop
    if (origenId === destinoId) {
        throw new Error("No se puede conectar un nudo consigo mismo")
    }

    // 2. Validation: Existing pipe
    const { data: existing } = await supabase
        .from("tramos")
        .select("id")
        .or(`and(nudo_origen_id.eq.${origenId},nudo_destino_id.eq.${destinoId}),and(nudo_origen_id.eq.${destinoId},nudo_destino_id.eq.${origenId})`)
        .single()

    if (existing) {
        throw new Error("Ya existe un tramo entre estos nudos")
    }

    // 3. Get node coordinates
    const { data: nudos } = await supabase
        .from("nudos")
        .select("id, latitud, longitud")
        .in("id", [origenId, destinoId])

    if (!nudos || nudos.length < 2) {
        throw new Error("No se encontraron los nudos seleccionados")
    }

    const n1 = nudos.find(n => n.id === origenId)!
    const n2 = nudos.find(n => n.id === destinoId)!

    // 4. Calculate length
    const longitud = haversine(n1.latitud, n1.longitud, n2.latitud, n2.longitud)

    // 5. Generate Code
    const { count } = await supabase.from("tramos").select("*", { count: "exact", head: true }).eq("proyecto_id", proyectoId)
    const codigo = `T-${(count || 0) + 1}`

    // 6. Insert
    const { data, error } = await supabase.from("tramos").insert({
        proyecto_id: proyectoId,
        nudo_origen_id: origenId,
        nudo_destino_id: destinoId,
        longitud, // Auto-calculated
        codigo,
        diametro_interior: 25.4, // Default 1 inch
        rugosidad: 150, // PVC default
        material: 'PVC',
        estado: 'activo'
    }).select().single()

    if (error) {
        throw new Error(`Error creando tramo: ${error.message}`)
    }

    revalidatePath(`/proyectos/${proyectoId}`)
    return { success: true, tramo: data }
}

export async function updateTramo(id: string, data: Partial<any>) {
    const supabase = await createClient()

    const updates: any = { updated_at: new Date().toISOString() }
    if (data.diametro_interior !== undefined) updates.diametro_interior = data.diametro_interior
    if (data.material !== undefined) updates.material = data.material
    if (data.rugosidad !== undefined) updates.rugosidad = data.rugosidad

    const { error } = await supabase
        .from("tramos")
        .update(updates)
        .eq("id", id)

    if (error) {
        throw new Error(`Error updating tramo ${id}: ${error.message}`)
    }

    revalidatePath("/proyectos/[id]", "page") // We don't have project ID here easily without fetch, but generic revalidate might work or we pass it
    // Actually, revalidatePath matches based on route, not query params for [id] unless specific?
    // "page" type revalidates the layout.
    return { success: true }
}
