"use client"

import { useState, useEffect } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { useProjectStore } from "@/store/project-store"
import { Nudo, Tramo, Calculo } from "@/types/models"

import { EditorTopBar } from "./EditorTopBar"
import { EditorFooterBar } from "./EditorFooterBar"
import { EditorSideTools } from "./EditorSideTools"
import { EditorSidePanel } from "./EditorSidePanel"
import { EditorNodePalette } from "./EditorNodePalette"
import PropertyInspector from "../designer/inspector/PropertyInspector" // Import path fix
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
    const [activeTab, setActiveTab] = useState("editor")
    const isGridOpen = useProjectStore(state => state.isGridOpen)
    const setGridOpen = useProjectStore(state => state.setGridOpen)

    // Store Actions
    const setElements = useProjectStore(state => state.setElements)
    const setProject = useProjectStore(state => state.setProject)
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore(state => state.setActiveComponentType)
    const addNudo = useProjectStore(state => state.addNudo)
    const removeNudo = useProjectStore(state => state.removeNudo)
    const replaceNudo = useProjectStore(state => state.replaceNudo)

    // Store State
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)

    // Initialize Store
    useEffect(() => {
        if (proyecto.id) {
            setProject(proyecto)
            setElements(serverNudos, serverTramos)
        }
    }, [proyecto.id, serverNudos, serverTramos, setProject, setElements])

    // Tab handler
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        if (tab === "resultados" || tab === "validacion") {
            setSidePanelOpen(true)
        }
    }

    // ========== Handlers ==========
    const handleNodeDragStop = async (id: string, x: number, y: number) => {
        updateNudoCoordinates(id, y / 1000, x / 1000).catch(err => {
            console.error("Failed to save node position:", err)
        })
    }

    const handleAddNode = async (x: number, y: number, tipo?: string) => {
        if (!proyecto.id) return

        const typeToCreate = (tipo || activeComponentType || 'union') as Nudo['tipo']

        const tempId = `temp-${Date.now()}`
        const nudoCount = nudos.length
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
        addNudo(tempNudo, { skipApi: true })
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
        <div className="relative w-full h-screen overflow-hidden bg-background">
            <ReactFlowProvider>
                {/* 1. TOP BAR */}
                <EditorTopBar
                    proyecto={proyecto}
                    nudos={nudos}
                    tramos={tramos}
                    ultimoCalculo={ultimoCalculo}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onToggleSidePanel={() => setSidePanelOpen(prev => !prev)}
                />

                {/* 2. MAIN CANVAS AREA */}
                <div className="absolute inset-0 pt-12 pb-9">
                    <WorkspaceSplitView
                        nudos={nudos}
                        tramos={tramos}
                        onNodeDragStop={handleNodeDragStop}
                        onNodeClick={() => { }} // Inspector handles selection automatically via store
                        onAddNode={handleAddNode}
                    />
                </div>

                {/* 3. LEFT: Node Palette (draggable) */}
                <EditorNodePalette />

                {/* 4. RIGHT: Tools + Inspector + SidePanel */}
                <div className="absolute top-16 right-4 z-[500] flex flex-col gap-4 items-end pointer-events-none">
                    {/* Make tools pointer-events-auto */}
                    <div className="pointer-events-auto">
                        <EditorSideTools />
                    </div>
                </div>

                {/* 5. PROPERTY INSPECTOR (Slide-in on selection) */}
                <PropertyInspector />

                {/* 6. SIDE PANEL (Results/Config) - Collapsible */}
                <EditorSidePanel
                    open={sidePanelOpen}
                    onClose={() => setSidePanelOpen(false)}
                    proyectoId={proyecto.id}
                    initialCost={initialCost}
                    ultimoCalculo={ultimoCalculo}
                />

                {/* 7. VALIDATION PANEL (Floating) */}
                <ValidationPanel />

                {/* 8. FOOTER BAR (Zoom + Stats + Table Toggle) */}
                <EditorFooterBar
                    onToggleTable={() => setGridOpen(!isGridOpen)}
                    isTableOpen={isGridOpen}
                    ultimoCalculo={ultimoCalculo}
                />
            </ReactFlowProvider>
        </div>
    )
}
