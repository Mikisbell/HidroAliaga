import { useProjectStore } from "@/store/project-store";
import { AlertCircle, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function ValidationPanel() {
    const alerts = useProjectStore(state => state.simulationAlerts);
    const simulationStatus = useProjectStore(state => state.simulationStatus);
    const { setCenter, getNodes, getEdges } = useReactFlow();

    const handleNavigate = (elementId: string) => {
        // Find element position
        const node = getNodes().find(n => n.id === elementId);
        if (node) {
            setCenter(node.position.x, node.position.y, { zoom: 2, duration: 800 });
            return;
        }

        // If not a node, could be an edge (pipe)
        // For edges, we can try to find source/target nodes to center
        const edge = getEdges().find(e => e.id === elementId);
        if (edge) {
            // Center on source node of the pipe for now, or midpoint if we calculated it
            const sourceNode = getNodes().find(n => n.id === edge.source);
            if (sourceNode) {
                setCenter(sourceNode.position.x, sourceNode.position.y, { zoom: 1.8, duration: 800 });
            }
        }
    };

    if (!alerts || alerts.length === 0) {
        if (simulationStatus === 'stopped') return null;

        return (
            <div className="absolute top-4 right-4 z-50 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur flex items-center gap-2 animate-in fade-in slide-in-from-top-2 pointer-events-none">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium text-sm">Diseño Normativo Conforme</span>
            </div>
        );
    }

    const errors = alerts.filter(a => a.level === 'error');
    const warnings = alerts.filter(a => a.level === 'warning');

    return (
        <div className="absolute top-4 right-4 z-50 w-80 flex flex-col gap-2 max-h-[calc(100vh-200px)] animate-in fade-in slide-in-from-top-2">
            {/* Header Summary */}
            <div className={cn(
                "px-4 py-3 rounded-xl shadow-lg backdrop-blur border flex items-center justify-between transition-colors duration-300",
                errors.length > 0
                    ? "bg-red-500/95 border-red-600 text-white shadow-red-500/20"
                    : "bg-amber-500/95 border-amber-600 text-white shadow-amber-500/20"
            )}>
                <div className="flex items-center gap-3">
                    {errors.length > 0 ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <div>
                        <h3 className="font-bold text-sm leading-none">
                            {errors.length > 0 ? "Incumplimiento Normativo" : "Advertencias de Diseño"}
                        </h3>
                        <p className="text-[11px] opacity-90 mt-1">
                            {errors.length} Errores, {warnings.length} Advertencias
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <ScrollArea className="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl border shadow-xl p-2 max-h-[400px]">
                <div className="flex flex-col gap-1.5">
                    {alerts.map((alert, idx) => (
                        <div
                            key={`${alert.elementId}-${alert.ruleId}-${idx}`}
                            onClick={() => handleNavigate(alert.elementId)}
                            className={cn(
                                "p-2.5 rounded-lg border text-xs relative group transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                alert.level === 'error'
                                    ? "bg-red-50/50 border-red-100 text-red-800 hover:bg-red-100 hover:border-red-200 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-300"
                                    : "bg-amber-50/50 border-amber-100 text-amber-800 hover:bg-amber-100 hover:border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-300"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70 flex items-center gap-1">
                                    {alert.elementType === 'node' ? 'Nudo' : 'Tramo'} {alert.elementId.slice(0, 4)}...
                                    <Search className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                                <Badge variant="outline" className={cn(
                                    "h-4 text-[9px] px-1",
                                    alert.level === 'error' ? "border-red-200 text-red-600" : "border-amber-200 text-amber-600"
                                )}>
                                    {alert.value.toFixed(2)} {alert.unit}
                                </Badge>
                            </div>
                            <p className="font-medium leading-tight">
                                {alert.message}
                            </p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
