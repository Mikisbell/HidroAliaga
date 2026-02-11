"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateProjectPDF } from "@/lib/reports/pdf-generator"
import { Loader2, FileDown } from "lucide-react"
import { Nudo, Tramo } from "@/types/models"

interface ReportButtonProps {
    proyecto: any
    nudos: Nudo[]
    tramos: Tramo[]
    ultimoCalculo: any
}

export function ReportButton({ proyecto, nudos, tramos, ultimoCalculo }: ReportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        setIsGenerating(true)
        try {
            // Small delay to allow UI to update
            await new Promise(resolve => setTimeout(resolve, 100))
            generateProjectPDF(proyecto, nudos, tramos, ultimoCalculo)
        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Error al generar el reporte PDF. Revisa la consola para más detalles.")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isGenerating || !nudos.length}
            className="border-primary/20 hover:bg-primary/5 text-primary"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Memoria de Cálculo
                </>
            )}
        </Button>
    )
}
