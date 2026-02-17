"use client"

import { useState, useMemo } from "react"
import { CurvaCaracteristica, CurvaCaracteristicaCreate, TipoCurva } from "@/types/models"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

interface CurveEditorProps {
    initialData?: CurvaCaracteristica
    onSave: (data: CurvaCaracteristicaCreate) => void
    onCancel: () => void
}

export function CurveEditor({ initialData, onSave, onCancel }: CurveEditorProps) {
    const [nombre, setNombre] = useState(initialData?.nombre || "")
    const [tipo, setTipo] = useState<TipoCurva>(initialData?.tipo || 'bomba')
    const [puntos, setPuntos] = useState<{ x: number; y: number }[]>(
        initialData?.puntos || []
    )

    // Sort points by X for proper line rendering
    const sortedPoints = useMemo(() => {
        return [...puntos].sort((a, b) => a.x - b.x)
    }, [puntos])

    const handlePointChange = (index: number, field: 'x' | 'y', value: number) => {
        const newPoints = [...puntos]
        newPoints[index] = { ...newPoints[index], [field]: value }
        setPuntos(newPoints)
    }

    const addPoint = () => {
        setPuntos([...puntos, { x: 0, y: 0 }])
    }

    const removePoint = (index: number) => {
        const newPoints = puntos.filter((_, i) => i !== index)
        setPuntos(newPoints)
    }

    const handleSave = () => {
        if (!nombre.trim()) return
        onSave({
            nombre,
            tipo,
            puntos: sortedPoints
        })
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nombre de la Curva</Label>
                    <Input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Ej. Bomba 5HP - Modelo X"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as TipoCurva)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bomba">Curva Bomba (Q-H)</SelectItem>
                            <SelectItem value="volumen">Curva Volumen (H-V)</SelectItem>
                            <SelectItem value="eficiencia">Curva Eficiencia (Q-E)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Points Input */}
                <Card className="lg:col-span-1 h-[500px] flex flex-col">
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Puntos ({tipo === 'bomba' ? 'Q vs H' : 'X vs Y'})</CardTitle>
                        <Button size="sm" variant="ghost" onClick={addPoint}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground mb-2">
                                <div>{tipo === 'bomba' ? 'Caudal (L/s)' : 'X'}</div>
                                <div>{tipo === 'bomba' ? 'Altura (m)' : 'Y'}</div>
                                <div></div>
                            </div>
                            {puntos.map((point, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                                    <Input
                                        type="number"
                                        className="h-8"
                                        value={point.x}
                                        onChange={e => handlePointChange(index, 'x', parseFloat(e.target.value) || 0)}
                                    />
                                    <Input
                                        type="number"
                                        className="h-8"
                                        value={point.y}
                                        onChange={e => handlePointChange(index, 'y', parseFloat(e.target.value) || 0)}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => removePoint(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {puntos.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    No hay puntos definidos.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Chart */}
                <Card className="lg:col-span-2 h-[500px] flex flex-col">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">Visualización Gráfica</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={sortedPoints || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name={tipo === 'bomba' ? "Caudal" : "X"}
                                    unit={tipo === 'bomba' ? " L/s" : ""}
                                    label={{ value: tipo === 'bomba' ? "Caudal (L/s)" : "X", position: 'insideBottomRight', offset: -10 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name={tipo === 'bomba' ? "Altura" : "Y"}
                                    unit={tipo === 'bomba' ? " m" : ""}
                                    label={{ value: tipo === 'bomba' ? "Altura Dinámica (m)" : "Y", angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Puntos" dataKey="y" fill="hsl(var(--primary))" />
                                <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!nombre.trim() || puntos.length < 2}>Guardar Curva</Button>
            </div>
        </div>
    )
}
