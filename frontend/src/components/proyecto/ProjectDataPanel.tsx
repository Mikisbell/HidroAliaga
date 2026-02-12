import { TramosGrid } from "@/components/tramos/TramosGrid"

// ... existing imports

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
    // ... existing hook logic

    const storeNudos = useProjectStore(state => state.nudos)
    const storeTramos = useProjectStore(state => state.tramos)

    // Fallback to props if store is empty (first render before effect)
    const nudos = storeNudos.length > 0 ? storeNudos : initialNudos
    const tramos = storeTramos.length > 0 ? storeTramos : initialTramos

    if (selectedElement) {
        return <PropertiesPanel />
    }

    return (
        <Tabs defaultValue="tramos" className="animate-fade-in-up-delay-3 h-full flex flex-col">
            <TabsList className="bg-card/60 border border-border/30 w-full justify-start overflow-x-auto">
                <TabsTrigger value="tramos">Editor de Tramos ({tramos?.length || 0})</TabsTrigger>
                <TabsTrigger value="nudos">Nudos ({nudos?.length || 0})</TabsTrigger>
                <TabsTrigger value="mapa">
                    <span className="hidden lg:inline">Mapa Visual</span>
                    <span className="lg:hidden">Mapa</span>
                </TabsTrigger>
                <TabsTrigger value="transparencia">Resultados</TabsTrigger>
                <TabsTrigger value="optimizacion">Optimización</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0 mt-4">
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

                <TabsContent value="mapa" className="mt-0 h-full">
                    {/* Mobile Map View if needed, but MapWrapper is usually separate */}
                    <MapWrapper
                        nudos={nudos || []}
                        tramos={tramos || []}
                        proyectoId={proyectoId}
                        initialPlanoConfig={initialPlanoConfig}
                    />
                </TabsContent>

                <TabsContent value="optimizacion" className="mt-0 h-full">
                    <OptimizationPanel proyectoId={proyectoId} currentCost={initialCost} />
                </TabsContent>

                <TabsContent value="nudos" className="mt-0 h-full">
                    <Card className="bg-card/60 border-border/30 h-full border-none shadow-none">
                        <CardContent className="p-0">
                            {nudos && nudos.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/20 hover:bg-transparent">
                                            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold w-[80px]">Código</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Tipo</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Elev. (m)</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Q (l/s)</TableHead>
                                            <TableHead className="text-right text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">P (mca)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {nudos.map((n) => (
                                            <TableRow key={n.id} className="table-row-hover border-border/10 cursor-pointer hover:bg-muted/50"
                                                onClick={() => useProjectStore.getState().setSelectedElement({ id: n.id, type: 'nudo' })}
                                            >
                                                <TableCell className="font-mono text-xs font-semibold">{n.codigo}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] border-border/30">{n.tipo}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">{n.elevacion?.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">{n.demanda_base?.toFixed(3)}</TableCell>
                                                <TableCell className="text-right font-mono text-xs font-semibold" style={{ color: n.presion_calc != null ? 'oklch(0.70 0.18 230)' : undefined }}>
                                                    {n.presion_calc != null ? n.presion_calc.toFixed(2) : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-16 text-center text-muted-foreground/50">
                                    <p className="text-sm">No hay nudos definidos</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tramos" className="mt-0 h-full">
                    {/* Integrated Editable Grid */}
                    <div className="h-full overflow-hidden">
                        <TramosGrid tramos={tramos || []} nudos={nudos || []} proyectoId={proyectoId} />
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    )
}
