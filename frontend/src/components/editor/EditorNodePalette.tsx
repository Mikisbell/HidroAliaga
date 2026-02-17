"use client"

import { useState, DragEvent } from "react"
import { useProjectStore } from "@/store/project-store"
import { useHydraulicSimulation } from "@/lib/hydraulics/engine/useHydraulicSimulation"
import { Nudo } from "@/types/models"
import {
    Droplets, Zap, CircleDashed, Spline, Play,
    ChevronLeft, ChevronRight, GripVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Left sidebar node palette — components are draggable onto the canvas.
 * Collapsed: ~52px icon column. Expanded: ~180px with labels.
 */
export function EditorNodePalette() {
    const [expanded, setExpanded] = useState(false)
    const activeTool = useProjectStore(state => state.activeTool)
    const activeComponentType = useProjectStore(state => state.activeComponentType)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore(state => state.setActiveComponentType)

    // Simulation
    const { runSimulation, isCalculating } = useHydraulicSimulation()
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)

    const handleCalculate = async () => {
        const { projectToNetwork } = await import('@/lib/hydraulics/engine/projectAdapter')
        const network = projectToNetwork(nudos, tramos)
        await runSimulation(network)
    }

    const onDragStart = (event: DragEvent, nodeType: Nudo['tipo']) => {
        event.dataTransfer.setData('application/reactflow-nodetype', nodeType)
        event.dataTransfer.effectAllowed = 'move'
        setActiveTool('node')
        setActiveComponentType(nodeType)
    }

    const components = [
        {
            type: 'reservorio' as Nudo['tipo'],
            label: 'Reservorio',
            icon: Droplets,
            shortcut: 'R',
            colors: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            activeColors: 'bg-blue-500/20 border-blue-500/40 ring-1 ring-blue-500/30',
        },
        {
            type: 'camara_rompe_presion' as Nudo['tipo'],
            label: 'C. Rompe Presión',
            icon: Zap,
            shortcut: 'C',
            colors: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            activeColors: 'bg-amber-500/20 border-amber-500/40 ring-1 ring-amber-500/30',
        },
        {
            type: 'union' as Nudo['tipo'],
            label: 'Nudo / Unión',
            icon: CircleDashed,
            shortcut: 'N',
            colors: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            activeColors: 'bg-gray-500/20 border-gray-400/40 ring-1 ring-gray-400/30',
        },
    ]

    const isActive = (type: Nudo['tipo']) =>
        activeTool === 'node' && activeComponentType === type

    return (
        <div
            className={cn(
                "absolute top-12 left-0 bottom-9 z-[500] flex flex-col",
                "bg-background/95 backdrop-blur-md border-r border-border/40",
                "transition-all duration-300 ease-in-out",
                expanded ? "w-[180px]" : "w-[52px]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-border/30">
                {expanded && (
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                        Componentes
                    </span>
                )}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                    {expanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Component Items */}
            <div className="flex-1 flex flex-col gap-1 p-1.5 overflow-y-auto">
                <TooltipProvider delayDuration={0}>
                    {components.map((comp) => (
                        <Tooltip key={comp.type}>
                            <TooltipTrigger asChild>
                                <div
                                    draggable
                                    onDragStart={(e) => onDragStart(e, comp.type)}
                                    onClick={() => {
                                        setActiveTool('node')
                                        setActiveComponentType(comp.type)
                                    }}
                                    className={cn(
                                        "flex items-center gap-2.5 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all duration-200",
                                        expanded ? "px-2.5 py-2" : "p-2 justify-center",
                                        isActive(comp.type) ? comp.activeColors : comp.colors,
                                        !isActive(comp.type) && "hover:scale-[1.02] hover:shadow-sm"
                                    )}
                                >
                                    <comp.icon className="w-5 h-5 shrink-0" />
                                    {expanded && (
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {comp.label}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground">
                                                Tecla: {comp.shortcut}
                                            </span>
                                        </div>
                                    )}
                                    {expanded && (
                                        <GripVertical className="w-3 h-3 text-muted-foreground/30 ml-auto shrink-0" />
                                    )}
                                </div>
                            </TooltipTrigger>
                            {!expanded && (
                                <TooltipContent side="right">
                                    <span className="font-semibold">{comp.label}</span>
                                    <span className="text-muted-foreground ml-1">({comp.shortcut})</span>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    ))}

                    {/* Divider */}
                    <div className="h-px bg-border/30 my-1" />

                    {/* Pipe tool */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => {
                                    setActiveTool('pipe')
                                    setActiveComponentType(null)
                                }}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-lg border transition-all duration-200",
                                    expanded ? "px-2.5 py-2" : "p-2 justify-center",
                                    activeTool === 'pipe'
                                        ? "bg-orange-500/20 border-orange-500/40 ring-1 ring-orange-500/30 text-orange-500"
                                        : "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:scale-[1.02] hover:shadow-sm"
                                )}
                            >
                                <Spline className="w-5 h-5 shrink-0" />
                                {expanded && (
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-medium text-foreground truncate">Tubería</span>
                                        <span className="text-[9px] text-muted-foreground">Conectar nudos</span>
                                    </div>
                                )}
                            </button>
                        </TooltipTrigger>
                        {!expanded && (
                            <TooltipContent side="right">Tubería — Conectar nudos</TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Simulate Button (bottom) */}
            <div className="p-1.5 border-t border-border/30">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={handleCalculate}
                                disabled={isCalculating}
                                className={cn(
                                    "w-full flex items-center gap-2 rounded-lg transition-all duration-200",
                                    expanded ? "px-3 py-2.5" : "p-2.5 justify-center",
                                    "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20",
                                    isCalculating && "opacity-70 animate-pulse cursor-wait"
                                )}
                            >
                                <Play className={cn("w-5 h-5 fill-current shrink-0", isCalculating && "animate-spin")} />
                                {expanded && (
                                    <span className="text-xs font-semibold">
                                        {isCalculating ? "Calculando..." : "Simular Red"}
                                    </span>
                                )}
                            </button>
                        </TooltipTrigger>
                        {!expanded && (
                            <TooltipContent side="right">Simular Red</TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
