"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingDown, X } from "lucide-react"
import { Nudo } from "@/types/models"

interface CRPHelperProps {
    nudos: Nudo[]
    staticPressures: Record<string, number>
    onFocusNode: (lat: number, lng: number) => void
}

export function CRPHelper({ nudos, staticPressures, onFocusNode }: CRPHelperProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Identify critical nodes (Pressure > 50)
    const criticalNodes = nudos
        .filter(n => (staticPressures[n.id] || 0) > 50)
        .sort((a, b) => (staticPressures[b.id] || 0) - (staticPressures[a.id] || 0)) // Sort by pressure desc

    if (criticalNodes.length === 0) return null

    if (!isOpen) {
        return (
            <Button
                variant="destructive"
                size="sm"
                className="shadow-lg animate-pulse"
                onClick={() => setIsOpen(true)}
            >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {criticalNodes.length} Alertas de Presión
            </Button>
        )
    }

    return (
        <Card className="w-[300px] shadow-xl border-red-200 dark:border-red-900 bg-card/95 backdrop-blur">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-red-50 dark:bg-red-900/20 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <CardTitle className="text-sm font-bold text-red-700 dark:text-red-300">
                        Presión Excesiva
                    </CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                <div className="p-2 space-y-1">
                    <p className="text-xs text-muted-foreground px-2 mb-2">
                        La presión estática supera los 50 m.c.a. en estos puntos. Considere instalar Cámaras Rompe Presión (CRP).
                    </p>
                    {criticalNodes.map(n => (
                        <div
                            key={n.id}
                            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer group transition-colors"
                            onClick={() => n.latitud && n.longitud && onFocusNode(n.latitud, n.longitud)}
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold flex items-center gap-1">
                                    📍 {n.codigo}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    Cota: {n.cota_terreno}m
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-red-600 block">
                                    {staticPressures[n.id]?.toFixed(1)} mca
                                </span>
                                <span className="text-[10px] text-blue-600 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrendingDown className="w-3 h-3" />
                                    Sugerir CRP
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
