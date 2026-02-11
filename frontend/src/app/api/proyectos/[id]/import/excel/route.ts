import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { DIAMETROS_EQUIVALENCIAS } from '@/lib/constants'

// Tipos para mapeo de columnas
interface ColumnMap {
    node?: number
    elevation?: number
    length?: number
    diameter?: number
    flow?: number // Can be Demand or Pipe Flow
    startNode?: number
    endNode?: number
}

// Palabras clave para detectar columnas
const KEYWORDS = {
    node: ['ELEMENTO', 'NUDO', 'NODO', 'PUNTO', 'ESTACION'],
    elevation: ['COTA', 'NIVEL', 'ELEVACION', 'ALTITUD'],
    length: ['LONGITUD', 'LONG', 'L (Km)', 'L (m)', 'DISTANCIA'],
    diameter: ['DIAMETRO', 'DIAM', 'Ø'],
    flow: ['CAUDAL', 'GASTO', 'Q', 'DEMANDA'],
    startNode: ['INICIO', 'DESDE', 'DE'],
    endNode: ['FIN', 'HASTA', 'A']
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: proyectoId } = await params
    const supabase = await createClient()

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })

        let importedNodes = 0
        let importedPipes = 0
        let logs: string[] = []

        // Iterar hojas buscando datos válidos
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName]
            const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            if (data.length < 5) continue

            // 1. Buscar fila de encabezados
            let headerRowIndex = -1
            let colMap: ColumnMap = {}

            for (let i = 0; i < Math.min(data.length, 50); i++) {
                const row = data[i].map(c => String(c).toUpperCase())

                // Verificar si esta fila parece un encabezado
                const map: ColumnMap = {}
                row.forEach((cell, idx) => {
                    if (KEYWORDS.node.some(k => cell.includes(k))) map.node = idx
                    if (KEYWORDS.elevation.some(k => cell.includes(k))) map.elevation = idx
                    if (KEYWORDS.length.some(k => cell.includes(k))) map.length = idx
                    if (KEYWORDS.diameter.some(k => cell.includes(k))) map.diameter = idx
                    if (KEYWORDS.flow.some(k => cell.includes(k))) map.flow = idx
                    // Specific connectivity logic
                    if (KEYWORDS.startNode.some(k => cell === k)) map.startNode = idx
                    if (KEYWORDS.endNode.some(k => cell === k)) map.endNode = idx
                })

                // Criterio mínimo: Debe tener Nudo y (Elevation OR Length)
                if (map.node !== undefined && (map.elevation !== undefined || map.length !== undefined)) {
                    headerRowIndex = i
                    colMap = map
                    logs.push(`Encabezados encontrados en hoja '${sheetName}' fila ${i + 1}`)
                    break
                }
            }

            if (headerRowIndex === -1) continue

            // 2. Leer datos
            const nodesToInsert: any[] = []
            const pipesToInsert: any[] = []

            // Map para tracking de nudos creados (evitar duplicados)
            // Usaremos el Código del nudo como clave
            const existingNodeCodes = new Set<string>()

            // Obtener nudos existentes en DB para no duplicar?
            // Mejor: Borrar todo o merge?
            // Por simplicidad: Asumimos importación LIMPIA o incremental.
            // Si ya existen, skip o update? Skip for now.
            const { data: dbNodes } = await supabase.from('nudos').select('codigo').eq('proyecto_id', proyectoId)
            dbNodes?.forEach(n => existingNodeCodes.add(n.codigo))

            // Detectar unidad de diámetro en encabezado
            // Si la columna de diámetro dice "PULG" o "INCH" -> Inches
            let diameterInInches = false
            if (colMap.diameter !== undefined) {
                const headerCell = String(data[headerRowIndex][colMap.diameter]).toUpperCase()
                if (headerCell.includes('PULG') || headerCell.includes('INCH') || headerCell.includes('"')) {
                    diameterInInches = true
                    logs.push(`Detectado unidades de diámetro: Pulgadas`)
                }
            }

            // Procesar filas de datos
            let prevNodeCode: string | null = null

            for (let i = headerRowIndex + 1; i < data.length; i++) {
                const row = data[i]
                if (!row || row.length === 0) continue

                const nodeCode = colMap.node !== undefined ? String(row[colMap.node] || '').trim() : null
                if (!nodeCode) continue

                // --- Procesar NUDO ---
                let elevation = colMap.elevation !== undefined ? parseFloat(row[colMap.elevation]) : 0
                const demand = colMap.flow !== undefined ? parseFloat(row[colMap.flow]) : 0

                // Si Elevation es NaN, intentar recuperarlo? o 0
                if (isNaN(elevation)) elevation = 0

                if (!existingNodeCodes.has(nodeCode)) {
                    nodesToInsert.push({
                        proyecto_id: proyectoId,
                        codigo: nodeCode,
                        tipo: i === headerRowIndex + 1 ? 'RESERVORIO' : 'NUDO', // Asumir primero es fuente?
                        elevacion: elevation,
                        demanda_base: demand,
                        // Posición: Asignar coordenadas dummy para que aparezcan en mapa
                        // Grid layout simple: X = i * 50, Y = i * 50?
                        latitud: -12.0 + (i * 0.001),
                        longitud: -77.0 + (i * 0.001)
                    })
                    existingNodeCodes.add(nodeCode)
                    importedNodes++
                }

                // --- Procesar TRAMO (Tubería) ---
                // Si tenemos longitud/diámetro, asumimos que este renglón define la tubería QUE LLEGA a este nudo?
                // O la que sale?
                // En planillas de "Verifica Red", usualmente Row N define: Node N, y Tramo N-1 -> N.

                const length = colMap.length !== undefined ? parseFloat(row[colMap.length]) : 0
                let diameter = colMap.diameter !== undefined ? parseFloat(row[colMap.diameter]) : 0

                // Conversión de unidades
                if (diameterInInches || diameter < 10) { // Heurística < 10 si no se detectó explícitamente
                    // Buscar en tabla equivalencias o multiplicar por 25.4
                    // "2" -> 60mm (aprox 2" PVC) o 50.8?
                    // Usemos la tabla de constantes si existe coincidencia exacta
                    const diamStr = String(diameter)
                    if (DIAMETROS_EQUIVALENCIAS[diamStr]) {
                        diameter = DIAMETROS_EQUIVALENCIAS[diamStr]
                    } else {
                        // Si no, conversión directa
                        diameter = diameter * 25.4
                    }
                }

                // Determinar conectividad
                let fromNode = prevNodeCode
                let toNode = nodeCode

                // Si hay columnas explícitas Inicio/Fin
                if (colMap.startNode !== undefined && colMap.endNode !== undefined) {
                    fromNode = String(row[colMap.startNode]).trim()
                    toNode = String(row[colMap.endNode]).trim()
                }

                if (fromNode && toNode && length > 0) {
                    pipesToInsert.push({
                        proyecto_id: proyectoId,
                        codigo: `T-${fromNode}-${toNode}`,
                        nudo_origen_id: null, // Se resolverá despues con DB IDs
                        nudo_destino_id: null,
                        nudo_origen_codigo: fromNode, // Temp prop
                        nudo_destino_codigo: toNode,   // Temp prop
                        longitud: length,
                        diametro_interior: diameter,
                        material: 'PVC', // Default
                        coef_hazen_williams: 150
                    })
                    importedPipes++
                }

                prevNodeCode = nodeCode
            }

            // Insertar Nudos primero
            if (nodesToInsert.length > 0) {
                const { error: errNodes } = await supabase.from('nudos').upsert(nodesToInsert, { onConflict: 'proyecto_id, codigo' })
                if (errNodes) throw new Error(`Error insertando nudos: ${errNodes.message}`)
            }

            // Resolver IDs para tramos
            // Leer todos los nudos del proyecto con sus IDs reales
            const { data: allNodes } = await supabase.from('nudos').select('id, codigo').eq('proyecto_id', proyectoId)
            const nodeMap = new Map<string, string>()
            allNodes?.forEach(n => nodeMap.set(n.codigo, n.id))

            // Preparar tramos finales
            const finalPipes = pipesToInsert.map(p => ({
                proyecto_id: p.proyecto_id,
                codigo: p.codigo,
                nudo_origen_id: nodeMap.get(p.nudo_origen_codigo),
                nudo_destino_id: nodeMap.get(p.nudo_destino_codigo),
                longitud: p.longitud,
                diametro_interior: p.diametro_interior,
                material: p.material,
                coef_hazen_williams: p.coef_hazen_williams
            })).filter(p => p.nudo_origen_id && p.nudo_destino_id)

            if (finalPipes.length > 0) {
                const { error: errPipes } = await supabase.from('tramos').insert(finalPipes)
                if (errPipes) throw new Error(`Error insertando tramos: ${errPipes.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            nodes: importedNodes,
            pipes: importedPipes,
            logs
        })

    } catch (error) {
        console.error("Import error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
    }
}
