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
                "relative flex flex-col items-center group cursor-pointer",
                selected && "scale-110"
            )}
            title={data.nombre || `CRP ${data.crp_type || ''}`}
        >
            {/* SVG CRP Symbol - Diamond with pressure break arrows */}
            <svg width="36" height="36" viewBox="0 0 36 36"
                className={cn(
                    "drop-shadow-md transition-all",
                    selected && "drop-shadow-lg"
                )}
            >
                {/* Diamond shape */}
                <path
                    d="M18 2 L34 18 L18 34 L2 18 Z"
                    className={cn(
                        "transition-all",
                        selected
                            ? "fill-amber-100 stroke-amber-600"
                            : "fill-amber-50 stroke-amber-500 group-hover:stroke-amber-600"
                    )}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
                {/* Pressure break symbol - zigzag line */}
                <path
                    d="M11 18 L14 14 L18 22 L22 14 L25 18"
                    fill="none"
                    className={cn(
                        "transition-all",
                        selected ? "stroke-amber-700" : "stroke-amber-600"
                    )}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Down arrow (pressure drops) */}
                <path
                    d="M18 24 L15 21 M18 24 L21 21"
                    fill="none"
                    className={cn(selected ? "stroke-amber-600" : "stroke-amber-500")}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>

            {/* Label below */}
            <span className={cn(
                "text-[9px] font-bold select-none mt-0.5 px-1 rounded uppercase whitespace-nowrap",
                selected
                    ? "text-amber-800 bg-amber-100/80"
                    : "text-amber-700 bg-white/60 group-hover:bg-amber-50/80"
            )}>
                {label}
            </span>

            {/* Type badge */}
            {data.crp_type && (
                <span className="absolute -left-2 top-0 text-[7px] font-mono font-bold text-amber-600 bg-amber-100/90 px-0.5 rounded pointer-events-none border border-amber-300/50">
                    {data.crp_type}
                </span>
            )}

            {/* Cota indicator */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <span className="absolute -right-3 top-0 text-[8px] font-mono text-amber-600 bg-white/80 px-0.5 rounded pointer-events-none">
                    {data.cota_terreno}m
                </span>
            )}

            {/* Selection ring */}
            {selected && (
                <div className="absolute -inset-1 rounded-lg border-2 border-amber-500/40 animate-pulse pointer-events-none" />
            )}

            {/* Ports */}
            <Handle type="target" position={Position.Top}
                className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity !-top-1" />
            <Handle type="source" position={Position.Bottom}
                className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity !-bottom-1" />
        </div>
    )
}

export default memo(CRPNode)
