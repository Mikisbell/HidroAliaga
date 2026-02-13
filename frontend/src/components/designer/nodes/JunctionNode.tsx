"use client"

import { memo, useMemo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { JunctionData } from "@/types/models"

const JunctionNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as JunctionData
    const label = data.codigo || data.label || id.substring(0, 1)

    // Simulation Results & Alerts
    const simulationResults = useProjectStore(state => state.simulationResults)
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)

    const result = useMemo(() => {
        if (!simulationResults || !simulationResults.nodeResults) return null
        return simulationResults.nodeResults[id] || simulationResults.nodeResults[data.codigo || '']
    }, [simulationResults, id, data.codigo])

    const statusColor = useMemo(() => {
        if (!simulationAlerts || simulationAlerts.length === 0) return "emerald"
        const myAlerts = simulationAlerts.filter(a => a.elementId === id)
        if (myAlerts.some(a => a.level === 'error')) return "red"
        if (myAlerts.some(a => a.level === 'warning')) return "amber"
        return "emerald"
    }, [simulationAlerts, id])

    const colorMap: Record<string, { ring: string, fill: string, dot: string, text: string, bg: string }> = {
        emerald: {
            ring: "ring-emerald-400/50",
            fill: "fill-emerald-500",
            dot: "bg-emerald-500",
            text: "text-emerald-800",
            bg: "bg-emerald-50/80",
        },
        red: {
            ring: "ring-red-400/50",
            fill: "fill-red-500",
            dot: "bg-red-500 animate-pulse",
            text: "text-red-800",
            bg: "bg-red-50/80",
        },
        amber: {
            ring: "ring-amber-400/50",
            fill: "fill-amber-500",
            dot: "bg-amber-500",
            text: "text-amber-800",
            bg: "bg-amber-50/80",
        },
    }
    const colors = colorMap[statusColor]

    return (
        <div
            className={cn(
                "relative flex flex-col items-center group cursor-pointer",
                selected && "scale-110"
            )}
            title={data.nombre as string || "Nudo"}
        >
            {/* SVG Junction Symbol - Dot with cross */}
            <svg width="28" height="28" viewBox="0 0 28 28"
                className={cn(
                    "drop-shadow-sm transition-all",
                    selected && "drop-shadow-md"
                )}
            >
                {/* Outer ring */}
                <circle cx="14" cy="14" r="12"
                    className={cn(
                        "transition-all",
                        selected
                            ? "fill-emerald-100 stroke-emerald-600"
                            : `fill-white stroke-emerald-500 group-hover:stroke-emerald-600`
                    )}
                    strokeWidth="2"
                />
                {/* Inner solid dot */}
                <circle cx="14" cy="14" r="5"
                    className={cn("transition-all", colors.fill)}
                />
                {/* Connection cross */}
                <line x1="14" y1="2" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
                <line x1="14" y1="21" x2="14" y2="26" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
                <line x1="2" y1="14" x2="7" y2="14" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
                <line x1="21" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
            </svg>

            {/* Label below */}
            <span className={cn(
                "text-[9px] font-bold select-none mt-0.5 px-1 rounded whitespace-nowrap",
                selected ? `${colors.text} ${colors.bg}` : "text-emerald-700 bg-white/60 group-hover:bg-emerald-50/80"
            )}>
                {label}
            </span>

            {/* Selection ring */}
            {selected && (
                <div className={cn("absolute -inset-1 rounded-full border-2 border-emerald-500/40 pointer-events-none", statusColor === 'red' && "border-red-500/40 animate-pulse")} />
            )}

            {/* Pressure result tooltip */}
            {result && (
                <div className="absolute -bottom-5 bg-white/90 dark:bg-gray-900/90 px-1.5 py-0.5 rounded-md border text-[9px] font-mono shadow-sm whitespace-nowrap z-20 pointer-events-none">
                    💧 {result.pressure.toFixed(1)} m
                </div>
            )}

            {/* Cota indicator */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-4 -top-1 text-[8px] font-mono text-emerald-600 bg-white/80 px-0.5 rounded pointer-events-none">
                    {data.cota_terreno}m
                </span>
            )}

            {/* Ports */}
            <Handle type="target" position={Position.Top}
                className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity !-top-1" />
            <Handle type="source" position={Position.Bottom}
                className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity !-bottom-1" />
        </div>
    )
}

export default memo(JunctionNode)
