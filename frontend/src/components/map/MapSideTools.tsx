import { useProjectStore } from "@/store/project-store"
import { deleteNudo } from "@/app/actions/nudos"
import { deleteTramo } from "@/app/actions/tramos"
import { MousePointer2, Trash2, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

interface SideTool {
    id: string
    label: string
    icon: LucideIcon
    shortcut: string
    action: () => void
    className?: string
    disabled?: boolean
}

export function MapSideTools() {
    const activeTool = useProjectStore(state => state.activeTool)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore((state) => state.setActiveComponentType)
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const removeNudo = useProjectStore(state => state.removeNudo)
    const removeTramo = useProjectStore(state => state.removeTramo)

    const handleDelete = async () => {
        if (!selectedElement) return

        const { id, type } = selectedElement

        // 1. INSTANT: Remove from store (optimistic)
        if (type === 'nudo') {
            removeNudo(id)
        } else {
            removeTramo(id)
        }
        setSelectedElement(null)
        toast.info("Eliminando...")

        // 2. BACKGROUND: Persist to DB
        try {
            if (type === 'nudo') {
                const res = await deleteNudo(id)
                if (res?.error) throw new Error(res.error)
            } else {
                const res = await deleteTramo(id)
                if (res?.error) throw new Error(res.error)
            }
            toast.success("Elemento eliminado")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al eliminar")
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
        {
            id: 'delete',
            label: selectedElement ? `Borrar ${selectedElement.type === 'nudo' ? 'Nudo' : 'Tramo'}` : 'Borrar Elemento',
            icon: Trash2,
            shortcut: 'Supr',
            action: handleDelete,
            className: selectedElement
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "text-muted-foreground/40 cursor-not-allowed",
            disabled: !selectedElement
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
                                disabled={tool.disabled}
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
