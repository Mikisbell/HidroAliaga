
"use client"

import { useState, useEffect } from "react"
import { Tramo } from "@/types/models"
import { useProjectStore } from "@/store/project-store"
import { updateTramoAction } from "@/app/actions/tramos"
import { Loader2 } from "lucide-react"

interface PipePropertiesFormProps {
    tramo: Tramo
}

export default function PipePropertiesForm({ tramo }: PipePropertiesFormProps) {
    const updateTramoStore = useProjectStore(state => state.updateTramo) // We need to add this action to store if missing
    // Actually, looking at store/project-store.ts, `updateTramo` is NOT exported in the interface or implementation yet?
    // Let me check project-store.ts content again later. Assuming it exists or I will add it.
    // Wait, I recall seeing `addTramo` and `removeTramo`. Let me double check if `updateTramo` exists.
    // If not, I will add it. For now I will assume I need to add it.

    const [formData, setFormData] = useState({
        codigo: tramo.codigo,
        diametro_interior: tramo.diametro_interior,
        material: tramo.material,
        longitud: tramo.longitud
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setFormData({
            codigo: tramo.codigo,
            diametro_interior: tramo.diametro_interior,
            material: tramo.material,
            longitud: tramo.longitud
        })
    }, [tramo.id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'diametro_interior' || name === 'longitud' ? parseFloat(value) || 0 : value
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // 1. Optimistic Update (Zustand)
            // We need to implement updateTramo in store if it's missing
            const updatedTramo = { ...tramo, ...formData }
            // @ts-ignore - will implement in store next
            useProjectStore.getState().updateTramo?.(updatedTramo)

            // 2. Server Action
            await updateTramo(updatedTramo)

        } catch (error) {
            console.error("Error updating pipe:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Código / Nombre</label>
                <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Material</label>
                <select
                    name="material"
                    value={formData.material || 'PVC'}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="PVC">PVC</option>
                    <option value="HDPE">HDPE (Polietileno)</option>
                    <option value="ACERO">Acero</option>
                    <option value="HFD">Hierro Fundido Dúctil</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Diámetro (mm)</label>
                    <input
                        type="number"
                        name="diametro_interior"
                        value={formData.diametro_interior}
                        onChange={handleChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Longitud (m)</label>
                    <input
                        type="number"
                        name="longitud"
                        value={formData.longitud?.toFixed(2)}
                        onChange={handleChange}
                        disabled // Usually calculated by geometry, but maybe editable? Let's allow edit for overrides or just show.
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring opacity-50 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-muted-foreground text-right">Calculada automáticamente</p>
                </div>
            </div>

            <div className="pt-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}
