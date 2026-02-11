"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function generateStressTestProject(nodeCount: number = 500) {
    const supabase = await createClient()

    // 1. Create Project
    const { data: project, error: projectError } = await supabase.from("proyectos").insert({
        nombre: `Stress Test ${new Date().toLocaleTimeString()}`,
        descripcion: `Generated stress test with ${nodeCount} nodes`,
        departamento: "TEST",
        provincia: "TEST",
        distrito: "TEST",
        tipo_red: "abierta", // Or cerrada
        ambito: "urbano",
        configuracion_plano: { zoom: 15, center: [-12.0464, -77.0428] }
    }).select().single()

    if (projectError) throw new Error(`Error creating project: ${projectError.message}`)

    // 2. Generate Nodes in a Grid
    const nodes = []
    const gridSize = Math.ceil(Math.sqrt(nodeCount))
    const startLat = -12.0464
    const startLng = -77.0428
    const step = 0.001 // ~100m

    for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        nodes.push({
            proyecto_id: project.id,
            codigo: `N-${i + 1}`,
            tipo: i === 0 ? "reservorio" : "union",
            latitud: startLat + (row * step),
            longitud: startLng + (col * step),
            cota_terreno: 100 + Math.random() * 50,
            demanda_base: Math.random() * 5,
            elevacion: 100 + Math.random() * 50
        })
    }

    const { error: nodesError } = await supabase.from("nudos").insert(nodes)
    if (nodesError) throw new Error(`Error inserting nodes: ${nodesError.message}`)

    // 3. Generate Pipes (Connect adjacent nodes)
    // Connect (row, col) to (row, col+1) and (row+1, col)
    const pipes = []
    // Need to fetch nodes back to get IDs? Yes, or we can use a trick if we knew IDs ahead of time.
    // Better to fetch them back.
    const { data: createdNodes } = await supabase.from("nudos").select("id, codigo").eq("proyecto_id", project.id).order("codigo")

    if (!createdNodes) throw new Error("Nodes not found after creation")

    // Map by index or coordinate? The order 'N-1', 'N-2'... matches index if sorted by codigo naturally? 
    // Codes are N-1, N-10, N-100... sort might be alphabetical.
    // Let's sort createdNodes by extracting number from code.
    createdNodes.sort((a, b) => {
        const numA = parseInt(a.codigo.split('-')[1])
        const numB = parseInt(b.codigo.split('-')[1])
        return numA - numB
    })

    let pipeCount = 0
    for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize

        // Connect Right
        if (col < gridSize - 1) {
            const nextIndex = i + 1
            if (nextIndex < nodeCount) {
                pipes.push({
                    proyecto_id: project.id,
                    nudo_origen_id: createdNodes[i].id,
                    nudo_destino_id: createdNodes[nextIndex].id,
                    codigo: `T-${++pipeCount}`,
                    longitud: 100, // Approx
                    diametro_interior: 25.4,
                    material: "PVC",
                    rugosidad: 150
                })
            }
        }

        // Connect Down
        if (row < gridSize - 1) {
            const downIndex = i + gridSize
            if (downIndex < nodeCount) {
                pipes.push({
                    proyecto_id: project.id,
                    nudo_origen_id: createdNodes[i].id,
                    nudo_destino_id: createdNodes[downIndex].id,
                    codigo: `T-${++pipeCount}`,
                    longitud: 100, // Approx
                    diametro_interior: 25.4,
                    material: "PVC",
                    rugosidad: 150
                })
            }
        }
    }

    // Insert in chunks to avoid payload limits if needed, but 1000 pipes is fine.
    const { error: pipesError } = await supabase.from("tramos").insert(pipes)
    if (pipesError) throw new Error(`Error inserting pipes: ${pipesError.message}`)

    revalidatePath("/admin")
    return { success: true, projectId: project.id }
}
