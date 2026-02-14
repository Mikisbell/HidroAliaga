"use client"

import { memo, useMemo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"

interface ReservoirData extends Record<string, unknown> {
    label?: string
    nombre?: string
    codigo?: string
    cota_terreno?: number
    altura_agua?: number
    tipo?: string
}

/**
 * ReservoirNode — N8N-inspired card with inline data.
 * Shows: code, tipo badge, cota, altura agua, validation status.
 */
const W = 56
const H = 44

const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData
    const label = data.codigo || data.label || "R"

    // Validation from store
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)
    const simulationResults = useProjectStore(state => state.simulationResults)

    const hasError = useMemo(() => {
        if (!simulationAlerts?.length) return false
        return simulationAlerts.some(a => a.elementId === id && a.level === 'error')
    }, [simulationAlerts, id])

    const hasWarning = useMemo(() => {
        if (!simulationAlerts?.length) return false
        return simulationAlerts.some(a => a.elementId === id && a.level === 'warning')
    }, [simulationAlerts, id])

    const hasResults = !!simulationResults

    // Status dot color
    const statusColor = hasError ? 'bg-red-500' : hasWarning ? 'bg-amber-500' : hasResults ? 'bg-emerald-500' : 'bg-gray-300'

    return (
        <>
            <div
                className="group relative"
                style={{ width: W, height: H }}
                title={data.nombre || "Reservorio"}
            >
                {/* Type badge — above node */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                    <span className={cn(
                        "text-[6px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full whitespace-nowrap",
                        selected
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                    )}>
                        Res
                    </span>
                </div>

                {/* Main SVG Tank */}
                <svg
                    width={W} height={H} viewBox={`0 0 ${W} ${H}`}
                    className={cn("drop-shadow-sm transition-all", selected && "drop-shadow-lg")}
                >
                    {/* Tank body */}
                    <rect x="2" y="2" width={W - 4} height={H - 4} rx="4"
                        className={cn(
                            "transition-all",
                            selected
                                ? "fill-blue-100 stroke-blue-600 dark:fill-blue-900/30"
                                : "fill-blue-50 stroke-blue-500 group-hover:stroke-blue-600 dark:fill-blue-950/20"
                        )}
                        strokeWidth="2.5"
                    />
                    {/* Water fill — bottom 40% */}
                    <rect x="4" y={H * 0.55} width={W - 8} height={H * 0.45 - 4} rx="2"
                        className={cn(
                            selected ? "fill-blue-400/50" : "fill-blue-400/25 group-hover:fill-blue-400/35"
                        )}
                    />
                    {/* Water wave */}
                    <path
                        d={`M4 ${H * 0.55} Q${W * 0.3} ${H * 0.55 - 3}, ${W * 0.5} ${H * 0.55} Q${W * 0.7} ${H * 0.55 + 3}, ${W - 4} ${H * 0.55}`}
                        fill="none"
                        className={cn(selected ? "stroke-blue-500" : "stroke-blue-400/70")}
                        strokeWidth="1" strokeLinecap="round"
                    />
                    {/* Top rim */}
                    <line x1="1" y1="2" x2={W - 1} y2="2"
                        className={cn(selected ? "stroke-blue-700" : "stroke-blue-600")}
                        strokeWidth="3" strokeLinecap="round"
                    />
                    {/* Code label CENTERED */}
                    <text
                        x={W / 2} y={H * 0.35}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={cn(
                            "select-none pointer-events-none font-bold",
                            selected ? "fill-blue-800" : "fill-blue-700"
                        )}
                        fontSize="11"
                        fontFamily="system-ui, sans-serif"
                    >
                        {label}
                    </text>
                </svg>

                {/* Validation status dot — top right */}
                <div className={cn(
                    "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm transition-colors",
                    statusColor
                )} />

                {/* Handles — 4 connection points */}
                <Handle type="source" position={Position.Bottom} id="bottom"
                    className="!w-2.5 !h-2.5 !bg-blue-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Right} id="right"
                    className="!w-2.5 !h-2.5 !bg-blue-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="target" position={Position.Top} id="top"
                    className="!w-2.5 !h-2.5 !bg-blue-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="target" position={Position.Left} id="left"
                    className="!w-2.5 !h-2.5 !bg-blue-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
            </div>

            {/* Inline data badges — below node */}
            <div className="absolute pointer-events-none whitespace-nowrap flex gap-1"
                style={{ left: -4, top: H + 2 }}>
                {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                    <span className="text-[7px] font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1 rounded">
                        ▲{data.cota_terreno}
                    </span>
                )}
                {data.altura_agua !== undefined && data.altura_agua !== 0 && (
                    <span className="text-[7px] font-mono text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 px-1 rounded">
                        💧{data.altura_agua}
                    </span>
                )}
            </div>
        </>
    )
}

export default memo(ReservoirNode)
