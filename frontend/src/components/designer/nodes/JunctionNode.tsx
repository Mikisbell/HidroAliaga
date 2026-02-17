"use client"

import { memo, useMemo } from "react"
import { NodeProps } from "@xyflow/react"
import { useProjectStore } from "@/store/project-store"
import { NodeCard } from "./NodeCard"
import { CircleDot } from "lucide-react"
import { JunctionData } from "@/types/models"

const JunctionNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as JunctionData
    const label = data.nombre || "Nudo"
    const code = data.codigo || data.label || id.substring(0, 1)

    // Validation & Simulation
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)
    const simulationResults = useProjectStore(state => state.simulationResults)

    // Check global results map or individual node result
    const result = useMemo(() => {
        if (!simulationResults?.nodeResults) return null
        return simulationResults.nodeResults[id] || simulationResults.nodeResults[code]
    }, [simulationResults, id, code])

    const hasError = useMemo(() => simulationAlerts?.some(a => a.elementId === id && a.level === 'error'), [simulationAlerts, id])
    const hasWarning = useMemo(() => simulationAlerts?.some(a => a.elementId === id && a.level === 'warning'), [simulationAlerts, id])

    const status = hasError ? "error" : hasWarning ? "warning" : "neutral"

    // Subtitle data
    const parts = []
    if (data.cota_terreno !== undefined) parts.push(`Z: ${data.cota_terreno}m`)
    if (result) parts.push(`P: ${result.pressure.toFixed(1)}m`)

    const subtitle = parts.length > 0 ? parts.join(" • ") : "Sin datos"

    return (
        <NodeCard
            title={label}
            code={code}
            subtitle={subtitle}
            icon={<CircleDot className="w-5 h-5 text-white" />}
            color="emerald"
            selected={selected}
            status={status}
            diffStatus={data.diffStatus}
        />
    )
}

export default memo(JunctionNode)
