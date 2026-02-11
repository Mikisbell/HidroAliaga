/**
 * API Route: Proyectos CRUD
 * GET /api/proyectos → Lista proyectos
 * POST /api/proyectos → Crear proyecto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { proyectoCreateSchema } from '@/lib/schemas'

export async function GET() {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('[GET /api/proyectos] Missing Supabase env vars')
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
        }

        const supabase = await createClient()

        // Get current user for per-user filtering
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('proyectos')
            .select('*')
            .eq('usuario_id', user?.id || '')
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('[GET /api/proyectos] Supabase error:', error)
            return NextResponse.json({ error: error?.message || 'Unknown error', details: error }, { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const stack = err instanceof Error ? err.stack : undefined
        console.error('[GET /api/proyectos] Unexpected error:', message, stack)
        return NextResponse.json(
            { error: 'Internal Server Error', message },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        const parsed = proyectoCreateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', detalles: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado. Debes iniciar sesión.' },
                { status: 401 }
            )
        }

        const projectData = {
            ...parsed.data,
            usuario_id: user.id
        }

        const { data, error } = await supabase
            .from('proyectos')
            .insert(projectData)
            .select()
            .single()

        if (error) {
            console.error('[POST /api/proyectos] Supabase error:', JSON.stringify(error, null, 2))
            return NextResponse.json({ error: error?.message || 'Unknown error', details: error }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        console.error('[POST /api/proyectos] Unexpected error:', err)
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(err) },
            { status: 500 }
        )
    }
}
