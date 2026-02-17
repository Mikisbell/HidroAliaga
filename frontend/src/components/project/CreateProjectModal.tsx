"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSWRConfig } from "swr"
import { Loader2, Plus, Zap, FileText, Settings } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api-client"
import { handleApiError } from "@/lib/error-handler"
import { Badge } from "@/components/ui/badge"

interface CreateProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const TEMPLATES = {
    urban: {
        name: "Basic Urban Network",
        description: "Small urban grid with basic demand patterns and reservoir configuration.",
        icon: Zap,
        color: "text-blue-500 bg-blue-500/10"
    },
    rural: {
        name: "Rural Gravity System",
        description: "Rural water supply system optimized for gravity flow with pressure reducing valves.",
        icon: FileText,
        color: "text-green-500 bg-green-500/10"
    },
    pump: {
        name: "Pumping Station Automation",
        description: "Simulation of pump curves, efficiency, and automated control logic.",
        icon: Settings, // Using Settings as placeholder for Pump icon
        color: "text-purple-500 bg-purple-500/10"
    }
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { mutate } = useSWRConfig()

    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES | null>(null)

    // Detect template from URL
    useEffect(() => {
        if (open) {
            const templateParam = searchParams.get('template') as keyof typeof TEMPLATES
            if (templateParam && TEMPLATES[templateParam]) {
                setSelectedTemplate(templateParam)
                setName(TEMPLATES[templateParam].name)
                setDescription(TEMPLATES[templateParam].description)
            } else {
                setSelectedTemplate(null)
                // Only reset if empty to allow user typing before opening? 
                // Actually safer to reset if opening fresh.
                if (!name) setName("")
                if (!description) setDescription("")
            }
        }
    }, [open, searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsLoading(true)
        try {
            const payload: any = {
                nombre: name,
                descripcion: description,
            }

            // If we had template logic in backend, we'd send it here
            // For now, we just create the project with the template's name/desc

            const newProject = await api.post("/proyectos/", payload)

            toast.success("Proyecto creado exitosamente")

            // Refresh projects list
            mutate("/proyectos/")

            // Reset form and close
            setName("")
            setDescription("")
            onOpenChange(false)

            // Remove query param
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('template')
            window.history.replaceState({}, '', newUrl)


            // Optional: Navigate to new project
            if (newProject && (newProject as any).id) {
                router.push(`/proyectos/${(newProject as any).id}`)
            }
        } catch (error) {
            handleApiError(error, "crear el proyecto")
        } finally {
            setIsLoading(false)
        }
    }

    const TemplateInfo = selectedTemplate ? TEMPLATES[selectedTemplate] : null
    const Icon = TemplateInfo?.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTemplate ? "Create from Template" : "Nuevo Proyecto"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTemplate
                                ? "Review the project details derived from the selected template."
                                : "Ingresa los detalles básicos para comenzar un nuevo diseño de red."}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTemplate && TemplateInfo && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg flex gap-3 border border-border/50">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TemplateInfo.color}`}>
                                {Icon && <Icon className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Using Template: {TemplateInfo.name}</p>
                                <Badge variant="secondary" className="mt-1 text-[10px] bg-background text-muted-foreground border-border">
                                    Pre-configured
                                </Badge>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Proyecto</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Ampliación Sector 3"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detalles sobre la ubicación o propósito..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {selectedTemplate ? "Create Project" : "Crear Proyecto"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
