"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Upload, Eye, EyeOff, Save, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export interface PlanoConfig {
    url: string
    opacity: number
    rotation?: number
    bounds: [[number, number], [number, number]] | null
}

interface PlanoManagerProps {
    proyectoId: string
    config: PlanoConfig | null
    onConfigChange: (config: PlanoConfig | null) => void
    onSave: (config: PlanoConfig) => Promise<void>
}

export function PlanoManager({ proyectoId, config, onConfigChange, onSave }: PlanoManagerProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isVisible, setIsVisible] = useState(true)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch(`/api/proyectos/${proyectoId}/plano`, {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || "Error subiendo plano")

            onConfigChange(result.config)
            toast.success("Plano subido correctamente. Ajusta su posición en el mapa.")

        } catch (error) {
            console.error(error)
            toast.error("Error al subir el plano")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = async () => {
        if (!config) return
        setIsSaving(true)
        try {
            await onSave(config)
            toast.success("Configuración del plano guardada")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar configuración")
        } finally {
            setIsSaving(false)
        }
    }

    if (!config) {
        return (
            <Card className="bg-card/90 backdrop-blur border-border/50">
                <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold">Cargar Plano Base</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="flex flex-col items-center gap-4 border-2 border-dashed border-muted rounded-lg p-6 hover:bg-muted/10 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="text-center space-y-1">
                            <p className="text-xs font-medium">Subir imagen (JPG, PNG)</p>
                            <p className="text-[10px] text-muted-foreground">Úsala como guía para dibujar la red</p>
                        </div>
                        <label className="cursor-pointer w-full flex flex-col items-center">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={isUploading}
                                className="text-xs w-full cursor-pointer hidden"
                            />
                            <Button variant="outline" size="sm" className="w-full mt-2" disabled={isUploading}>
                                {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                                Seleccionar Archivo
                            </Button>
                        </label>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card/90 backdrop-blur border-border/50 w-[300px]">
            <CardHeader className="py-2 px-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold">Gestión de Plano</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(!isVisible)}>
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
            </CardHeader>

            {isVisible && (
                <CardContent className="pb-3 px-3 space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            <span>Opacidad</span>
                            <span>{Math.round(config.opacity * 100)}%</span>
                        </div>
                        <Slider
                            value={[config.opacity]}
                            min={0}
                            max={1}
                            step={0.05}
                            onValueChange={([val]: number[]) => onConfigChange({ ...config, opacity: val })}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                            Guardar Posición
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                            onClick={() => onConfigChange(null)}
                        >
                            Quitar
                        </Button>
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                        Arrastra las esquinas del plano en el mapa para ajustarlo a la topografía.
                    </p>
                </CardContent>
            )}
        </Card>
    )
}
