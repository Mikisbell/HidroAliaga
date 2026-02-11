"use client"

import { useProjectStore } from "@/store/project-store"
import { MousePointer2, Circle, Spline, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function MapToolbar() {
    const activeTool = useProjectStore(state => state.activeTool)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const calculateHydraulics = useProjectStore(state => state.calculateHydraulics)
    const isLoading = useProjectStore(state => state.isLoading)

    const tools = [
        {
            id: 'select',
            label: 'Seleccionar',
            icon: MousePointer2,
            shortcut: 'V'
        },
        {
            id: 'node',
            label: 'Añadir Nudo',
            icon: Circle,
            shortcut: 'N'
        },
        {
            id: 'pipe',
            label: 'Dibujar Tubería',
            icon: Spline,
            shortcut: 'P'
        }
    ] as const

    return (
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 p-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/40 shadow-xl ring-1 ring-black/5">
            <TooltipProvider delayDuration={0}>
                {tools.map((tool) => (
                    <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                            <button
                                aria-label={tool.label}
                                onClick={() => setActiveTool(tool.id)}
                                className={cn(
                                    "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center group relative",
                                    activeTool === tool.id
                                        ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <tool.icon className={cn(
                                    "w-5 h-5",
                                    activeTool === tool.id ? "stroke-[2.5px]" : "stroke-2"
                                )} />

                                {activeTool === tool.id && (
                                    <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 dark:ring-white/20" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                            <span>{tool.label}</span>
                            <span className="flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground border border-border/50">
                                {tool.shortcut}
                            </span>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>

            <div className="h-px bg-border/50 my-1" />

            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            aria-label="Calcular Hidráulica"
                            onClick={() => calculateHydraulics()}
                            disabled={isLoading}
                            className={cn(
                                "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                                isLoading && "opacity-50 cursor-not-allowed animate-pulse"
                            )}
                        >
                            <Play className="w-5 h-5 stroke-[2.5px]" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {isLoading ? "Calculando..." : "Calcular Hidráulica"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
