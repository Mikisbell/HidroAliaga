"use client"

import { useCallback } from "react"
import { Tramo } from "@/types/models"
import { updateTramo, deleteTramo } from "@/app/actions/tramos" // Correct alias
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { Trash2 } from "lucide-react"

interface TramosBottomPanelProps {
    tramos: Tramo[]
}

export function TramosBottomPanel({ tramos }: TramosBottomPanelProps) {
    const router = useRouter()
    const updateTramoStore = useProjectStore(state => state.updateTramo)
    const removeTramoStore = useProjectStore(state => state.removeTramo)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const selectedElement = useProjectStore(state => state.selectedElement)

    const handleTramoUpdate = useCallback(async (id: string, field: string, value: any) => {
        let numValue = value
        if (field === 'longitud' || field === 'diametro_comercial' || field === 'diametro_interior') {
            numValue = parseFloat(value) || 0
        }

        // Optimistic UI update in store
        // @ts-ignore
        updateTramoStore?.({ id, [field]: numValue })

        const res = await updateTramo({ id, [field]: numValue })
        if (res.error) {
            toast.error(res.error)
        } else {
            router.refresh()
        }
    }, [router, updateTramoStore])

    const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("¿Estás seguro de eliminar este tramo?")) return

        removeTramoStore(id)
        toast.info("Eliminando tramo...")

        const res = await deleteTramo(id)
        if (res.error) {
            toast.error(res.error)
            router.refresh()
        } else {
            toast.success("Tramo eliminado")
            router.refresh()
        }
    }, [removeTramoStore, router])

    return (
        <div className="h-full flex flex-col bg-background/50 border-t border-border/40 w-full">
            <div className="p-2 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Editor de Tramos ({tramos.length})</h3>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-muted/10 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                        <tr>
                            <HeaderCell>Código</HeaderCell>
                            <HeaderCell align="text-right">Long (m)</HeaderCell>
                            <HeaderCell align="text-right">Ø (mm)</HeaderCell>
                            <HeaderCell>Mat.</HeaderCell>
                            <HeaderCell align="text-right">Q (L/s)</HeaderCell>
                            <HeaderCell align="text-right">Vel (m/s)</HeaderCell>
                            <HeaderCell w="w-8"></HeaderCell>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                        {tramos.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-muted-foreground italic">Sin tramos</td></tr>
                        ) : (
                            tramos.map((t) => (
                                <tr
                                    key={t.id}
                                    className={cn(
                                        "hover:bg-muted/10 cursor-pointer transition-colors group",
                                        selectedElement?.id === t.id && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                    onClick={() => setSelectedElement({ id: t.id, type: 'tramo' })}
                                >
                                    <Cell bold>{t.codigo}</Cell>
                                    <EditableCell
                                        value={t.longitud}
                                        onChange={(v: string) => handleTramoUpdate(t.id, 'longitud', v)}
                                        align="text-right"
                                        type="number"
                                    />
                                    <EditableCell
                                        value={t.diametro_interior}
                                        onChange={(v: string) => handleTramoUpdate(t.id, 'diametro_interior', v)}
                                        align="text-right"
                                        type="number"
                                    />
                                    <EditableCell
                                        value={t.material}
                                        onChange={(v: string) => handleTramoUpdate(t.id, 'material', v)}
                                        uppercase
                                    />
                                    <Cell align="text-right" className="text-orange-600 dark:text-orange-400 font-mono bg-orange-50/5">
                                        {t.caudal?.toFixed(3)}
                                    </Cell>
                                    <Cell align="text-right" className="text-emerald-600 dark:text-emerald-400 font-mono">
                                        {t.velocidad?.toFixed(2)}
                                    </Cell>
                                    <td className="p-0 w-8 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(e, t.id)}
                                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                                            title="Eliminar tramo"
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

// Reuse helpers - in a real app, these should be shared in UI components
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

const EditableCell = ({ value, onChange, align, type = "text", uppercase }: any) => {
    return (
        <td className="p-0 border-r border-border/10 last:border-r-0 h-8">
            <input
                className={cn(
                    "w-full h-full bg-transparent px-2 outline-none focus:bg-primary/10 transition-colors placeholder:text-muted-foreground/20 font-mono text-[11px]",
                    align,
                    uppercase && "uppercase"
                )}
                defaultValue={value}
                type={type}
                onBlur={(e) => {
                    const newVal = e.target.value
                    if (newVal !== String(value)) {
                        onChange(newVal)
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                }}
                onClick={(e) => e.stopPropagation()}
            />
        </td>
    )
}
