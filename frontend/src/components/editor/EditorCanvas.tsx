"use client"

import { useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { useProjectStore } from "@/store/project-store"
import { Nudo, Tramo, Calculo } from "@/types/models"

import { EditorTopBar } from "./EditorTopBar"
import { EditorStatsBar } from "./EditorStatsBar"
import { EditorSidePanel } from "./EditorSidePanel"
import { ValidationPanel } from "@/components/designer/ValidationPanel"

import dynamic from "next/dynamic"
import { updateNudoCoordinates, createNudo } from "@/app/actions/nudos"
import { createTramo } from "@/app/actions/tramos"
import { getCodigoPrefix } from "@/lib/nudo-codes"
import { toast } from "sonner"

// Dynamic import (client-only, no SSR for ReactFlow)
const WorkspaceSplitView = dynamic(
    () => import("@/components/workspace/WorkspaceSplitView").then(mod => mod.WorkspaceSplitView),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-background animate-pulse">
                <div className="text-center space-y-2">
                    <p className="text-4xl animate-bounce">📐</p>
                    <p className="text-sm text-muted-foreground">Cargando editor...</p>
                </div>
            </div>
        )
    }
)

interface EditorCanvasProps {
    proyecto: any
    nudos: Nudo[]
    tramos: Tramo[]
    ultimoCalculo?: Calculo
    initialCost: number
}

export function EditorCanvas({
    proyecto,
    nudos: serverNudos,
    tramos: serverTramos,
    ultimoCalculo,
    initialCost
}: EditorCanvasProps) {
    const [sidePanelOpen, setSidePanelOpen] = useState(false)

    // Store state
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore(state => state.setActiveComponentType)
    const addNudo = useProjectStore(state => state.addNudo)
    const removeNudo = useProjectStore(state => state.removeNudo)
    const replaceNudo = useProjectStore(state => state.replaceNudo)
    const addTramo = useProjectStore(state => state.addTramo)
    const removeTramo = useProjectStore(state => state.removeTramo)
    const storeNudos = useProjectStore(state => state.nudos)
    const storeTramos = useProjectStore(state => state.tramos)

    const nudos = storeNudos.length > 0 ? storeNudos : serverNudos
    const tramos = storeTramos.length > 0 ? storeTramos : serverTramos

    // ========== Handlers (same logic as DesignerWrapper) ==========
    const handleNodeDragStop = async (id: string, x: number, y: number) => {
        updateNudoCoordinates(id, y / 1000, x / 1000).catch(err => {
            console.error("Failed to save node position:", err)
        })
    }

    const handleConnect = async (sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) => {
        if (!proyecto.id) return

        const lengthStr = window.prompt("Longitud Real del Tramo (m):", "100")
        if (lengthStr === null) return
        const length = parseFloat(lengthStr)
        if (isNaN(length) || length <= 0) {
            toast.error("Longitud inválida")
            return
        }

        const tempId = `temp-tramo-${Date.now()}`
        const tempTramo: Tramo = {
            id: tempId,
            proyecto_id: proyecto.id,
            codigo: `T-${storeNudos.length + 1}`,
            nudo_origen_id: sourceId,
            nudo_destino_id: targetId,
            source_handle: sourceHandle || undefined,
            target_handle: targetHandle || undefined,
            longitud: length,
            material: 'pvc',
            diametro_comercial: 0.75,
            diametro_interior: 0,
            coef_hazen_williams: 150,
            clase_tuberia: 'CL-10',
        } as Tramo
        addTramo(tempTramo)

        try {
            const result = await createTramo({
                proyecto_id: proyecto.id,
                nudo_origen_id: sourceId,
                nudo_destino_id: targetId,
                source_handle: sourceHandle || undefined,
                target_handle: targetHandle || undefined,
                longitud: length,
            })
            if (!result.success) throw new Error(result.message)
            toast.success("Tramo creado")
        } catch (error) {
            removeTramo(tempId)
            toast.error(error instanceof Error ? error.message : "Error al crear tramo")
        }
    }

    const handleAddNode = async (x: number, y: number, tipo?: string) => {
        if (!proyecto.id) return

        const typeToCreate = (tipo || activeComponentType || 'union') as Nudo['tipo']

        const tempId = `temp-${Date.now()}`
        const nudoCount = storeNudos.length
        const tempNudo: Nudo = {
            id: tempId,
            proyecto_id: proyecto.id,
            codigo: `${getCodigoPrefix(typeToCreate)}${nudoCount + 1}`,
            tipo: typeToCreate,
            latitud: y / 1000,
            longitud: x / 1000,
            cota_terreno: 0,
            demanda_base: 0,
            elevacion: 0,
            numero_viviendas: 0,
            altura_agua: 0,
        } as Nudo
        addNudo(tempNudo)
        setActiveTool('select')
        setActiveComponentType(null)

        try {
            const result = await createNudo(proyecto.id, y / 1000, x / 1000, typeToCreate)
            if (result.success && result.data?.nudo) {
                replaceNudo(tempId, result.data.nudo)
            } else {
                throw new Error(result.message || "Error creating node")
            }
        } catch (error) {
            removeNudo(tempId)
            toast.error(error instanceof Error ? error.message : "Error al crear nudo")
        }
    }

    return (
        <div className="relative w-full h-[calc(100vh-0px)] overflow-hidden">
            <ReactFlowProvider>
                {/* ===== TOP BAR OVERLAY ===== */}
                <EditorTopBar
                    proyecto={proyecto}
                    nudos={nudos}
                    tramos={tramos}
                    ultimoCalculo={ultimoCalculo}
                    onToggleSidePanel={() => setSidePanelOpen(prev => !prev)}
                />

                {/* ===== FULL-VIEWPORT CANVAS ===== */}
                <div className="absolute inset-0 pt-12">
                    <WorkspaceSplitView
                        nudos={nudos}
                        tramos={tramos}
                        onNodeDragStop={handleNodeDragStop}
                        onConnect={handleConnect}
                        onNodeClick={() => { }}
                        onAddNode={handleAddNode}
                    />
                </div>

                {/* ===== FLOATING STATS ===== */}
                <EditorStatsBar ultimoCalculo={ultimoCalculo} />

                {/* ===== VALIDATION PANEL ===== */}
                <ValidationPanel />

                {/* ===== COLLAPSIBLE SIDE PANEL ===== */}
                <EditorSidePanel
                    open={sidePanelOpen}
                    onClose={() => setSidePanelOpen(false)}
                    proyectoId={proyecto.id}
                    initialCost={initialCost}
                    ultimoCalculo={ultimoCalculo}
                />
            </ReactFlowProvider>
        </div>
    )
}
