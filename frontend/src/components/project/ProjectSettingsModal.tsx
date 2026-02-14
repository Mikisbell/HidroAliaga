import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useProjectStore } from "@/store/project-store"
import { toast } from "sonner"
import { ProjectSettings } from "@/types/models"
import { api } from "@/lib/api-client"
import { handleApiError } from "@/lib/error-handler"
import { Loader2, Trash2 } from "lucide-react"

interface ProjectSettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProjectSettingsModal({ open, onOpenChange }: ProjectSettingsModalProps) {
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const project = useProjectStore(state => state.currentProject)
    const updateSettings = useProjectStore(state => state.updateProjectSettings)

    // Local state for form
    const [normativa, setNormativa] = useState<'urbano' | 'rural'>('urbano')
    const [dotacion, setDotacion] = useState(150)
    const [k1, setK1] = useState(1.3)
    const [k2, setK2] = useState(2.0)
    const [isDeleting, setIsDeleting] = useState(false)

    // Load initial values
    useEffect(() => {
        if (project && project.settings) {
            setNormativa(project.settings.normativa || 'urbano')
            setDotacion(project.settings.dotacion || 150)
            setK1(project.settings.k1 || 1.3)
            setK2(project.settings.k2 || 2.0)
        }
    }, [project, open])

    const handleSave = async () => {
        if (!project?.id) return

        const newSettings: ProjectSettings = {
            normativa,
            dotacion,
            k1,
            k2
        }

        // Update Store (Optimistic)
        updateSettings(newSettings)

        // Persist to backend
        try {
            const { updateProject } = await import("@/app/actions/proyectos")
            const res = await updateProject(project.id, { settings: newSettings })

            if (!res.success) {
                toast.error("Error al guardar configuración: " + res.message)
                // TODO: Revert store?
            } else {
                toast.success("Configuración del proyecto actualizada")
                onOpenChange(false)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar configuración")
        }
    }

    const handleDelete = async () => {
        if (!project?.id) return

        if (!confirm("¿ESTÁS SEGURO? Esta acción es irreversible y eliminará todos los nudos, tramos y cálculos asociados.")) {
            return
        }

        setIsDeleting(true)
        try {
            await api.delete(`/proyectos/${project.id}`)
            toast.success("Proyecto eliminado correctamente")

            // Refresh list and redirect
            mutate("/proyectos/")
            onOpenChange(false)
            router.push("/dashboard")
        } catch (error) {
            handleApiError(error, "eliminar el proyecto")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Configuración del Proyecto</DialogTitle>
                    <DialogDescription>
                        Ajusta los parámetros normativos y opciones del proyecto.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Normativa Selector */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="normativa" className="text-right">
                            Normativa
                        </Label>
                        <Select
                            value={normativa}
                            onValueChange={(v: 'urbano' | 'rural') => setNormativa(v)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccione normativa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="urbano">Urbana (RNE OS.050)</SelectItem>
                                <SelectItem value="rural">Rural (RM 192-2018)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dotación */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dotacion" className="text-right">
                            Dotación
                        </Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input
                                id="dotacion"
                                type="number"
                                value={dotacion}
                                onChange={(e) => setDotacion(Number(e.target.value))}
                            />
                            <span className="text-xs text-muted-foreground w-20">L/hab/día</span>
                        </div>
                    </div>

                    {/* Coeficientes */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="k1" className="text-right">K1 (Max. Diario)</Label>
                        <Input
                            id="k1"
                            type="number"
                            step="0.1"
                            className="col-span-3"
                            value={k1}
                            onChange={(e) => setK1(Number(e.target.value))}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="k2" className="text-right">K2 (Max. Horario)</Label>
                        <Input
                            id="k2"
                            type="number"
                            step="0.1"
                            className="col-span-3"
                            value={k2}
                            onChange={(e) => setK2(Number(e.target.value))}
                        />
                    </div>

                    <Separator className="my-2" />

                    {/* Zona de Peligro */}
                    <div className="border border-red-200 rounded-md p-4 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
                        <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Zona de Peligro
                        </h4>
                        <p className="text-xs text-red-600/80 mb-3">
                            Eliminar este proyecto borrará permanentemente todos los datos asociados.
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                "Eliminar Proyecto"
                            )}
                        </Button>
                    </div>

                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
