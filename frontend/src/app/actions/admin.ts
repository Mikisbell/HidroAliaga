"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Verifica si el usuario actual es admin.
 * Lanza error si no lo es.
 */
async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("No autenticado")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        throw new Error("Acceso denegado: Se requieren permisos de administrador")
    }

    return supabase
}

export async function getSystemStats() {
    try {
        const supabase = await requireAdmin()

        // Ejecutar consultas en paralelo
        const [usersReq, projectsReq] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('proyectos').select('*', { count: 'exact', head: true })
        ])

        return {
            users: usersReq.count || 0,
            projects: projectsReq.count || 0
        }
    } catch (error) {
        console.error("Error getting stats:", error)
        return { users: 0, projects: 0 }
    }
}

export async function getUsers() {
    await requireAdmin()

    // 1. Obtener usuarios de auth.users (requiere Service Role)
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    // 2. Obtener perfiles (roles)
    // Usamos el mismo supabaseAdmin para asegurar consistencia
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')

    if (profileError) throw profileError

    // 3. Fusionar datos
    const richUsers = users.map(user => {
        const profile = profiles.find(p => p.id === user.id)
        return {
            id: user.id,
            email: user.email,
            full_name: profile?.full_name || user.user_metadata?.full_name || "Sin nombre",
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
            role: profile?.role || 'user',
            provider: user.app_metadata?.provider || 'email',
            last_sign_in_at: user.last_sign_in_at,
            created_at: user.created_at
        }
    })

    // Ordenar: primero admins, luego por fecha de creación reciente
    return richUsers.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1
        if (a.role !== 'admin' && b.role === 'admin') return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

export async function updateUserRole(userId: string, newRole: 'user' | 'admin') {
    const supabase = await requireAdmin()

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
}

export async function updateUserProfile(userId: string, data: { full_name: string }) {
    const supabase = await requireAdmin()

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name })
        .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
}

export async function getAllProjects() {
    const supabase = await requireAdmin()

    // Gracias a la política RLS "Admins can do everything", esto devolverá TODOS los proyectos
    const { data: projects, error } = await supabase
        .from('proyectos')
        .select(`
            id, 
            nombre, 
            ubicacion:distrito, 
            created_at, 
            estado,
            usuario_id
        `)
        .order('created_at', { ascending: false })

    if (error) throw error

    return projects
}

export async function deleteUser(userId: string) {
    await requireAdmin()

    // Para eliminar de auth.users necesitamos el SERVICE_ROLE_KEY
    // No podemos usar el cliente normal de cookies.
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
}

export async function deleteProject(projectId: string) {
    const supabase = await requireAdmin()

    const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', projectId)

    if (error) throw error

    revalidatePath('/admin/projects')
    return { success: true }
}
