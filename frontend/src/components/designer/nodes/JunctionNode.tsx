import { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from "@/lib/utils";
import { useProjectStore } from '@/store/project-store';
import { JunctionData } from '@/types/models';

const JunctionNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as JunctionData;
    const label = data.codigo || data.label || id.substring(0, 1)

    // Simulation Results
    const simulationResults = useProjectStore(state => state.simulationResults);

    const result = useMemo(() => {
        if (!simulationResults || !simulationResults.nodeResults) return null;
        return simulationResults.nodeResults[id] || simulationResults.nodeResults[data.codigo || ''];
    }, [simulationResults, id, data.codigo]);

    // Pressure Color Coding
    const pressureColor = useMemo(() => {
        if (!result) return data.color || "bg-emerald-500";
        if (result.pressure < 10) return "bg-red-500 animate-pulse"; // Low Pressure Warning
        if (result.pressure > 50) return "bg-orange-500"; // High Pressure Warning
        return "bg-emerald-500"; // OK
    }, [result, data.color]);

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background transition-all shadow-sm group",
                selected
                    ? "border-emerald-600 ring-2 ring-emerald-200 shadow-md scale-110"
                    : `border-transparent hover:border-emerald-600 hover:shadow-md`,
                pressureColor === "bg-emerald-500" ? "border-emerald-500" : "border-transparent" // Default border
            )}
            title={data.nombre as string || "Nudo"}
        >
            {/* Status Indicator (Fill) */}
            <div className={cn(
                "absolute inset-0.5 rounded-full opacity-20",
                pressureColor
            )} />

            {/* Centered Label */}
            <span className={cn(
                "text-[10px] font-bold select-none pointer-events-none z-10",
                selected ? "text-emerald-700" : "text-emerald-600"
            )}>
                {label}
            </span>

            {/* Simulation Result Label (Pressure) */}
            {result && (
                <div className="absolute -bottom-5 bg-white/90 px-1 py-0.5 rounded border text-[9px] font-mono shadow-sm whitespace-nowrap z-20 pointer-events-none">
                    {result.pressure.toFixed(2)} m
                </div>
            )}

            {/* Ports - Invisible but functional */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full !bg-transparent border-0 rounded-full" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full !bg-transparent border-0 rounded-full" />
        </div>
    );
};

export default memo(JunctionNode);
