"use client"

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    type EdgeProps,
    useReactFlow
} from '@xyflow/react'
import { updateTramo } from '@/app/actions/tramos'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { useProjectStore } from '@/store/project-store'

export interface PipeEdgeData {
    codigo?: string
    longitud?: number
    diametro_comercial?: number
    material?: string
    numero_viviendas?: number
    [key: string]: unknown
}

function PipeEdgeComponent({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected,
}: EdgeProps) {
    const edgeData = data as PipeEdgeData | undefined
    const { setEdges } = useReactFlow()
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(edgeData?.longitud?.toString() || "")
    const inputRef = useRef<HTMLInputElement>(null)

    // Simulation Results & Alerts (The Referee)
    const simulationResults = useProjectStore(state => state.simulationResults)
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)

    // Result logic
    const result = simulationResults ? simulationResults.linkResults[id] || simulationResults.linkResults[edgeData?.codigo || ''] : null;

    // Validation Status Color
    const statusColor = (() => {
        if (!simulationAlerts || simulationAlerts.length === 0) return '#22c55e'; // Green default/ok

        const myAlerts = simulationAlerts.filter(a => a.elementId === id);
        const hasError = myAlerts.some(a => a.level === 'error');
        const hasWarning = myAlerts.some(a => a.level === 'warning');

        if (hasError) return '#ef4444'; // Red
        if (hasWarning) return '#f59e0b'; // Amber
        return '#22c55e'; // Green
    })();

    // Fallback logic for normal simulation view if no alerts/validation executed yet
    // Uses velocity as proxy if available, otherwise gray/blue
    const finalColor = (() => {
        if (simulationAlerts && simulationAlerts.length > 0) return statusColor;
        if (result) {
            // Legacy/Simple Velocity check if no validation run
            const v = result.velocity;
            if (v < 0.6) return '#3b82f6';
            if (v > 3.0) return '#ef4444';
            return '#22c55e';
        }
        return selected ? '#3b82f6' : '#64748b'; // Default/Selected
    })();

    const edgeStyle = {
        strokeWidth: selected ? 4 : 3,
        strokeOpacity: 0.8,
        strokeLinecap: 'round' as const,
        stroke: finalColor
    };

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    })

    // Calculate rotation angle in degrees
    const angleRad = Math.atan2(targetY - sourceY, targetX - sourceX);
    let angleDeg = angleRad * (180 / Math.PI);

    // Keep text readable (don't let it be upside down)
    if (angleDeg > 90 || angleDeg < -90) {
        angleDeg += 180;
    }

    const longitud = edgeData?.longitud
    const diametro = edgeData?.diametro_comercial

    // Sync state with prop if external change happens (and not editing)
    useEffect(() => {
        if (!isEditing && edgeData?.longitud !== undefined) {
            setEditValue(edgeData.longitud.toString())
        }
    }, [edgeData?.longitud, isEditing])

    // Focus input on edit
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleSave = useCallback(async () => {
        const val = parseFloat(editValue)
        if (isNaN(val)) {
            setIsEditing(false)
            return
        }

        // Optimistic UI update
        setEdges((edges) => edges.map((e) => {
            if (e.id === id) {
                return { ...e, data: { ...e.data, longitud: val } }
            }
            return e
        }))

        setIsEditing(false)

        // Backend update
        const res = await updateTramo({ id, longitud: val })
        if (!res.success) {
            toast.error(res.message || "Error al actualizar longitud")
        }
    }, [id, editValue, setEdges])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            setIsEditing(false)
            setEditValue(edgeData?.longitud?.toString() || "") // Revert to original
        }
    }

    return (
        <>
            <BaseEdge path={edgePath} style={edgeStyle} />

            {/* Visual Markers for Start/End — Small (r=1.5) as requested */}
            <circle cx={sourceX} cy={sourceY} r={1.5} fill="#22c55e" />
            <circle cx={targetX} cy={targetY} r={1.5} fill="#3b82f6" />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px) rotate(${angleDeg}deg)`,
                        zIndex: 10,
                        transformOrigin: 'center center'
                    }}
                >
                    {/* 
                      Layout:
                      [Length Label]  <-- Above
                          |           <-- Gap for line (transparent)
                      [Households]    <-- Below
                    */}
                    <div className="flex flex-col items-center select-none gap-1"> {/* gap-2 ensures space for the line */}

                        {/* --- TOP: Length Label --- */}
                        {
                            isEditing ? (
                                <div className="flex items-center gap-1 bg-background border border-blue-500 rounded p-0.5 shadow-lg scale-110 origin-center mb-1">
                                    <span className="text-[7px] font-mono text-muted-foreground pl-1">L=</span>
                                    <input
                                        ref={inputRef}
                                        type="number"
                                        className="w-14 h-4 text-[7px] font-bold bg-transparent outline-none"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleSave}
                                    />
                                    <div
                                        className="w-5 h-5 bg-blue-500 text-white rounded cursor-pointer flex items-center justify-center hover:bg-blue-600 transition-colors"
                                        onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
                                    >
                                        <Check className="w-3 h-3" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-0.5" style={{ transform: 'translateY(2px)' }}> {/* Slight nudge down towards line? No, up. Flex puts it top. */}
                                    <div
                                        className="group flex items-center px-1 py-0 rounded hover:bg-white/50 cursor-pointer transition-all"
                                        onClick={() => setIsEditing(true)}
                                        title="Longitud (m) - Clic para editar"
                                    >
                                        <span style={{ textShadow: '0px 0px 3px rgba(255,255,255,0.8)' }} className="text-[7px] font-bold font-mono whitespace-nowrap text-foreground/80">
                                            L={longitud?.toFixed(1) || '0.0'}m
                                        </span>
                                    </div>
                                </div>
                            )
                        }

                        {/* --- GAP (Invisible, handled by flex gap) --- */}

                        {/* --- BOTTOM: Household Count & Result --- */}
                        <div
                            className="bg-transparent px-1 min-w-[20px] text-center cursor-pointer transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                const current = typeof edgeData?.numero_viviendas === 'number' ? edgeData.numero_viviendas : 0;
                                const newVal = window.prompt("Viviendas en tramo:", current.toString());
                                if (newVal !== null) {
                                    const num = parseInt(newVal);
                                    if (!isNaN(num)) {
                                        setEdges((prev) => prev.map((ed) => {
                                            if (ed.id === id) return { ...ed, data: { ...ed.data, numero_viviendas: num } }
                                            return ed
                                        }));
                                        updateTramo({ id, numero_viviendas: num }).then(res => {
                                            if (!res.success) toast.error(res.message)
                                        });
                                    }
                                }
                            }}
                            title="Viviendas abastecidas (Clic para editar)"
                        >
                            <span className="text-[7px] font-bold text-purple-700">🏠 {typeof edgeData?.numero_viviendas === 'number' ? edgeData.numero_viviendas : 0}</span>
                        </div>

                        {/* Simulation Result (If exists, place it below households or alongside?) */}
                        {
                            result && (
                                <div className="bg-white/90 px-1 py-0 rounded border text-[8px] font-mono shadow-sm whitespace-nowrap text-slate-600 mt-0.5"
                                    style={{ transform: `rotate(${-angleDeg}deg)` }}
                                >
                                    {result.velocity.toFixed(2)} m/s
                                </div>
                            )
                        }

                    </div >
                </div >
            </EdgeLabelRenderer >
        </>
    )
}

export const PipeEdge = memo(PipeEdgeComponent)
