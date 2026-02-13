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

const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData
    const label = data.codigo || data.label || "R"

    return (
        <div
            className={cn(
                "relative flex items-center justify-center group cursor-pointer",
                selected && "scale-110"
            )}
            title={data.nombre || "Reservorio"}
        >
            {/* SVG Tank with LABEL CENTERED inside */}
            <svg width="48" height="40" viewBox="0 0 48 40"
                className={cn("drop-shadow-md transition-all", selected && "drop-shadow-lg")}
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
                <rect x="10" y="20" width="28" height="12" rx="1"
                    className={cn(
                        "transition-all",
                        selected ? "fill-blue-400/40" : "fill-blue-400/25 group-hover:fill-blue-400/35"
                    )}
                />
                {/* Water surface wave */}
                <path
                    d="M10 20 Q14.5 17.5, 19 20 Q23.5 22.5, 28 20 Q32.5 17.5, 38 20"
                    fill="none"
                    className={cn(selected ? "stroke-blue-500" : "stroke-blue-400")}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                {/* Top rim */}
                <line x1="5" y1="6" x2="43" y2="6"
                    className={cn(selected ? "stroke-blue-700" : "stroke-blue-600")}
                    strokeWidth="3" strokeLinecap="round"
                />
                {/* Centered label text */}
                <text
                    x="24" y="18"
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

            {/* Cota badge */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-7 top-1/2 -translate-y-1/2 text-[8px] font-mono text-blue-600 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded pointer-events-none border border-blue-200 shadow-sm">
                    {data.cota_terreno}m
                </span>
            )}

            {selected && (
                <div className="absolute -inset-1 rounded-lg border-2 border-blue-400/40 pointer-events-none" />
            )}

            {/* 1 Handle — SOURCE only (bottom, water out) */}
            <Handle type="source" position={Position.Bottom} id="out"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity !min-w-0 !min-h-0 !-bottom-1.5" />
        </div>
    )
}

export default memo(ReservoirNode)
