"use client"

import { memo } from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    type EdgeProps,
} from '@xyflow/react'

export interface PipeEdgeData {
    codigo?: string
    longitud?: number
    diametro?: number
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
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    })

    const longitud = edgeData?.longitud
    const codigo = edgeData?.codigo
    const diametro = edgeData?.diametro

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: selected ? '#3b82f6' : '#1f2937',
                    strokeWidth: selected ? 4 : 2.5,
                    strokeLinecap: 'round',
                }}
            />
            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan pointer-events-auto"
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    }}
                >
                    <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${selected
                            ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                            : 'bg-background/90 border-border/50 text-muted-foreground'
                        }`}>
                        {codigo && <span className="font-bold mr-1">{codigo}</span>}
                        {longitud !== undefined && <span>L={longitud.toFixed(1)}m</span>}
                        {diametro !== undefined && <span className="ml-1">Ø{diametro}mm</span>}
                        {!codigo && !longitud && <span className="italic">Tubería</span>}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    )
}

export const PipeEdge = memo(PipeEdgeComponent)
