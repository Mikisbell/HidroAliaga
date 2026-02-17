'use server'

import { createClient } from '@/lib/supabase/server'
import { PatronDemanda, PatronDemandaCreate } from '@/types/models'
import { revalidatePath } from 'next/cache'

export async function createPattern(patron: PatronDemanda): Promise<{ success: boolean; data?: PatronDemanda; error?: string }> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...createData } = patron;

    const { data, error } = await supabase
        .from('patrones_demanda')
        .insert(createData)
        .select()
        .single()

    if (error) {
        console.error('Error creating pattern:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/proyectos/[id]', 'layout')
    return { success: true, data }
}

export async function updatePattern(id: string, patron: Partial<PatronDemanda>): Promise<{ success: boolean; data?: PatronDemanda; error?: string }> {
    const supabase = await createClient()

    // Remove immutable fields if present
    const { id: _, created_at, updated_at, ...updateData } = patron;

    const { data, error } = await supabase
        .from('patrones_demanda')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating pattern:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/proyectos/[id]', 'layout')
    return { success: true, data }
}

export async function deletePattern(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('patrones_demanda')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting pattern:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/proyectos/[id]', 'layout')
    return { success: true }
}

export async function getPatterns(projectId: string): Promise<{ success: boolean; data?: PatronDemanda[]; error?: string }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('patrones_demanda')
        .select('*')
        .eq('proyecto_id', projectId)
        .order('nombre', { ascending: true })

    if (error) {
        console.error('Error fetching patterns:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}
