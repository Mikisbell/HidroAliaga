"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ExcelImportButtonProps {
    proyectoId: string
    onImportSuccess?: () => void
}

export function ExcelImportButton({ proyectoId, onImportSuccess }: ExcelImportButtonProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch(`/api/proyectos/${proyectoId}/import/excel`, {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Error en la importación")
            }

            toast.success(`Importación completada: ${result.nodes} nudos, ${result.pipes} tramos.`)
            if (result.logs?.length > 0) {
                console.log("Import Logs:", result.logs)
            }

            router.refresh()
            if (onImportSuccess) onImportSuccess()

        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error al importar Excel")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <>
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-card/50 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                )}
                {isUploading ? "Importando..." : "Importar Excel"}
            </Button>
        </>
    )
}
