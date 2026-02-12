"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

interface ReservoirData extends Record<string, unknown> {
    label?: string;
    nombre?: string;
    codigo?: string;
    cota_terreno?: number;
    altura_agua?: number;
}

const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData;
    const label = data.codigo || data.label || "R"

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-sm border-2 bg-background transition-all shadow-sm group",
                selected
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200 shadow-md scale-110"
                    : "border-blue-500 hover:border-blue-600 hover:shadow-md"
            )}
            title={data.nombre || "Reservorio"}
        >
            {/* Centered Label */}
            <span className={cn(
                "text-[12px] font-bold select-none pointer-events-none text-blue-700",
                selected ? "text-blue-800" : "text-blue-600"
            )}>
                {label}
            </span>

            {/* Ports - Invisible but functional */}
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full !bg-transparent border-0" />
        </div>
    )
}

export default memo(ReservoirNode)
