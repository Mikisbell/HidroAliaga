"use client"

import { useState } from "react"
import { useProjectStore } from "@/store/project-store"
import { CurvaCaracteristica, CurvaCaracteristicaCreate } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CurveEditor } from "./CurveEditor"

interface CurveListProps {
    onSelect?: (curveId: string) => void
    viewOnly?: boolean
    filterType?: CurvaCaracteristica['tipo']
}

export function CurveList({ onSelect, viewOnly = false, filterType }: CurveListProps) {
    const curves = useProjectStore(state => state.curvas)
    const addCurve = useProjectStore(state => state.addCurve)
    const updateCurve = useProjectStore(state => state.updateCurve)
    const deleteCurve = useProjectStore(state => state.deleteCurve)
    const currentProject = useProjectStore(state => state.currentProject)

    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingCurve, setEditingCurve] = useState<CurvaCaracteristica | undefined>(undefined)

    const filteredCurves = filterType
        ? curves.filter(c => c.tipo === filterType)
        : curves

    const handleEdit = (curve: CurvaCaracteristica) => {
        setEditingCurve(curve)
        setIsEditorOpen(true)
    }

    const handleCreate = () => {
        setEditingCurve(undefined)
        setIsEditorOpen(true)
    }

    const handleSave = async (data: CurvaCaracteristicaCreate) => {
        if (!currentProject) return

        if (editingCurve) {
            // Update
            updateCurve({
                ...editingCurve,
                ...data,
                puntos: data.puntos || editingCurve.puntos || []
            })
        } else {
            // Create
            addCurve({
                id: crypto.randomUUID(),
                proyecto_id: currentProject.id,
                ...data,
                tipo: data.tipo || 'bomba',
                puntos: data.puntos || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        }
        setIsEditorOpen(false)
    }

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm("¿Estás seguro de eliminar esta curva?")) {
            deleteCurve(id)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Curvas Disponibles</h3>
                <Button size="sm" variant="outline" onClick={handleCreate} disabled={viewOnly}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredCurves.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                        No hay curvas creadas{filterType ? ` de tipo ${filterType}` : ''}.
                    </div>
                )}
                {filteredCurves.map(curve => (
                    <div
                        key={curve.id}
                        className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                        onClick={() => onSelect?.(curve.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{curve.nombre}</div>
                            <div className="text-xs text-muted-foreground truncate">
                                Tipo: {curve.tipo} • {curve.puntos.length} puntos
                            </div>
                        </div>
                        {!viewOnly && (
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(curve); }}
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={(e) => handleDelete(curve.id, e)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCurve ? 'Editar Curva' : 'Nueva Curva Característica'}</DialogTitle>
                        <DialogDescription>
                            Define los puntos de la curva (Caudal vs Altura para bombas).
                        </DialogDescription>
                    </DialogHeader>
                    {isEditorOpen && (
                        <CurveEditor
                            initialData={editingCurve}
                            onSave={handleSave}
                            onCancel={() => setIsEditorOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
