"use client"

import dynamic from "next/dynamic"
import { Nudo, Tramo } from "@/types/models"
import { updateNudoCoordinates, createNudo } from "@/app/actions/nudos"
import { createTramo } from "@/app/actions/tramos"
import { useProjectStore } from "@/store/project-store"
import { ReactFlowProvider } from "@xyflow/react"

// Dynamic import of the Workspace (Client Only because of React Flow)
const WorkspaceSplitView = dynamic(() => import("@/components/workspace/WorkspaceSplitView").then(mod => mod.WorkspaceSplitView), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted/10 rounded-xl border border-border/30 animate-pulse">
            <div className="text-center space-y-2">
                <p className="text-4xl animate-bounce">📐</p>
                <p className="text-sm text-muted-foreground">Cargando espacio de trabajo...</p>
            </div>
        </div>
    )
})

interface DesignerWrapperProps {
    nudos: Nudo[]
    tramos: Tramo[]
    proyectoId: string
}

export default function DesignerWrapper({ nudos, tramos, proyectoId }: DesignerWrapperProps) {
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const setActiveTool = useProjectStore(state => state.setActiveTool)

    // When a node is dragged, save its new position (using latitud/longitud as X/Y)
    const handleNodeDragStop = async (id: string, x: number, y: number) => {
        try {
            // We store canvas X/Y in the latitud/longitud fields
            await updateNudoCoordinates(id, y / 1000, x / 1000)
        } catch (error) {
            console.error("Failed to save node position:", error)
        }
    }

    // Creating a new pipe by connecting two nodes
    const handleConnect = async (sourceId: string, targetId: string) => {
        if (!proyectoId) return

        // Zero Map Logic: Ask for Length
        const lengthStr = window.prompt("Longitud Real del Tramo (m):", "100")
        if (lengthStr === null) return // User cancelled

        const length = parseFloat(lengthStr)
        if (isNaN(length) || length <= 0) {
            alert("Por favor ingrese una longitud válida mayor a 0")
            return
        }

        try {
            await createTramo({
                proyecto_id: proyectoId,
                nudo_origen_id: sourceId,
                nudo_destino_id: targetId,
                longitud: length, // Pass manual length
                // Default material/diameter will be handled by backend or defaults
            })
        } catch (error) {
            console.error("Failed to create pipe:", error)
            alert(error instanceof Error ? error.message : "Error al crear el tramo")
        }
    }

    // Adding a new node on canvas click
    const handleAddNode = async (x: number, y: number) => {
        if (!proyectoId) return
        try {
            const typeToCreate = activeComponentType || 'union'
            // Store canvas position as lat/lng (scaled)
            await createNudo(proyectoId, y / 1000, x / 1000, typeToCreate)
            setActiveTool('select')
        } catch (error) {
            console.error("Failed to create node:", error)
            alert("Error al crear el nudo")
        }
    }

    return (
        <div className="relative w-full h-full min-h-[500px]">
            <ReactFlowProvider>
                <WorkspaceSplitView
                    nudos={nudos}
                    tramos={tramos}
                    onNodeDragStop={handleNodeDragStop}
                    onConnect={handleConnect}
                    onNodeClick={() => setActiveTool('select')} // Basic handler, expand as needed
                    onAddNode={handleAddNode}
                />
            </ReactFlowProvider>
        </div>
    )
}
