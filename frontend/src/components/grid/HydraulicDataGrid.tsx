"use client"

import { useState } from "react"
import { useProjectStore } from "@/store/project-store"
import { cn } from "@/lib/utils"
// Ensure you have these icons installed or use text
import { List, Calculator, ArrowRight } from "lucide-react"

export function HydraulicDataGrid() {
    const {
        nudos,
        tramos,
        updateNudo // We need to import the action wrapper or use store action if available
    } = useProjectStore()

    const [activeTab, setActiveTab] = useState<'tramos' | 'nudos'>('tramos')

    // Simple Tab Switcher
    return (
        <div className="flex flex-col h-full bg-background border-t border-border shadow-inner">
            {/* Toolbar / Tabs */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('tramos')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'tramos'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                        )}
                    >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Tramos ({tramos.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('nudos')}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                            activeTab === 'nudos'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                        )}
                    >
                        <List className="w-3.5 h-3.5" />
                        Nudos ({nudos.length})
                    </button>
                    {/* Simulation Tab Placeholder */}
                    <button
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
                        )}
                        disabled
                    >
                        <Calculator className="w-3.5 h-3.5" />
                        Cálculos
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-muted/10 sticky top-0 z-10 backdrop-blur-sm">
                        {activeTab === 'tramos' ? (
                            <tr>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-10">ID</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30">Código</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-24">Longitud (m)</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-24">Diámetro (mm)</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-24">Material</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30">Caudal (L/s)</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b text-right">Velocidad (m/s)</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-10">ID</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30">Etiqueta</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-20">Cota (Z)</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-20">Viviendas</th>
                                <th className="px-3 py-2 font-medium text-muted-foreground border-b border-r border-border/30 w-24">Demanda (L/s)</th>
                                <th className="px-3 py-2 font-medium text-right border-b">Presión (mca)</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {activeTab === 'tramos' ? (
                            tramos.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground italic bg-muted/5">
                                        No hay tramos dibujados. Conecta dos nudos en el lienzo.
                                    </td>
                                </tr>
                            ) : (
                                tramos.map((tramo, index) => (
                                    <tr key={tramo.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-3 py-1.5 border-r border-border/20 text-muted-foreground font-mono">{index + 1}</td>
                                        <td className="px-3 py-1.5 border-r border-border/20 font-medium">{tramo.codigo || 'T-?'}</td>
                                        <td className="px-3 py-1.5 border-r border-border/20 font-mono text-right text-blue-600 dark:text-blue-400">
                                            {tramo.longitud?.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-1.5 border-r border-border/20 text-right">{tramo.diametro_interior?.toFixed(1) || '-'}</td>
                                        <td className="px-3 py-1.5 border-r border-border/20 text-muted-foreground text-xs uppercase">{tramo.material || 'PVC'}</td>
                                        <td className="px-3 py-1.5 border-r border-border/20 text-right font-mono bg-orange-50/10 text-orange-600 dark:text-orange-400">
                                            {tramo.caudal?.toFixed(3) || '0.000'}
                                        </td>
                                        <td className="px-3 py-1.5 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                            {tramo.velocidad?.toFixed(2) || '0.00'}
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            nudos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic bg-muted/5">
                                        No hay nudos en el proyecto. Arrastra componentes al lienzo.
                                    </td>
                                </tr>
                            ) : (
                                nudos.map((nudo, index) => (
                                    <tr key={nudo.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-3 py-1.5 border-r border-border/20 text-muted-foreground font-mono">{index + 1}</td>
                                        <td className="px-3 py-1.5 border-r border-border/20 font-bold">{nudo.codigo || nudo.nombre || 'N-?'}</td>
                                        <td className="px-3 py-1.5 border-r border-border/20 font-mono text-right text-blue-600 dark:text-blue-400">
                                            {nudo.cota_terreno?.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-1.5 border-r border-border/20 text-right font-medium">
                                            {nudo.numero_viviendas || '-'}
                                        </td>
                                        <td className="px-3 py-1.5 border-r border-border/20 text-right font-mono bg-orange-50/10 text-orange-600 dark:text-orange-400">
                                            {nudo.demanda_base?.toFixed(3)}
                                        </td>
                                        <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {nudo.presion_calc?.toFixed(2) || '0.00'}
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
