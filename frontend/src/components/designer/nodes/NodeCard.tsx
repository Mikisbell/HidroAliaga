"use client"

import { ReactNode } from "react"
import { Handle, Position } from "@xyflow/react"
import { cn } from "@/lib/utils"
import { Trash2, Edit2 } from "lucide-react"

interface NodeCardProps {
    title: string
    subtitle?: string
    code?: string
    icon: ReactNode
    color: "blue" | "amber" | "emerald" | "cyan" | "rose" | "slate"
    selected?: boolean
    status?: "success" | "warning" | "error" | "neutral"
    statusMessage?: string
    diffStatus?: "added" | "modified" | "removed" | "unchanged" // New Prop
    onDelete?: () => void
    onEdit?: () => void
    className?: string
    children?: ReactNode
}

const colorStyles = {
    blue: {
        bg: "bg-blue-600",
        bgLight: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-900",
        text: "text-blue-700 dark:text-blue-300",
        icon: "text-blue-50"
    },
    amber: {
        bg: "bg-amber-500",
        bgLight: "bg-amber-50 dark:bg-amber-950/20",
        border: "border-amber-200 dark:border-amber-900",
        text: "text-amber-700 dark:text-amber-300",
        icon: "text-amber-50"
    },
    emerald: {
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/20",
        border: "border-emerald-200 dark:border-emerald-900",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: "text-emerald-50"
    },
    cyan: {
        bg: "bg-cyan-500",
        bgLight: "bg-cyan-50 dark:bg-cyan-950/20",
        border: "border-cyan-200 dark:border-cyan-900",
        text: "text-cyan-700 dark:text-cyan-300",
        icon: "text-cyan-50"
    },
    rose: {
        bg: "bg-rose-500",
        bgLight: "bg-rose-50 dark:bg-rose-950/20",
        border: "border-rose-200 dark:border-rose-900",
        text: "text-rose-700 dark:text-rose-300",
        icon: "text-rose-50"
    },
    slate: {
        bg: "bg-slate-500",
        bgLight: "bg-slate-50 dark:bg-slate-950/20",
        border: "border-slate-200 dark:border-slate-900",
        text: "text-slate-700 dark:text-slate-300",
        icon: "text-slate-50"
    }
}

const statusColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-slate-300 dark:bg-slate-600"
}

/**
 * A unified card component for all hydraulic nodes, inspired by N8N.
 * Features:
 * - Left icon block (color-coded)
 * - Main content area
 * - Floating action/status indicators
 * - Standardized connection handles
 */
export function NodeCard({
    title,
    subtitle,
    code,
    icon,
    color,
    selected,
    status = "neutral",
    diffStatus,
    onDelete,
    onEdit,
    className,
    children
}: NodeCardProps) {
    const styles = colorStyles[color]

    // Diff Styling
    let diffClasses = "";
    if (diffStatus === 'added') diffClasses = "ring-2 ring-green-500 ring-offset-2";
    if (diffStatus === 'modified') diffClasses = "ring-2 ring-orange-500 ring-offset-2 border-orange-500";
    if (diffStatus === 'removed') diffClasses = "opacity-50 grayscale";

    return (
        <div className={cn(
            "group relative flex min-w-[180px] h-[64px] bg-white dark:bg-slate-900 rounded-lg shadow-sm border transition-all duration-200",
            selected ? `ring-2 ring-primary border-transparent shadow-lg` : `border-border hover:border-border/80 hover:shadow-md`,
            diffClasses,
            className
        )}>
            {/* Status Indicator (Top Right Dot) */}
            <div className={cn(
                "absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 z-20",
                statusColors[status]
            )} />

            {/* Left Icon Block */}
            <div className={cn(
                "flex items-center justify-center w-[48px] h-full rounded-l-lg shrink-0",
                styles.bg
            )}>
                <div className={cn("w-6 h-6", styles.icon)}>
                    {icon}
                </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col justify-center px-3 py-1.5 grow min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate text-foreground/90">
                        {title}
                    </span>
                    {code && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
                            {code}
                        </span>
                    )}
                </div>

                {subtitle && (
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                        {subtitle}
                    </div>
                )}

                {/* Extra custom content (like tags) */}
                {children && (
                    <div className="mt-1 flex gap-1">
                        {children}
                    </div>
                )}
            </div>

            {/* Hover Actions (Floating above) */}
            <div className={cn(
                "absolute -top-8 right-0 flex bg-background/90 backdrop-blur border rounded-full p-0.5 gap-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-30 scale-90 origin-bottom-right"
            )}>
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit() }}
                        className="p-1.5 hover:bg-muted rounded-full text-foreground/70 hover:text-primary transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete() }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-foreground/70 hover:text-red-600 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Connection Handles - 4 Sides */}
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-muted-foreground/30 !border-none !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-muted-foreground/30 !border-none !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-muted-foreground/30 !border-none !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-muted-foreground/30 !border-none !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}
