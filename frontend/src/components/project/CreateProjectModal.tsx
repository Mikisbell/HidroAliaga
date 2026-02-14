"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { Loader2, Plus } from "lucide-react"
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

interface CreateProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsLoading(true)
        try {
            const newProject = await api.post("/proyectos/", {
                nombre: name,
                descripcion: description,
                // Default settings could be handled here or backend
            })

            toast.success("Proyecto creado exitosamente")

            // Refresh projects list
            mutate("/proyectos/")

            // Reset form and close
            setName("")
            setDescription("")
            onOpenChange(false)

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                        <DialogDescription>
                            Ingresa los detalles básicos para comenzar un nuevo diseño de red.
                        </DialogDescription>
                    </DialogHeader>
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
                                    Crear Proyecto
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
