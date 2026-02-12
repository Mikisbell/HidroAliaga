"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileImage, Sparkles, FolderUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlueprintUploadProps {
    onSkip?: () => void
    onUpload?: (file: File) => void
}

export function BlueprintUpload({ onSkip, onUpload }: BlueprintUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleAnalyze = () => {
        if (!file) return
        setIsAnalyzing(true)
        // Simulate analysis delay
        setTimeout(() => {
            setIsAnalyzing(false)
            if (onUpload) onUpload(file)
            // Ideally we would return analysis data here
        }, 2000)
    }

    return (
        <Card className="max-w-3xl mx-auto mt-8 border-dashed border-2 bg-muted/5 shadow-none">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Carga Inteligente de Plano</CardTitle>
                <CardDescription>
                    Sube una imagen o PDF de tu plano y deja que nuestra IA identifique los elementos iniciales.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Upload Zone */}
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-xl transition-colors cursor-pointer",
                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                        file ? "border-solid border-primary/20 bg-muted/20" : ""
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('blueprint-upload')?.click()}
                >
                    <input
                        id="blueprint-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                    />

                    {file ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-background rounded-lg shadow-sm border flex items-center justify-center">
                                <FileImage className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">{file.name}</p>
                                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                Cambiar archivo
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 p-8">
                            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Arrastra tu plano aquí</p>
                                <p className="text-sm text-muted-foreground mt-1">o haz clic para explorar</p>
                            </div>
                            <p className="text-xs text-muted-foreground/60">
                                Soporta JPG, PNG, PDF hasta 10MB
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                        Saltar este paso
                    </Button>
                    <Button
                        onClick={handleAnalyze}
                        disabled={!file || isAnalyzing}
                        className="min-w-[150px]"
                    >
                        {isAnalyzing ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analizar con IA
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
