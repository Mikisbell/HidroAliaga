"use client"

import { memo, useMemo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { JunctionData } from "@/types/models"

/**
 * JunctionNode — N8N-inspired circle card with inline data.
 * Shows: code, tipo badge, cota, pressure result, validation status.
 */
const CIRCLE_SIZE = 32

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

    const hasResults = !!simulationResults

    const borderCls = hasError ? "border-red-500" : hasWarning ? "border-amber-500" : "border-emerald-500"
    const statusColor = hasError ? 'bg-red-500' : hasWarning ? 'bg-amber-500' : hasResults ? 'bg-emerald-500' : 'bg-gray-300'

    return (
        <>
            {/* Type badge — above node */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                <span className={cn(
                    "text-[6px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full whitespace-nowrap",
                    selected
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                )}>
                    Nudo
                </span>
            </div>

            {/* ROOT = circle */}
            <div
                className={cn(
                    "rounded-full border-[2.5px] flex items-center justify-center transition-all shadow-sm group",
                    selected
                        ? `${borderCls} ring-2 ring-emerald-300/50 shadow-lg bg-emerald-50 dark:bg-emerald-950/30`
                        : `${borderCls} bg-white dark:bg-gray-900 hover:shadow-md`
                )}
                style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
            >
                <span className={cn(
                    "text-[9px] font-bold select-none pointer-events-none leading-none",
                    selected ? "text-emerald-800" : "text-emerald-700 dark:text-emerald-400",
                    hasError && "text-red-700", hasWarning && "text-amber-700"
                )}>
                    {label}
                </span>

                {/* 4 Handles */}
                <Handle type="target" position={Position.Top} id="top"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Right} id="right"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Bottom} id="bottom"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="target" position={Position.Left} id="left"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
            </div>

            {/* Validation status dot */}
            <div className={cn(
                "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm transition-colors z-20",
                statusColor
            )} />

            {/* Inline data badges — below node */}
            <div className="absolute pointer-events-none whitespace-nowrap flex gap-1"
                style={{ left: -8, top: CIRCLE_SIZE + 2 }}>
                {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                    <span className="text-[7px] font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded">
                        ▲{data.cota_terreno}
                    </span>
                )}
                {result && (
                    <span className={cn(
                        "text-[7px] font-mono px-1 rounded border shadow-sm",
                        hasError ? "text-red-700 bg-red-50 border-red-200" :
                            hasWarning ? "text-amber-700 bg-amber-50 border-amber-200" :
                                "text-blue-700 bg-blue-50 border-blue-200"
                    )}>
                        {result.pressure.toFixed(1)}m
                    </span>
                )}
            </div>
        </>
    )
}

export default memo(JunctionNode)
