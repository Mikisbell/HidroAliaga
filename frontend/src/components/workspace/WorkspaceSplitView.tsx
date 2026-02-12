"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useProjectStore } from "@/store/project-store"
import { cn } from "@/lib/utils"

import NetworkDesigner from "@/components/designer/NetworkDesigner"
import { MapBottomPalette } from "@/components/map/MapBottomPalette"
import { MapSideTools } from "@/components/map/MapSideTools"
import { NudosSidePanel } from "./NudosSidePanel"
import { TramosBottomPanel } from "./TramosBottomPanel"
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
    // We reuse isGridOpen to toggle the bottom panel (Tramos)
    const { isGridOpen } = useProjectStore()

    // Top/Bottom split state
    const [splitPercentage, setSplitPercentage] = useState(70)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    // Handle Dragging specifically for Top/Bottom Split
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

            {/* --- TOP SECTION (Map + Node Panel) --- */}
            <div
                style={{ height: isGridOpen ? `${splitPercentage}%` : '100%' }}
                className={cn("bg-background transition-[height] duration-0 relative min-h-0 flex flex-row")}
            >
                {/* 1. LEFT: Network Designer (Map) */}
                <div className="flex-1 relative min-w-0">
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

                {/* 2. RIGHT: Nudos Side Panel (Fixed Width) */}
                {/* Only show if there is enough space? For now always show if grid is open or maybe always? 
                    User asked for "Nudos a la derecha de diseñador". Let's show it always active unless explicit toggle. 
                    Actually, let's link it to a new state or just always visible for this "3-in-1" view. 
                    Let's assume always visible for now. */}
                <div className="hidden md:block">
                    <NudosSidePanel nudos={nudos} />
                </div>
            </div>

            {/* --- SPLITTER HANDLE (Horizontal) --- */}
            {isGridOpen && (
                <div
                    onMouseDown={handleMouseDown}
                    className="h-1.5 bg-border hover:bg-primary/50 cursor-row-resize flex items-center justify-center z-50 transition-colors"
                >
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>
            )}

            {/* --- BOTTOM SECTION (Pipes Panel) --- */}
            {isGridOpen && (
                <div
                    style={{ height: `${100 - splitPercentage}%` }}
                    className="bg-background min-h-0 flex flex-col"
                >
                    <TramosBottomPanel tramos={tramos} />
                </div>
            )}
        </div>
    )
}
