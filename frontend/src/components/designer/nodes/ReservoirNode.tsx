"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Settings, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";
import { updateNudo } from "@/app/actions/nudos";

interface ReservoirData extends Record<string, unknown> {
    label?: string;
    cota_terreno?: number;
    altura_agua?: number;
}

const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData;
    const [cota, setCota] = useState(data.cota_terreno?.toString() || "");
    const [alturaAgua, setAlturaAgua] = useState(data.altura_agua?.toString() || "");

    // Sync local state with data prop if it changes externally
    useEffect(() => {
        setCota(data.cota_terreno?.toString() || "");
        setAlturaAgua(data.altura_agua?.toString() || "");
    }, [data.cota_terreno, data.altura_agua]);

    const handleBlur = useCallback(async () => {
        const valCota = parseFloat(cota);
        const valAgua = parseFloat(alturaAgua);

        if (isNaN(valCota) && cota !== "") return; // Don't save invalid numbers

        const updates: any = {};
        if (!isNaN(valCota)) updates.cota_terreno = valCota;
        if (!isNaN(valAgua)) updates.altura_agua = valAgua;

        if (Object.keys(updates).length > 0) {
            try {
                // Optimistic update via store if needed, but react flow data update is handled by parent refetch usually
                await updateNudo(id, updates);
                // Trigger global refresh to update calculations?
            } catch (error) {
                console.error("Failed to update reservoir:", error);
            }
        }
    }, [id, cota, alturaAgua]);

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-md border-2 bg-background transition-all shadow-md group min-w-[120px]",
                selected
                    ? "border-blue-500 ring-2 ring-blue-200 shadow-xl scale-105"
                    : "border-blue-200 hover:border-blue-400"
            )}
        >
            {/* Header Icon */}
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center z-10 shadow-sm">
                <span className="text-lg font-bold text-blue-700">R</span>
            </div>

            {/* Content Body */}
            <div className="mt-3 flex flex-col items-center gap-1 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {data.label || id.substring(0, 4)}
                </span>

                {/* Inputs */}
                <div className="w-full space-y-1.5 mt-1 px-1">
                    {/* Cota Input */}
                    <div className="flex items-center gap-1.5 bg-muted/20 p-1 rounded border border-border/10 focus-within:border-blue-300/50 transition-colors">
                        <span className="text-[9px] font-mono text-muted-foreground w-6 text-right">Z:</span>
                        <input
                            type="number"
                            className="w-full bg-transparent text-xs font-medium text-right focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Cota"
                            value={cota}
                            onChange={(e) => setCota(e.target.value)}
                            onBlur={handleBlur}
                        />
                        <span className="text-[8px] text-muted-foreground">m</span>
                    </div>

                    {/* Water Level Input (Optional) */}
                    <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/10 p-1 rounded border border-border/10 focus-within:border-blue-300/50 transition-colors group/water">
                        <Droplets className="w-2.5 h-2.5 text-blue-400" />
                        <input
                            type="number"
                            className="w-full bg-transparent text-xs font-medium text-right focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-blue-600 dark:text-blue-400 placeholder:text-blue-200"
                            placeholder="H.Agua"
                            value={alturaAgua}
                            onChange={(e) => setAlturaAgua(e.target.value)}
                            onBlur={handleBlur}
                            title="Altura de Agua (Opcional)"
                        />
                        <span className="text-[8px] text-blue-400/70">m</span>
                    </div>
                </div>
            </div>

            {/* Config Trigger (Hidden unless hovered/selected) */}
            <div className={cn(
                "absolute -right-2 -top-2 transition-opacity duration-200",
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
                <Settings className="w-3 h-3 text-muted-foreground/50 hover:text-foreground cursor-pointer" />
            </div>

            {/* Ports */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-blue-500 border-2 border-white dark:border-zinc-800"
            />
        </div>
    );
};

export default memo(ReservoirNode);
