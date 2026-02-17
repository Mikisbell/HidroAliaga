"use client"

import { useProjectStore } from "@/store/project-store"
import { useReactFlow } from "@xyflow/react"
import { useUndoRedo } from "@/hooks/useUndoRedo"
import {
    Maximize2, ZoomIn, ZoomOut, Undo2, Redo2,
    MousePointer2, Table2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditorFooterBarProps {
    onToggleTable: () => void
    isTableOpen: boolean
}

export function EditorFooterBar({ onToggleTable, isTableOpen }: EditorFooterBarProps) {
    const activeTool = useProjectStore(state => state.activeTool)
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const { undo, redo, canUndo, canRedo } = useUndoRedo()

    let reactFlowInstance: ReturnType<typeof useReactFlow> | null = null
    try {
        reactFlowInstance = useReactFlow()
    } catch { }

    const toolLabel = (() => {
        if (activeTool === 'pipe') return '🔗 Tubería'
        if (activeTool === 'node') {
            switch (activeComponentType) {
                case 'reservorio': return '🏔️ Reservorio'
                case 'camara_rompe_presion': return '◆ CRP'
                default: return '⚬ Nudo'
            }
        }
        return '↖ Seleccionar'
    })()

    return (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] flex items-center justify-between h-9 px-2 bg-background/95 backdrop-blur-md border-t border-border/40 select-none">

            {/* === LEFT: Canvas controls (n8n: fit, zoom+, zoom-, undo, redo) === */}
            <div className="flex items-center gap-0.5">
                <TooltipProvider delayDuration={0}>
                    {/* Fit View */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 300 })}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Ajustar Vista</TooltipContent>
                    </Tooltip>

                    {/* Zoom In */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => reactFlowInstance?.zoomIn({ duration: 200 })}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Acercar</TooltipContent>
                    </Tooltip>

                    {/* Zoom Out */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => reactFlowInstance?.zoomOut({ duration: 200 })}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Alejar</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border/50 mx-1" />

                    {/* Undo */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    canUndo
                                        ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        : "text-muted-foreground/30 cursor-not-allowed"
                                )}
                            >
                                <Undo2 className="w-3.5 h-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Deshacer (Ctrl+Z)</TooltipContent>
                    </Tooltip>

                    {/* Redo */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    canRedo
                                        ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        : "text-muted-foreground/30 cursor-not-allowed"
                                )}
                            >
                                <Redo2 className="w-3.5 h-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Rehacer (Ctrl+Y)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* === CENTER: Active tool + network info (n8n: "Session c40a0... Logs") === */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <MousePointer2 className="w-3 h-3" />
                    <span className="font-medium">{toolLabel}</span>
                </span>
                <span className="text-muted-foreground/40">|</span>
                <span>
                    <span className="font-semibold text-foreground">{nudos.length}</span> nudos
                </span>
                <span>
                    <span className="font-semibold text-foreground">{tramos.length}</span> tramos
                </span>
            </div>

            {/* === RIGHT: Table toggle (n8n: "Open Chat" button) === */}
            <button
                onClick={onToggleTable}
                className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    isTableOpen
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-primary/90 text-primary-foreground hover:bg-primary shadow-md shadow-primary/20"
                )}
            >
                <Table2 className="w-4 h-4" />
                {isTableOpen ? "Cerrar Tabla" : "Tabla de Cálculo"}
            </button>
        </div>
    )
}
