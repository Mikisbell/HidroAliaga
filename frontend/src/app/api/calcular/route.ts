/**
 * API Route: Cálculo Hidráulico
 * POST /api/calcular → Ejecuta motor hidráulico para un proyecto
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MotorHidraulico, validarProyecto } from '@/lib/engine'
import type { NudoCalc, TramoCalc } from '@/lib/engine'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const body = await request.json()

    const { proyecto_id, tolerancia = 1e-7, max_iteraciones = 1000 } = body

    if (!proyecto_id) {
        return NextResponse.json({ error: 'proyecto_id es requerido' }, { status: 400 })
    }

    // Obtener proyecto con nudos y tramos
    const { data: proyecto, error: errProyecto } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', proyecto_id)
        .single()

    if (errProyecto || !proyecto) {
        return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    const { data: nudosDB } = await supabase
        .from('nudos')
        .select('*')
        .eq('proyecto_id', proyecto_id)

    const { data: tramosDB } = await supabase
        .from('tramos')
        .select('*')
        .eq('proyecto_id', proyecto_id)

    if (!nudosDB?.length || !tramosDB?.length) {
        return NextResponse.json(
            { error: 'El proyecto necesita al menos 1 nudo y 1 tramo' },
            { status: 400 }
        )
    }

    // Convertir a formato del motor
    const nudosMap = new Map<string, NudoCalc>()
    for (const n of nudosDB) {
        nudosMap.set(n.id, {
            id: n.id,
            codigo: n.codigo,
            tipo: n.tipo || 'union',
            elevacion: n.elevacion || 0,
            demanda: n.demanda_base || 0,
            presion_calc: 0,
            cota_agua: n.elevacion || 0,
        })
    }

    const tramosMap = new Map<string, TramoCalc>()
    for (const t of tramosDB) {
        tramosMap.set(t.id, {
            id: t.id,
            codigo: t.codigo,
            nudo_origen_id: t.nudo_origen_id,
            nudo_destino_id: t.nudo_destino_id,
            longitud: t.longitud || 0,
            diametro: t.diametro_interior || 0,
            material: t.material || 'pvc',
            coef_hazen_williams: t.coef_hazen_williams || 150,
            caudal: 0,
            velocidad: 0,
            perdida_carga: 0,
        })
    }

    // Ejecutar cálculo
    const motor = new MotorHidraulico(nudosMap, tramosMap, tolerancia, max_iteraciones)
    const resultado = motor.calcular()

    // Validar contra normativa
    const validacion = validarProyecto(resultado.nudos, resultado.tramos, proyecto.ambito || 'urbano')

    // Guardar resultado en Supabase
    const { data: calculo, error: errCalculo } = await supabase
        .from('calculos')
        .insert({
            proyecto_id,
            metodo: resultado.tipo_red === 'cerrada' ? 'hardy_cross' : resultado.tipo_red === 'abierta' ? 'balance_masa' : 'hibrido',
            tolerancia,
            max_iteraciones,
            convergencia: resultado.convergencia,
            error_final: resultado.error_final,
            iteraciones_realizadas: resultado.iteraciones_realizadas,
            tiempo_calculo: resultado.tiempo_calculo,
            presion_minima: resultado.presion_minima,
            presion_maxima: resultado.presion_maxima,
            velocidad_minima: resultado.velocidad_minima,
            velocidad_maxima: resultado.velocidad_maxima,
            iteraciones_data: resultado.historial_iteraciones,
            resultados_nudos: resultado.nudos,
            resultados_tramos: resultado.tramos,
            validacion_passed: validacion.valido,
            alertas: validacion.alertas,
        })
        .select()
        .single()

    if (errCalculo) {
        console.error('Error guardando cálculo:', errCalculo)
    }

    // Actualizar presiones y velocidades en nudos/tramos
    for (const nudo of resultado.nudos) {
        await supabase
            .from('nudos')
            .update({ presion_calc: nudo.presion_calc })
            .eq('id', nudo.id)
    }

    for (const tramo of resultado.tramos) {
        await supabase
            .from('tramos')
            .update({
                caudal: tramo.caudal,
                velocidad: tramo.velocidad,
                perdida_carga: tramo.perdida_carga,
            })
            .eq('id', tramo.id)
    }

    return NextResponse.json({
        calculo: calculo || null,
        resultado,
        validacion,
    })
}
