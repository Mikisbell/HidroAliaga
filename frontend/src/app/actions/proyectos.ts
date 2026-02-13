"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ProyectoCreate, ProjectSettings } from "@/types/models"

/**
 * Actualiza un proyecto existente.
 * Permite actualizar campos parciales incluyendo settings (JSONB).
 */
export async function updateProject(id: string, data: Partial<ProyectoCreate>) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('proyectos')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error("Error updating project:", error)
        throw new Error("Error al actualizar el proyecto")
    }

    revalidatePath(`/proyectos/${id}`)
    revalidatePath('/proyectos')

    return { success: true }
}
