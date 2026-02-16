import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { proyectoCreateSchema } from '@/lib/schemas'
import { cookies } from 'next/headers'
import * as fs from 'fs'
import path from 'path'

// Mock user for E2E tests (Default Admin)
const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111'

function logDebug(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'server-debug.log')
        const timestamp = new Date().toISOString()
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`)
    } catch (e) {
        console.error('Failed to write to debug log:', e)
    }
}

export async function GET() {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('[GET /api/proyectos] Missing Supabase env vars')
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
        }

        const supabase = await createClient()

        let userId: string | undefined

        // Bypass auth for E2E tests
        if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
            const cookieStore = await cookies()
            userId = cookieStore.get('e2e-user-id')?.value || MOCK_USER_ID
        } else {
            // Get current user for per-user filtering
            const { data: { user } } = await supabase.auth.getUser()
            userId = user?.id
        }

        // If no authenticated user, return empty list
        if (!userId) {
            return NextResponse.json([])
        }

        const { data, error } = await supabase
            .from('proyectos')
            .select('*')
            .eq('usuario_id', userId)
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

        let userId: string | undefined

        if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
            const cookieStore = await cookies()
            userId = cookieStore.get('e2e-user-id')?.value || MOCK_USER_ID
            logDebug(`[POST /api/proyectos] Bypass active. Using userId: ${userId}`)
        } else {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                logDebug(`[POST /api/proyectos] Auth check failed: ${JSON.stringify(authError)}`)
                return NextResponse.json(
                    { error: 'No autorizado. Debes iniciar sesión.' },
                    { status: 401 }
                )
            }
            userId = user.id
        }

        const projectData = {
            ...parsed.data,
            usuario_id: userId
        }

        logDebug(`[POST /api/proyectos] Creating project for user ${userId}...`)

        const { data, error } = await supabase
            .from('proyectos')
            .insert(projectData)
            .select()
            .single()

        if (error) {
            logDebug(`[POST /api/proyectos] Supabase error: ${JSON.stringify(error, null, 2)}`)
            console.error('[POST /api/proyectos] Supabase error:', JSON.stringify(error, null, 2))
            return NextResponse.json({ error: error?.message || 'Unknown error', details: error }, { status: 500 })
        }

        logDebug(`[POST /api/proyectos] Project created ID: ${data.id}`)

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        console.error('[POST /api/proyectos] Unexpected error:', err)
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(err) },
            { status: 500 }
        )
    }
}
