"use client"

import { useCallback, useMemo, useState } from "react"
import { Nudo, Tramo } from "@/types/models"
import { updateNudo } from "@/app/actions/nudos"
import { updateTramoAction } from "@/app/actions/tramos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { Trash2, TrendingUp, Droplets, MapPin, Activity } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Unified Hydraulic Table — reads directly from Zustand store
 * so it updates in REAL TIME when nodes/pipes are added/removed.
 */
export function HydraulicTablePanel() {
    const router = useRouter()
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const simulationResults = useProjectStore(state => state.simulationResults)
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const removeTramoStore = useProjectStore(state => state.removeTramo)
    const removeNudoStore = useProjectStore(state => state.removeNudo)
    const updateNudoStore = useProjectStore(state => state.updateNudo)
    const updateTramoStore = useProjectStore(state => state.updateTramo)

    // --- Derived Data (Joins) ---
    const tramoRows = useMemo(() => {
        return tramos.map(t => {
            const startNode = nudos.find(n => n.id === t.nudo_origen_id)
            const endNode = nudos.find(n => n.id === t.nudo_destino_id)
            const res = simulationResults?.linkResults?.[t.id] || simulationResults?.linkResults?.[t.codigo || '']

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
                result: res
            }
        })
    }, [tramos, nudos, simulationResults])

    const nudoRows = useMemo(() => {
        return nudos.map(n => {
            const res = simulationResults?.nodeResults?.[n.id] || simulationResults?.nodeResults?.[n.codigo || '']
            return {
                nudo: n,
                result: res
            }
        })
    }, [nudos, simulationResults])

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
    }, [updateTramoStore, router])

    const handleNudoUpdate = useCallback(async (id: string, field: string, value: any) => {
        // Handle string vs number
        const val = field === 'codigo' ? value : (parseFloat(value) || 0)

        updateNudoStore({ id, [field]: val } as any)
        try {
            await updateNudo(id, { [field]: val })
        } catch {
            toast.error("Error al actualizar nudo")
            router.refresh()
        }
    }, [updateNudoStore, router])

    const handleRowClick = useCallback((id: string, type: 'tramo' | 'nudo') => {
        // Toggle selection or select new
        setSelectedElement(
            selectedElement?.id === id ? null : { id, type }
        )
    }, [selectedElement, setSelectedElement])

    // --- Type Emoji Helper ---
    const getTypeEmoji = (type: string) => {
        switch (type) {
            case 'reservorio': return '🏗️';
            case 'camara_rompe_presion': return '⚡';
            case 'union': return '🔵';
            default: return '📍';
        }
    }

    return (
        <div className="flex flex-col h-full bg-background border-t">
            <Tabs defaultValue="tramos" className="flex flex-col h-full">
                <div className="border-b px-4 py-1 flex items-center justify-between bg-muted/20">
                    <TabsList className="h-8">
                        <TabsTrigger value="tramos" className="text-xs h-7 px-3">
                            <TrendingUp className="mr-1.5 w-3.5 h-3.5" />
                            Tramos ({tramos.length})
                        </TabsTrigger>
                        <TabsTrigger value="nudos" className="text-xs h-7 px-3">
                            <MapPin className="mr-1.5 w-3.5 h-3.5" />
                            Nudos ({nudos.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto bg-card/50">
                    {/* --- TRAMOS TAB --- */}
                    <TabsContent value="tramos" className="h-full mt-0 p-0 border-0">
                        <table className="w-full text-xs font-mono border-collapse relative">
                            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm text-foreground shadow-sm">
                                <tr>
                                    <HeaderCell>Código</HeaderCell>
                                    <HeaderCell>Clase</HeaderCell>
                                    <HeaderCell>Long (m)</HeaderCell>
                                    <HeaderCell>Ø (pulg)</HeaderCell>
                                    <HeaderCell>Cota In (m)</HeaderCell>
                                    <HeaderCell>Cota Fin (m)</HeaderCell>
                                    <HeaderCell>Vel (m/s)</HeaderCell>
                                    <HeaderCell>Hf (m)</HeaderCell>
                                </tr>
                            </thead>
                            <tbody>
                                {tramoRows.map(({ tramo, startNode, endNode, cotaInicio, cotaFin, result }) => {
                                    const isSelected = selectedElement?.id === tramo.id
                                    return (
                                        <tr
                                            key={tramo.id}
                                            onClick={() => handleRowClick(tramo.id, 'tramo')}
                                            className={cn(
                                                "border-b border-border/50 transition-colors cursor-pointer group",
                                                isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/30"
                                            )}
                                        >
                                            <Cell className="font-bold text-primary">{tramo.codigo}</Cell>
                                            <Cell>{tramo.clase_tuberia || "S-10"}</Cell>
                                            <EditableCell
                                                value={tramo.longitud}
                                                onChange={(v) => handleTramoUpdate(tramo.id, 'longitud', v)}
                                                suffix="m"
                                                className="bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-bold"
                                            />
                                            <EditableCell
                                                value={tramo.diametro_comercial}
                                                onChange={(v) => handleTramoUpdate(tramo.id, 'diametro_comercial', v)}
                                                suffix={'"'}
                                                className="bg-blue-500/5 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold"
                                            />

                                            {/* Read-only cotas linking to nodes */}
                                            <Cell className="text-muted-foreground">
                                                <span title={startNode?.codigo}>{cotaInicio}</span>
                                            </Cell>
                                            <Cell className="text-muted-foreground">
                                                <span title={endNode?.codigo}>{cotaFin}</span>
                                            </Cell>

                                            {/* Results */}
                                            <Cell className={cn(result && (result.velocity > 3 ? "text-red-500 font-bold" : "text-emerald-600"))}>
                                                {result ? result.velocity.toFixed(2) : "-"}
                                            </Cell>
                                            <Cell>{result ? result.headloss.toFixed(2) : "-"}</Cell>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </TabsContent>

                    {/* --- NUDOS TAB --- */}
                    <TabsContent value="nudos" className="h-full mt-0 p-0 border-0">
                        <table className="w-full text-xs font-mono border-collapse relative">
                            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm text-foreground shadow-sm">
                                <tr>
                                    <HeaderCell>Código</HeaderCell>
                                    <HeaderCell>Tipo</HeaderCell>
                                    <HeaderCell>Cota (m)</HeaderCell>
                                    <HeaderCell>Demanda (L/s)</HeaderCell>
                                    <HeaderCell>Presión (m)</HeaderCell>
                                    <HeaderCell>Altura H2O (m)</HeaderCell>
                                </tr>
                            </thead>
                            <tbody>
                                {nudoRows.map(({ nudo, result }) => {
                                    const isSelected = selectedElement?.id === nudo.id
                                    return (
                                        <tr
                                            key={nudo.id}
                                            onClick={() => handleRowClick(nudo.id, 'nudo')}
                                            className={cn(
                                                "border-b border-border/50 transition-colors cursor-pointer group",
                                                isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/30"
                                            )}
                                        >
                                            <EditableTextCell
                                                value={nudo.codigo}
                                                onChange={(v) => handleNudoUpdate(nudo.id, 'codigo', v)}
                                                className="font-bold text-primary"
                                            />
                                            <Cell>
                                                <span className="flex items-center gap-1.5 opacity-80">
                                                    <span>{getTypeEmoji(nudo.tipo)}</span>
                                                    <span className="capitalize">{nudo.tipo.replace(/_/g, ' ')}</span>
                                                </span>
                                            </Cell>
                                            <EditableCell
                                                value={nudo.cota_terreno}
                                                onChange={(v) => handleNudoUpdate(nudo.id, 'cota_terreno', v)}
                                                suffix="m"
                                                className="bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-bold"
                                            />
                                            <EditableCell
                                                value={nudo.demanda_base}
                                                onChange={(v) => handleNudoUpdate(nudo.id, 'demanda_base', v)}
                                                suffix="L/s"
                                                className="bg-blue-500/5 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                            />

                                            {/* Results */}
                                            <Cell className={cn(result && (result.pressure < 10 ? "text-amber-600 font-bold" : "text-emerald-600"))}>
                                                {result ? result.pressure.toFixed(2) : "-"}
                                            </Cell>

                                            {/* Reservoir specific */}
                                            <Cell>
                                                {nudo.tipo === 'reservorio' ? (
                                                    <EditableCell
                                                        value={nudo.altura_agua}
                                                        onChange={(v) => handleNudoUpdate(nudo.id, 'altura_agua', v)}
                                                        className="bg-cyan-500/5 text-cyan-700"
                                                    />
                                                ) : <span className="text-muted-foreground/30">—</span>}
                                            </Cell>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

function HeaderCell({ children }: { children: React.ReactNode }) {
    return (
        <th className="text-left px-3 py-2 font-medium text-muted-foreground bg-muted/50 whitespace-nowrap border-b border-border">
            {children}
        </th>
    )
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <td className={cn("px-3 py-1.5 whitespace-nowrap align-middle", className)}>
            {children}
        </td>
    )
}

function EditableCell({ value, onChange, className, suffix }: {
    value: number | undefined
    onChange: (val: string) => void
    className?: string
    suffix?: string
}) {
    const [localValue, setLocalValue] = useState(value?.toString() ?? "")

    const handleBlur = () => {
        if (localValue !== value?.toString()) {
            onChange(localValue)
        }
    }

    return (
        <td className={cn("px-1 py-1 align-middle w-24", className)}>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:ring-1 hover:ring-primary/50 transition-all bg-background/50">
                <input
                    className="w-full bg-transparent outline-none p-0 text-inherit font-inherit text-right"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onClick={(e) => e.stopPropagation()} // Prevent row selection
                />
                {suffix && <span className="text-[9px] opacity-50 select-none pb-0.5">{suffix}</span>}
            </div>
        </td>
    )
}

function EditableTextCell({ value, onChange, className }: {
    value: string
    onChange: (val: string) => void
    className?: string
}) {
    const [localValue, setLocalValue] = useState(value)

    const handleBlur = () => {
        if (localValue !== value) {
            onChange(localValue)
        }
    }

    return (
        <td className={cn("px-1 py-1 align-middle w-24", className)}>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:ring-1 hover:ring-primary/50 transition-all bg-background/50">
                <input
                    className="w-full bg-transparent outline-none p-0 text-inherit font-inherit"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </td>
    )
}
