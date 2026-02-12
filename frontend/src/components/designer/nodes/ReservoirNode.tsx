"use client"

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface ReservoirNodeData {
    label: string
    codigo: string
    cota_terreno?: number
    [key: string]: unknown
}

function ReservoirNodeComponent({ data, selected }: NodeProps) {
    const nodeData = data as ReservoirNodeData
    return (
        <div className={`relative group ${selected ? 'ring-4 ring-blue-400/50' : ''}`}>
            {/* Main Shape - Blue Square */}
            <div className="w-12 h-12 bg-blue-600 rounded-sm flex items-center justify-center shadow-lg border-2 border-blue-700 transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl cursor-grab active:cursor-grabbing">
                <span className="text-white font-bold text-lg select-none">R</span>
            </div>

            {/* Label below */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-bold text-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/50 shadow-sm">
                    {nodeData.codigo || nodeData.label || 'R-1'}
                </span>
            </div>

            {/* Cota badge */}
            {nodeData.cota_terreno !== undefined && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] text-muted-foreground bg-muted/80 px-1 rounded">
                        {nodeData.cota_terreno} m
                    </span>
                </div>
            )}

            {/* Connection Handles */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </div>
    )
}

export const ReservoirNode = memo(ReservoirNodeComponent)
