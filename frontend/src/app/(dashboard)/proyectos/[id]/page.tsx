import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalcularButton } from "@/components/proyecto/calcular-button"
import { ExcelImportButton } from "@/components/import/ExcelImportButton"
import MapWrapper from "@/components/map/MapWrapper"
import OptimizationPanel from "@/components/optimization/OptimizationPanel"
import TransparencyPanel from "@/components/results/TransparencyPanel"
import { PIPE_DATABASE } from "@/lib/optimization/cost-database"

import { ReportButton } from "@/components/reports/ReportButton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileSpreadsheet } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

import { ProjectInitializer } from "@/components/proyecto/ProjectInitializer"
import { ProjectDataPanel } from "@/components/proyecto/ProjectDataPanel"

export default async function ProyectoPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: proyecto, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !proyecto) notFound()

    const { data: nudos } = await supabase.from("nudos").select("*").eq("proyecto_id", id).order("codigo")
    const { data: tramos } = await supabase.from("tramos").select("*").eq("proyecto_id", id).order("codigo")
    const { data: calculos } = await supabase.from("calculos").select("*").eq("proyecto_id", id).order("created_at", { ascending: false }).limit(5)

    const ultimoCalculo = calculos?.[0]

    // Calcular costo inicial estimado
    const initialCost = tramos?.reduce((acc, t) => {
        // Buscar costo en BD por diámetro interno (aproximado)
        const pipe = PIPE_DATABASE.find(p => Math.abs(p.diametro_interior_mm - t.diametro_interior) < 1)
        const costPerMeter = pipe ? pipe.costo_usd_metro : 0
        return acc + (t.longitud * costPerMeter)
    }, 0) || 0

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <ProjectInitializer proyecto={proyecto} nudos={nudos || []} tramos={tramos || []} />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-up">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                        Proyecto
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight">{proyecto.nombre}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{proyecto.ambito}</Badge>
                        <Badge variant="outline" className="text-[10px] border-border/30">Red {proyecto.tipo_red}</Badge>
                        {proyecto.departamento && (
                            <span className="text-xs text-muted-foreground/50">
                                📍 {proyecto.departamento}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ExcelImportButton proyectoId={id} />
                    {/* Button Removed: Editor Tramos integrated in Dashboard */}
                    <ReportButton
                        proyecto={proyecto}
                        nudos={nudos || []}
                        tramos={tramos || []}
                        ultimoCalculo={ultimoCalculo}
                    />
                    <CalcularButton proyectoId={id} />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up-delay-1">
                <Card className="stat-card stat-card-blue bg-card/60">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.70 0.18 230)' }}>{nudos?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider font-medium">Nudos</p>
                    </CardContent>
                </Card>
                <Card className="stat-card stat-card-cyan bg-card/60">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.70 0.15 200)' }}>{tramos?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider font-medium">Tramos</p>
                    </CardContent>
                </Card>
                <Card className="stat-card stat-card-green bg-card/60">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.70 0.16 160)' }}>{calculos?.length || 0}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider font-medium">Cálculos</p>
                    </CardContent>
                </Card>
                <Card className="stat-card stat-card-amber bg-card/60">
                    <CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${ultimoCalculo?.convergencia ? '' : ''}`}
                            style={{ color: ultimoCalculo ? (ultimoCalculo.convergencia ? 'oklch(0.70 0.16 160)' : 'oklch(0.78 0.15 80)') : 'oklch(0.40 0.02 250)' }}>
                            {ultimoCalculo ? (ultimoCalculo.convergencia ? '✓' : '✗') : '—'}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider font-medium">Convergencia</p>
                    </CardContent>
                </Card>
            </div>

            {/* Último cálculo */}
            {ultimoCalculo && (
                <Card className="bg-card/60 border-border/30 animate-fade-in-up-delay-2" style={{ borderTopColor: ultimoCalculo.convergencia ? 'oklch(0.70 0.16 160 / 40%)' : 'oklch(0.78 0.15 80 / 40%)', borderTopWidth: '2px' }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-widest" style={{ color: ultimoCalculo.convergencia ? 'oklch(0.70 0.16 160)' : 'oklch(0.78 0.15 80)' }}>
                            Último Cálculo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Método</p>
                            <p className="font-semibold text-sm mt-0.5">{ultimoCalculo.metodo}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Iteraciones</p>
                            <p className="font-semibold text-sm mt-0.5 font-mono">{ultimoCalculo.iteraciones_realizadas}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Presión min/max</p>
                            <p className="font-semibold text-sm mt-0.5 font-mono">
                                {ultimoCalculo.presion_minima?.toFixed(2)} / {ultimoCalculo.presion_maxima?.toFixed(2)} <span className="text-[10px] text-muted-foreground/40">m.c.a.</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Velocidad min/max</p>
                            <p className="font-semibold text-sm mt-0.5 font-mono">
                                {ultimoCalculo.velocidad_minima?.toFixed(3)} / {ultimoCalculo.velocidad_maxima?.toFixed(3)} <span className="text-[10px] text-muted-foreground/40">m/s</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Validación</p>
                            <Badge className="mt-1" variant={ultimoCalculo.validacion_passed ? "default" : "destructive"}>
                                {ultimoCalculo.validacion_passed ? "✓ Aprobado" : "✗ Con alertas"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data Panel */}
            <div className="lg:flex-1 flex flex-col h-[600px] lg:h-[800px]">
                <ProjectDataPanel
                    proyectoId={id}
                    nudos={nudos || []}
                    tramos={tramos || []}
                    initialCost={initialCost}
                    ultimoCalculo={ultimoCalculo}
                    initialPlanoConfig={proyecto.configuracion_plano}
                />
            </div>
        </div>
    )
}
