/**
 * API Route: Nudo Individual
 * GET /api/proyectos/[id]/nudos/[nudoId] → Obtener nudo
 * PUT /api/proyectos/[id]/nudos/[nudoId] → Actualizar nudo
 * DELETE /api/proyectos/[id]/nudos/[nudoId] → Eliminar nudo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nudoUpdateSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string; nudoId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
    const { id, nudoId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('nudos')
        .select('*')
        .eq('proyecto_id', id)
        .eq('id', nudoId)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 })
    }

    return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: Params) {
    const { id, nudoId } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Validate body
    const parsed = nudoUpdateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Datos inválidos', detalles: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from('nudos')
        .update(parsed.data)
        .eq('proyecto_id', id)
        .eq('id', nudoId)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const { id, nudoId } = await params
    const supabase = await createClient()

    const { error } = await supabase
        .from('nudos')
        .delete()
        .eq('proyecto_id', id)
        .eq('id', nudoId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
}
