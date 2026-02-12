"use client"

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface CRPNodeData {
    label: string
    codigo: string
    cota_terreno?: number
    [key: string]: unknown
}

function CRPNodeComponent({ data, selected }: NodeProps) {
    const nodeData = data as CRPNodeData
    return (
        <div className={`relative group ${selected ? 'ring-4 ring-yellow-400/50' : ''}`}>
            {/* Main Shape - Yellow Square */}
            <div className="w-12 h-12 bg-yellow-500 rounded-sm flex items-center justify-center shadow-lg border-2 border-yellow-600 transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl cursor-grab active:cursor-grabbing">
                <span className="text-white font-bold text-[10px] select-none leading-tight text-center">CRP</span>
            </div>

            {/* Label below */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-bold text-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/50 shadow-sm">
                    {nodeData.codigo || nodeData.label || 'CRP-1'}
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
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white dark:!border-gray-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </div>
    )
}

export const CRPNode = memo(CRPNodeComponent)
