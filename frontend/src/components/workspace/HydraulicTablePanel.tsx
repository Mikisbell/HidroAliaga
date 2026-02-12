"use client"

import { useCallback, useMemo } from "react"
import { Nudo, Tramo } from "@/types/models"
import { updateNudo } from "@/app/actions/nudos"
import { updateTramoAction, deleteTramo } from "@/app/actions/tramos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { Trash2, Droplets } from "lucide-react"

/**
 * Unified Hydraulic Table — reads directly from Zustand store
 * so it updates in REAL TIME when nodes/pipes are added/removed.
 */
export function HydraulicTablePanel() {
    const router = useRouter()
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const removeTramoStore = useProjectStore(state => state.removeTramo)
    const updateNudoStore = useProjectStore(state => state.updateNudo)
    const updateTramoStore = useProjectStore(state => state.updateTramo)

    // --- Derived Data (Joins) ---
    const rows = useMemo(() => {
        return tramos.map(t => {
            const startNode = nudos.find(n => n.id === t.nudo_origen_id)
            const endNode = nudos.find(n => n.id === t.nudo_destino_id)

            // Calculated fields
            const cotaInicio = startNode?.cota_terreno ?? 0
            const cotaFin = endNode?.cota_terreno ?? 0
            const longitud = t.longitud ?? 0
            const desnivel = cotaInicio - cotaFin
            const pendiente = longitud > 0 ? (desnivel / longitud) * 1000 : 0 // m/km

            return {
                tramo: t,
                startNode,
                endNode,
                cotaInicio,
                cotaFin,
                longitud,
                pendiente,
            }
        })
    }, [tramos, nudos])

    // --- Actions ---
    const handleTramoUpdate = useCallback(async (id: string, field: string, value: any) => {
        const numValue = parseFloat(value) || 0
        updateTramoStore({ id, [field]: numValue } as any)
        try {
            await updateTramoAction({ id, [field]: numValue })
        } catch {
            toast.error("Error al actualizar tramo")
            router.refresh()
        }
    }, [router, updateTramoStore])

    const handleNodeUpdate = useCallback(async (id: string, field: string, value: any) => {
        if (!id) return
        const numValue = parseFloat(value) || 0
        updateNudoStore({ id, [field]: numValue } as any)
        try {
            await updateNudo(id, { [field]: numValue })
        } catch {
            toast.error("Error al actualizar nudo")
            router.refresh()
        }
    }, [router, updateNudoStore])

    const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("¿Eliminar este tramo?")) return
        removeTramoStore(id)
        toast.info("Eliminando tramo...")
        const res = await deleteTramo(id)
        if (res.error) {
            toast.error(res.error)
            router.refresh()
        } else {
            toast.success("Tramo eliminado")
        }
    }, [removeTramoStore, router])

    const handleRowClick = useCallback((id: string) => {
        // Just highlight — no panel switch, no navigation
        setSelectedElement(
            selectedElement?.id === id ? null : { id, type: 'tramo' }
        )
    }, [selectedElement, setSelectedElement])


    return (
        <div className="h-full flex flex-col bg-background border-t border-border/40">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-muted/20 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Tabla Hidráulica — {tramos.length} tramos · {nudos.length} nudos
                    </h3>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                    <thead className="bg-muted/10 sticky top-0 z-10 backdrop-blur-sm shadow-sm ring-1 ring-border/10">
                        <tr>
                            <HeaderGroup colSpan={2} title="CONEXIONES" color="text-blue-500" />
                            <HeaderGroup colSpan={2} title="COTAS (m.s.n.m)" color="text-amber-600" />
                            <HeaderGroup colSpan={3} title="DEMANDA" color="text-purple-500" />
                            <HeaderGroup colSpan={5} title="GEOMETRÍA TRAMO" color="text-emerald-600" />
                            <HeaderGroup colSpan={5} title="RESULTADOS" color="text-sky-600" />
                            <th className="p-0 w-8 bg-muted/10 sticky top-0 border-b border-border/20"></th>
                        </tr>
                        <tr className="[&_th]:font-normal [&_th]:text-muted-foreground [&_th]:border-b [&_th]:border-r [&_th]:border-border/20 [&_th]:py-1 [&_th]:px-2">
                            <th className="w-20">TRAMO-I</th>
                            <th className="w-20">TRAMO-F</th>
                            <th className="w-20 text-right">Inicio</th>
                            <th className="w-20 text-right">Fin</th>
                            <th className="w-16 text-right">Viv.</th>
                            <th className="w-20 text-right">Qu (L/s)</th>
                            <th className="w-20 text-right bg-purple-500/5 font-semibold text-purple-700 dark:text-purple-400">Q Diseño</th>
                            <th className="w-20 text-right">Long (m)</th>
                            <th className="w-20 text-right">S (m/km)</th>
                            <th className="w-16 text-right">Ø Real</th>
                            <th className="w-20 text-right">Ø Com (in)</th>
                            <th className="w-16 text-right">Clase</th>
                            <th className="w-20 text-right">Vel (m/s)</th>
                            <th className="w-20 text-right">Hf (m)</th>
                            <th className="w-20 text-right">P. Inicio</th>
                            <th className="w-20 text-right">P. Final</th>
                            <th className="w-8 sticky right-0 bg-background border-l border-border/20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={17} className="p-8 text-center text-muted-foreground italic bg-muted/5">
                                    No hay tramos. Conecta nudos en el mapa para crear tramos.
                                </td>
                            </tr>
                        ) : (
                            rows.map(({ tramo: t, startNode, endNode, cotaInicio, cotaFin, longitud, pendiente }) => (
                                <tr
                                    key={t.id}
                                    className={cn(
                                        "hover:bg-blue-500/5 cursor-pointer transition-colors group",
                                        selectedElement?.id === t.id && "bg-blue-500/10 ring-1 ring-inset ring-blue-500/20"
                                    )}
                                    onClick={() => handleRowClick(t.id)}
                                >
                                    {/* CONEXIONES */}
                                    <Cell className="font-semibold text-blue-600 dark:text-blue-400">{startNode?.codigo || '?'}</Cell>
                                    <Cell className="font-semibold text-blue-600 dark:text-blue-400">{endNode?.codigo || '?'}</Cell>

                                    {/* COTAS (Editable → updates Node) */}
                                    <EditableCell
                                        value={cotaInicio}
                                        onChange={(v) => startNode && handleNodeUpdate(startNode.id, 'cota_terreno', v)}
                                    />
                                    <EditableCell
                                        value={cotaFin}
                                        onChange={(v) => endNode && handleNodeUpdate(endNode.id, 'cota_terreno', v)}
                                    />

                                    {/* DEMANDA */}
                                    <EditableCell
                                        value={startNode?.numero_viviendas ?? 0}
                                        onChange={(v) => startNode && handleNodeUpdate(startNode.id, 'numero_viviendas', v)}
                                    />
                                    <Cell className="text-right">{(startNode?.demanda_base ?? 0).toFixed(3)}</Cell>
                                    <Cell className="text-right bg-purple-500/5 font-bold text-purple-600">{(t.caudal ?? 0).toFixed(3)}</Cell>

                                    {/* GEOMETRÍA */}
                                    <EditableCell
                                        value={longitud}
                                        onChange={(v) => handleTramoUpdate(t.id, 'longitud', v)}
                                    />
                                    <Cell className="text-right">{pendiente.toFixed(2)}</Cell>
                                    <Cell className="text-right">{t.diametro_interior ?? '-'}</Cell>
                                    <Cell className="text-right">{t.diametro_comercial ?? '-'}</Cell>
                                    <Cell className="text-right text-xs">{t.clase_tuberia ?? '-'}</Cell>

                                    {/* RESULTADOS */}
                                    <Cell className="text-right">{(t.velocidad ?? 0).toFixed(2)}</Cell>
                                    <Cell className="text-right">{(t.perdida_carga ?? 0).toFixed(3)}</Cell>
                                    <Cell className={cn("text-right", startNode?.presion_calc && startNode.presion_calc < 10 ? "text-red-500 font-bold" : "")}>
                                        {startNode?.presion_calc?.toFixed(2) || '-'}
                                    </Cell>
                                    <Cell className={cn("text-right", endNode?.presion_calc && endNode.presion_calc < 10 ? "text-red-500 font-bold" : "")}>
                                        {endNode?.presion_calc?.toFixed(2) || '-'}
                                    </Cell>

                                    {/* DELETE */}
                                    <td className="p-0 text-center sticky right-0 bg-background border-l border-border/20">
                                        <button
                                            onClick={(e) => handleDelete(e, t.id)}
                                            className="p-1.5 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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

// --- Helpers ---
const HeaderGroup = ({ colSpan, title, color }: { colSpan: number, title: string, color: string }) => (
    <th colSpan={colSpan} className={cn("text-center py-1 bg-muted/30 border-b border-r border-border/20 text-[10px] font-bold tracking-wider select-none", color)}>
        {title}
    </th>
)

const Cell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <td className={cn("px-2 py-0.5 border-r border-border/10 h-7 overflow-hidden text-ellipsis text-right", className)}>
        {children}
    </td>
)

const EditableCell = ({ value, onChange }: { value: any, onChange: (val: string) => void }) => (
    <td className="p-0 border-r border-border/10 h-7 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-colors">
        <input
            className="w-full h-full bg-transparent px-2 outline-none text-right font-mono text-[11px] focus:ring-1 focus:ring-inset focus:ring-primary/50"
            defaultValue={value}
            onBlur={(e) => {
                if (e.target.value !== String(value)) onChange(e.target.value)
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
    </td>
)
