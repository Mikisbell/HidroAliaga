"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Home, Droplets, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateNudoViviendasAction } from "@/app/actions/tramos";
import { updateNudo } from "@/app/actions/nudos";

interface JunctionData extends Record<string, unknown> {
    label?: string;
    cota_terreno?: number;
    numero_viviendas?: number;
    demanda_base?: number;
}

const JunctionNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as JunctionData;
    const [cota, setCota] = useState(data.cota_terreno?.toString() || "");
    const [houses, setHouses] = useState(data.numero_viviendas?.toString() || "");
    const [demand, setDemand] = useState(data.demanda_base !== undefined ? data.demanda_base.toFixed(3) : "0.000");

    // Local update handler
    const handleBlur = useCallback(async () => {
        const valCota = parseFloat(cota);
        const valHouses = parseInt(houses, 10);

        const updates: any = {};
        if (!isNaN(valCota)) updates.cota_terreno = valCota;
        if (!isNaN(valHouses)) updates.numero_viviendas = valHouses;

        if (Object.keys(updates).length > 0) {
            try {
                await updateNudo(id, updates);
                // If houses changed, we might trigger a recalculation of demand (L/s) here or rely on backend
            } catch (error) {
                console.error("Failed to update junction:", error);
            }
        }
    }, [id, cota, houses]);

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center p-2 rounded-full border-2 bg-background transition-all shadow-sm group min-w-[100px]",
                selected
                    ? "border-emerald-500 ring-2 ring-emerald-200 shadow-xl scale-105"
                    : "border-emerald-200 hover:border-emerald-400"
            )}
        >
            {/* Node Label (A, B, C...) */}
            <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center z-10 shadow-sm text-xs font-bold text-emerald-700">
                {data.label || id.substring(0, 1)}
            </div>

            <div className="flex flex-col items-center gap-1 w-full px-1">
                {/* Cota Input */}
                <div className="flex items-center gap-1 w-full">
                    <span className="text-[9px] font-mono text-muted-foreground w-4 text-right">Z:</span>
                    <input
                        type="number"
                        className="w-full bg-transparent text-xs font-semibold text-right focus:outline-none p-0.5 border-b border-dashed border-muted-foreground/30 focus:border-emerald-500 transition-colors"
                        placeholder="Cota"
                        value={cota}
                        onChange={(e) => setCota(e.target.value)}
                        onBlur={handleBlur}
                    />
                </div>

                {/* Houses Input */}
                <div className="flex items-center gap-1 w-full group/houses">
                    <Home className="w-3 h-3 text-emerald-500/70" />
                    <input
                        type="number"
                        className="w-full bg-transparent text-xs font-semibold text-right focus:outline-none p-0.5 border-b border-dashed border-muted-foreground/30 focus:border-emerald-500 transition-colors text-emerald-700 dark:text-emerald-400"
                        placeholder="Viv."
                        value={houses}
                        onChange={(e) => setHouses(e.target.value)}
                        onBlur={handleBlur}
                        title="Número de Viviendas"
                    />
                </div>

                {/* Read-only Demand (L/s) */}
                <div className="flex items-center justify-end gap-1 w-full opacity-50 text-[9px] font-mono">
                    <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                    <span>{demand} L/s</span>
                </div>

            </div>


            {/* Ports */}
            <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-emerald-500" />
            <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-emerald-500" />
        </div>
    );
};

export default memo(JunctionNode);
