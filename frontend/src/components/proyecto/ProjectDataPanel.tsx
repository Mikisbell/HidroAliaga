"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useProjectStore } from "@/store/project-store"
import DesignerWrapper from "@/components/designer/DesignerWrapper"
import OptimizationPanel from "@/components/optimization/OptimizationPanel"
import TransparencyPanel from "@/components/results/TransparencyPanel"
import { Nudo, Tramo, Calculo } from "@/types/models"
import { BlueprintUpload } from "@/components/setup/BlueprintUpload"

interface ProjectDataPanelProps {
    proyectoId: string
    nudos: Nudo[]
    tramos: Tramo[]
    initialCost: number
    ultimoCalculo?: Calculo
    initialPlanoConfig?: any
}

export function ProjectDataPanel({
    proyectoId, nudos: initialNudos, tramos: initialTramos, initialCost, ultimoCalculo, initialPlanoConfig
}: ProjectDataPanelProps) {

    const storeNudos = useProjectStore(state => state.nudos)
    const storeTramos = useProjectStore(state => state.tramos)

    // Fallback to props if store is empty (first render before effect)
    const nudos = storeNudos.length > 0 ? storeNudos : initialNudos
    const tramos = storeTramos.length > 0 ? storeTramos : initialTramos

    // selectedElement is handled inline by HydraulicTablePanel (row highlight)
    // No more full-screen PropertiesPanel hijack

    return (
        <Tabs defaultValue="mapa" className="animate-fade-in-up-delay-3 h-full flex flex-col">
            <TabsList className="bg-card/60 border border-border/30 w-full justify-start overflow-x-auto">
                <TabsTrigger value="mapa">Diseñador y Datos</TabsTrigger>
                <TabsTrigger value="transparencia">Resultados</TabsTrigger>
                <TabsTrigger value="optimizacion">Optimización</TabsTrigger>
                <TabsTrigger value="inicio">Configuración</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0 mt-4">

                {/* UNIFIED DESIGN TAB */}
                <TabsContent value="mapa" className="mt-0 h-full">
                    <DesignerWrapper
                        nudos={nudos || []}
                        tramos={tramos || []}
                        proyectoId={proyectoId}
                    />
                </TabsContent>

                <TabsContent value="transparencia" className="mt-0 h-full">
                    {ultimoCalculo ? (
                        <TransparencyPanel calculo={ultimoCalculo} />
                    ) : (
                        <Card className="bg-card/60 border-border/30 h-full">
                            <CardContent className="py-16 text-center text-muted-foreground/50 flex flex-col items-center justify-center h-full">
                                <p className="text-sm">Realiza un cálculo primero para ver el detalle de iteraciones.</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="optimizacion" className="mt-0 h-full">
                    <OptimizationPanel proyectoId={proyectoId} currentCost={initialCost} />
                </TabsContent>

                <TabsContent value="inicio" className="mt-0 h-full">
                    <BlueprintUpload />
                </TabsContent>
            </div>
        </Tabs>
    )
}
