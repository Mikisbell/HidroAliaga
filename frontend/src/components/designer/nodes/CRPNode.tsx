"use client"

import { memo, useState, useCallback } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { Layers, Settings, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
// Ensure to import updateNudo from your actions file
import { updateNudo } from "@/app/actions/nudos"

interface CRPData extends Record<string, unknown> {
    cota_terreno?: number;
    crp_type?: 'T6' | 'T7';
}

const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData;
    // Local state for Cota and Type
    const [cota, setCota] = useState(data.cota_terreno?.toString() || "")
    const [tipoCRP, setTipoCRP] = useState<'T6' | 'T7'>((data.crp_type as 'T6' | 'T7') || 'T7') // Default to T7

    // Update handler
    const handleUpdate = useCallback(async (newCota?: string, newType?: 'T6' | 'T7') => {
        const updates: any = {}

        if (newCota !== undefined) {
            const val = parseFloat(newCota)
            if (!isNaN(val)) updates.cota_terreno = val
        }

        if (newType !== undefined) {
            updates.crp_type = newType
            // We might store this in 'notas' or a specific JSON field if not a core column, 
            // but let's assume 'crp_type' is handled or we use 'notas' for now as a workaround 
            // if schema allows custom data. Ideally schema has it.
            // For now, let's just update local state visually if backend doesn't support 'crp_type' column yet.
        }

        if (Object.keys(updates).length > 0) {
            try {
                await updateNudo(id, updates)
            } catch (error) {
                console.error("Failed to update CRP:", error)
            }
        }
    }, [id])

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-lg border-2 bg-background transition-all shadow-md group min-w-[140px]",
                selected
                    ? "border-orange-500 ring-2 ring-orange-200 shadow-xl scale-105"
                    : "border-orange-200 hover:border-orange-400"
            )}
        >
            {/* Header Icon */}
            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-lg bg-orange-100 border border-orange-300 flex items-center justify-center z-10 shadow-sm rotate-12">
                <Layers className="w-5 h-5 text-orange-600" />
            </div>

            {/* Label */}
            <div className="w-full text-center border-b border-orange-100 pb-1 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                    Cámara Rompe Presión
                </span>
            </div>

            {/* Content */}
            <div className="w-full space-y-2">
                {/* Type Selector */}
                <div className="flex items-center justify-between gap-2 bg-orange-50/50 p-1.5 rounded border border-orange-100">
                    <span className="text-[10px] font-semibold text-orange-700">Tipo:</span>
                    <select
                        className="bg-transparent text-[10px] font-bold text-right text-orange-900 focus:outline-none cursor-pointer"
                        value={tipoCRP}
                        onChange={(e) => {
                            const val = e.target.value as 'T6' | 'T7'
                            setTipoCRP(val)
                            handleUpdate(undefined, val)
                        }}
                    >
                        <option value="T6">CRP-T6</option>
                        <option value="T7">CRP-T7</option>
                    </select>
                </div>

                {/* Cota Input */}
                <div className="flex items-center gap-1.5 bg-muted/20 p-1 rounded border border-border/10">
                    <span className="text-[9px] font-mono text-muted-foreground w-6 text-right">Z:</span>
                    <input
                        type="number"
                        className="w-full bg-transparent text-xs font-medium text-right focus:outline-none p-0"
                        placeholder="Cota Fondo"
                        value={cota}
                        onChange={(e) => setCota(e.target.value)}
                        onBlur={(e) => handleUpdate(e.target.value, undefined)}
                    />
                    <span className="text-[8px] text-muted-foreground">m</span>
                </div>
            </div>

            {/* Flow Indicators */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-orange-500 !rounded-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                <ChevronRight className="w-12 h-12 text-orange-500" />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-orange-500 !rounded-none" />
        </div>
    )
}

export default memo(CRPNode)
