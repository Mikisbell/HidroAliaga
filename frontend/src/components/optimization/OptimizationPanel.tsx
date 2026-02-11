"use client"

import { useState } from "react"
import { optimizeNetwork, applyOptimization } from "@/app/actions/optimize"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface OptimizationPanelProps {
    proyectoId: string
    currentCost: number // We might need to calculate this or pass it
}

export default function OptimizationPanel({ proyectoId, currentCost: initialCost }: OptimizationPanelProps) {
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])

    const handleOptimize = async () => {
        setIsOptimizing(true)
        setResult(null)
        setHistory([])

        try {
            const res = await optimizeNetwork(proyectoId, {
                populationSize: 50,
                maxGenerations: 50
            })

            if (res.success) {
                setResult(res)
                setHistory(res.history || [])
            }
        } catch (error) {
            console.error("Optimization failed:", error)
            alert("Error al optimizar la red")
        } finally {
            setIsOptimizing(false)
        }
    }

    const handleApply = async () => {
        if (!result) return
        setIsApplying(true)
        try {
            await applyOptimization(proyectoId, result.optimizedDiameters)
            alert("Optimización aplicada correctamente")
            setResult(null) // Reset result to force refresh or just keep it?
        } catch (error) {
            console.error("Failed to apply optimization:", error)
            alert("Error al aplicar cambios")
        } finally {
            setIsApplying(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <Card className="bg-card/60 border-border/30">
                <CardHeader>
                    <CardTitle>Optimización con Algoritmo Genético</CardTitle>
                    <CardDescription>
                        Encuentra la combinación óptima de diámetros para minimizar costos cumpliendo normativas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!result && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <span className="text-4xl">🧬</span>
                            </div>
                            <Button
                                onClick={handleOptimize}
                                size="lg"
                                disabled={isOptimizing}
                                className="w-full max-w-xs font-semibold"
                            >
                                {isOptimizing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Optimizando (puede tardar)...
                                    </>
                                ) : (
                                    "Iniciar Optimización"
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center max-w-md">
                                Se ejecutarán 50 generaciones con una población de 50 individuos.
                                El proceso buscará minimizar el costo de tuberías manteniendo presiones entre 15 y 50 m.c.a.
                            </p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="Costo Original (Est.)"
                                    value={`$${initialCost?.toFixed(2) || '---'}`}
                                    color="gray"
                                />
                                <StatCard
                                    label="Costo Optimizado"
                                    value={`$${result.bestCost.toFixed(2)}`}
                                    color="emerald"
                                    highlight
                                />
                                <StatCard
                                    label="Presión Min / Max"
                                    value={`${result.minPressure.toFixed(1)} / ${result.maxPressure.toFixed(1)}`}
                                    sub="m.c.a."
                                    color={result.minPressure < 15 || result.maxPressure > 50 ? "red" : "blue"}
                                />
                                <StatCard
                                    label="Ahorro Potencial"
                                    value={initialCost ? `${((initialCost - result.bestCost) / initialCost * 100).toFixed(1)}%` : 'N/A'}
                                    color="amber"
                                />
                            </div>

                            {/* Chart */}
                            <div className="h-[300px] w-full bg-card/40 rounded-xl border border-border/20 p-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Progreso de Convergencia (Fitness)</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="generation" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="bestFitness" stroke="oklch(0.70 0.16 160)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                                <Button variant="outline" onClick={() => setResult(null)}>
                                    Descartar
                                </Button>
                                <Button onClick={handleApply} disabled={isApplying}>
                                    {isApplying ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Aplicando...
                                        </>
                                    ) : (
                                        "Aplicar Cambios a la Red"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ label, value, sub, color = "gray", highlight = false }: any) {
    const colors: any = {
        gray: "text-muted-foreground",
        emerald: "text-[oklch(0.70_0.16_160)]",
        blue: "text-[oklch(0.70_0.18_230)]",
        red: "text-red-500",
        amber: "text-amber-500"
    }

    return (
        <div className={`p-4 rounded-xl border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-background/40 border-border/20'}`}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
            <p className={`text-xl font-bold mt-1 ${colors[color]}`}>{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground/50">{sub}</p>}
        </div>
    )
}
