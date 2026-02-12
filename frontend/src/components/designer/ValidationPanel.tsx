import { useProjectStore } from "@/store/project-store";
import { AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ValidationPanel() {
    const alerts = useProjectStore(state => state.simulationAlerts);
    const simulationStatus = useProjectStore(state => state.simulationStatus);

    if (!alerts || alerts.length === 0) {
        if (simulationStatus === 'stopped') return null;

        return (
            <div className="absolute top-4 right-4 z-50 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
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
                "px-4 py-3 rounded-xl shadow-lg backdrop-blur border flex items-center justify-between",
                errors.length > 0
                    ? "bg-red-500/90 border-red-600 text-white"
                    : "bg-amber-500/90 border-amber-600 text-white"
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
            <ScrollArea className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-xl border shadow-xl p-2">
                <div className="flex flex-col gap-1.5">
                    {alerts.map((alert, idx) => (
                        <div
                            key={`${alert.elementId}-${alert.ruleId}-${idx}`}
                            className={cn(
                                "p-2.5 rounded-lg border text-xs relative group transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                                alert.level === 'error'
                                    ? "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-300"
                                    : "bg-amber-50/50 border-amber-100 text-amber-800 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-300"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">
                                    {alert.elementType === 'node' ? 'Nudo' : 'Tramo'} {alert.elementId.slice(0, 4)}...
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
