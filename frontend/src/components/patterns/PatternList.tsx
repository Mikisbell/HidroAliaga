"use client"

import { useState } from "react"
import { useProjectStore } from "@/store/project-store"
import { PatronDemanda, PatronDemandaCreate } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PatternEditor } from "./PatternEditor"

interface PatternListProps {
    onSelect?: (patternId: string) => void
    viewOnly?: boolean
}

export function PatternList({ onSelect, viewOnly = false }: PatternListProps) {
    const patterns = useProjectStore(state => state.patrones)
    const addPattern = useProjectStore(state => state.addPattern)
    const updatePattern = useProjectStore(state => state.updatePattern)
    const deletePattern = useProjectStore(state => state.deletePattern)
    const currentProject = useProjectStore(state => state.currentProject)

    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [editingPattern, setEditingPattern] = useState<PatronDemanda | undefined>(undefined)

    const handleEdit = (pattern: PatronDemanda) => {
        setEditingPattern(pattern)
        setIsEditorOpen(true)
    }

    const handleCreate = () => {
        setEditingPattern(undefined)
        setIsEditorOpen(true)
    }

    const handleSave = async (data: PatronDemandaCreate) => {
        if (!currentProject) return

        if (editingPattern) {
            // Update
            updatePattern({
                ...editingPattern,
                ...data,
                multiplicadores: data.multiplicadores || editingPattern.multiplicadores || []
            })
        } else {
            // Create
            addPattern({
                id: crypto.randomUUID(),
                proyecto_id: currentProject.id,
                ...data,
                multiplicadores: data.multiplicadores || Array(24).fill(1),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        }
        setIsEditorOpen(false)
    }

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm("¿Estás seguro de eliminar este patrón? Se removerá de todos los nodos asignados.")) {
            deletePattern(id)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Patrones Disponibles</h3>
                <Button size="sm" variant="outline" onClick={handleCreate} disabled={viewOnly}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo
                </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {patterns.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                        No hay patrones creados.
                    </div>
                )}
                {patterns.map(pattern => (
                    <div
                        key={pattern.id}
                        className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                        onClick={() => onSelect?.(pattern.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{pattern.nombre}</div>
                            <div className="text-xs text-muted-foreground truncate">
                                Prom: {(pattern.multiplicadores.reduce((a, b) => a + b, 0) / 24).toFixed(2)}x
                            </div>
                        </div>
                        {!viewOnly && (
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(pattern); }}
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={(e) => handleDelete(pattern.id, e)}
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
                        <DialogTitle>{editingPattern ? 'Editar Patrón' : 'Nuevo Patrón de Demanda'}</DialogTitle>
                        <DialogDescription>
                            Define los factores de multiplicación horaria para simular la variación de consumo durante el día.
                        </DialogDescription>
                    </DialogHeader>
                    {isEditorOpen && (
                        <PatternEditor
                            initialData={editingPattern}
                            onSave={handleSave}
                            onCancel={() => setIsEditorOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
