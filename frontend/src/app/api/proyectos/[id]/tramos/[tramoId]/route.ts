/**
 * API Route: Tramo Individual
 * GET /api/proyectos/[id]/tramos/[tramoId] → Obtener tramo
 * PUT /api/proyectos/[id]/tramos/[tramoId] → Actualizar tramo
 * DELETE /api/proyectos/[id]/tramos/[tramoId] → Eliminar tramo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tramoUpdateSchema } from '@/lib/schemas'

type Params = { params: Promise<{ id: string; tramoId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
    const { id, tramoId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tramos')
        .select('*')
        .eq('proyecto_id', id)
        .eq('id', tramoId)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 })
    }

    return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: Params) {
    const { id, tramoId } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Validate body
    const parsed = tramoUpdateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Datos inválidos', detalles: parsed.error.flatten() },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from('tramos')
        .update(parsed.data)
        .eq('proyecto_id', id)
        .eq('id', tramoId)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const { id, tramoId } = await params
    const supabase = await createClient()

    const { error } = await supabase
        .from('tramos')
        .delete()
        .eq('proyecto_id', id)
        .eq('id', tramoId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
}
