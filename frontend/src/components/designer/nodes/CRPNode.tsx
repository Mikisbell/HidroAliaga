"use client"

import { memo, useMemo } from "react"
import { NodeProps } from "@xyflow/react"
import { useProjectStore } from "@/store/project-store"
import { NodeCard } from "./NodeCard"
import { Gauge } from "lucide-react"

interface CRPData extends Record<string, unknown> {
    cota_terreno?: number
    codigo?: string
    nombre?: string
    crp_type?: 'T6' | 'T7'
    tipo?: string
    diffStatus?: 'added' | 'modified' | 'removed' | 'unchanged'
}

const CRPNode = ({ id, data: initialData, selected }: NodeProps) => {
    const data = initialData as CRPData
    const label = data.nombre || "C.R.P."
    const code = data.codigo || id.substring(0, 3)
    const type = data.crp_type || 'T6'

    // Validation
    const simulationAlerts = useProjectStore(state => state.simulationAlerts)
    const hasError = useMemo(() => simulationAlerts?.some(a => a.elementId === id && a.level === 'error'), [simulationAlerts, id])
    const hasWarning = useMemo(() => simulationAlerts?.some(a => a.elementId === id && a.level === 'warning'), [simulationAlerts, id])

    const status = hasError ? "error" : hasWarning ? "warning" : "neutral"

    // Subtitle data
    const parts = []
    parts.push(`Tipo: ${type}`)
    if (data.cota_terreno !== undefined) parts.push(`Cota: ${data.cota_terreno}m`)
    const subtitle = parts.join(" • ")

    return (
        <NodeCard
            title={label}
            code={code}
            subtitle={subtitle}
            icon={<Gauge className="w-5 h-5 text-white" />}
            color="amber"
            selected={selected}
            status={status}
            diffStatus={data.diffStatus}
        />
    )
}

export default memo(CRPNode)
