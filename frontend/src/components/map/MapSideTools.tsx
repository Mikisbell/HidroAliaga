import { useProjectStore } from "@/store/project-store"
import { MousePointer2, LineChart, Trash2, Eraser, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SideTool {
    id: string
    label: string
    icon: LucideIcon
    shortcut: string
    action: () => void
    className?: string
}

export function MapSideTools() {
    const activeTool = useProjectStore(state => state.activeTool)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore((state) => state.setActiveComponentType)
    const selectedElement = useProjectStore(state => state.selectedElement)

    // Placeholder for delete action - will implement logic later or hook into store
    const handleDelete = () => {
        if (selectedElement) {
            if (confirm("¿Estás seguro de eliminar este elemento?")) {
                // TODO: Dispatch delete action
                console.log("Deleting element:", selectedElement)
            }
        } else {
            setActiveTool('select') // Just activate select mode if nothing selected
        }
    }

    const sideTools: SideTool[] = [
        {
            id: 'select',
            label: 'Seleccionar / Mover',
            icon: MousePointer2,
            shortcut: 'Esc',
            action: () => {
                setActiveTool('select')
                setActiveComponentType(null)
            }
        },
        // {
        //     id: 'profile',
        //     label: 'Ver Perfil',
        //     icon: LineChart,
        //     shortcut: 'G',
        //     action: () => {
        //         // Toggle profile mode or just be a button?
        //         // Usually profile is viewed by clicking a node, but maybe a tool to click 2 nodes?
        //         // For now let's keep it simple.
        //     }
        // },
        {
            id: 'delete',
            label: 'Borrar Elemento',
            icon: Trash2,
            shortcut: 'Supr',
            action: handleDelete,
            className: "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        }
    ]

    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 p-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/40 shadow-xl ring-1 ring-black/5">
            <TooltipProvider delayDuration={0}>
                {sideTools.map((tool) => (
                    <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                            <button
                                aria-label={tool.label}
                                onClick={tool.action}
                                className={cn(
                                    "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center group relative",
                                    (activeTool as string) === tool.id
                                        ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    tool.className
                                )}
                            >
                                <tool.icon className={cn(
                                    "w-5 h-5",
                                    activeTool === tool.id ? "stroke-[2.5px]" : "stroke-2"
                                )} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="flex items-center gap-2">
                            <span>{tool.label}</span>
                            <span className="flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground border border-border/50">
                                {tool.shortcut}
                            </span>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    )
}
