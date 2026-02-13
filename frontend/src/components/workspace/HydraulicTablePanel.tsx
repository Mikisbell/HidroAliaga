"use client"

import { useCallback, useMemo, useState, useRef, useEffect } from "react"
import { Nudo, Tramo } from "@/types/models"
import { updateNudo } from "@/app/actions/nudos"
import { updateTramo } from "@/app/actions/tramos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { TrendingUp, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

/** Standard commercial diameters in inches */
const COMMERCIAL_DIAMS = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 6, 8]

/** Get interior diameter in mm from commercial inches */
function getInteriorMM(comercialPulg: number): number {
    return DIAM_LOOKUP[comercialPulg] ?? (comercialPulg * 25.4 * 0.82)
}

/** Calculate theoretical slope (m/km → ‰) */
function calcSlopeTeor(cotaI: number, cotaF: number, longitud: number): number {
    if (longitud <= 0) return 0
    return ((cotaI - cotaF) / longitud) * 1000
}

/** Calculate theoretical real diameter from Q (L/s) targeting velocity ~1 m/s */
function calcDiamReal(qLps: number): number {
    if (qLps <= 0) return 0
    const qM3s = qLps / 1000
    const targetVel = 1.0 // m/s
    const areaM2 = qM3s / targetVel
    const diamM = Math.sqrt((4 * areaM2) / Math.PI)
    return diamM * 39.3701 // convert m → inches
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
//  MAIN COMPONENT
// ═══════════════════════════════════════

export function HydraulicTablePanel() {
    const router = useRouter()
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const simulationResults = useProjectStore(state => state.simulationResults)
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const updateNudoStore = useProjectStore(state => state.updateNudo)
    const updateTramoStore = useProjectStore(state => state.updateTramo)

    // Total households across all tramos
    const totalViviendas = useMemo(() =>
        tramos.reduce((sum, t) => sum + (t.numero_viviendas ?? 0), 0)
        , [tramos])

    // ═══ TRAMO ROWS — 19 columns with cascading piezometric heads ═══
    const tramoRows = useMemo(() => {
        if (tramos.length === 0 || nudos.length === 0) return []

        // ── Project parameters (from reference spreadsheet) ──
        // Dens. Pobl = 5 hab/fam, Pt = totalViviendas * 5
        const DENS_POBL = 5
        const Pt = totalViviendas * DENS_POBL // total population

        // Total demand from junction nodes (Qmh)
        const Qmh = nudos
            .filter(n => n.tipo !== 'reservorio')
            .reduce((sum, n) => sum + (n.demanda_base ?? 0), 0)

        // qu (unit flow per inhabitant) = Qmh / Pt
        const quUnit = Pt > 0 ? Qmh / Pt : 0

        // ── Step 1: Build adjacency and compute Qu per tramo ──
        const tramoMap = new Map(tramos.map(t => [t.id, t]))
        const nudoMap = new Map(nudos.map(n => [n.id, n]))

        // Build graph: which tramos go OUT of each nudo
        const outgoing = new Map<string, Tramo[]>()
        for (const t of tramos) {
            const list = outgoing.get(t.nudo_origen_id) || []
            list.push(t)
            outgoing.set(t.nudo_origen_id, list)
        }

        // Compute Qu per tramo
        const quMap = new Map<string, number>()
        for (const t of tramos) {
            const nViv = t.numero_viviendas ?? 0
            quMap.set(t.id, quUnit * nViv * DENS_POBL)
        }

        // ── Step 2: Topological sort from reservoir (BFS) ──
        // Q(Diseño) accumulates: for each tramo, Q = Qu_self + sum(Q of downstream tramos)
        // We traverse from leaves towards reservoir, accumulating Q.
        // Simpler: traverse from reservoir outward, and Q gets reduced at each branch.

        // Actually from the spreadsheet: Q(Diseño) for the pipe leaving the reservoir = total Qmh
        // Then at each node, Q splits proportionally to downstream households.
        // For a simple branching network (tree): Q at any pipe = sum of all Qu downstream of it.

        // Compute cumulative Q using reverse DFS from leaves
        const qDesignMap = new Map<string, number>()

        // For each tramo, sum its own Qu plus all Qu of tramos downstream
        function computeQDownstream(tramoId: string, visited: Set<string>): number {
            if (visited.has(tramoId)) return 0
            visited.add(tramoId)

            const t = tramoMap.get(tramoId)!
            let q = quMap.get(tramoId) || 0

            // Find tramos that leave from this tramo's end node
            const downstream = outgoing.get(t.nudo_destino_id) || []
            for (const dt of downstream) {
                q += computeQDownstream(dt.id, visited)
            }

            qDesignMap.set(tramoId, q)
            return q
        }

        // Start from reservoir outgoing tramos
        const reservoirs = nudos.filter(n => n.tipo === 'reservorio')
        for (const res of reservoirs) {
            const out = outgoing.get(res.id) || []
            for (const t of out) {
                computeQDownstream(t.id, new Set())
            }
        }
        // Fill any uncomputed tramos (disconnected)
        for (const t of tramos) {
            if (!qDesignMap.has(t.id)) {
                computeQDownstream(t.id, new Set())
            }
        }

        // ── Step 3: Topological order (BFS from reservoir) for Cpi/CPf cascade ──
        const orderedTramos: Tramo[] = []
        const visitedNodes = new Set<string>()
        const queue: string[] = []

        // Start with reservoir nodes
        for (const res of reservoirs) {
            queue.push(res.id)
            visitedNodes.add(res.id)
        }

        while (queue.length > 0) {
            const nodeId = queue.shift()!
            const out = outgoing.get(nodeId) || []
            for (const t of out) {
                orderedTramos.push(t)
                if (!visitedNodes.has(t.nudo_destino_id)) {
                    visitedNodes.add(t.nudo_destino_id)
                    queue.push(t.nudo_destino_id)
                }
            }
        }
        // Add any remaining tramos not reachable from reservoirs
        for (const t of tramos) {
            if (!orderedTramos.find(ot => ot.id === t.id)) {
                orderedTramos.push(t)
            }
        }

        // ── Step 4: Compute all 19 columns with cascading Cpi/CPf ──
        // nodeCpi stores the piezometric head arriving at each node
        const nodeCpi = new Map<string, number>()

        // Reservoir Cpi = its cota_terreno (or head)
        for (const res of reservoirs) {
            nodeCpi.set(res.id, res.cota_terreno ?? 0)
        }

        const rows = orderedTramos.map(t => {
            const startNode = nudoMap.get(t.nudo_origen_id)
            const endNode = nudoMap.get(t.nudo_destino_id)

            // EPANET results
            const linkRes = simulationResults?.linkResults?.[t.id]
                || simulationResults?.linkResults?.[t.codigo || '']

            // 1-4: Identification
            const tramoI = startNode?.codigo || '—'
            const tramoF = endNode?.codigo || '—'
            const cotaI = startNode?.cota_terreno ?? 0
            const cotaF = endNode?.cota_terreno ?? 0

            // 5: Households
            const nViv = t.numero_viviendas ?? 0

            // 6: Qu (per tramo)
            const qu = quMap.get(t.id) || 0

            // 7: Q(Diseño) = cumulative from downstream
            const qDiseno = linkRes?.flow != null
                ? Math.abs(linkRes.flow)
                : (qDesignMap.get(t.id) || 0)

            // 8: Length
            const longitud = t.longitud ?? 0

            // 9: Theoretical slope (‰)
            const sTeor = calcSlopeTeor(cotaI, cotaF, longitud)

            // 10: Real diameter (targeting ~1 m/s)
            const dReal = calcDiamReal(qDiseno)

            // 11-12: Commercial diameter
            const dComercial = t.diametro_comercial ?? 0
            const diamMM = getInteriorMM(dComercial)

            // 13: Velocity
            const vel = linkRes?.velocity != null
                ? linkRes.velocity
                : calcVelocity(qDiseno, diamMM)

            // 14: Sr (real friction slope)
            const sr = calcSr(qDiseno, diamMM, t.coef_hazen_williams || 150)

            // 15: Hf (head loss)
            const hf = linkRes?.headloss != null
                ? linkRes.headloss
                : calcHf(sr, longitud)

            // 16-17: Cpi / CPf — cascading from upstream
            // If start node is CRP, reset Cpi to its cota
            const isCRP = startNode?.tipo === 'camara_rompe_presion'
            const cpi = isCRP
                ? cotaI
                : (nodeCpi.get(t.nudo_origen_id) ?? cotaI)
            const cpf = cpi - hf

            // Store CPf as the Cpi for the end node (for next tramo)
            // CRP at destination resets the piezometric head
            if (endNode?.tipo === 'camara_rompe_presion') {
                nodeCpi.set(t.nudo_destino_id, cotaF) // CRP resets
            } else {
                nodeCpi.set(t.nudo_destino_id, cpf)
            }

            // 18-19: Pressures
            const pi = cpi - cotaI
            const pf = cpf - cotaF

            return {
                tramo: t,
                tramoI, tramoF,
                cotaI, cotaF,
                nViv,
                qu, qDiseno,
                longitud,
                sTeor, dReal,
                dComercial, diamMM,
                vel, sr, hf,
                cpi, cpf, pi, pf,
                startNode, endNode,
            }
        })

        return rows
    }, [tramos, nudos, simulationResults, totalViviendas])

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
                    {/* ═══════ TRAMOS TAB — 19 COLUMNS ═══════ */}
                    <TabsContent value="tramos" className="h-full mt-0 p-0 border-0">
                        <div className="overflow-x-auto h-full">
                            <table className="w-max min-w-full text-[10px] font-mono border-collapse">
                                <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
                                    <tr className="border-b border-border">
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
                                        <TH>Sr</TH>
                                        <TH>Hf (m)</TH>
                                        <TH>Cpi</TH>
                                        <TH>CPf</TH>
                                        <TH>Pi</TH>
                                        <TH>Pf</TH>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tramoRows.map((row) => {
                                        const isSelected = selectedElement?.id === row.tramo.id
                                        return (
                                            <tr
                                                key={row.tramo.id}
                                                onClick={() => handleRowClick(row.tramo.id, 'tramo')}
                                                className={cn(
                                                    "border-b border-border/30 transition-colors cursor-pointer",
                                                    isSelected
                                                        ? "bg-primary/8 hover:bg-primary/12"
                                                        : "hover:bg-muted/20"
                                                )}
                                            >
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
                                                    onChange={(v) => handleTramoUpdate(row.tramo.id, 'numero_viviendas', v)}
                                                    className="bg-yellow-50/60 dark:bg-yellow-900/10"
                                                />
                                                {/* 6. Qu */}
                                                <TD>{row.qu > 0 ? row.qu.toFixed(3) : '—'}</TD>
                                                {/* 7. Q Diseño */}
                                                <TD className="font-bold">{row.qDiseno > 0 ? row.qDiseno.toFixed(3) : '—'}</TD>
                                                {/* 8. Longitud — EDITABLE */}
                                                <EditNumCell
                                                    value={row.longitud}
                                                    onChange={(v) => handleTramoUpdate(row.tramo.id, 'longitud', v)}
                                                    className="bg-yellow-50/60 dark:bg-yellow-900/10"
                                                />
                                                {/* 9. S teórico */}
                                                <TD>{row.sTeor.toFixed(2)}</TD>
                                                {/* 10. D real */}
                                                <TD>{row.dReal > 0 ? row.dReal.toFixed(3) : '—'}</TD>
                                                {/* 11. D comercial — EDITABLE */}
                                                <EditNumCell
                                                    value={row.dComercial}
                                                    onChange={(v) => handleTramoUpdate(row.tramo.id, 'diametro_comercial', v)}
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
                                                <TD>{row.sr > 0 ? row.sr.toFixed(4) : '—'}</TD>
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
                                                    {row.pi !== 0 ? row.pi.toFixed(2) : '—'}
                                                </TD>
                                                {/* 19. Pf — color coded */}
                                                <TD className={cn(
                                                    row.pf > 0 && row.pf < 10 ? "text-red-600 font-bold" :
                                                        row.pf > 50 ? "text-amber-600 font-bold" :
                                                            row.pf > 0 ? "text-emerald-600" : ""
                                                )}>
                                                    {row.pf !== 0 ? row.pf.toFixed(2) : '—'}
                                                </TD>
                                            </tr>
                                        )
                                    })}
                                    {tramos.length === 0 && (
                                        <tr>
                                            <td colSpan={19} className="text-center py-6 text-muted-foreground text-xs">
                                                Conecta nudos en el diseñador para ver los cálculos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    {/* ═══════ NUDOS TAB ═══════ */}
                    <TabsContent value="nudos" className="h-full mt-0 p-0 border-0">
                        <table className="w-full text-[10px] font-mono border-collapse">
                            <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
                                <tr className="border-b border-border">
                                    <TH>Código</TH>
                                    <TH>Tipo</TH>
                                    <TH className="bg-yellow-50/50 dark:bg-yellow-900/10">Cota (m)</TH>
                                    <TH className="bg-yellow-50/50 dark:bg-yellow-900/10">Demanda (L/s)</TH>
                                    <TH>Presión (m)</TH>
                                    <TH>Carga (m)</TH>
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
                                                isSelected
                                                    ? "bg-primary/8 hover:bg-primary/12"
                                                    : "hover:bg-muted/20"
                                            )}
                                        >
                                            <EditTextCell
                                                value={nudo.codigo}
                                                onChange={(v) => handleNudoUpdate(nudo.id, 'codigo', v)}
                                                className="font-bold text-primary"
                                            />
                                            <TD>
                                                <span className="flex items-center gap-1 opacity-80">
                                                    <span>{typeEmoji(nudo.tipo)}</span>
                                                    <span className="capitalize text-[9px]">{nudo.tipo.replace(/_/g, ' ')}</span>
                                                </span>
                                            </TD>
                                            <EditNumCell
                                                value={nudo.cota_terreno}
                                                onChange={(v) => handleNudoUpdate(nudo.id, 'cota_terreno', v)}
                                                className="bg-yellow-50/60 dark:bg-yellow-900/10"
                                            />
                                            <EditNumCell
                                                value={nudo.demanda_base}
                                                onChange={(v) => handleNudoUpdate(nudo.id, 'demanda_base', v)}
                                                className="bg-yellow-50/60 dark:bg-yellow-900/10"
                                            />
                                            <TD className={cn(
                                                result && (result.pressure < 10
                                                    ? "text-red-600 font-bold"
                                                    : result.pressure > 50
                                                        ? "text-amber-600 font-bold"
                                                        : "text-emerald-600")
                                            )}>
                                                {result ? result.pressure.toFixed(2) : '—'}
                                            </TD>
                                            <TD>
                                                {result ? result.head.toFixed(2) : '—'}
                                            </TD>
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

// ═══════════════════════════════════════
//  SUB-COMPONENTS (Dense table cells)
// ═══════════════════════════════════════

/** Header cell */
function TH({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <th className={cn(
            "text-left px-2 py-1 font-semibold text-[9px] text-muted-foreground whitespace-nowrap border-b border-border",
            className
        )}>
            {children}
        </th>
    )
}

/** Read-only data cell */
function TD({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <td className={cn("px-2 py-0.5 whitespace-nowrap text-right tabular-nums", className)}>
            {children}
        </td>
    )
}

/** Editable numeric cell */
function EditNumCell({ value, onChange, className }: {
    value: number | undefined
    onChange: (val: string) => void
    className?: string
}) {
    const [local, setLocal] = useState(value?.toString() ?? "0")
    const prevValue = useRef(value)

    // Sync from store when value changes externally
    useEffect(() => {
        if (value !== prevValue.current) {
            setLocal(value?.toString() ?? "0")
            prevValue.current = value
        }
    }, [value])

    const handleBlur = () => {
        if (local !== value?.toString()) {
            onChange(local)
        }
    }

    return (
        <td className={cn("px-1 py-0.5 w-16", className)}>
            <input
                className="w-full bg-transparent outline-none text-right text-[10px] font-mono tabular-nums px-1 py-0.5 rounded hover:ring-1 hover:ring-primary/30 focus:ring-1 focus:ring-primary/50 transition-all"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
            />
        </td>
    )
}

/** Editable text cell */
function EditTextCell({ value, onChange, className }: {
    value: string
    onChange: (val: string) => void
    className?: string
}) {
    const [local, setLocal] = useState(value)

    useEffect(() => { setLocal(value) }, [value])

    const handleBlur = () => {
        if (local !== value) onChange(local)
    }

    return (
        <td className={cn("px-1 py-0.5 w-20", className)}>
            <input
                className="w-full bg-transparent outline-none text-[10px] font-mono px-1 py-0.5 rounded hover:ring-1 hover:ring-primary/30 focus:ring-1 focus:ring-primary/50 transition-all"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={handleBlur}
                onClick={(e) => e.stopPropagation()}
            />
        </td>
    )
}
