
"use client"

import { useState, useEffect } from "react"
import { Tramo } from "@/types/models"
import { useProjectStore } from "@/store/project-store"
import { updateTramo } from "@/app/actions/tramos"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PipePropertiesFormProps {
    tramo: Tramo
}

export default function PipePropertiesForm({ tramo }: PipePropertiesFormProps) {
    const updateTramoStore = useProjectStore(state => state.updateTramo)
    const scenarios = useProjectStore(state => state.scenarios)
    const activeScenarioId = useProjectStore(state => state.activeScenarioId)

    // Calculate Parent Tramo for Overrides
    const parentTramo = (() => {
        if (!activeScenarioId) return null;
        const activeScenario = scenarios.find(s => s.id === activeScenarioId);
        if (!activeScenario || !activeScenario.parent_id) return null;
        const parentScenario = scenarios.find(s => s.id === activeScenario.parent_id);
        if (!parentScenario?.snapshot?.tramos) return null;
        return parentScenario.snapshot.tramos.find(t => t.id === tramo.id);
    })();

    const [formData, setFormData] = useState({
        codigo: tramo.codigo,
        diametro_interior: tramo.diametro_interior,
        material: tramo.material,
        longitud: tramo.longitud,
        tipo: tramo.tipo, // Add type
        curva_bomba_id: tramo.curva_bomba_id || "",
        tipo_valvula: tramo.tipo_valvula || "PRV",
        consigna_valvula: tramo.consigna_valvula,
        estado_inicial: tramo.estado_inicial || "open"
    })
    const [isSaving, setIsSaving] = useState(false)
    const curvas = useProjectStore(state => state.curvas) // Get curves

    useEffect(() => {
        setFormData({
            codigo: tramo.codigo,
            diametro_interior: tramo.diametro_interior,
            material: tramo.material,
            longitud: tramo.longitud,
            tipo: tramo.tipo,
            curva_bomba_id: tramo.curva_bomba_id || "",
            tipo_valvula: tramo.tipo_valvula || "PRV",
            consigna_valvula: tramo.consigna_valvula,
            estado_inicial: tramo.estado_inicial || "open"
        })
    }, [tramo.id, tramo])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: ['diametro_interior', 'longitud', 'consigna_valvula'].includes(name)
                ? parseFloat(value) || 0
                : value
        }))
    }

    const handleReset = async (field: keyof typeof formData) => {
        if (!parentTramo) return;
        const parentValue = parentTramo[field as keyof Tramo];

        // Optimistic
        const newValue = (field === 'curva_bomba_id' || field === 'tipo_valvula' || field === 'estado_inicial')
            ? (parentValue || "")
            : (parentValue ?? 0);

        // Cast to any to avoid strict type checking on mixed types for now
        setFormData(prev => ({ ...prev, [field]: newValue as any }));

        // @ts-ignore
        const updatedTramo: Tramo = { ...tramo, [field]: parentValue };
        // @ts-ignore
        useProjectStore.getState().updateTramo?.(updatedTramo);

        // @ts-ignore
        await updateTramo({ ...tramo, [field]: parentValue });
    }

    const renderOverride = (field: keyof typeof formData) => {
        if (!parentTramo) return null;

        const currentValue = formData[field];
        const parentValueRaw = parentTramo[field as keyof Tramo];

        // Default handling
        let parentValue: any = parentValueRaw;
        if (field === 'curva_bomba_id') parentValue = parentValueRaw || "";
        if (field === 'tipo_valvula') parentValue = parentValueRaw || "PRV";
        if (field === 'estado_inicial') parentValue = parentValueRaw || "open";
        if (field === 'consigna_valvula') parentValue = parentValueRaw || undefined; // checking undefined
        if (typeof currentValue === 'number' && typeof parentValue === 'undefined') parentValue = 0; // heuristic

        // Equality check
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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // @ts-ignore
            const updatedTramo: Tramo = { ...tramo, ...formData }

            // 1. Optimistic Update
            // @ts-ignore
            useProjectStore.getState().updateTramo?.(updatedTramo)

            // 2. Server Action
            const res = await updateTramo(updatedTramo)
            if (!res.success) throw new Error(res.message)

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
                <label className="text-xs font-medium text-muted-foreground">Tipo de Elemento</label>
                <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="tuberia">Tubería</option>
                    <option value="bomba">Bomba</option>
                    <option value="valvula">Válvula de Control</option>
                    <option value="accesorio">Accesorio</option>
                </select>
            </div>

            {formData.tipo === 'tuberia' && (
                <>
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
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-muted-foreground">Diámetro (mm)</label>
                                {renderOverride('diametro_interior')}
                            </div>
                            <input
                                type="number"
                                name="diametro_interior"
                                value={formData.diametro_interior}
                                onChange={handleChange}
                                className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentTramo && formData.diametro_interior != parentTramo.diametro_interior ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Longitud (m)</label>
                            <input
                                type="number"
                                name="longitud"
                                value={formData.longitud?.toFixed(2)}
                                onChange={handleChange}
                                disabled
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </>
            )}

            {formData.tipo === 'bomba' && (
                <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">Curva Característica</label>
                        {renderOverride('curva_bomba_id')}
                        <CurveListDialog onSelect={(id) => setFormData(prev => ({ ...prev, curva_bomba_id: id }))} />
                    </div>
                    <select
                        name="curva_bomba_id"
                        value={formData.curva_bomba_id || ""}
                        onChange={handleChange}
                        className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentTramo && (formData.curva_bomba_id || "") != (parentTramo.curva_bomba_id || "") ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                    >
                        <option value="">(Seleccionar Curva)</option>
                        {curvas.filter(c => c.tipo === 'bomba').map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            )}

            {formData.tipo === 'valvula' && (
                <>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted-foreground">Tipo de Válvula</label>
                            {renderOverride('tipo_valvula')}
                        </div>
                        <select
                            name="tipo_valvula"
                            value={formData.tipo_valvula}
                            onChange={handleChange}
                            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentTramo && (formData.tipo_valvula || "PRV") != (parentTramo.tipo_valvula || "PRV") ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                        >
                            <option value="PRV">Reductora de Presión (PRV)</option>
                            <option value="PSV">Sostenedora de Presión (PSV)</option>
                            <option value="FCV">Controladora de Caudal (FCV)</option>
                            <option value="TCV">Aceleradora (TCV)</option>
                            <option value="GPV">Propósito General (GPV)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted-foreground">
                                {formData.tipo_valvula === 'FCV' ? 'Caudal Máximo (L/s)' : 'Presión Consigna (m)'}
                            </label>
                            {renderOverride('consigna_valvula')}
                        </div>
                        <input
                            type="number"
                            name="consigna_valvula"
                            value={formData.consigna_valvula || 0}
                            onChange={handleChange}
                            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentTramo && (formData.consigna_valvula || 0) != (parentTramo.consigna_valvula || 0) ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-muted-foreground">Estado Inicial</label>
                            {renderOverride('estado_inicial')}
                        </div>
                        <select
                            name="estado_inicial"
                            value={formData.estado_inicial}
                            onChange={handleChange}
                            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${parentTramo && (formData.estado_inicial || "open") != (parentTramo.estado_inicial || "open") ? 'border-orange-500/50 bg-orange-500/5' : 'border-input'}`}
                        >
                            <option value="open">Abierta</option>
                            <option value="closed">Cerrada</option>
                            <option value="active">Activa (Regulando)</option>
                        </select>
                    </div>
                </>
            )}

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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CurveList } from "@/components/hydraulics/CurveList"

function CurveListDialog({ onSelect }: { onSelect: (id: string) => void }) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-[10px] text-primary hover:underline">
                    Gestionar Curvas
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gestión de Curvas</DialogTitle>
                </DialogHeader>
                <CurveList
                    filterType="bomba"
                    onSelect={(id) => {
                        onSelect(id)
                        setOpen(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
