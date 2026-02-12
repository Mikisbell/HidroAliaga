"use client"

import dynamic from "next/dynamic"
import { Nudo, Tramo } from "@/types/models"
import { updateNudoCoordinates, createNudo } from "@/app/actions/nudos"
import { createTramo } from "@/app/actions/tramos"
import { useProjectStore } from "@/store/project-store"
import { ReactFlowProvider } from "@xyflow/react"
import { ValidationPanel } from "./ValidationPanel"
import { toast } from "sonner"

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

export default function DesignerWrapper({ nudos: serverNudos, tramos: serverTramos, proyectoId }: DesignerWrapperProps) {
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

    // Game-loop pattern: Store is the SINGLE source of truth
    // Server props only used as fallback before hydration
    const nudos = storeNudos.length > 0 ? storeNudos : serverNudos
    const tramos = storeTramos.length > 0 ? storeTramos : serverTramos

    // ========== OPTIMISTIC: Node position save (debounced, no blocking) ==========
    const handleNodeDragStop = async (id: string, x: number, y: number) => {
        // Fire and forget — don't block the UI
        updateNudoCoordinates(id, y / 1000, x / 1000).catch(err => {
            console.error("Failed to save node position:", err)
        })
    }

    // ========== OPTIMISTIC: Create pipe ==========
    const handleConnect = async (sourceId: string, targetId: string) => {
        if (!proyectoId) return

        const lengthStr = window.prompt("Longitud Real del Tramo (m):", "100")
        if (lengthStr === null) return
        const length = parseFloat(lengthStr)
        if (isNaN(length) || length <= 0) {
            toast.error("Longitud inválida")
            return
        }

        // 1. INSTANT: Create temporary tramo in store
        const tempId = `temp-tramo-${Date.now()}`
        const tempTramo: Tramo = {
            id: tempId,
            proyecto_id: proyectoId,
            codigo: `T-${storeNudos.length + 1}`,
            nudo_origen_id: sourceId,
            nudo_destino_id: targetId,
            longitud: length,
            material: 'pvc',
            diametro_comercial: 0.75,
            diametro_interior: 0,
            coef_hazen_williams: 150,
            clase_tuberia: 'CL-10',
        } as Tramo
        addTramo(tempTramo)

        // 2. BACKGROUND: Persist to DB
        try {
            await createTramo({
                proyecto_id: proyectoId,
                nudo_origen_id: sourceId,
                nudo_destino_id: targetId,
                longitud: length,
            })
            toast.success("Tramo creado")
        } catch (error) {
            // Rollback on failure
            removeTramo(tempId)
            toast.error(error instanceof Error ? error.message : "Error al crear tramo")
        }
    }

    // ========== OPTIMISTIC: Create node (drag & drop OR click) ==========
    const handleAddNode = async (x: number, y: number, tipo?: string) => {
        if (!proyectoId) return

        const typeToCreate = (tipo || activeComponentType || 'union') as Nudo['tipo']

        // 1. INSTANT: Create temporary node in store (appears immediately on canvas)
        const tempId = `temp-${Date.now()}`
        const nudoCount = storeNudos.length
        const tempNudo: Nudo = {
            id: tempId,
            proyecto_id: proyectoId,
            codigo: `N-${nudoCount + 1}`,
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

        // 2. BACKGROUND: Persist to DB (user doesn't wait for this)
        try {
            const result = await createNudo(proyectoId, y / 1000, x / 1000, typeToCreate)
            if (result.nudo) {
                // Replace temp node with real DB node (has real UUID)
                replaceNudo(tempId, result.nudo as Nudo)
            }
        } catch (error) {
            // Rollback: remove the optimistic node
            removeNudo(tempId)
            toast.error(error instanceof Error ? error.message : "Error al crear nudo")
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
                    onNodeClick={() => { }} // Selection handled by NetworkDesigner via store
                    onAddNode={handleAddNode}
                />
                {/* Property Inspector integrated in Side Panel */}
                {/* The Referee - Validation Panel INSIDE Provider for Zoom capabilities */}
                <ValidationPanel />
            </ReactFlowProvider>
        </div>
    )
}
