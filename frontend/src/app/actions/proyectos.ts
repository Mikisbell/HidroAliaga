"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ProyectoCreate } from "@/types/models"
import { proyectoUpdateSchema } from "@/lib/schemas"
import { z } from "zod"
import { ActionState } from "./types"

const idSchema = z.string().uuid()

/**
 * Actualiza un proyecto existente.
 * Permite actualizar campos parciales incluyendo settings (JSONB).
 */
export async function updateProject(id: string, data: Partial<ProyectoCreate>): Promise<ActionState> {
    const supabase = await createClient()

    const parseId = idSchema.safeParse(id)
    if (!parseId.success) return { success: false, message: "ID inválido" }

    const parsedData = proyectoUpdateSchema.safeParse(data)
    if (!parsedData.success) {
        return {
            success: false,
            message: "Datos inválidos",
            errors: parsedData.error.flatten().fieldErrors
        }
    }

    const { error } = await supabase
        .from('proyectos')
        .update(parsedData.data)
        .eq('id', id)

    if (error) {
        console.error("Error updating project:", error)
        return { success: false, message: "Error al actualizar el proyecto" }
    }

    revalidatePath(`/proyectos/${id}`)
    revalidatePath('/proyectos')

    return { success: true }
}
