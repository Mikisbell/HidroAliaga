"use client"

import { memo, useMemo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"
import { JunctionData } from "@/types/models"

/**
 * Junction Node — Simple circle, 4 connection points touching the circle edge.
 * The root div size MUST equal the circle size so React Flow handles align.
 */
const CIRCLE_SIZE = 28

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

    const borderCls = hasError ? "border-red-500" : hasWarning ? "border-amber-500" : "border-emerald-500"

    return (
        <>
            {/* ROOT = circle itself, no wrapper. React Flow sizes from this. */}
            <div
                className={cn(
                    "rounded-full border-[2.5px] flex items-center justify-center transition-all shadow-sm group",
                    selected
                        ? `${borderCls} ring-2 ring-emerald-300/50 shadow-md bg-emerald-50 dark:bg-emerald-950/30`
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

                {/* 4 Handles — React Flow positions them at edge of this div */}
                <Handle type="target" position={Position.Top} id="top"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Right} id="right"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Bottom} id="bottom"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="target" position={Position.Left} id="left"
                    className="!w-2 !h-2 !bg-emerald-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
            </div>

            {/* Cota badge — OUTSIDE the root div, won't affect dimensions */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <div className="absolute pointer-events-none whitespace-nowrap"
                    style={{ left: CIRCLE_SIZE + 4, top: CIRCLE_SIZE / 2 - 6 }}>
                    <span className="text-[8px] font-mono text-gray-500 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                        {data.cota_terreno}m
                    </span>
                </div>
            )}

            {/* Pressure result */}
            {result && (
                <div className="absolute pointer-events-none whitespace-nowrap"
                    style={{ left: CIRCLE_SIZE / 2 - 15, top: CIRCLE_SIZE + 2 }}>
                    <span className="text-[8px] font-mono text-blue-600 bg-white/90 dark:bg-gray-900/90 px-1 py-0.5 rounded border shadow-sm">
                        {result.pressure.toFixed(1)}m
                    </span>
                </div>
            )}
        </>
    )
}

export default memo(JunctionNode)
