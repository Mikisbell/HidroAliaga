"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from "recharts"
import { Calculo, ResultadoIteracion } from "@/types/models"
import { AlertCircle, CheckCircle2, Info, ChevronDown, ChevronRight, Table as TableIcon, ChartLine } from "lucide-react"

interface TransparencyPanelProps {
    calculo: Calculo
}

export default function TransparencyPanel({ calculo }: TransparencyPanelProps) {
    const logs = (calculo.iteraciones_data as ResultadoIteracion[]) || []

    // Preparar datos para el gráfico
    const chartData = useMemo(() => {
        return logs.map(log => ({
            iteracion: log.iteracion,
            error: log.error_maximo,
            deltaQ: log.delta_q_total,
        }))
    }, [logs])

    if (!logs.length) {
        return (
            <Card className="bg-card/60 border-border/30">
                <CardContent className="py-10 text-center text-muted-foreground">
                    <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de iteraciones disponibles para este cálculo.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estado Final</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {calculo.convergencia ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-2xl font-bold">
                                {calculo.convergencia ? "Convergió" : "No Convergió"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            en {calculo.iteraciones_realizadas} iteraciones
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Error Final</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-mono font-bold">
                            {calculo.error_final?.toExponential(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tolerancia: {calculo.tolerancia?.toExponential(1)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Método</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold capitalize">
                            {calculo.metodo.replace('_', ' ')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Motor Hidráulico v{calculo.version_modelo || '1.0'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="chart" className="w-full">
                <TabsList className="bg-card/60 border border-border/30">
                    <TabsTrigger value="chart" className="gap-2"><ChartLine className="w-4 h-4" /> Gráfico de Convergencia</TabsTrigger>
                    <TabsTrigger value="table" className="gap-2"><TableIcon className="w-4 h-4" /> Tabla Detallada</TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="mt-4">
                    <Card className="bg-card/60 border-border/30">
                        <CardHeader>
                            <CardTitle>Evolución del Error (Hardy Cross)</CardTitle>
                            <CardDescription>
                                Muestra cómo disminuye el error máximo (corrección de caudal) en cada iteración.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                    <XAxis dataKey="iteracion" strokeOpacity={0.5} style={{ fontSize: 12 }}>
                                        <Label value="Iteración" offset={-5} position="insideBottom" />
                                    </XAxis>
                                    <YAxis
                                        strokeOpacity={0.5}
                                        style={{ fontSize: 12 }}
                                        scale="log"
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.9)', borderRadius: '8px', border: '1px solid #333' }}
                                        labelStyle={{ color: '#ccc' }}
                                        formatter={(value: number | string | undefined) => [
                                            typeof value === 'number' ? value.toExponential(3) : value,
                                            ''
                                        ]}
                                    />
                                    <Legend />
                                    <ReferenceLine y={calculo.tolerancia} label="Tolerancia" stroke="red" strokeDasharray="3 3" />
                                    <Line
                                        type="monotone"
                                        dataKey="error"
                                        name="Error Máximo (L/s)"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="deltaQ"
                                        name="Suma ΔQ Global"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="table" className="mt-4">
                    <Card className="bg-card/60 border-border/30">
                        <CardHeader>
                            <CardTitle>Registro de Iteraciones</CardTitle>
                            <CardDescription>
                                Detalle paso a paso del proceso de balanceo de caudales.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px] rounded-md border border-border/20">
                                <div className="p-4 space-y-4">
                                    {logs.map((log) => (
                                        <CollapsibleIterationRow key={log.iteracion} log={log} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function CollapsibleIterationRow({ log }: { log: ResultadoIteracion }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-border/30 rounded-lg overflow-hidden bg-card/40 hover:bg-card/60 transition-colors">
            <div
                className="flex items-center justify-between p-3 cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-mono font-bold text-sm">Iteración #{log.iteracion}</span>
                    <Badge variant="outline" className={`text-[10px] ${log.convergencia_alcanzada ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}`}>
                        Error: {log.error_maximo.toExponential(2)}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                    ΔQ Total: {log.delta_q_total.toFixed(4)}
                </div>
            </div>

            {isOpen && (
                <div className="p-3 pt-0 border-t border-border/10 bg-black/10">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/10 hover:bg-transparent">
                                <TableHead className="h-8 text-[10px]">Malla</TableHead>
                                <TableHead className="h-8 text-[10px] text-right">Σ hf (Num)</TableHead>
                                <TableHead className="h-8 text-[10px] text-right">Σ n·K·Qⁿ⁻¹ (Den)</TableHead>
                                <TableHead className="h-8 text-[10px] text-right font-bold text-primary">ΔQ (Corr)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {log.detalles_mallas.map((detalle) => (
                                <TableRow key={detalle.malla_id} className="border-border/10 hover:bg-transparent">
                                    <TableCell className="py-1 font-mono text-xs">{detalle.malla_id}</TableCell>
                                    <TableCell className="py-1 text-right font-mono text-xs text-muted-foreground">{detalle.suma_hf.toFixed(4)}</TableCell>
                                    <TableCell className="py-1 text-right font-mono text-xs text-muted-foreground">{detalle.suma_denom.toFixed(4)}</TableCell>
                                    <TableCell className="py-1 text-right font-mono text-xs font-bold text-primary">{detalle.delta_q.toFixed(6)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
