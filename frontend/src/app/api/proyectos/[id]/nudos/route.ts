/**
 * API Route: Nudos de un Proyecto
 * GET /api/proyectos/[id]/nudos → Lista nudos
 * POST /api/proyectos/[id]/nudos → Crear nudo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nudoCreateSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('nudos')
        .select('*')
        .eq('proyecto_id', id)
        .order('codigo')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: Params) {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const parsed = nudoCreateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Datos inválidos', detalles: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from('nudos')
        .insert({ ...parsed.data, proyecto_id: id })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
