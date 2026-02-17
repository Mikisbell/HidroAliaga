"use client"

import { useState, useMemo } from "react"
import { PatronDemanda, PatronDemandaCreate } from "@/types/models"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface PatternEditorProps {
    initialData?: PatronDemanda
    onSave: (data: PatronDemandaCreate) => void
    onCancel: () => void
}

export function PatternEditor({ initialData, onSave, onCancel }: PatternEditorProps) {
    const [nombre, setNombre] = useState(initialData?.nombre || "")
    const [multipliers, setMultipliers] = useState<number[]>(
        initialData?.multiplicadores || Array(24).fill(1)
    )

    const chartData = useMemo(() => {
        return multipliers.map((val, h) => ({
            hour: h,
            value: val,
            label: `${h}:00`
        }))
    }, [multipliers])

    const handleMultiplierChange = (index: number, value: number) => {
        const newMultipliers = [...multipliers]
        newMultipliers[index] = Math.max(0, parseFloat(value.toFixed(2)))
        setMultipliers(newMultipliers)
    }

    const handleSave = () => {
        if (!nombre.trim()) return
        onSave({
            nombre,
            descripcion: initialData?.descripcion,
            multiplicadores: multipliers
        })
    }

    const average = multipliers.reduce((a, b) => a + b, 0) / 24

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Nombre del Patrón</Label>
                <Input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Residencial, Comercial..."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Verification & Input Table (Compact) */}
                <Card className="lg:col-span-1 h-[500px] flex flex-col">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">Multiplicadores Horarios</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-2">
                            {multipliers.map((val, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                    <span className="w-10 font-mono text-muted-foreground">{index}:00</span>
                                    <Input
                                        type="number"
                                        step={0.1}
                                        min={0}
                                        className="h-7 w-20 text-right"
                                        value={val}
                                        onChange={e => handleMultiplierChange(index, parseFloat(e.target.value) || 0)}
                                    />
                                    <Slider
                                        value={[val]}
                                        min={0}
                                        max={3}
                                        step={0.1}
                                        onValueChange={([v]) => handleMultiplierChange(index, v)}
                                        className="flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Visual Chart */}
                <Card className="lg:col-span-2 h-[500px] flex flex-col">
                    <CardHeader className="py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Visualización</CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Promedio: <span className={average > 1.05 || average < 0.95 ? "text-amber-500 font-bold" : "text-green-500 font-bold"}>
                                {average.toFixed(2)}
                            </span> (Ideal: 1.00)
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} width={30} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(var(--foreground), 0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <ReferenceLine y={1} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!nombre.trim()}>Guardar Patrón</Button>
            </div>
        </div>
    )
}
