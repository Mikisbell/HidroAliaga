
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('proyectos')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error(`[GET /api/proyectos/${id}] Error:`, error.message)
            return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error(`[GET /api/proyectos/${id}] Unexpected error:`, err)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
