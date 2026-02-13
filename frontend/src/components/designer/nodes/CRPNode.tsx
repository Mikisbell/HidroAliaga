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

const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData
    const label = data.codigo || id.substring(0, 1)

    return (
        <div
            className={cn(
                "relative group cursor-pointer overflow-visible",
                selected && "scale-110"
            )}
            title={data.nombre || `CRP ${data.crp_type || ''}`}
            /* Exact size matches the diamond SVG */
            style={{ width: 40, height: 40 }}
        >
            {/* Diamond SVG — fills the container exactly */}
            <svg
                width="40" height="40" viewBox="0 0 40 40"
                className={cn(
                    "absolute inset-0 drop-shadow-md transition-all",
                    selected && "drop-shadow-lg"
                )}
            >
                <path
                    d="M20 3 L37 20 L20 37 L3 20 Z"
                    className={cn(
                        "transition-all",
                        selected
                            ? "fill-amber-100 stroke-amber-600 dark:fill-amber-900/30"
                            : "fill-amber-50 stroke-amber-500 group-hover:stroke-amber-600 dark:fill-amber-950/20"
                    )}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                <text
                    x="20" y="21"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={cn(
                        "select-none pointer-events-none font-bold",
                        selected ? "fill-amber-800" : "fill-amber-700"
                    )}
                    fontSize="9"
                    fontFamily="system-ui, sans-serif"
                >
                    {label}
                </text>
            </svg>

            {/* Type badge */}
            {data.crp_type && (
                <span className="absolute -left-4 top-1 text-[7px] font-mono font-bold text-amber-600 bg-amber-100/90 px-0.5 rounded pointer-events-none border border-amber-300/50 whitespace-nowrap">
                    {data.crp_type}
                </span>
            )}

            {/* Cota badge */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-[8px] font-mono text-amber-600 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded pointer-events-none border border-amber-200 shadow-sm whitespace-nowrap">
                    {data.cota_terreno}m
                </span>
            )}

            {/* 2 Handles at the diamond vertices — IN (top tip), OUT (bottom tip) */}
            <Handle type="target" position={Position.Top} id="in"
                className="!w-2.5 !h-2.5 !bg-amber-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Bottom} id="out"
                className="!w-2.5 !h-2.5 !bg-amber-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0" />
        </div>
    )
}

export default memo(CRPNode)
