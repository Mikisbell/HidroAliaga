"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

interface ReservoirData extends Record<string, unknown> {
    label?: string
    nombre?: string
    codigo?: string
    cota_terreno?: number
    altura_agua?: number
    tipo?: string
}

/**
 * Reservoir Node — Tank icon with only 1 connection point (SOURCE/output at bottom)
 */
const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData
    const label = data.codigo || data.label || "R"

    return (
        <div
            className={cn(
                "relative flex flex-col items-center group cursor-pointer",
                selected && "scale-110"
            )}
            title={data.nombre || "Reservorio"}
        >
            {/* SVG Reservoir — engineering tank symbol */}
            <svg width="48" height="40" viewBox="0 0 48 40"
                className={cn(
                    "drop-shadow-md transition-all",
                    selected && "drop-shadow-lg"
                )}
            >
                {/* Tank body */}
                <rect x="8" y="6" width="32" height="28" rx="2"
                    className={cn(
                        "transition-all",
                        selected
                            ? "fill-blue-100 stroke-blue-600 dark:fill-blue-900/30"
                            : "fill-blue-50 stroke-blue-500 group-hover:stroke-blue-600 dark:fill-blue-950/20"
                    )}
                    strokeWidth="2.5"
                />
                {/* Water fill */}
                <rect x="10" y="18" width="28" height="14" rx="1"
                    className={cn(
                        "transition-all",
                        selected ? "fill-blue-400/50" : "fill-blue-400/35 group-hover:fill-blue-400/45"
                    )}
                />
                {/* Water surface wave */}
                <path
                    d="M10 18 Q14 15.5, 18 18 Q22 20.5, 26 18 Q30 15.5, 34 18 Q36 19.5, 38 18"
                    fill="none"
                    className={cn(selected ? "stroke-blue-500" : "stroke-blue-400")}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                {/* Top rim / cap */}
                <line x1="5" y1="6" x2="43" y2="6"
                    className={cn(selected ? "stroke-blue-700" : "stroke-blue-600")}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                {/* Vertical support left */}
                <line x1="8" y1="34" x2="8" y2="38"
                    className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
                {/* Vertical support right */}
                <line x1="40" y1="34" x2="40" y2="38"
                    className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
                {/* Base */}
                <line x1="4" y1="38" x2="44" y2="38"
                    className={cn(selected ? "stroke-blue-700" : "stroke-blue-600")}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>

            {/* Label */}
            <span className={cn(
                "text-[9px] font-bold select-none mt-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none",
                selected
                    ? "text-blue-800 bg-blue-100/80"
                    : "text-blue-700 bg-white/70 dark:bg-gray-900/70 group-hover:bg-blue-50/80"
            )}>
                {label}
            </span>

            {/* Cota badge */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-6 top-2 text-[8px] font-mono text-blue-600 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded pointer-events-none border border-blue-200 shadow-sm">
                    {data.cota_terreno}m
                </span>
            )}

            {/* Water level badge */}
            {data.altura_agua !== undefined && data.altura_agua !== 0 && (
                <span className="absolute -left-5 top-5 text-[7px] font-mono text-blue-500 bg-blue-50/90 px-0.5 rounded pointer-events-none border border-blue-200">
                    H:{data.altura_agua}m
                </span>
            )}

            {selected && (
                <div className="absolute -inset-1 rounded-lg border-2 border-blue-400/40 pointer-events-none" />
            )}

            {/* 1 Connection Handle — SOURCE only (bottom, water flows out) */}
            <Handle type="source" position={Position.Bottom} id="out"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0 !-bottom-1.5" />
        </div>
    )
}

export default memo(ReservoirNode)
