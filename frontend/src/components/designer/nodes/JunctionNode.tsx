"use client"

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface JunctionNodeData {
    label: string
    codigo: string
    cota_terreno?: number
    demanda_base?: number
    [key: string]: unknown
}

function JunctionNodeComponent({ data, selected }: NodeProps) {
    const nodeData = data as JunctionNodeData
    return (
        <div className={`relative group ${selected ? 'ring-4 ring-gray-400/50 rounded-full' : ''}`}>
            {/* Main Shape - Small Circle */}
            <div className="w-5 h-5 bg-white dark:bg-gray-200 border-[3px] border-black dark:border-white rounded-full shadow-md transition-all duration-200 group-hover:scale-125 group-hover:shadow-lg cursor-grab active:cursor-grabbing" />

            {/* Label - Prominent letter next to node */}
            <div className="absolute -right-2 -top-6 whitespace-nowrap">
                <span className="text-sm font-bold text-foreground bg-background/70 px-1 rounded drop-shadow-sm">
                    {nodeData.codigo || nodeData.label || 'N'}
                </span>
            </div>

            {/* Cota + Demand info */}
            {nodeData.cota_terreno !== undefined && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[9px] text-muted-foreground bg-muted/60 px-1 rounded">
                        {nodeData.cota_terreno}m
                        {nodeData.demanda_base ? ` · ${nodeData.demanda_base}L/s` : ''}
                    </span>
                </div>
            )}

            {/* Connection Handles - All 4 sides */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-2.5 !h-2.5 !bg-gray-600 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-2.5 !h-2.5 !bg-gray-600 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!w-2.5 !h-2.5 !bg-gray-600 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="!w-2.5 !h-2.5 !bg-gray-600 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </div>
    )
}

export const JunctionNode = memo(JunctionNodeComponent)
