"use client"

import { useProjectStore } from "@/store/project-store"
import { Calculo } from "@/types/models"
import { CheckCircle, XCircle, Minus } from "lucide-react"

interface EditorStatsBarProps {
    ultimoCalculo?: Calculo
}

export function EditorStatsBar({ ultimoCalculo }: EditorStatsBarProps) {
    const nudos = useProjectStore(state => state.nudos)
    const tramos = useProjectStore(state => state.tramos)

    return (
        <div className="flex items-center gap-2">
            {/* Nudos */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-xs">
                <span className="font-semibold text-blue-400">{nudos.length}</span>
                <span className="text-muted-foreground">nudos</span>
            </div>

            {/* Tramos */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-xs">
                <span className="font-semibold text-cyan-400">{tramos.length}</span>
                <span className="text-muted-foreground">tramos</span>
            </div>

            {/* Convergence */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-xs">
                {ultimoCalculo ? (
                    ultimoCalculo.convergencia ? (
                        <>
                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400 font-medium">Convergió</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400 font-medium">No convergió</span>
                        </>
                    )
                ) : (
                    <>
                        <Minus className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <span className="text-muted-foreground/50">Sin cálculo</span>
                    </>
                )}
            </div>

            {/* Pressure range (if calculated) */}
            {ultimoCalculo && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-xs">
                    <span className="text-muted-foreground">P:</span>
                    <span className="font-mono font-medium text-foreground">
                        {ultimoCalculo.presion_minima?.toFixed(1)}–{ultimoCalculo.presion_maxima?.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground/50">m.c.a.</span>
                </div>
            )}
        </div>
    )
}
