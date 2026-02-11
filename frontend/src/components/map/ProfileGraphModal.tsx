"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from "recharts"
import { Nudo } from "@/types/models"

export interface ProfileDataPoint {
    name: string
    distance: number // Cumulative distance from source
    elevation: number // Cota terreno
    hydraulicHead: number // Cota piezometrica (Elevation + Static Pressure)
    staticPressure: number // Calculated
    nodeType: string
}

interface ProfileGraphModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    data: ProfileDataPoint[]
    targetNodeCode: string
}

export function ProfileGraphModal({ isOpen, onOpenChange, data, targetNodeCode }: ProfileGraphModalProps) {

    const chartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            // For visualization, we might want to fill the area below elevation
            landSurface: d.elevation,
        }))
    }, [data])

    const minElev = Math.min(...data.map(d => Math.min(d.elevation, d.hydraulicHead)))
    const maxElev = Math.max(...data.map(d => Math.max(d.elevation, d.hydraulicHead)))
    const padding = (maxElev - minElev) * 0.1

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Perfil Longitudinal - {targetNodeCode}</DialogTitle>
                    <DialogDescription>
                        Perfil desde la fuente hasta el nudo seleccionado.
                        Area gris: Terreno. Línea azul: Gradiente Hidráulica.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 w-full min-h-0 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="colorLand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="distance"
                                type="number"
                                unit="m"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(val) => val.toFixed(0)}
                                label={{ value: 'Distancia (m)', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                domain={[minElev - padding, maxElev + padding]}
                                unit="m"
                                label={{ value: 'Cota (m)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #ccc' }}
                                formatter={(value: any, name: any) => [
                                    (typeof value === 'number' ? value.toFixed(2) : value) + ' m',
                                    name === 'landSurface' ? 'Terreno' : name === 'hydraulicHead' ? 'Línea Piezométrica' : name
                                ]}
                                labelFormatter={(label) => `Distancia: ${parseFloat(label).toFixed(2)}m`}
                            />

                            {/* Terreno */}
                            <Area
                                type="monotone"
                                dataKey="landSurface"
                                stroke="#6b7280"
                                fill="url(#colorLand)"
                                fillOpacity={1}
                                strokeWidth={2}
                                name="Cota Terreno"
                            />

                            {/* Linea de Gradiente (Static Pressure Head) */}
                            <Line
                                type="stepAfter" // Step because pressure is constant until losses/drops (Static)
                                // Actually static head is constant from source, unless there is a CRP. 
                                // StepAfter is good if we consider head drops at CRP. 
                                // But terrain varies continuously. 
                                // Let's use 'monotone' or 'linear' for the head line points.
                                // In static conditions, the head is horizontal. 
                                // Except at a CRP, where it drops vertically.
                                dataKey="hydraulicHead"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 3, fill: '#3b82f6' }}
                                name="Cota Piezométrica"
                                animationDuration={1000}
                            />

                            {/* Reference lines for max pressure? Maybe too complex for now */}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
