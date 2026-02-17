"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, BarChart3, Gauge, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calculo } from "@/types/models"
import OptimizationPanel from "@/components/optimization/OptimizationPanel"
import TransparencyPanel from "@/components/results/TransparencyPanel"
import { BlueprintUpload } from "@/components/setup/BlueprintUpload"
import { Card, CardContent } from "@/components/ui/card"

interface EditorSidePanelProps {
    open: boolean
    onClose: () => void
    proyectoId: string
    initialCost: number
    ultimoCalculo?: Calculo
}

type PanelTab = "results" | "optimization" | "config"

export function EditorSidePanel({ open, onClose, proyectoId, initialCost, ultimoCalculo }: EditorSidePanelProps) {
    const [activeTab, setActiveTab] = useState<PanelTab>("results")

    const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
        { id: "results", label: "Resultados", icon: <BarChart3 className="w-4 h-4" /> },
        { id: "optimization", label: "Optimización", icon: <Gauge className="w-4 h-4" /> },
        { id: "config", label: "Configuración", icon: <Settings className="w-4 h-4" /> },
    ]

    return (
        <div
            className={cn(
                "absolute top-12 right-0 bottom-0 w-[420px] z-10 bg-background/95 backdrop-blur-md border-l border-border/40 flex flex-col transition-transform duration-300 ease-in-out",
                open ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                activeTab === tab.id
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            {tab.icon}
                            <span className="hidden lg:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "results" && (
                    <>
                        {ultimoCalculo ? (
                            <TransparencyPanel calculo={ultimoCalculo} />
                        ) : (
                            <Card className="bg-card/60 border-border/30">
                                <CardContent className="py-12 text-center text-muted-foreground/50">
                                    <p className="text-sm">Realiza un cálculo primero para ver el detalle de iteraciones.</p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {activeTab === "optimization" && (
                    <OptimizationPanel proyectoId={proyectoId} currentCost={initialCost} />
                )}

                {activeTab === "config" && (
                    <BlueprintUpload />
                )}
            </div>
        </div>
    )
}
