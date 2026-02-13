"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

interface CRPData extends Record<string, unknown> {
    cota_terreno?: number
    codigo?: string
    nombre?: string
    crp_type?: 'T6' | 'T7'
}

/**
 * CRP — Diamond shape. Root = exact diamond bounding box.
 * Handles at top/bottom = diamond tips.
 */
const SIZE = 30

const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData
    const label = data.codigo || id.substring(0, 1)

    return (
        <>
            <div
                className="group"
                style={{ width: SIZE, height: SIZE }}
                title={data.nombre || `CRP ${data.crp_type || ''}`}
            >
                {/* Diamond = rotated square, fills the entire div */}
                <div
                    className={cn(
                        "absolute border-[2.5px] flex items-center justify-center transition-all shadow-sm",
                        selected
                            ? "border-amber-600 bg-amber-100 dark:bg-amber-900/30 shadow-md"
                            : "border-amber-500 bg-amber-50 dark:bg-amber-950/20 hover:border-amber-600 hover:shadow-md"
                    )}
                    style={{
                        width: SIZE * 0.72,
                        height: SIZE * 0.72,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                    }}
                />
                {/* Label (not rotated) */}
                <span className={cn(
                    "absolute inset-0 flex items-center justify-center text-[8px] font-bold select-none pointer-events-none leading-none uppercase z-10",
                    selected ? "text-amber-800" : "text-amber-700"
                )}>
                    {label}
                </span>

                {/* 2 Handles — top (IN) and bottom (OUT), at diamond tips */}
                <Handle type="target" position={Position.Top} id="in"
                    className="!w-2 !h-2 !bg-amber-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
                <Handle type="source" position={Position.Bottom} id="out"
                    className="!w-2 !h-2 !bg-amber-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
            </div>

            {/* Cota badge outside */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <div className="absolute pointer-events-none whitespace-nowrap"
                    style={{ left: SIZE + 1, top: SIZE / 2 - 5 }}>
                    <span className="text-[7px] font-mono text-amber-600">
                        {data.cota_terreno}
                    </span>
                </div>
            )}
        </>
    )
}

export default memo(CRPNode)
