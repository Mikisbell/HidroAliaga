"use client"

import { memo, useMemo } from "react"
import { NodeProps } from "@xyflow/react"
import { useProjectStore } from "@/store/project-store"
import { NodeCard } from "./NodeCard"
import { Waves } from "lucide-react"

interface ReservoirData extends Record<string, unknown> {
    label?: string
    nombre?: string
    codigo?: string
    cota_terreno?: number
    altura_agua?: number
    tipo?: string
}

const ReservoirNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as ReservoirData
    const label = data.nombre || "Reservorio"
    const code = data.codigo || data.label || "R"

    // Validation
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)
    const hasError = useMemo(() => simulationAlerts?.some(a => a.elementId === id && a.level === 'error'), [simulationAlerts, id])
    const hasWarning = useMemo(() => simulationAlerts?.some(a => a.elementId === id && a.level === 'warning'), [simulationAlerts, id])

    const status = hasError ? "error" : hasWarning ? "warning" : "neutral"

    // Subtitle data
    const parts = []
    if (data.cota_terreno !== undefined) parts.push(`Cota: ${data.cota_terreno}m`)
    if (data.altura_agua !== undefined) parts.push(`Nivel: ${data.altura_agua}m`)
    const subtitle = parts.join(" • ")

    return (
        <NodeCard
            title={label}
            code={code}
            subtitle={subtitle}
            icon={<Waves className="w-5 h-5 text-white" />}
            color="blue"
            selected={selected}
            status={status}
        // Actions could be passed here if we lift state up or use local
        // onEdit={() => console.log('Edit', id)}
        />
    )
}

export default memo(ReservoirNode)
