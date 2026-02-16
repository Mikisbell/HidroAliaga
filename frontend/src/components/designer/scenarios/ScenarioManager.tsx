"use client"

import { useState } from 'react'
import { useProjectStore } from '@/store/project-store'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Check, ArrowRight, Copy, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScenarioManagerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ScenarioManager({ open, onOpenChange }: ScenarioManagerProps) {
    const { scenarios, activeScenarioId, createScenario, switchScenario, deleteScenario } = useProjectStore()
    const [newName, setNewName] = useState('')

    const handleCreate = () => {
        if (!newName.trim()) return
        // Create child of currently active scenario
        // If activeScenarioId is null, ProjectStore defaults to Base scenario as parent
        createScenario(newName, activeScenarioId)
        setNewName('')
    }

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('¿Estás seguro de eliminar este escenario?')) {
            deleteScenario(id)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Gestión de Escenarios
                    </SheetTitle>
                    <SheetDescription>
                        Crea alternativas de diseño (ej. "Demanda Futura" hereda de "Actual").
                        Los cambios en un hijo no afectan al padre.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 flex flex-col h-full max-h-[calc(100vh-120px)]">

                    {/* Create New */}
                    <div className="flex gap-2 mb-6">
                        <Input
                            placeholder="Nombre del nuevo escenario..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        />
                        <Button onClick={handleCreate} disabled={!newName.trim()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Crear
                        </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-3 overflow-y-auto pr-2 pb-4 flex-1">
                        {scenarios.map(scenario => {
                            // Helper logic: Active if ID matches OR if Base and no active ID
                            const isReallyActive = (activeScenarioId === scenario.id) || (scenario.is_base && !activeScenarioId)
                            const parent = scenarios.find(s => s.id === scenario.parent_id)

                            return (
                                <div
                                    key={scenario.id}
                                    onClick={() => !isReallyActive && switchScenario(scenario.id)}
                                    className={cn(
                                        "relative flex flex-col p-4 rounded-lg border transition-all select-none",
                                        isReallyActive
                                            ? "bg-primary/5 border-primary shadow-sm cursor-default"
                                            : "hover:bg-muted/50 cursor-pointer border-border"
                                    )}
                                >
                                    {/* Active Strip */}
                                    {isReallyActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
                                    )}

                                    <div className="flex items-center justify-between w-full pl-2">
                                        <div className="font-medium flex items-center gap-2 text-foreground">
                                            {scenario.name}
                                            {isReallyActive && (
                                                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Activo
                                                </span>
                                            )}
                                            {scenario.is_base && (
                                                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border">
                                                    Base
                                                </span>
                                            )}
                                        </div>

                                        {!isReallyActive && !scenario.is_base && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDelete(scenario.id, e)}
                                                title="Eliminar escenario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="pl-2 mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                        {parent ? (
                                            <div className="flex items-center">
                                                <ArrowRight className="w-3 h-3 mr-1 text-primary/50" />
                                                Hereda de <strong>{parent.name}</strong>
                                            </div>
                                        ) : (
                                            <div className="opacity-50">Escenario Raíz</div>
                                        )}

                                        <div className="opacity-60">
                                            {new Date(scenario.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {scenarios.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                No se encontraron escenarios.
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
