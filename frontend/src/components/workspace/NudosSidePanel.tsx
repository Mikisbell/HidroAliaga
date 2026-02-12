"use client"

import { useState, useCallback } from "react"
import { Nudo, Tramo } from "@/types/models"
import { updateNudo, deleteNudo } from "@/app/actions/nudos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useProjectStore } from "@/store/project-store"
import { Trash2, ArrowLeft, Settings2 } from "lucide-react"

// Inspector Forms
import NodePropertiesForm from "@/components/designer/inspector/NodePropertiesForm"
import PipePropertiesForm from "@/components/designer/inspector/PipePropertiesForm"

interface RightPanelProps {
    nudos: Nudo[]
    tramos: Tramo[]
}

export function RightPanel({ nudos, tramos }: RightPanelProps) {
    const router = useRouter()
    const {
        selectedElement,
        setSelectedElement,
        removeNudo: removeNudoStore
    } = useProjectStore()

    const handleNudoUpdate = useCallback(async (id: string, field: string, value: any) => {
        let numValue = value
        if (field === 'cota_terreno' || field === 'numero_viviendas') {
            numValue = parseFloat(value) || 0
        }

        try {
            await updateNudo(id, { [field]: numValue })
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al actualizar nudo")
        }
    }, [router])

    const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
        e.stopPropagation() // Prevent row selection
        if (!confirm("¿Estás seguro de eliminar este nudo?")) return

        // Optimistic Update
        removeNudoStore(id)
        toast.info("Eliminando nudo...")

        const res = await deleteNudo(id)
        if (res.error) {
            toast.error(res.error)
            router.refresh() // Rollback (fetch real state)
        } else {
            toast.success("Nudo eliminado")
            router.refresh()
        }
    }, [removeNudoStore, router])

    // --- RENDER INSPECTOR MODE ---
    if (selectedElement) {
        let title = "Propiedades"
        let content = null

        if (selectedElement.type === 'nudo') {
            const data = nudos.find(n => n.id === selectedElement.id)
            if (data) {
                title = `Nudo ${data.codigo}`
                content = <NodePropertiesForm nudo={data} />
            }
        } else if (selectedElement.type === 'tramo') {
            const data = tramos.find(t => t.id === selectedElement.id)
            if (data) {
                title = `Tramo ${data.codigo || 'Tubería'}`
                content = <PipePropertiesForm tramo={data} />
            }
        }

        if (content) {
            return (
                <div className="h-full flex flex-col bg-background/50 border-l border-border/40 w-[350px]">
                    <div className="p-2 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                        <button
                            onClick={() => setSelectedElement(null)}
                            className="p-1 hover:bg-muted rounded-md transition-colors"
                            title="Volver a la lista"
                        >
                            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                            <Settings2 className="w-3 h-3" />
                            {title}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {content}
                    </div>
                </div>
            )
        }
        // Fallback if data not found (e.g. deleted), go back to list
        setSelectedElement(null)
    }

    // --- RENDER LIST MODE (Default) ---
    return (
        <div className="h-full flex flex-col bg-background/50 border-l border-border/40 w-[350px]">
            <div className="p-2 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nudos ({nudos.length})</h3>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-muted/10 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                        <tr>
                            <HeaderCell>Código</HeaderCell>
                            <HeaderCell align="text-right">Cota (Z)</HeaderCell>
                            <HeaderCell align="text-right">Viv.</HeaderCell>
                            <HeaderCell align="text-right">P (mca)</HeaderCell>
                            <HeaderCell w="w-8"></HeaderCell>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                        {nudos.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-muted-foreground italic">Sin nudos</td></tr>
                        ) : (
                            nudos.map((n) => (
                                <tr
                                    key={n.id}
                                    className={cn(
                                        "hover:bg-muted/10 cursor-pointer transition-colors group"
                                    )}
                                    onClick={() => setSelectedElement({ id: n.id, type: 'nudo' })}
                                >
                                    <Cell bold>{n.codigo}</Cell>
                                    <EditableCell
                                        value={n.cota_terreno}
                                        onChange={(v: string) => handleNudoUpdate(n.id, 'cota_terreno', v)}
                                        align="text-right"
                                        type="number"
                                    />
                                    <EditableCell
                                        value={n.numero_viviendas}
                                        onChange={(v: string) => handleNudoUpdate(n.id, 'numero_viviendas', v)}
                                        align="text-right"
                                        type="number"
                                        min={0}
                                        step={1}
                                    />
                                    <Cell align="text-right" className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                        {n.presion_calc?.toFixed(2)}
                                    </Cell>
                                    <td className="p-0 w-8 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(e, n.id)}
                                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                                            title="Eliminar nudo"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// --- Helpers ---

const HeaderCell = ({ children, align, w }: { children?: React.ReactNode, align?: string, w?: string }) => (
    <th className={cn("px-2 py-1.5 font-medium text-muted-foreground border-b border-r border-border/20 last:border-r-0 select-none", align, w)}>
        {children}
    </th>
)

const Cell = ({ children, align, className, bold }: any) => (
    <td className={cn(
        "px-2 py-0 border-r border-border/10 last:border-r-0 h-8 overflow-hidden text-ellipsis whitespace-nowrap",
        bold && "font-semibold text-foreground",
        align,
        className
    )}>
        {children}
    </td>
)

const EditableCell = ({ value, onChange, align, type = "text", min, step }: any) => {
    return (
        <td className="p-0 border-r border-border/10 last:border-r-0 h-8">
            <input
                className={cn(
                    "w-full h-full bg-transparent px-2 outline-none focus:bg-primary/10 transition-colors placeholder:text-muted-foreground/20 font-mono text-[11px]",
                    align
                )}
                defaultValue={value}
                type={type}
                min={min}
                step={step}
                onBlur={(e) => {
                    const newVal = e.target.value
                    if (newVal !== String(value)) {
                        onChange(newVal)
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                }}
                onClick={(e) => e.stopPropagation()} // Prevent row selection when clicking input
            />
        </td>
    )
}
