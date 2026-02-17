"use client"

import { useProjectStore } from "@/store/project-store"
import { deleteNudo } from "@/app/actions/nudos"
import { deleteTramo } from "@/app/actions/tramos"
import {
    Plus, Search, Copy, LayoutGrid, Sparkles, Trash2, LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

/**
 * Right-side vertical tool column (n8n style: +, Search, Copy, Layout, AI wand)
 * Adapted for hydraulics: Agregar Nudo, Buscar, Duplicar, Auto-Layout, Copiloto IA, Eliminar
 */
export function EditorSideTools() {
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const removeNudo = useProjectStore(state => state.removeNudo)
    const removeTramo = useProjectStore(state => state.removeTramo)
    const tramos = useProjectStore(state => state.tramos)
    const activeTool = useProjectStore(state => state.activeTool)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const setActiveComponentType = useProjectStore(state => state.setActiveComponentType)

    const handleDelete = async () => {
        if (!selectedElement) return
        const { id, type } = selectedElement

        if (type === 'nudo') {
            const connectedTramos = tramos.filter(
                t => t.nudo_origen_id === id || t.nudo_destino_id === id
            )
            connectedTramos.forEach(t => removeTramo(t.id))
            removeNudo(id)
        } else {
            removeTramo(id)
        }
        setSelectedElement(null)
        toast.info("Eliminando...")

        try {
            if (type === 'nudo') {
                const res = await deleteNudo(id)
                if (!res.success) throw new Error(res.message)
                toast.success('Nudo eliminado')
            } else if (type === 'tramo') {
                const res = await deleteTramo(id)
                if (!res.success) throw new Error(res.message)
                toast.success('Tramo eliminado')
            }
            useProjectStore.getState().setSelectedElement(null)
        } catch (error) {
            console.error("Error al eliminar:", error)
            toast.error(error instanceof Error ? error.message : "Error al eliminar elemento")
        }
    }

    interface ToolItem {
        id: string
        label: string
        icon: LucideIcon
        action: () => void
        className?: string
        disabled?: boolean
        dividerAfter?: boolean
    }

    const tools: ToolItem[] = [
        {
            id: 'add',
            label: 'Agregar Nudo',
            icon: Plus,
            action: () => {
                setActiveTool('node')
                setActiveComponentType('union')
            },
        },
        {
            id: 'search',
            label: 'Buscar Elemento',
            icon: Search,
            action: () => toast.info("Próximamente: Buscar elemento"),
        },
        {
            id: 'duplicate',
            label: 'Duplicar',
            icon: Copy,
            action: () => toast.info("Próximamente: Duplicar elemento"),
        },
        {
            id: 'layout',
            label: 'Auto-Layout',
            icon: LayoutGrid,
            action: () => toast.info("Próximamente: Auto-layout de red"),
            dividerAfter: true,
        },
        {
            id: 'copilot',
            label: 'Copiloto IA',
            icon: Sparkles,
            action: () => toast.info("Próximamente: Copiloto normativo IA"),
            className: "text-purple-400 hover:text-purple-300",
        },
        {
            id: 'delete',
            label: selectedElement
                ? `Eliminar ${selectedElement.type === 'nudo' ? 'Nudo' : 'Tramo'}`
                : 'Eliminar Elemento',
            icon: Trash2,
            action: handleDelete,
            className: selectedElement
                ? "text-red-400 hover:bg-red-900/20"
                : "text-muted-foreground/30 cursor-not-allowed",
            disabled: !selectedElement,
        }
    ]

    return (
        <div className="absolute top-16 right-4 z-[1000] flex flex-col gap-1 p-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/40 shadow-xl">
            <TooltipProvider delayDuration={0}>
                {tools.map((tool) => (
                    <div key={tool.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    aria-label={tool.label}
                                    onClick={tool.action}
                                    disabled={tool.disabled}
                                    className={cn(
                                        "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                                        "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        tool.className
                                    )}
                                >
                                    <tool.icon className="w-4.5 h-4.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <span>{tool.label}</span>
                            </TooltipContent>
                        </Tooltip>
                        {tool.dividerAfter && (
                            <div className="w-full h-px bg-border/40 my-0.5" />
                        )}
                    </div>
                ))}
            </TooltipProvider>
        </div>
    )
}
