'use server'

import { createClient } from "@/lib/supabase/server"
import { CurvaCaracteristica } from "@/types/models"
import { revalidatePath } from "next/cache"

export async function getCurves(projectId: string): Promise<CurvaCaracteristica[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('curvas_caracteristicas')
        .select('*')
        .eq('proyecto_id', projectId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching curves:', error)
        return []
    }

    return data as CurvaCaracteristica[]
}

export async function addCurve(projectId: string, curve: CurvaCaracteristica) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('curvas_caracteristicas')
        .insert({
            id: curve.id,
            proyecto_id: projectId,
            nombre: curve.nombre,
            tipo: curve.tipo,
            puntos: curve.puntos,
            created_at: curve.created_at,
            updated_at: curve.updated_at
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating curve:', error)
        return { success: false, error }
    }

    revalidatePath(`/proyectos/${projectId}`)
    return { success: true, data: data as CurvaCaracteristica }
}

export async function updateCurve(projectId: string, curveId: string, updates: Partial<CurvaCaracteristica>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('curvas_caracteristicas')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', curveId)
        .eq('proyecto_id', projectId) // Security check
        .select()
        .single()

    if (error) {
        console.error('Error updating curve:', error)
        return { success: false, error }
    }

    revalidatePath(`/proyectos/${projectId}`)
    return { success: true, data: data as CurvaCaracteristica }
}

export async function deleteCurve(projectId: string, curveId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('curvas_caracteristicas')
        .delete()
        .eq('id', curveId)
        .eq('proyecto_id', projectId)

    if (error) {
        console.error('Error deleting curve:', error)
        return { success: false, error }
    }

    revalidatePath(`/proyectos/${projectId}`)
    return { success: true }
}
