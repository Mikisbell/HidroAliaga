"use client"

import { memo, useMemo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { JunctionData } from "@/types/models"

const JunctionNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as JunctionData
    const label = data.codigo || data.label || id.substring(0, 1)

    const simulationResults = useProjectStore(state => state.simulationResults)
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)

    const result = useMemo(() => {
        if (!simulationResults?.nodeResults) return null
        return simulationResults.nodeResults[id] || simulationResults.nodeResults[data.codigo || '']
    }, [simulationResults, id, data.codigo])

    const hasError = useMemo(() => {
        if (!simulationAlerts?.length) return false
        return simulationAlerts.some(a => a.elementId === id && a.level === 'error')
    }, [simulationAlerts, id])

    const hasWarning = useMemo(() => {
        if (!simulationAlerts?.length) return false
        return simulationAlerts.some(a => a.elementId === id && a.level === 'warning')
    }, [simulationAlerts, id])

    const borderColor = hasError ? "border-red-500" : hasWarning ? "border-amber-500" : "border-emerald-500"

    return (
        <div
            className={cn(
                "relative flex items-center justify-center group cursor-pointer",
                selected && "scale-110"
            )}
        >
            {/* Circle with LABEL CENTERED inside */}
            <div className={cn(
                "w-10 h-10 rounded-full border-[2.5px] flex items-center justify-center transition-all shadow-sm",
                selected
                    ? `${borderColor} ring-2 ring-emerald-300/50 shadow-md bg-emerald-50 dark:bg-emerald-950/30`
                    : `${borderColor} bg-white dark:bg-gray-900 hover:shadow-md`
            )}>
                <span className={cn(
                    "text-[10px] font-bold select-none pointer-events-none leading-none text-center",
                    selected ? "text-emerald-800" : "text-emerald-700 dark:text-emerald-400",
                    hasError && "text-red-700",
                    hasWarning && "text-amber-700"
                )}>
                    {label}
                </span>
            </div>

            {/* Cota badge */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-7 top-1/2 -translate-y-1/2 text-[8px] font-mono text-gray-500 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded border border-gray-200 dark:border-gray-700 pointer-events-none shadow-sm">
                    {data.cota_terreno}m
                </span>
            )}

            {/* Pressure result */}
            {result && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-blue-600 bg-white/90 dark:bg-gray-900/90 px-1 py-0.5 rounded border shadow-sm pointer-events-none whitespace-nowrap z-20">
                    {result.pressure.toFixed(1)}m
                </div>
            )}

            {selected && (
                <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/30 pointer-events-none" />
            )}

            {/* 4 Handles — T, R, B, L */}
            <Handle type="target" position={Position.Top} id="top"
                className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Right} id="right"
                className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Bottom} id="bottom"
                className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0" />
            <Handle type="target" position={Position.Left} id="left"
                className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0" />
        </div>
    )
}

export default memo(JunctionNode)
