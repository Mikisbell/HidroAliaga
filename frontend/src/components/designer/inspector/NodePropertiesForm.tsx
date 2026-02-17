
"use client"

import { useState, useEffect } from "react"
import { Nudo } from "@/types/models"
import { useProjectStore } from "@/store/project-store"
import { updateNudo } from "@/app/actions/nudos"
import { Loader2 } from "lucide-react"

import { PatternList } from "@/components/patterns/PatternList"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface NodePropertiesFormProps {
    nudo: Nudo
}

export default function NodePropertiesForm({ nudo }: NodePropertiesFormProps) {
    const updateNudoStore = useProjectStore(state => state.updateNudo)
    const patrones = useProjectStore(state => state.patrones)
    const scenarios = useProjectStore(state => state.scenarios)
    const activeScenarioId = useProjectStore(state => state.activeScenarioId)

    // Calculate Parent Node for Overrides
    const parentNudo = (() => {
        if (!activeScenarioId) return null;
        const activeScenario = scenarios.find(s => s.id === activeScenarioId);
        if (!activeScenario || !activeScenario.parent_id) return null;
        const parentScenario = scenarios.find(s => s.id === activeScenario.parent_id);
        if (!parentScenario?.snapshot?.nudos) return null;
        return parentScenario.snapshot.nudos.find(n => n.id === nudo.id);
    })();

    const [formData, setFormData] = useState({
        codigo: nudo.codigo,
        cota_terreno: nudo.cota_terreno,
        demanda_base: nudo.demanda_base,
        tipo: nudo.tipo,
        patron_demanda_id: nudo.patron_demanda_id || ""
    })
    const [isSaving, setIsSaving] = useState(false)

    // Update form when selection changes
    useEffect(() => {
        setFormData({
            codigo: nudo.codigo,
            cota_terreno: nudo.cota_terreno,
            demanda_base: nudo.demanda_base,
            tipo: nudo.tipo,
            patron_demanda_id: nudo.patron_demanda_id || ""
        })
    }, [nudo.id, nudo])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cota_terreno' || name === 'demanda_base' ? parseFloat(value) || 0 : value
        }))
    }

    const handleReset = async (field: keyof typeof formData) => {
        if (!parentNudo) return;
        const parentValue = parentNudo[field as keyof Nudo];

        // Optimistic
        const newValue = field === 'patron_demanda_id' ? (parentValue || "") : (parentValue ?? 0); // Handle nulls/undefined

        setFormData(prev => ({ ...prev, [field]: newValue }));

        const updatedNudo = { ...nudo, [field]: parentValue }; // Use raw parent value
        updateNudoStore(updatedNudo as Nudo);

        await updateNudo(nudo.id, { [field]: parentValue });
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const updatedNudo = { ...nudo, ...formData }
            // Ensure types match Nudo
            updateNudoStore(updatedNudo as Nudo)
            await updateNudo(updatedNudo.id, updatedNudo)
        } catch (error) {
            console.error("Error updating node:", error)
        } finally {
            setIsSaving(false)
        }
    }

    // Helper to render override indicator
    const renderOverride = (field: keyof typeof formData) => {
        if (!parentNudo) return null;

        const currentValue = formData[field];
        // Normalize for comparison (handle null/undefined/empty string)
        const parentValueRaw = parentNudo[field as keyof Nudo];
        const parentValue = field === 'patron_demanda_id' ? (parentValueRaw || "") : (parentValueRaw ?? 0);

        // Simple equality check (works for primitive types)
        if (currentValue != parentValue) {
            return (
                <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] text-orange-500 font-semibold bg-orange-500/10 px-1 rounded">Modificado</span>
                    <button
                        onClick={() => handleReset(field)}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline"
                        title={`Resetear a valor original: ${parentValue}`}
                    >
                        Reset
                    </button>
                </div>
            );
        }
        return null;
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
                <label className="text-xs font-medium text-muted-foreground">Tipo de Componente</label>
                <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="union">Nudo (Unión)</option>
                    <option value="reservorio">Reservorio</option>
                    <option value="cisterna">Cisterna</option>
                    <option value="tanque_elevado">Tanque Elevado</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">Cota (m)</label>
                        {renderOverride('cota_terreno')}
                    </div>
                    <input
                        type="number"
                        name="cota_terreno"
                        value={formData.cota_terreno}
                        onChange={handleChange}
                        className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentNudo && formData.cota_terreno != (parentNudo.cota_terreno ?? 0) ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">Demanda (L/s)</label>
                        {renderOverride('demanda_base')}
                    </div>
                    <input
                        type="number"
                        name="demanda_base"
                        value={formData.demanda_base}
                        onChange={handleChange}
                        className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentNudo && formData.demanda_base != (parentNudo.demanda_base ?? 0) ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                    />
                </div>
            </div>

            {/* Demand Pattern Selector */}
            <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-muted-foreground mr-2">Patrón de Demanda</label>
                    {renderOverride('patron_demanda_id')}
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="text-[10px] text-primary hover:underline ml-auto">
                                Gestionar Patrones
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Gestión de Patrones</DialogTitle>
                            </DialogHeader>
                            <PatternList onSelect={(id) => {
                                setFormData(prev => ({ ...prev, patron_demanda_id: id }))
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
                <select
                    name="patron_demanda_id"
                    value={formData.patron_demanda_id || ""}
                    onChange={handleChange}
                    className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentNudo && (formData.patron_demanda_id || "") != (parentNudo.patron_demanda_id || "") ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                >
                    <option value="">(Ninguno - Constante)</option>
                    {patrones.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                </select>
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
