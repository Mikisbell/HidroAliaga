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
 * Reservoir — Tank icon. ROOT = tight SVG bounding box.
 * Only 1 handle (SOURCE at bottom). SVG fills edge-to-edge.
 */
const W = 36
const H = 30

const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData
    const label = data.codigo || data.label || "R"

    return (
        <>
            <div
                className="group"
                style={{ width: W, height: H }}
                title={data.nombre || "Reservorio"}
            >
                {/* SVG fills 100% — NO internal padding */}
                <svg
                    width={W} height={H} viewBox={`0 0 ${W} ${H}`}
                    className={cn("drop-shadow-sm transition-all", selected && "drop-shadow-md")}
                >
                    {/* Tank body — edge to edge */}
                    <rect x="1" y="1" width={W - 2} height={H - 2} rx="2"
                        className={cn(
                            "transition-all",
                            selected
                                ? "fill-blue-100 stroke-blue-600 dark:fill-blue-900/30"
                                : "fill-blue-50 stroke-blue-500 group-hover:stroke-blue-600 dark:fill-blue-950/20"
                        )}
                        strokeWidth="2"
                    />
                    {/* Water fill — bottom half */}
                    <rect x="3" y={H * 0.5} width={W - 6} height={H * 0.5 - 3} rx="1"
                        className={cn(
                            selected ? "fill-blue-400/50" : "fill-blue-400/30 group-hover:fill-blue-400/40"
                        )}
                    />
                    {/* Water wave */}
                    <path
                        d={`M3 ${H * 0.5} Q${W * 0.25} ${H * 0.5 - 3}, ${W * 0.5} ${H * 0.5} Q${W * 0.75} ${H * 0.5 + 3}, ${W - 3} ${H * 0.5}`}
                        fill="none"
                        className={cn(selected ? "stroke-blue-500" : "stroke-blue-400")}
                        strokeWidth="1.2" strokeLinecap="round"
                    />
                    {/* Top rim */}
                    <line x1="0" y1="1" x2={W} y2="1"
                        className={cn(selected ? "stroke-blue-700" : "stroke-blue-600")}
                        strokeWidth="2.5" strokeLinecap="round"
                    />
                    {/* Label CENTERED */}
                    <text
                        x={W / 2} y={H * 0.38}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={cn(
                            "select-none pointer-events-none font-bold",
                            selected ? "fill-blue-800" : "fill-blue-700"
                        )}
                        fontSize="10"
                        fontFamily="system-ui, sans-serif"
                    >
                        {label}
                    </text>
                </svg>

                {/* 1 Handle — SOURCE at bottom center */}
                <Handle type="source" position={Position.Bottom} id="out"
                    className="!w-2.5 !h-2.5 !bg-blue-500 !border-[1.5px] !border-white !rounded-full !min-w-0 !min-h-0" />
            </div>

            {/* Cota badge outside */}
            {data.cota_terreno !== undefined && data.cota_terreno !== 0 && (
                <div className="absolute pointer-events-none whitespace-nowrap"
                    style={{ left: W + 4, top: H / 2 - 6 }}>
                    <span className="text-[8px] font-mono text-blue-600 bg-white/90 dark:bg-gray-900/90 px-0.5 rounded border border-blue-200 shadow-sm">
                        {data.cota_terreno}m
                    </span>
                </div>
            )}
        </>
    )
}

export default memo(ReservoirNode)
