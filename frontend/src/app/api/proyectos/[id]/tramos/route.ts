/**
 * API Route: Tramos de un Proyecto
 * GET /api/proyectos/[id]/tramos → Lista tramos
 * POST /api/proyectos/[id]/tramos → Crear tramo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tramoCreateSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tramos')
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

    const parsed = tramoCreateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Datos inválidos', detalles: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from('tramos')
        .insert({ ...parsed.data, proyecto_id: id })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
