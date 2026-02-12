"use client"

import { useEffect, useRef, useState } from "react"
import { useProjectStore } from "@/store/project-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Play,
    Pause,
    Square,
    SkipBack,
    SkipForward,
    ChevronRight,
    Activity,
    AlertTriangle,
    CheckCircle2,
    X
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export function SimulationPanel() {
    const {
        simulationMode,
        simulationStatus,
        simulationStep,
        simulationLog,
        simulationSpeed,
        setSimulationStatus,
        setSimulationStep,
        setSimulationMode
    } = useProjectStore()

    const scrollRef = useRef<HTMLDivElement>(null)
    const [autoScroll, setAutoScroll] = useState(true)

    // Auto-scroll to bottom of log
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [simulationLog, simulationStep, autoScroll])

    // Simulation Timer
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (simulationStatus === 'playing') {
            interval = setInterval(() => {
                const nextStep = simulationStep + 1
                if (nextStep < simulationLog.length) {
                    setSimulationStep(nextStep)
                } else {
                    setSimulationStatus('stopped') // End of simulation
                }
            }, simulationSpeed)
        }

        return () => clearInterval(interval)
    }, [simulationStatus, simulationStep, simulationLog.length, simulationSpeed, setSimulationStep, setSimulationStatus])

    if (simulationMode !== 'simulation') return null

    const currentLog = simulationLog[simulationStep]

    return (
        <Card className="absolute right-4 top-20 w-80 max-h-[calc(100vh-140px)] flex flex-col shadow-2xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-right-10 z-50">
            <CardHeader className="p-3 border-b border-border/10 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-sm font-semibold">Panel de Simulación</CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSimulationMode('design')}
                >
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                {/* Controls */}
                <div className="p-3 bg-muted/30 border-b border-border/10 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSimulationStep(0)}
                            disabled={simulationStep === 0}
                        >
                            <SkipBack className="h-4 w-4" />
                        </Button>

                        {simulationStatus === 'playing' ? (
                            <Button
                                variant="default"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                                onClick={() => setSimulationStatus('paused')}
                            >
                                <Pause className="h-5 w-5 fill-current" />
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                                onClick={() => {
                                    if (simulationStep >= simulationLog.length - 1) setSimulationStep(0)
                                    setSimulationStatus('playing')
                                }}
                                disabled={simulationLog.length === 0}
                            >
                                <Play className="h-5 w-5 fill-current pl-0.5" />
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSimulationStep(Math.min(simulationLog.length - 1, simulationStep + 1))}
                            disabled={simulationStep >= simulationLog.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => {
                                setSimulationStatus('stopped')
                                setSimulationStep(0)
                            }}
                        >
                            <Square className="h-3 w-3 fill-current" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-muted-foreground font-mono">1x</span>
                        <Slider
                            defaultValue={[1000]}
                            max={2000}
                            min={100}
                            step={100}
                            inverted
                            className="flex-1"
                            onValueChange={(val) => useProjectStore.setState({ simulationSpeed: val[0] })}
                        />
                        <span className="text-[10px] text-muted-foreground font-mono">10x</span>
                    </div>
                </div>

                {/* Event List */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 bg-muted/10 border-b border-border/5 px-3 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider z-10 backdrop-blur-sm">
                        Event List ({simulationStep + 1}/{simulationLog.length || 0})
                    </div>
                    <ScrollArea className="h-full pt-6" ref={scrollRef}>
                        <div className="p-3 space-y-2">
                            {simulationLog.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground/50 text-xs italic">
                                    Presiona Play para iniciar la simulación...
                                </div>
                            ) : (
                                simulationLog.map((log, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex gap-3 p-2 rounded-lg text-sm transition-all duration-200 border",
                                            index === simulationStep
                                                ? "bg-primary/10 border-primary/30 shadow-sm scale-[1.02]"
                                                : "bg-card border-border/20 text-muted-foreground opacity-70 hover:opacity-100"
                                        )}
                                        onClick={() => {
                                            setSimulationStatus('paused')
                                            setSimulationStep(index)
                                        }}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {log.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />}
                                            {log.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className="font-semibold text-xs uppercase tracking-tight">
                                                    Paso {log.step}
                                                </span>
                                                <span className="text-[10px] font-mono opacity-50">
                                                    {((log.timestamp) / 1000).toFixed(2)}s
                                                </span>
                                            </div>
                                            <p className="text-xs leading-relaxed break-words">
                                                {log.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div className="h-4" /> {/* Spacer */}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}
