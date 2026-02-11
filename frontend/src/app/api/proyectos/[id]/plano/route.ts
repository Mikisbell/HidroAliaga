import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: proyectoId } = await params
    const supabase = await createClient()

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
        }

        // 1. Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${proyectoId}-${Date.now()}.${fileExt}`
        const filePath = `${proyectoId}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('planos')
            .upload(filePath, file)

        if (uploadError) {
            throw new Error(`Error subiendo imagen: ${uploadError.message}`)
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('planos')
            .getPublicUrl(filePath)

        // 3. Update Proyecto with new configuration
        // Default bounds: Small square around the first node or center (0,0) if empty
        // We start with a default scale. The user will resize it.
        const defaultBounds = null // Let frontend decide based on map center

        const newConfig = {
            url: publicUrl,
            opacity: 0.5,
            rotation: 0,
            bounds: null // Will be set by frontend on first load
        }

        const { error: updateError } = await supabase
            .from('proyectos')
            .update({ configuracion_plano: newConfig })
            .eq('id', proyectoId)

        if (updateError) {
            throw new Error(`Error actualizando proyecto: ${updateError.message}`)
        }

        return NextResponse.json({
            success: true,
            config: newConfig
        })

    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: proyectoId } = await params
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { configuracion_plano } = body

        if (!configuracion_plano) {
            return NextResponse.json({ error: 'Configuración requerida' }, { status: 400 })
        }

        const { error: updateError } = await supabase
            .from('proyectos')
            .update({ configuracion_plano })
            .eq('id', proyectoId)

        if (updateError) {
            throw new Error(`Error actualizando configuración: ${updateError.message}`)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
    }
}
