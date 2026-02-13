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
                "relative flex flex-col items-center group cursor-pointer",
                selected && "scale-110"
            )}
            title={data.nombre || "Reservorio"}
        >
            {/* SVG Reservoir Symbol */}
            <svg
                width="44" height="36" viewBox="0 0 44 36"
                className={cn(
                    "drop-shadow-md transition-all",
                    selected && "drop-shadow-lg"
                )}
            >
                {/* Tank body (trapezoid) */}
                <path
                    d="M6 4 L38 4 L35 32 L9 32 Z"
                    className={cn(
                        "transition-all",
                        selected
                            ? "fill-blue-100 stroke-blue-600"
                            : "fill-blue-50 stroke-blue-500 group-hover:stroke-blue-600"
                    )}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                {/* Water level */}
                <path
                    d="M10.5 16 L33.5 16 L33 28 L10 28 Z"
                    className={cn(
                        "transition-all",
                        selected ? "fill-blue-400/60" : "fill-blue-400/40 group-hover:fill-blue-400/50"
                    )}
                />
                {/* Water surface waves */}
                <path
                    d="M11 16 Q14 14, 17 16 Q20 18, 23 16 Q26 14, 29 16 Q32 18, 33 16"
                    fill="none"
                    className={cn(
                        "transition-all",
                        selected ? "stroke-blue-500" : "stroke-blue-400"
                    )}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                {/* Top rim */}
                <line x1="4" y1="4" x2="40" y2="4"
                    className={cn(selected ? "stroke-blue-700" : "stroke-blue-600")}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>

            {/* Label below */}
            <span className={cn(
                "text-[10px] font-bold select-none mt-0.5 px-1 rounded",
                selected
                    ? "text-blue-800 bg-blue-100/80"
                    : "text-blue-700 bg-white/60 group-hover:bg-blue-50/80"
            )}>
                {label}
            </span>

            {/* Selection ring */}
            {selected && (
                <div className="absolute -inset-1 rounded-lg border-2 border-blue-500/40 animate-pulse pointer-events-none" />
            )}

            {/* Cota indicator */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-3 top-0 text-[8px] font-mono text-blue-500 bg-white/80 px-0.5 rounded pointer-events-none">
                    {data.cota_terreno}m
                </span>
            )}

            {/* Port — Source only (water flows out) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity !-bottom-1.5"
            />
        </div>
    )
}

export default memo(ReservoirNode)
