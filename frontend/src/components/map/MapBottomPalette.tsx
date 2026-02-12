import { useProjectStore } from "@/store/project-store"
import { Spline, Play, Droplets, Zap, CircleDashed } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Nudo } from "@/types/models"

export function MapBottomPalette() {
    const activeTool = useProjectStore(state => state.activeTool)
    const setActiveTool = useProjectStore(state => state.setActiveTool)
    const activeComponentType = useProjectStore((state) => state.activeComponentType)
    const setActiveComponentType = useProjectStore((state) => state.setActiveComponentType)
    const calculateHydraulics = useProjectStore(state => state.calculateHydraulics)
    const isLoading = useProjectStore(state => state.isLoading)

    // Palette Items
    const paletteItems = [
        {
            type: 'reservorio' as Nudo['tipo'],
            label: 'Reservorio',
            icon: Droplets,
            shortcut: 'R',
            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        },
        {
            type: 'camara_rompe_presion' as Nudo['tipo'],
            label: 'C. Rompe Presión',
            icon: Zap,
            shortcut: 'C',
            color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
        },
        {
            type: 'union' as Nudo['tipo'],
            label: 'Nudo / Unión',
            icon: CircleDashed,
            shortcut: 'N',
            color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    ]

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 p-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl ring-1 ring-black/5 dark:bg-gray-950/90 dark:border-gray-800/50">

            {/* Simulation Controls */}
            <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-gray-800">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => calculateHydraulics()}
                                disabled={isLoading}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-300 flex items-center justify-center bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95",
                                    isLoading && "opacity-70 animate-pulse cursor-wait"
                                )}
                            >
                                <Play className={cn("w-6 h-6 fill-current", isLoading ? "animate-spin" : "")} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Simular Red (Calcular)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Components Palette */}
            <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={0}>
                    {paletteItems.map((item) => (
                        <Tooltip key={item.type}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => {
                                        setActiveTool('node')
                                        setActiveComponentType(item.type)
                                    }}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 min-w-[60px] rounded-xl transition-all duration-200 gap-1 border border-transparent",
                                        activeTool === 'node' && activeComponentType === item.type
                                            ? `bg-primary/10 border-primary/20 shadow-inner scale-95`
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                                    )}
                                >
                                    <div className={cn("p-2 rounded-lg", item.color)}>
                                        <item.icon className="w-6 h-6 stroke-[2px]" />
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
                                        {item.label}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <span className="font-bold">{item.label}</span> <span className="text-muted-foreground opacity-70">({item.shortcut})</span>
                            </TooltipContent>
                        </Tooltip>
                    ))}

                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 mx-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => {
                                    setActiveTool('pipe')
                                    setActiveComponentType(null)
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 min-w-[60px] rounded-xl transition-all duration-200 gap-1 border border-transparent",
                                    activeTool === 'pipe'
                                        ? "bg-primary/10 border-primary/20 shadow-inner scale-95"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                                )}
                            >
                                <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                    <Spline className="w-6 h-6 stroke-[2px]" />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
                                    Tubería
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Conexión (Tubería)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
