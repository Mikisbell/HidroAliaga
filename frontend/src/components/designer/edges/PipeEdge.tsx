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
import { Check, X } from 'lucide-react'
import { useProjectStore } from '@/store/project-store'

export interface PipeEdgeData {
    codigo?: string
    longitud?: number
    diametro_comercial?: number
    material?: string
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

    const longitud = edgeData?.longitud
    const codigo = edgeData?.codigo
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
        if (res.error) {
            toast.error("Error al actualizar longitud")
            // Revert could be handled here if needed
        }
    }, [id, editValue, setEdges])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave()
        if (e.key === 'Escape') setIsEditing(false)
    }

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={edgeStyle}
            />
            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan pointer-events-auto"
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        zIndex: 10,
                    }}
                >
                    {isEditing ? (
                        <div className="flex items-center gap-1 bg-background border border-blue-500 rounded p-0.5 shadow-lg scale-110">
                            <span className="text-[10px] font-mono text-muted-foreground pl-1">L=</span>
                            <input
                                ref={inputRef}
                                type="number"
                                className="w-16 h-5 text-[11px] font-bold bg-transparent outline-none"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSave}
                            />
                            <div
                                className="w-5 h-5 bg-blue-500 text-white rounded cursor-pointer flex items-center justify-center hover:bg-blue-600 transition-colors"
                                onMouseDown={(e) => { e.preventDefault(); handleSave(); }} // onMouseDown prevents blur firing before clean click
                            >
                                <Check className="w-3 h-3" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-0.5">
                            <div
                                className={`group flex items-center gap-1.5 px-1.5 py-0.5 rounded-full border shadow-sm cursor-pointer transition-all hover:scale-105 hover:border-blue-400 ${selected
                                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                                    : 'bg-background/95 border-border/60 text-muted-foreground'
                                    }`}
                                onClick={() => setIsEditing(true)}
                                title="Clic para editar longitud"
                            >
                                {/* Label Content */}
                                <span className="text-[10px] font-bold font-mono">
                                    L={longitud?.toFixed(1) || '0.0'}
                                </span>

                                {diametro && (
                                    <span className="text-[9px] opacity-70 border-l border-current pl-1.5">
                                        Ø{diametro}
                                    </span>
                                )}
                            </div>
                            {/* Simulation Result Label */}
                            {result && (
                                <div className="bg-white/90 px-1 py-0 rounded border text-[8px] font-mono shadow-sm whitespace-nowrap text-slate-600">
                                    {result.velocity.toFixed(2)} m/s
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    )
}

export const PipeEdge = memo(PipeEdgeComponent)
