"use client"

import { useState, useCallback, useRef } from "react"
import { useProjectStore } from "@/store/project-store"
import { cn } from "@/lib/utils"
import { List, Calculator, ArrowRight, Copy, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { updateTramo, createBatchTramos } from "@/app/actions/tramos"
import { updateNudo } from "@/app/actions/nudos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function HydraulicDataGrid() {
    const {
        currentProject,
        nudos,
        tramos,
        updateNudo: updateNudoStore,
        // We need a way to update tramo in store immediately for optimistic UI
        // Assuming setElements or similar fits, or we just rely on router.refresh() 
        // ideally we update store. 
    } = useProjectStore()

    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'tramos' | 'nudos'>('tramos')
    const [isPasting, setIsPasting] = useState(false)

    // --- Actions ---
    const handleTramoUpdate = useCallback(async (id: string, field: string, value: any) => {
        let numValue = value
        if (field === 'longitud' || field === 'diametro_comercial' || field === 'diametro_interior') {
            numValue = parseFloat(value) || 0
        }

        // Optimistic UI could happen here if store exposed updateTramo action
        const res = await updateTramo({ id, [field]: numValue })
        if (res.error) {
            toast.error(res.error)
        } else {
            router.refresh() // Sync with server
        }
    }, [router])

    const handleNudoUpdate = useCallback(async (id: string, field: string, value: any) => {
        let numValue = value
        if (field === 'cota_terreno' || field === 'numero_viviendas') {
            numValue = parseFloat(value) || 0
        }

        try {
            await updateNudo(id, { [field]: numValue })
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al actualizar nudo")
        }
    }, [router])

    // --- Paste Logic (Simplified for MVP) ---
    const handlePaste = async (e: React.ClipboardEvent) => {
        if (activeTab !== 'tramos' || !currentProject) return
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        if (!text) return

        setIsPasting(true)
        toast.info("Procesando pegado...")

        // Logic similar to TramosGrid but streamlined
        // EXPECTED: [NodeA] [NodeB] [Len] ...
        const rows = text.split(/\r?\n/).filter(line => line.trim() !== '')
        const newTramos = []

        for (const row of rows) {
            const cols = row.split('\t').map(c => c.trim())
            if (cols.length < 2) continue

            // Find nodes by Code (Case insensitive)
            const nA = nudos.find(n => n.codigo.toLowerCase() === cols[0].toLowerCase())
            const nB = nudos.find(n => n.codigo.toLowerCase() === cols[1].toLowerCase())

            if (nA && nB) {
                newTramos.push({
                    proyecto_id: currentProject.id,
                    nudo_origen_id: nA.id,
                    nudo_destino_id: nB.id,
                    longitud: parseFloat(cols[2]?.replace(',', '.') || '0'),
                    diametro_comercial: parseFloat(cols[3]?.replace(',', '.') || '0.75'),
                    material: cols[4] || 'pvc',
                    clase_tuberia: cols[5] || 'CL-10'
                })
            }
        }

        if (newTramos.length > 0) {
            const res = await createBatchTramos(newTramos, currentProject.id)
            if (res.error) toast.error(res.error)
            else {
                toast.success(`${res.count} tramos importados`)
                router.refresh()
            }
        } else {
            toast.warning("No se reconocieron tramos válidos (Formato: NudoA NudoB Long ...)")
        }
        setIsPasting(false)
    }

    return (
        <div
            className="flex flex-col h-full bg-background border-t border-border shadow-inner outline-none"
            onPaste={handlePaste}
            tabIndex={0} // Focusable for paste
        >
            {/* Toolbar / Tabs */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b border-border">
                <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg">
                    <TabButton active={activeTab === 'tramos'} onClick={() => setActiveTab('tramos')}>
                        <ArrowRight className="w-3.5 h-3.5" /> Tramos ({tramos.length})
                    </TabButton>
                    <TabButton active={activeTab === 'nudos'} onClick={() => setActiveTab('nudos')}>
                        <List className="w-3.5 h-3.5" /> Nudos ({nudos.length})
                    </TabButton>
                </div>
                {isPasting && <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Pegando...</span>}
                <div className="text-[10px] text-muted-foreground hidden sm:block">
                    <span className="opacity-50">Edita directamente las celdas o pega desde Excel</span>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-auto bg-background/50">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-muted/10 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                        {activeTab === 'tramos' ? (
                            <tr>
                                <HeaderCell w="w-12">ID</HeaderCell>
                                <HeaderCell w="w-16">Código</HeaderCell>
                                <HeaderCell w="w-20" align="text-right">Long (m)</HeaderCell>
                                <HeaderCell w="w-16" align="text-right">Ø (pulg)</HeaderCell>
                                <HeaderCell w="w-16">Mat.</HeaderCell>
                                <HeaderCell w="w-16">Clase</HeaderCell>
                                <HeaderCell align="text-right">Q (L/s)</HeaderCell>
                                <HeaderCell align="text-right">Vel (m/s)</HeaderCell>
                            </tr>
                        ) : (
                            <tr>
                                <HeaderCell w="w-12">ID</HeaderCell>
                                <HeaderCell w="w-16">Etiqueta</HeaderCell>
                                <HeaderCell w="w-20" align="text-right">Cota (Z)</HeaderCell>
                                <HeaderCell w="w-20" align="text-right">Viviendas</HeaderCell>
                                <HeaderCell w="w-20" align="text-right">Q (L/s)</HeaderCell>
                                <HeaderCell align="text-right">Presión (mca)</HeaderCell>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-border/10">
                        {activeTab === 'tramos' ? (
                            tramos.length === 0 ? <EmptyRow cols={8} msg="Sin tramos. Dibuja o pega desde Excel." /> :
                                tramos.map((t, i) => (
                                    <tr key={t.id} className="hover:bg-muted/10 group">
                                        <Cell readOnly>{i + 1}</Cell>
                                        <Cell readOnly bold>{t.codigo}</Cell>
                                        <EditableCell
                                            value={t.longitud}
                                            onChange={(v: string) => handleTramoUpdate(t.id, 'longitud', v)}
                                            align="text-right"
                                            type="number"
                                        />
                                        <EditableCell
                                            value={t.diametro_comercial}
                                            onChange={(v: string) => handleTramoUpdate(t.id, 'diametro_comercial', v)}
                                            align="text-right"
                                            type="number"
                                        />
                                        <EditableCell
                                            value={t.material}
                                            onChange={(v: string) => handleTramoUpdate(t.id, 'material', v)}
                                            uppercase
                                        />
                                        <EditableCell
                                            value={t.clase_tuberia}
                                            onChange={(v: string) => handleTramoUpdate(t.id, 'clase_tuberia', v)}
                                            uppercase
                                        />
                                        <Cell align="text-right" className="text-orange-600 dark:text-orange-400 font-mono bg-orange-50/5">
                                            {t.caudal?.toFixed(3)}
                                        </Cell>
                                        <Cell align="text-right" className="text-emerald-600 dark:text-emerald-400 font-mono">
                                            {t.velocidad?.toFixed(2)}
                                        </Cell>
                                    </tr>
                                ))
                        ) : (
                            nudos.length === 0 ? <EmptyRow cols={6} msg="Sin nudos." /> :
                                nudos.map((n, i) => (
                                    <tr key={n.id} className="hover:bg-muted/10 group">
                                        <Cell readOnly>{i + 1}</Cell>
                                        <Cell readOnly bold>{n.codigo}</Cell>
                                        <EditableCell
                                            value={n.cota_terreno}
                                            onChange={(v: string) => handleNudoUpdate(n.id, 'cota_terreno', v)}
                                            align="text-right"
                                            type="number"
                                        />
                                        <EditableCell
                                            value={n.numero_viviendas}
                                            onChange={(v: string) => handleNudoUpdate(n.id, 'numero_viviendas', v)}
                                            align="text-right"
                                            type="number"
                                            min={0}
                                            step={1}
                                        />
                                        <Cell align="text-right" className="text-orange-600 dark:text-orange-400 font-mono bg-orange-50/5">
                                            {n.demanda_base?.toFixed(3)}
                                        </Cell>
                                        <Cell align="text-right" className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                            {n.presion_calc?.toFixed(2)}
                                        </Cell>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// --- Subcomponents for Performance & Clean Code ---

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-3 py-1 text-[11px] font-medium rounded-sm transition-all flex items-center gap-2",
            active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
        )}
    >
        {children}
    </button>
)

const HeaderCell = ({ children, w, align }: { children: React.ReactNode, w?: string, align?: string }) => (
    <th className={cn("px-2 py-1.5 font-medium text-muted-foreground border-b border-r border-border/20 last:border-r-0 select-none", w, align)}>
        {children}
    </th>
)

const EmptyRow = ({ cols, msg }: { cols: number, msg: string }) => (
    <tr>
        <td colSpan={cols} className="px-4 py-12 text-center text-muted-foreground/50 italic">
            {msg}
        </td>
    </tr>
)

const Cell = ({ children, align, className, readOnly, bold }: any) => (
    <td className={cn(
        "px-2 py-0 border-r border-border/10 last:border-r-0 h-7 overflow-hidden text-ellipsis whitespace-nowrap",
        readOnly && "cursor-default text-muted-foreground/70",
        bold && "font-semibold text-foreground",
        align,
        className
    )}>
        {children}
    </td>
)

const EditableCell = ({ value, onChange, align, type = "text", uppercase, min, step }: any) => {
    return (
        <td className="p-0 border-r border-border/10 last:border-r-0 h-7">
            <input
                className={cn(
                    "w-full h-full bg-transparent px-2 outline-none focus:bg-primary/10 transition-colors placeholder:text-muted-foreground/20 font-mono text-[11px]",
                    align,
                    uppercase && "uppercase"
                )}
                defaultValue={value}
                type={type}
                min={min}
                step={step}
                onBlur={(e) => {
                    const newVal = e.target.value
                    if (newVal !== String(value)) {
                        onChange(newVal)
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                }}
            />
        </td>
    )
}
