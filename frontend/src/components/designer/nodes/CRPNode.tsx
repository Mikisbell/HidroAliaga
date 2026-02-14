"use client"

import { memo, useMemo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { useProjectStore } from "@/store/project-store"

interface CRPData extends Record<string, unknown> {
    cota_terreno?: number
    codigo?: string
    nombre?: string
    crp_type?: 'T6' | 'T7'
    tipo?: string
}

/**
 * CRPNode — N8N-inspired diamond card with inline data.
 * Shows: code, tipo badge, cota, validation status.
 */
const SIZE = 36

const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData
    const label = data.codigo || id.substring(0, 3)

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
    const statusColor = hasError ? 'bg-red-500' : hasWarning ? 'bg-amber-500' : hasResults ? 'bg-emerald-500' : 'bg-gray-300'

    return (
        <>
            <div
                className="group relative"
                style={{ width: SIZE, height: SIZE }}
                title={data.nombre || `CRP ${data.crp_type || ''}`}
            >
                {/* Type badge — above node */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                    <span className={cn(
                        "text-[6px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full whitespace-nowrap",
                        selected
                            ? "bg-amber-600 text-white"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                    )}>
                        CRP
                    </span>
                </div>

                {/* Diamond = rotated square */}
                <div
                    className={cn(
                        "absolute border-[2.5px] flex items-center justify-center transition-all",
                        selected
                            ? "border-amber-600 bg-amber-100 dark:bg-amber-900/30 shadow-lg"
                            : "border-amber-500 bg-amber-50 dark:bg-amber-950/20 hover:border-amber-600 hover:shadow-md shadow-sm"
                    )}
                    style={{
                        width: SIZE * 0.72,
                        height: SIZE * 0.72,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        borderRadius: 3,
                    }}
                />
                {/* Label (not rotated) */}
                <span className={cn(
                    "absolute inset-0 flex items-center justify-center text-[9px] font-bold select-none pointer-events-none leading-none z-10",
                    selected ? "text-amber-800" : "text-amber-700"
                )}>
                    {label}
                </span>

                {/* Validation status dot */}
                <div className={cn(
                    "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm transition-colors z-20",
                    statusColor
                )} />

                {/* 4 Handles */}
                <Handle type="target" position={Position.Top} id="top"
                    className="!w-2 !h-2 !bg-amber-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Right} id="right"
                    className="!w-2 !h-2 !bg-amber-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Bottom} id="bottom"
                    className="!w-2 !h-2 !bg-amber-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="target" position={Position.Left} id="left"
                    className="!w-2 !h-2 !bg-amber-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
            </div>

            {/* Inline data badge — below node */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <div className="absolute pointer-events-none whitespace-nowrap"
                    style={{ left: -2, top: SIZE + 2 }}>
                    <span className="text-[7px] font-mono text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-1 rounded">
                        ▲{data.cota_terreno}
                    </span>
                </div>
            )}
        </>
    )
}

export default memo(CRPNode)
