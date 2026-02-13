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
 * CRP (Cámara Rompe Presión) — Diamond shape with 2 connection points (IN top, OUT bottom)
 */
const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData
    const label = data.codigo || id.substring(0, 1)

    return (
        <div
            className={cn(
                "relative flex flex-col items-center group cursor-pointer",
                selected && "scale-110"
            )}
            title={data.nombre || `CRP ${data.crp_type || ''}`}
        >
            {/* Diamond SVG with pressure break symbol */}
            <svg width="34" height="34" viewBox="0 0 34 34"
                className={cn(
                    "drop-shadow-md transition-all",
                    selected && "drop-shadow-lg"
                )}
            >
                {/* Diamond body */}
                <path
                    d="M17 2 L32 17 L17 32 L2 17 Z"
                    className={cn(
                        "transition-all",
                        selected
                            ? "fill-amber-100 stroke-amber-600 dark:fill-amber-900/30"
                            : "fill-amber-50 stroke-amber-500 group-hover:stroke-amber-600 dark:fill-amber-950/20"
                    )}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                {/* Zigzag pressure break */}
                <path
                    d="M11 17 L14 13 L17 21 L20 13 L23 17"
                    fill="none"
                    className={cn(selected ? "stroke-amber-700" : "stroke-amber-600")}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Label */}
            <span className={cn(
                "text-[9px] font-bold select-none mt-0.5 px-1 rounded uppercase whitespace-nowrap pointer-events-none",
                selected
                    ? "text-amber-800 bg-amber-100/80"
                    : "text-amber-700 bg-white/70 dark:bg-gray-900/70 group-hover:bg-amber-50/80"
            )}>
                {label}
            </span>

            {/* Type badge */}
            {data.crp_type && (
                <span className="absolute -left-3 top-1 text-[7px] font-mono font-bold text-amber-600 bg-amber-100/90 px-0.5 rounded pointer-events-none border border-amber-300/50">
                    {data.crp_type}
                </span>
            )}

            {/* Cota badge */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-5 top-1 text-[8px] font-mono text-amber-600 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded pointer-events-none border border-amber-200 shadow-sm">
                    {data.cota_terreno}m
                </span>
            )}

            {selected && (
                <div className="absolute -inset-1 rounded-lg border-2 border-amber-400/40 pointer-events-none" />
            )}

            {/* 2 Connection Handles — IN (top) and OUT (bottom) only */}
            <Handle type="target" position={Position.Top} id="in"
                className="!w-2.5 !h-2.5 !bg-amber-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0 !-top-1" />
            <Handle type="source" position={Position.Bottom} id="out"
                className="!w-2.5 !h-2.5 !bg-amber-500 !border-[1.5px] !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0 !-bottom-1" />
        </div>
    )
}

export default memo(CRPNode)
