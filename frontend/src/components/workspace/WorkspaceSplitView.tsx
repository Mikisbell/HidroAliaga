"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useProjectStore } from "@/store/project-store"
import { cn } from "@/lib/utils"
// We assume we are inside the 'Proyectos/[id]/page.tsx' so we receive nudos/tramos via store or props, 
// but NetworkDesigner needs props. 
// So this component will receive nudos/tramos/handlers and pass them down.

import NetworkDesigner from "@/components/designer/NetworkDesigner"
import { HydraulicDataGrid } from "@/components/grid/HydraulicDataGrid"
import { MapBottomPalette } from "@/components/map/MapBottomPalette"
import { MapSideTools } from "@/components/map/MapSideTools"
import { Nudo, Tramo } from "@/types/models"

interface WorkspaceSplitViewProps {
    nudos: Nudo[]
    tramos: Tramo[]
    // Pass-through props for Designer
    onNodeDragStop?: (id: string, x: number, y: number) => void
    onConnect?: (sourceId: string, targetId: string) => void
    onNodeClick?: (nudo: Nudo) => void
    onAddNode?: (x: number, y: number, tipo?: string) => void
}

export function WorkspaceSplitView({
    nudos,
    tramos,
    onNodeDragStop,
    onConnect,
    onNodeClick,
    onAddNode
}: WorkspaceSplitViewProps) {
    const { isGridOpen, setGridOpen } = useProjectStore()
    const [splitPercentage, setSplitPercentage] = useState(70) // Top panel %
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    // Handle Dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true
        document.body.style.cursor = 'row-resize'
        document.body.style.userSelect = 'none'
    }, [])

    const handleMouseUp = useCallback(() => {
        isDragging.current = false
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const relativeY = e.clientY - containerRect.top
        const percentage = (relativeY / containerRect.height) * 100

        // Clamp between 20% and 80%
        const clamped = Math.min(Math.max(percentage, 20), 80)
        setSplitPercentage(clamped)
    }, [])

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove)
        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [handleMouseMove, handleMouseUp])


    return (
        <div ref={containerRef} className="flex flex-col h-full w-full overflow-hidden relative">
            {/* TOP PANEL: CANVAS */}
            <div
                style={{ height: isGridOpen ? `${splitPercentage}%` : '100%' }}
                className={cn("bg-background transition-[height] duration-0 relative min-h-0")}
            >
                {/* Overlays */}
                <MapBottomPalette />
                <MapSideTools />

                <NetworkDesigner
                    nudos={nudos}
                    tramos={tramos}
                    onNodeDragStop={onNodeDragStop}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onAddNode={onAddNode}
                />
            </div>

            {/* SPLITTER HANDLE */}
            {isGridOpen && (
                <div
                    onMouseDown={handleMouseDown}
                    className="h-1.5 bg-border hover:bg-primary/50 cursor-row-resize flex items-center justify-center z-50 transition-colors"
                >
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>
            )}

            {/* BOTTOM PANEL: DATA GRID */}
            {isGridOpen && (
                <div
                    style={{ height: `${100 - splitPercentage}%` }}
                    className="bg-background min-h-0 flex flex-col"
                >
                    <HydraulicDataGrid />
                </div>
            )}
        </div>
    )
}
