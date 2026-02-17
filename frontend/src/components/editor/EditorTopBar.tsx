"use client"

import Link from "next/link"
import { ArrowLeft, FileSpreadsheet, FileText, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalcularButton } from "@/components/proyecto/calcular-button"
import { ExcelImportButton } from "@/components/import/ExcelImportButton"
import { ReportButton } from "@/components/reports/ReportButton"
import { Calculo, Nudo, Tramo } from "@/types/models"

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
    onToggleSidePanel?: () => void
}

export function EditorTopBar({ proyecto, nudos, tramos, ultimoCalculo, onToggleSidePanel }: EditorTopBarProps) {
    return (
        <div className="absolute top-0 left-0 right-0 z-20 h-12 flex items-center gap-3 px-4 bg-background/80 backdrop-blur-md border-b border-border/40">
            {/* Back */}
            <Link
                href="/proyectos"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Project Name */}
            <h1 className="text-sm font-semibold text-foreground truncate max-w-[300px]">
                {proyecto.nombre}
            </h1>

            {/* Badges */}
            <div className="hidden md:flex items-center gap-1.5">
                {proyecto.ambito && (
                    <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
                        {proyecto.ambito}
                    </Badge>
                )}
                {proyecto.tipo_red && (
                    <Badge variant="outline" className="text-[9px] h-5 border-border/50">
                        Red {proyecto.tipo_red}
                    </Badge>
                )}
                {proyecto.departamento && (
                    <span className="text-[10px] text-muted-foreground/50 ml-1">
                        📍 {proyecto.departamento}
                    </span>
                )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1.5">
                <ExcelImportButton proyectoId={proyecto.id} />
                <ReportButton
                    proyecto={proyecto}
                    nudos={nudos}
                    tramos={tramos}
                    ultimoCalculo={ultimoCalculo}
                />
                <CalcularButton proyectoId={proyecto.id} />

                {/* Toggle Side Panel */}
                {onToggleSidePanel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleSidePanel}
                        className="text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                        <FileText className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
