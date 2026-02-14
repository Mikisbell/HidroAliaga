"use client"

import { useProjectStore } from "@/store/project-store"
import { Undo2, Redo2, MousePointer2, Plus, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUndoRedo } from "@/hooks/useUndoRedo"

/**
 * N8N-inspired status bar at the bottom of the designer.
 * Shows: node/edge count, active tool, undo/redo buttons, keyboard hint.
 */
export function DesignerStatusBar() {
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const activeTool = useProjectStore(state => state.activeTool)
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const { undo, redo, canUndo, canRedo } = useUndoRedo()

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
        <div className="absolute bottom-0 left-0 right-0 z-[1000] flex items-center justify-between px-3 py-1.5 bg-background/95 backdrop-blur-md border-t border-border/40 text-xs text-muted-foreground select-none">

            {/* Left: Counts */}
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span className="font-semibold text-foreground">{nudos.length}</span> nudos
                </span>
                <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span className="font-semibold text-foreground">{tramos.length}</span> tramos
                </span>
            </div>

            {/* Center: Active tool */}
            <div className="flex items-center gap-2">
                <MousePointer2 className="w-3 h-3" />
                <span className="font-medium">{toolLabel}</span>
            </div>

            {/* Right: Undo/Redo + shortcuts hint */}
            <div className="flex items-center gap-2">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={cn(
                        "p-1 rounded hover:bg-muted transition-colors",
                        !canUndo && "opacity-30 cursor-not-allowed"
                    )}
                    title="Deshacer (Ctrl+Z)"
                >
                    <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={cn(
                        "p-1 rounded hover:bg-muted transition-colors",
                        !canRedo && "opacity-30 cursor-not-allowed"
                    )}
                    title="Rehacer (Ctrl+Y)"
                >
                    <Redo2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground/60 ml-1 hidden sm:inline">
                    R·C·N·T·Esc·F
                </span>
            </div>
        </div>
    )
}
