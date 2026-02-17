"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useProjectStore } from "@/store/project-store"
import { cn } from "@/lib/utils"

import NetworkDesigner from "@/components/designer/NetworkDesigner"
import { HydraulicTablePanel } from "./HydraulicTablePanel"
import { Nudo, Tramo } from "@/types/models"

interface WorkspaceSplitViewProps {
    nudos: Nudo[]
    tramos: Tramo[]
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
    const { isGridOpen } = useProjectStore()

    const [splitPercentage, setSplitPercentage] = useState(60)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

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
        setSplitPercentage(Math.min(Math.max(percentage, 20), 80))
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

            {/* --- TOP: Map --- */}
            <div
                style={{ height: isGridOpen ? `${splitPercentage}%` : '100%' }}
                className={cn("bg-background transition-[height] duration-0 relative min-h-0")}
            >
                <div className="flex-1 relative w-full h-full">

                    <NetworkDesigner
                        nudos={nudos}
                        tramos={tramos}
                        onNodeDragStop={onNodeDragStop}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onAddNode={onAddNode}
                    />
                </div>
            </div>

            {/* --- SPLITTER --- */}
            {isGridOpen && (
                <div
                    onMouseDown={handleMouseDown}
                    className="h-1.5 bg-border hover:bg-primary/50 cursor-row-resize flex items-center justify-center z-50 transition-colors"
                >
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>
            )}

            {/* --- BOTTOM: Unified Hydraulic Table --- */}
            {isGridOpen && (
                <div
                    style={{ height: `${100 - splitPercentage}%` }}
                    className="bg-background min-h-0 flex flex-col"
                >
                    <HydraulicTablePanel />
                </div>
            )}
        </div>
    )
}
