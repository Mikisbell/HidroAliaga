
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    try {
        // Fetch nudos
        const { data: nudos, error: nudosError } = await supabase
            .from('nudos')
            .select('*')
            .eq('proyecto_id', id)
            .order('codigo')

        if (nudosError) throw nudosError

        // Fetch tramos
        const { data: tramos, error: tramosError } = await supabase
            .from('tramos')
            .select('*')
            .eq('proyecto_id', id)
            .order('codigo')

        if (tramosError) throw tramosError

        return NextResponse.json({
            nudos: nudos || [],
            tramos: tramos || []
        })

    } catch (err) {
        console.error(`[GET /api/proyectos/${id}/elements] Error:`, err)
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(err) },
            { status: 500 }
        )
    }
}
