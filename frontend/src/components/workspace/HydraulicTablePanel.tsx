"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Nudo, Tramo } from "@/types/models"
import { updateNudo } from "@/app/actions/nudos"
import { updateTramo } from "@/app/actions/tramos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { TrendingUp, MapPin, GripVertical } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// DnD Kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ═══════════════════════════════════════
//  CONSTANTS & HELPERS
// ═══════════════════════════════════════

/** Commercial diameter → interior mm lookup (PVC Class 10) */
const DIAM_LOOKUP: Record<number, number> = {
    0.5: 16.1,
    0.75: 21.0,
    1: 26.5,
    1.5: 40.5,
    2: 52.5,
    2.5: 62.7,
    3: 77.9,
    4: 102.2,
    6: 154.1,
    8: 202.7,
}

/** Get interior diameter in mm from commercial inches */
function getInteriorMM(comercialPulg: number): number {
    return DIAM_LOOKUP[comercialPulg] ?? (comercialPulg * 25.4 * 0.82)
}

/** Calculate theoretical slope (m/km → ‰) */
function calcSlopeTeor(cotaI: number, cotaF: number, longitud: number): number {
    if (longitud <= 0) return 0
    return ((cotaI - cotaF) / longitud) * 1000
}

/** Calculate theoretical real diameter using Hazen-Williams:
 *  D = (Q / (0.2785 * C * S^0.54))^(1/2.63)
 *  Q in m³/s, S in m/m, D in m → converted to inches */
function calcDiamReal(qLps: number, sTeorPermil: number, C: number): number {
    if (qLps <= 0 || sTeorPermil <= 0) return 0
    const qM3s = qLps / 1000
    const S = sTeorPermil / 1000 // ‰ → m/m
    const denom = 0.2785 * C * Math.pow(S, 0.54)
    if (denom <= 0) return 0
    const diamM = Math.pow(qM3s / denom, 1 / 2.63)
    return diamM * 39.3701 // m → inches
}

/** Velocity from Q (L/s) and diameter (mm) */
function calcVelocity(qLps: number, diamMM: number): number {
    if (diamMM <= 0 || qLps <= 0) return 0
    const diamM = diamMM / 1000
    const area = Math.PI * Math.pow(diamM, 2) / 4
    return Math.abs(qLps / 1000) / area
}

/** Hazen-Williams friction slope Sr (m/m) */
function calcSr(qLps: number, diamMM: number, C: number): number {
    if (diamMM <= 0 || qLps <= 0 || C <= 0) return 0
    const diamM = diamMM / 1000
    const qM3s = Math.abs(qLps) / 1000
    // S = (Q / (0.2785 * C * D^2.63))^(1/0.54)
    const denom = 0.2785 * C * Math.pow(diamM, 2.63)
    if (denom <= 0) return 0
    return Math.pow(qM3s / denom, 1 / 0.54)
}

/** Head loss Hf = Sr * L */
function calcHf(sr: number, longitud: number): number {
    return sr * longitud
}

// ═══════════════════════════════════════
//  SORTABLE ROW COMPONENT
// ═══════════════════════════════════════

function SortableRow({ row, isSelected, onRowClick, onUpdate }: {
    row: any,
    isSelected: boolean,
    onRowClick: (id: string, type: 'tramo') => void,
    onUpdate: (id: string, field: string, val: any) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: row.tramo.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
    }

    return (
        <tr
            ref={setNodeRef}
            style={style}
            onClick={() => onRowClick(row.tramo.id, 'tramo')}
            className={cn(
                "border-b border-border/30 transition-colors cursor-pointer group",
                isSelected
                    ? "bg-primary/8 hover:bg-primary/12"
                    : "hover:bg-muted/20"
            )}
        >
            {/* Drag Handle */}
            <TD className="w-6 px-0 text-center cursor-grab active:cursor-grabbing touch-none">
                <div {...attributes} {...listeners} className="opacity-20 group-hover:opacity-100 transition-opacity flex justify-center">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                </div>
            </TD>

            {/* 1. TRAMO-I */}
            <TD className="font-bold text-blue-600 dark:text-blue-400">{row.tramoI}</TD>
            {/* 2. TRAMO-F */}
            <TD className="font-bold text-blue-600 dark:text-blue-400">{row.tramoF}</TD>
            {/* 3. Cota inicio */}
            <TD>{row.cotaI}</TD>
            {/* 4. Cota fin */}
            <TD>{row.cotaF}</TD>
            {/* 5. N° viviendas — EDITABLE */}
            <EditNumCell
                value={row.nViv}
                onChange={(v) => onUpdate(row.tramo.id, 'numero_viviendas', v)}
                className="bg-yellow-50/60 dark:bg-yellow-900/10"
            />
            {/* 6. Qu */}
            <TD>{row.qu > 0 ? row.qu.toFixed(3) : '—'}</TD>
            {/* 7. Q Diseño */}
            <TD className="font-bold">{row.qDiseno > 0 ? row.qDiseno.toFixed(3) : '—'}</TD>
            {/* 8. Longitud — EDITABLE */}
            <EditNumCell
                value={row.longitud}
                onChange={(v) => onUpdate(row.tramo.id, 'longitud', v)}
                className="bg-yellow-50/60 dark:bg-yellow-900/10"
            />
            {/* 9. S teórico */}
            <TD>{row.sTeor.toFixed(2)}</TD>
            {/* 10. D real */}
            <TD>{row.dReal > 0 ? row.dReal.toFixed(3) : '—'}</TD>
            {/* 11. D comercial — EDITABLE */}
            <EditNumCell
                value={row.dComercial}
                onChange={(v) => onUpdate(row.tramo.id, 'diametro_comercial', v)}
                className="bg-yellow-50/60 dark:bg-yellow-900/10"
            />
            {/* 12. Ø mm */}
            <TD>{row.diamMM.toFixed(1)}</TD>
            {/* 13. Velocity — color coded */}
            <TD className={cn(
                "font-bold",
                row.vel > 3.0 ? "text-red-600" :
                    row.vel > 0.6 ? "text-emerald-600" :
                        row.vel > 0 ? "text-blue-500" : ""
            )}>
                {row.vel > 0 ? row.vel.toFixed(2) : '—'}
            </TD>
            {/* 14. Sr */}
            <TD>{row.sr > 0 ? (row.sr * 1000).toFixed(2) : '—'}</TD>
            {/* 15. Hf */}
            <TD>{row.hf > 0 ? row.hf.toFixed(2) : '—'}</TD>
            {/* 16. Cpi */}
            <TD>{row.cpi > 0 ? row.cpi.toFixed(3) : '—'}</TD>
            {/* 17. CPf */}
            <TD>{row.cpf > 0 ? row.cpf.toFixed(3) : '—'}</TD>
            {/* 18. Pi — color coded */}
            <TD className={cn(
                row.pi > 0 && row.pi < 10 ? "text-red-600 font-bold" :
                    row.pi > 50 ? "text-amber-600 font-bold" :
                        row.pi > 0 ? "text-emerald-600" : ""
            )}>
                {row.pi.toFixed(3)}
            </TD>
            {/* 19. Pf — color coded */}
            <TD className={cn(
                row.pf > 0 && row.pf < 10 ? "text-red-600 font-bold" :
                    row.pf > 50 ? "text-amber-600 font-bold" :
                        row.pf > 0 ? "text-emerald-600" : ""
            )}>
                {row.pf.toFixed(3)}
            </TD>
        </tr>
    )
}

// ═══════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════

export function HydraulicTablePanel() {
    const router = useRouter()
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const currentProject = useProjectStore(state => state.currentProject)
    const simulationResults = useProjectStore(state => state.simulationResults)
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const updateNudoStore = useProjectStore(state => state.updateNudo)
    const updateTramoStore = useProjectStore(state => state.updateTramo)
    const reorderTramosStore = useProjectStore(state => state.reorderTramos)

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Total households across all tramos
    const totalViviendas = useMemo(() =>
        tramos.reduce((sum, t) => sum + (t.numero_viviendas ?? 0), 0)
        , [tramos])

    // ═══ TRAMO ROWS CALCULATION ═══
    const computedTramoRows = useMemo(() => {
        if (tramos.length === 0 || nudos.length === 0) return []

        const DENS_POBL = 5
        const Pt = totalViviendas * DENS_POBL
        const Qmh = nudos
            .filter(n => n.tipo !== 'reservorio')
            .reduce((sum, n) => sum + (n.demanda_base ?? 0), 0)

        const quUnit = Pt > 0 ? Qmh / Pt : 0

        const tramoMap = new Map(tramos.map(t => [t.id, t]))
        const nudoMap = new Map(nudos.map(n => [n.id, n]))
        const outgoing = new Map<string, Tramo[]>()

        for (const t of tramos) {
            const list = outgoing.get(t.nudo_origen_id) || []
            list.push(t)
            outgoing.set(t.nudo_origen_id, list)
        }

        const quMap = new Map<string, number>()
        for (const t of tramos) {
            const nViv = t.numero_viviendas ?? 0
            quMap.set(t.id, quUnit * nViv * DENS_POBL)
        }

        // Cumulative Q (Design)
        const qDesignMap = new Map<string, number>()
        function computeQDownstream(tramoId: string, visited: Set<string>): number {
            if (visited.has(tramoId)) return 0
            visited.add(tramoId)
            const t = tramoMap.get(tramoId)!
            let q = quMap.get(tramoId) || 0
            const downstream = outgoing.get(t.nudo_destino_id) || []
            for (const dt of downstream) {
                q += computeQDownstream(dt.id, visited)
            }
            qDesignMap.set(tramoId, q)
            return q
        }

        const reservoirs = nudos.filter(n => n.tipo === 'reservorio')
        for (const res of reservoirs) {
            const out = outgoing.get(res.id) || []
            for (const t of out) computeQDownstream(t.id, new Set())
        }
        for (const t of tramos) {
            if (!qDesignMap.has(t.id)) computeQDownstream(t.id, new Set())
        }

        // Topological ordering for Cpi/CPf (DFS for better branch grouping)
        const orderedTramos: Tramo[] = []
        const visitedTramos = new Set<string>()

        // Helper for DFS traversal
        function visitNode(nodeId: string) {
            const out = outgoing.get(nodeId) || []

            // Sort outgoing: Prioritize largest diameter or just generic order
            // For now, let's stick to insertion order, which usually respects creation time

            for (const t of out) {
                if (visitedTramos.has(t.id)) continue

                visitedTramos.add(t.id)
                orderedTramos.push(t)

                // Recurse immediately (Depth-First)
                visitNode(t.nudo_destino_id)
            }
        }

        // Start from reservoirs
        for (const res of reservoirs) {
            visitNode(res.id)
        }

        // Add any disconnected/cyclic tramos that weren't visited
        for (const t of tramos) {
            if (!visitedTramos.has(t.id)) orderedTramos.push(t)
        }

        // Calculations
        const nodeCpi = new Map<string, number>()
        for (const res of reservoirs) {
            nodeCpi.set(res.id, res.cota_terreno ?? 0)
        }

        return orderedTramos.map(t => {
            const startNode = nudoMap.get(t.nudo_origen_id)
            const endNode = nudoMap.get(t.nudo_destino_id)

            const linkRes = simulationResults?.linkResults?.[t.id]
                || simulationResults?.linkResults?.[t.codigo || '']

            const tramoI = startNode?.codigo || '—'
            const tramoF = endNode?.codigo || '—'
            const cotaI = startNode?.cota_terreno ?? 0
            const cotaF = endNode?.cota_terreno ?? 0
            const nViv = t.numero_viviendas ?? 0
            const qu = quMap.get(t.id) || 0
            const qDiseno = linkRes?.flow != null ? Math.abs(linkRes.flow) : (qDesignMap.get(t.id) || 0)
            const longitud = t.longitud ?? 0
            const sTeor = calcSlopeTeor(cotaI, cotaF, longitud)
            const dReal = calcDiamReal(qDiseno, sTeor, t.coef_hazen_williams || 150)
            const dComercial = t.diametro_comercial ?? 0
            const diamMM = getInteriorMM(dComercial)
            const vel = linkRes?.velocity != null ? linkRes.velocity : calcVelocity(qDiseno, diamMM)
            const sr = calcSr(qDiseno, diamMM, t.coef_hazen_williams || 150)
            const hf = linkRes?.headloss != null ? linkRes.headloss : calcHf(sr, longitud)

            const isCRP = startNode?.tipo === 'camara_rompe_presion'
            const cpi = isCRP ? cotaI : (nodeCpi.get(t.nudo_origen_id) ?? cotaI)
            const cpf = cpi - hf

            if (endNode?.tipo === 'camara_rompe_presion') nodeCpi.set(t.nudo_destino_id, cotaF)
            else nodeCpi.set(t.nudo_destino_id, cpf)

            const pi = cpi - cotaI
            const pf = cpf - cotaF

            return {
                id: t.id, // For DnD
                tramo: t,
                tramoI, tramoF, cotaI, cotaF, nViv,
                qu, qDiseno, longitud, sTeor, dReal,
                dComercial, diamMM, vel, sr, hf,
                cpi, cpf, pi, pf,
                startNode, endNode
            }
        })
    }, [tramos, nudos, simulationResults, totalViviendas])

    // ═══ APPLY SORT ORDER ═══
    const sortedTramoRows = useMemo(() => {
        const order = currentProject?.settings?.tramo_order || []
        if (order.length === 0) return computedTramoRows

        const map = new Map(computedTramoRows.map(r => [r.tramo.id, r]))
        const sorted = []

        // 1. Add rows in the custom order
        for (const id of order) {
            const row = map.get(id)
            if (row) {
                sorted.push(row)
                map.delete(id)
            }
        }

        // 2. Add remaining (new) rows at the end
        for (const row of map.values()) {
            sorted.push(row)
        }

        return sorted
    }, [computedTramoRows, currentProject?.settings?.tramo_order])

    // ═══ DND HANDLER ═══
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = sortedTramoRows.findIndex(r => r.tramo.id === active.id)
            const newIndex = sortedTramoRows.findIndex(r => r.tramo.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                const newRows = arrayMove(sortedTramoRows, oldIndex, newIndex)
                const newOrder = newRows.map(r => r.tramo.id)
                reorderTramosStore(newOrder)
            }
        }
    }

    // ═══ NUDO ROWS ═══
    const nudoRows = useMemo(() => {
        return nudos.map(n => {
            const res = simulationResults?.nodeResults?.[n.id]
                || simulationResults?.nodeResults?.[n.codigo || '']
            return { nudo: n, result: res }
        })
    }, [nudos, simulationResults])

    // ═══ ACTIONS ═══
    const handleTramoUpdate = useCallback(async (id: string, field: string, value: any) => {
        const numValue = parseFloat(value) || 0
        updateTramoStore({ id, [field]: numValue } as any)
        try {
            await updateTramo({ id, [field]: numValue })
        } catch {
            toast.error("Error al actualizar tramo")
            router.refresh()
        }
    }, [updateTramoStore, router])

    const handleNudoUpdate = useCallback(async (id: string, field: string, value: any) => {
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
        setSelectedElement(
            selectedElement?.id === id ? null : { id, type }
        )
    }, [selectedElement, setSelectedElement])

    // ═══ TYPE EMOJI ═══
    const typeEmoji = (type: string) => {
        switch (type) {
            case 'reservorio': return '🏗️'
            case 'camara_rompe_presion': return '⚡'
            case 'union': return '🔵'
            default: return '📍'
        }
    }

    return (
        <div className="flex flex-col h-full bg-background border-t">
            <Tabs defaultValue="tramos" className="flex flex-col h-full">
                <div className="border-b px-3 py-0.5 flex items-center justify-between bg-muted/20">
                    <TabsList className="h-7">
                        <TabsTrigger value="tramos" className="text-[10px] h-6 px-2.5">
                            <TrendingUp className="mr-1 w-3 h-3" />
                            Tramos ({tramos.length})
                        </TabsTrigger>
                        <TabsTrigger value="nudos" className="text-[10px] h-6 px-2.5">
                            <MapPin className="mr-1 w-3 h-3" />
                            Nudos ({nudos.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto">
                    {/* ═══════ TRAMOS TAB — 19 COLUMNS DRAGGABLE ═══════ */}
                    <TabsContent value="tramos" className="h-full mt-0 p-0 border-0">
                        <div className="overflow-x-auto h-full">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <table className="w-max min-w-full text-[10px] font-mono border-collapse">
                                    <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-sm">
                                        <tr className="border-b border-border">
                                            <TH className="w-6"></TH> {/* Drag handle col */}
                                            <TH>Tramo-I</TH>
                                            <TH>Tramo-F</TH>
                                            <TH>Cota I</TH>
                                            <TH>Cota F</TH>
                                            <TH className="bg-yellow-50/50 dark:bg-yellow-900/10">N° Viv</TH>
                                            <TH>Qu (L/s)</TH>
                                            <TH>Q Diseño</TH>
                                            <TH className="bg-yellow-50/50 dark:bg-yellow-900/10">Long (m)</TH>
                                            <TH>S teór ‰</TH>
                                            <TH>D real ″</TH>
                                            <TH className="bg-yellow-50/50 dark:bg-yellow-900/10">D com ″</TH>
                                            <TH>Ø mm</TH>
                                            <TH>Vel m/s</TH>
                                            <TH>Sr ‰</TH>
                                            <TH>Hf (m)</TH>
                                            <TH>Cpi</TH>
                                            <TH>CPf</TH>
                                            <TH>Pi</TH>
                                            <TH>Pf</TH>
                                        </tr>
                                    </thead>
                                    <tbody className="relative">
                                        <SortableContext
                                            items={sortedTramoRows.map(r => r.tramo.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {sortedTramoRows.map((row) => (
                                                <SortableRow
                                                    key={row.tramo.id}
                                                    row={row}
                                                    isSelected={selectedElement?.id === row.tramo.id}
                                                    onRowClick={handleRowClick}
                                                    onUpdate={handleTramoUpdate}
                                                />
                                            ))}
                                        </SortableContext>
                                    </tbody>
                                </table>
                            </DndContext>
                        </div>
                    </TabsContent>

                    {/* ═══════ NUDOS TAB — STANDARD ═══════ */}
                    <TabsContent value="nudos" className="h-full mt-0 p-0 border-0">
                        <div className="overflow-auto h-full">
                            <table className="w-full text-[10px] font-mono border-collapse">
                                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm text-left">
                                    <tr className="border-b border-border">
                                        <TH>Tipo</TH>
                                        <TH>Código</TH>
                                        <TH className="bg-yellow-50/50 dark:bg-yellow-900/10">Cota</TH>
                                        <TH>Demanda</TH>
                                        <TH>P Calc</TH>
                                        <TH>Altura</TH>
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
                                                    "border-b border-border/30 transition-colors cursor-pointer",
                                                    isSelected ? "bg-primary/8" : "hover:bg-muted/20"
                                                )}
                                            >
                                                <TD>{typeEmoji(nudo.tipo)}</TD>
                                                <TD className="font-bold">{nudo.codigo}</TD>
                                                <EditNudoCell
                                                    value={nudo.cota_terreno}
                                                    onChange={(v) => handleNudoUpdate(nudo.id, 'cota_terreno', v)}
                                                    className="bg-yellow-50/60 dark:bg-yellow-900/10"
                                                />
                                                <TD>{nudo.demanda_base ?? 0}</TD>
                                                <TD className={cn(
                                                    (result?.pressure ?? 0) < 0 ? "text-red-500 font-bold" : ""
                                                )}>
                                                    {(result?.pressure ?? 0).toFixed(2)}
                                                </TD>
                                                <TD>{(result?.head ?? nudo.elevacion ?? 0).toFixed(2)}</TD>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

function TH({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <th className={cn("px-2 py-1.5 font-medium text-muted-foreground whitespace-nowrap text-center border-r border-border/20 last:border-0", className)}>
            {children}
        </th>
    )
}

function TD({ children, className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
    return (
        <td className={cn("px-2 py-0.5 border-r border-border/20 last:border-0 text-center whitespace-nowrap", className)} {...props}>
            {children}
        </td>
    )
}

function EditNumCell({ value, onChange, className }: { value?: number, onChange: (val: number) => void, className?: string }) {
    const [localVal, setLocalVal] = useState<string>(value?.toString() ?? "0")

    useEffect(() => {
        setLocalVal(value?.toString() ?? "0")
    }, [value])

    const commit = () => {
        const parsed = parseFloat(localVal)
        if (!isNaN(parsed) && parsed !== value) {
            onChange(parsed)
        }
    }

    return (
        <td className={cn("p-0 border-r border-border/20 min-w-[50px]", className)}>
            <input
                type="text"
                className="w-full h-full bg-transparent text-center focus:outline-none focus:bg-background focus:ring-1 ring-primary px-1 py-0.5"
                value={localVal}
                onChange={e => setLocalVal(e.target.value)}
                onBlur={commit}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur()
                    }
                }}
            />
        </td>
    )
}

function EditNudoCell({ value, onChange, className }: { value?: number, onChange: (val: number) => void, className?: string }) {
    return <EditNumCell value={value} onChange={onChange} className={className} />
}
