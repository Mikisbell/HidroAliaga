"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ChevronRight, MoreHorizontal, History, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalcularButton } from "@/components/proyecto/calcular-button"
import { ExcelImportButton } from "@/components/import/ExcelImportButton"
import { ReportButton } from "@/components/reports/ReportButton"
import { Calculo, Nudo, Tramo } from "@/types/models"
import { cn } from "@/lib/utils"

interface EditorTopBarProps {
    proyecto: {
        id: string
        nombre: string
        ambito?: string
        tipo_red?: string
        departamento?: string
    }
    nudos: Nudo[]
    tramos: Tramo[]
    ultimoCalculo?: Calculo
    activeTab: string
    onTabChange: (tab: string) => void
    onToggleSidePanel?: () => void
}

const tabs = [
    { id: "editor", label: "Editor" },
    { id: "resultados", label: "Resultados" },
    { id: "validacion", label: "Validación" },
]

export function EditorTopBar({
    proyecto, nudos, tramos, ultimoCalculo,
    activeTab, onTabChange, onToggleSidePanel
}: EditorTopBarProps) {

    return (
        <div className="absolute top-0 left-0 right-0 z-20 h-12 flex items-center bg-background/95 backdrop-blur-md border-b border-border/40">

            {/* === LEFT: Breadcrumb (n8n: "Personal > Build your first AI agent + Add tag") === */}
            <div className="flex items-center gap-1.5 px-4 shrink-0 border-r border-border/30 h-full">
                <Link
                    href="/dashboard"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Proyectos
                </Link>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                    {proyecto.nombre}
                </span>

                {/* Tags / Badges */}
                <div className="hidden lg:flex items-center gap-1 ml-2">
                    {proyecto.ambito && (
                        <Badge variant="outline" className="text-[9px] h-[18px] px-1.5 border-primary/30 text-primary">
                            {proyecto.ambito}
                        </Badge>
                    )}
                    {proyecto.tipo_red && (
                        <Badge variant="outline" className="text-[9px] h-[18px] px-1.5 border-border/50">
                            {proyecto.tipo_red}
                        </Badge>
                    )}
                    {proyecto.departamento && (
                        <span className="text-[10px] text-muted-foreground/40 ml-0.5">
                            📍 {proyecto.departamento}
                        </span>
                    )}
                </div>
            </div>

            {/* === CENTER: Tabs (n8n: "Editor | Executions | Evaluations") === */}
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border border-border/30">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm border border-border/50"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* === RIGHT: Actions (n8n: "Publish ▼ | ↻ | ... | ⭐ Star") === */}
            <div className="flex items-center gap-1.5 px-4 shrink-0">
                <ExcelImportButton proyectoId={proyecto.id} />

                {/* Calcular = n8n's "Publish" */}
                <CalcularButton proyectoId={proyecto.id} />

                {/* Reportes */}
                <ReportButton
                    proyecto={proyecto}
                    nudos={nudos}
                    tramos={tramos}
                    ultimoCalculo={ultimoCalculo}
                />

                {/* History (like n8n's ↻) */}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <History className="w-4 h-4" />
                </Button>

                {/* More (like n8n's ...) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onToggleSidePanel}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
