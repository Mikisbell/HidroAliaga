import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjectStore } from "@/store/project-store"
import { toast } from "sonner"
import { ProjectSettings } from "@/types/models"

interface ProjectSettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProjectSettingsModal({ open, onOpenChange }: ProjectSettingsModalProps) {
    const project = useProjectStore(state => state.currentProject)
    const updateSettings = useProjectStore(state => state.updateProjectSettings)

    // Local state for form
    const [normativa, setNormativa] = useState<'urbano' | 'rural'>('urbano')
    const [dotacion, setDotacion] = useState(150)
    const [k1, setK1] = useState(1.3)
    const [k2, setK2] = useState(2.0)

    // Load initial values
    useEffect(() => {
        if (project && project.settings) {
            setNormativa(project.settings.normativa || 'urbano')
            setDotacion(project.settings.dotacion || 150)
            setK1(project.settings.k1 || 1.3)
            setK2(project.settings.k2 || 2.0)
        }
    }, [project, open])

    const handleSave = () => {
        const newSettings: ProjectSettings = {
            normativa,
            dotacion,
            k1,
            k2
        }

        // Update Store (Optimistic)
        updateSettings(newSettings)

        // TODO: Sync with Backend Project table (updateProject Action)
        // For now we just update local store for the session to enable validator testing

        toast.success("Configuración del proyecto actualizada")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configuración del Proyecto</DialogTitle>
                    <DialogDescription>
                        Ajusta los parámetros normativos para la validación automática.
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
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
