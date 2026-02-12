
"use client"

import { useProjectStore } from "@/store/project-store"
import { X, Settings2 } from "lucide-react"

// Placeholder imports until we create them
import NodePropertiesForm from "./NodePropertiesForm"
import PipePropertiesForm from "./PipePropertiesForm"

export default function PropertyInspector() {
    const selectedElement = useProjectStore(state => state.selectedElement)
    const setSelectedElement = useProjectStore(state => state.setSelectedElement)
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)

    if (!selectedElement) return null

    // Find the actual data object
    const data = selectedElement.type === 'nudo'
        ? nudos.find(n => n.id === selectedElement.id)
        : tramos.find(t => t.id === selectedElement.id)

    if (!data) return null

    return (
        <div className="absolute top-4 right-4 w-80 bg-background/95 backdrop-blur-sm border border-border shadow-2xl rounded-xl overflow-hidden z-[50] animate-in slide-in-from-right-10 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">
                        {selectedElement.type === 'nudo' ? 'Propiedades del Nudo' : 'Propiedades del Tramo'}
                    </h3>
                </div>
                <button
                    onClick={() => setSelectedElement(null)}
                    className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 max-h-[80vh] overflow-y-auto">
                {selectedElement.type === 'nudo' && (
                    <NodePropertiesForm nudo={data as any} />
                )}
                {selectedElement.type === 'tramo' && (
                    <PipePropertiesForm tramo={data as any} />
                )}
            </div>
        </div>
    )
}
