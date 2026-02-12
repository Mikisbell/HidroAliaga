"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

interface CRPData extends Record<string, unknown> {
    cota_terreno?: number;
    codigo?: string;
    nombre?: string;
    crp_type?: 'T6' | 'T7';
}

const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData;
    const label = data.codigo || id.substring(0, 1)

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-md border-2 bg-background transition-all shadow-sm group",
                selected
                    ? "border-orange-600 bg-orange-50 ring-2 ring-orange-200 shadow-md scale-110"
                    : "border-orange-500 hover:border-orange-600 hover:shadow-md"
            )}
            title={data.nombre || `CRP ${data.crp_type || ''}`}
        >
            {/* Centered Label */}
            <span className={cn(
                "text-[10px] font-bold select-none pointer-events-none uppercase",
                selected ? "text-orange-800" : "text-orange-700"
            )}>
                {label}
            </span>

            {/* Ports - Invisible but functional */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full !bg-transparent border-0 rounded-none" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full !bg-transparent border-0 rounded-none" />
        </div>
    )
}

export default memo(CRPNode)
