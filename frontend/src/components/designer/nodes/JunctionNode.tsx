import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { updateNudo } from "@/app/actions/nudos";

interface JunctionData extends Record<string, unknown> {
    label?: string;
    cota_terreno?: number;
    numero_viviendas?: number;
    demanda_base?: number;
}

"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface JunctionData extends Record<string, unknown> {
    label?: string;
    nombre?: string;
    codigo?: string;
}

const JunctionNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as JunctionData;
    const label = data.codigo || data.label || id.substring(0, 1)

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background transition-all shadow-sm group",
                selected
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200 shadow-md scale-110"
                    : "border-emerald-500 hover:border-emerald-600 hover:shadow-md"
            )}
            title={data.nombre as string || "Nudo"}
        >
            {/* Centered Label */}
            <span className={cn(
                "text-[10px] font-bold select-none pointer-events-none",
                selected ? "text-emerald-700" : "text-emerald-600"
            )}>
                {label}
            </span>

            {/* Ports - Invisible but functional */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full !bg-transparent border-0 rounded-full" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full !bg-transparent border-0 rounded-full" />

            {/* Selection Indicator (optional, maybe a small dot or glow) is handled by border/ring above */}
        </div>
    );
};

export default memo(JunctionNode);

export default memo(JunctionNode);
