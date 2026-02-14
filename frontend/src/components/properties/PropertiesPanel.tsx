"use client"

import { useProjectStore } from "@/store/project-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Settings2, Activity, Map as MapIcon, Save } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { updateNudo } from "@/app/actions/nudos"
import { updateTramo } from "@/app/actions/tramos"
import { Nudo, Tramo } from "@/types/models"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function PropertiesPanel() {
    const selectedElement = useProjectStore(state => state.selectedElement)
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)
    const project = useProjectStore(state => state.currentProject)

    if (!selectedElement) return null

    const nudo = selectedElement.type === 'nudo' ? nudos.find(n => n.id === selectedElement.id) : null
    const tramo = selectedElement.type === 'tramo' ? tramos.find(t => t.id === selectedElement.id) : null

    return (
        <Card className="h-full border-none shadow-none bg-transparent">
            <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    {selectedElement.type === 'nudo' ? <MapIcon className="w-5 h-5 text-blue-500" /> : <Activity className="w-5 h-5 text-indigo-500" />}
                    <div>
                        <CardTitle className="text-base">
                            {selectedElement.type === 'nudo' ? 'Propiedades del Nudo' : 'Propiedades del Tramo'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {nudo?.codigo || tramo?.codigo || 'Elemento seleccionado'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                {selectedElement.type === 'nudo' && nudo && (
                    <NudoProperties nudo={nudo} />
                )}
                {selectedElement.type === 'tramo' && tramo && (
                    <TramoProperties tramo={tramo} />
                )}
            </CardContent>
        </Card>
    )
}

function NudoProperties({ nudo }: { nudo: Nudo }) {
    const [cota, setCota] = useState(nudo.cota_terreno?.toString() || "0")
    const [demanda, setDemanda] = useState(nudo.demanda_base?.toString() || "0")
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setCota(nudo.cota_terreno?.toString() || "0")
        setDemanda(nudo.demanda_base?.toString() || "0")
    }, [nudo.id]) // Reset on change

    const handleSave = () => {
        startTransition(async () => {
            try {
                const res = await updateNudo(nudo.id, {
                    cota_terreno: parseFloat(cota),
                    demanda_base: parseFloat(demanda)
                })
                if (!res.success) throw new Error(res.message)

                toast.success(`Nudo ${nudo.codigo} actualizado`)
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Error al actualizar el nudo")
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Código</Label>
                <Input value={nudo.codigo} disabled className="bg-muted font-mono" />
            </div>

            <div className="space-y-2">
                <Label>Tipo</Label>
                <Select defaultValue={nudo.tipo} disabled>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="union">Unión</SelectItem>
                        <SelectItem value="reservorio">Reservorio</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            <div className="space-y-2">
                <Label>Cota Terreno (m.s.n.m.)</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        value={cota}
                        onChange={e => setCota(e.target.value)}
                        className="font-mono"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Demanda Base (L/s)</Label>
                <Input
                    type="number"
                    value={demanda}
                    onChange={e => setDemanda(e.target.value)}
                    className="font-mono"
                />
            </div>

            <Button onClick={handleSave} className="w-full mt-4" size="sm" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
        </div>
    )
}

function TramoProperties({ tramo }: { tramo: Tramo }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Código</Label>
                <Input value={tramo.codigo} disabled className="bg-muted font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Longitud (m)</Label>
                    <Input value={tramo.longitud.toFixed(2)} disabled className="bg-muted font-mono" />
                </div>
                <div className="space-y-2">
                    <Label>Diámetro (mm)</Label>
                    <Input value={tramo.diametro_interior} disabled className="bg-muted font-mono" />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Material</Label>
                <Input value={tramo.material} disabled className="bg-muted" />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                La edición de tuberías estará disponible en la próxima actualización.
            </div>
        </div>
    )
}
