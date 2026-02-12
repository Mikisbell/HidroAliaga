'use client'

import { useState, useRef, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { updateTramo, updateNudoViviendasAction, createTramo, createBatchTramos, deleteBatchTramos } from "@/app/actions/tramos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus, Save, Trash2, Copy, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TramosGridProps {
    tramos: any[]
    nudos: any[]
    proyectoId: string
}

export function TramosGrid({ tramos, nudos, proyectoId }: TramosGridProps) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPasting, setIsPasting] = useState(false)
    const tableRef = useRef<HTMLDivElement>(null)

    // Helper to find node by ID or Code
    const getNode = (id: string) => nudos.find(n => n.id === id)
    const findNodeByCode = (code: string) => nudos.find(n => n.codigo.trim().toLowerCase() === code.trim().toLowerCase())

    const handleTramoUpdate = async (id: string, field: string, value: any) => {
        let numValue = value
        if (field === 'longitud' || field === 'diametro_comercial') {
            numValue = parseFloat(value)
            if (isNaN(numValue)) return
        }

        const payload: any = { id }
        payload[field] = numValue

        const res = await updateTramo(payload)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Actualizado")
            router.refresh()
        }
    }

    const handleViviendasUpdate = async (nudoId: string, value: string) => {
        const num = parseInt(value)
        if (isNaN(num)) return
        const res = await updateNudoViviendasAction(nudoId, num)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Viviendas actualizadas")
            router.refresh()
        }
    }

    const [newRow, setNewRow] = useState<any>({
        nudo_origen_id: '',
        nudo_destino_id: '',
        longitud: '',
        diametro_comercial: '0.75',
        material: 'pvc',
        clase_tuberia: 'CL-10'
    })

    const sortedNodes = [...nudos].sort((a, b) => {
        if (a.tipo === 'reservorio' && b.tipo !== 'reservorio') return -1
        if (a.tipo !== 'reservorio' && b.tipo === 'reservorio') return 1
        return a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
    })

    const handleCreateTramo = async () => {
        if (!newRow.nudo_origen_id || !newRow.nudo_destino_id) {
            toast.error("Selecciona Nudo Origen y Destino")
            return
        }
        if (newRow.nudo_origen_id === newRow.nudo_destino_id) {
            toast.error("Origen y Destino deben ser distintos")
            return
        }

        const res = await createTramo({
            ...newRow,
            proyecto_id: proyectoId,
            longitud: parseFloat(newRow.longitud) || 0,
            diametro_comercial: parseFloat(newRow.diametro_comercial) || 0.75,
            clase_tuberia: newRow.clase_tuberia || 'CL-10'
        })

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Tramo creado")
            setNewRow({
                nudo_origen_id: newRow.nudo_destino_id,
                nudo_destino_id: '',
                longitud: '',
                diametro_comercial: newRow.diametro_comercial,
                material: newRow.material,
                clase_tuberia: newRow.clase_tuberia
            })
            router.refresh()
        }
    }

    // --- Bulk Selection ---
    const toggleSelectAll = () => {
        if (selectedIds.size === tramos.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(tramos.map(t => t.id)))
        }
    }

    const toggleSelectRow = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const handleBulkDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar ${selectedIds.size} tramos?`)) return

        const ids = Array.from(selectedIds)
        const res = await deleteBatchTramos(ids)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Tramos eliminados")
            setSelectedIds(new Set())
            router.refresh()
        }
    }

    // --- Paste Logic ---
    const handlePaste = async (e: React.ClipboardEvent) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        if (!text) return

        setIsPasting(true)
        const rows = text.split(/\r?\n/).filter(line => line.trim() !== '')

        if (rows.length === 0) {
            setIsPasting(false)
            return
        }

        toast.info(`Procesando ${rows.length} filas del portapapeles...`)

        const newTramos = []
        let errors = 0

        // Heuristic: Try to match standard columns
        // Expected: [Code?] [NodeA] [NodeB] [Len] [Dia] [Mat] [Class]
        // Or simplified: [NodeA] [NodeB] [Len] ...

        for (const row of rows) {
            const cols = row.split('\t').map(c => c.trim())

            // Try to identify Node A and Node B
            // If col[0] looks like a node code, assume simplified format
            // If col[1] looks like a node code, assume col[0] is Code

            let nudoOrigen = findNodeByCode(cols[0])
            let nudoDestino = findNodeByCode(cols[1])
            let startIndex = 0

            // If first col isn't a node, check if second is
            if (!nudoOrigen && cols.length > 2) {
                const altOrigen = findNodeByCode(cols[1])
                const altDestino = findNodeByCode(cols[2])
                if (altOrigen && altDestino) {
                    nudoOrigen = altOrigen
                    nudoDestino = altDestino
                    startIndex = 1 // Offset for length/dia
                }
            }

            if (nudoOrigen && nudoDestino) {
                // Determine other fields based on remaining columns
                // Expected after nodes: [Longitud] [Diametro] [Material] [Clase]
                const longitud = parseFloat(cols[startIndex + 2]?.replace(',', '.') || '0')
                const diametro = parseFloat(cols[startIndex + 3]?.replace(',', '.') || '0.75')
                const material = cols[startIndex + 4] || 'pvc'
                const clase = cols[startIndex + 5] || 'CL-10'

                newTramos.push({
                    nudo_origen_id: nudoOrigen.id,
                    nudo_destino_id: nudoDestino.id,
                    longitud: isNaN(longitud) ? 0 : longitud,
                    diametro_comercial: isNaN(diametro) ? 0.75 : diametro,
                    material,
                    clase_tuberia: clase,
                    codigo: startIndex === 1 ? cols[0] : undefined // Use explicit code if found
                })
            } else {
                errors++
            }
        }

        if (newTramos.length > 0) {
            const res = await createBatchTramos(newTramos, proyectoId)
            if (res.error) {
                toast.error(`Error al importar: ${res.error}`)
            } else {
                toast.success(`Importados ${res.count} tramos correctamente`)
                if (errors > 0) toast.warning(`${errors} filas se ignoraron (nudos no encontrados)`)
                router.refresh()
            }
        } else {
            toast.error("No se encontraron tramos válidos. Verifica los códigos de los nudos.")
        }
        setIsPasting(false)
    }

    return (
        <div
            className="relative rounded-md border bg-card shadow-sm outline-none focus:ring-1 focus:ring-primary/20"
            tabIndex={0}
            onPaste={handlePaste}
            ref={tableRef}
        >
            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-foreground/90 text-background px-4 py-2 rounded-full shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <span className="text-sm font-medium">{selectedIds.size} seleccionados</span>
                    <div className="h-4 w-px bg-background/20" />
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/20 hover:text-white rounded-full text-red-300"
                        onClick={handleBulkDelete} title="Borrar selección">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/20 hover:text-white rounded-full"
                        onClick={() => setSelectedIds(new Set())} title="Cancelar">
                        <span className="text-xs">✕</span>
                    </Button>
                </div>
            )}

            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[40px]">
                            <Checkbox
                                checked={tramos.length > 0 && selectedIds.size === tramos.length}
                                onCheckedChange={toggleSelectAll}
                            />
                        </TableHead>
                        <TableHead className="w-[80px]">Tramo</TableHead>
                        <TableHead>Nudo Inicio</TableHead>
                        <TableHead>Nudo Fin</TableHead>
                        <TableHead className="text-right">Cota Ini (m)</TableHead>
                        <TableHead className="text-right">Cota Fin (m)</TableHead>
                        <TableHead className="text-center w-[120px]">Longitud (m)</TableHead>
                        <TableHead className="text-center w-[100px]">Ø (pulg)</TableHead>
                        <TableHead className="text-center w-[100px]">Clase</TableHead>
                        <TableHead className="text-center w-[100px]">Mat.</TableHead>
                        <TableHead className="text-center w-[100px]">Viviendas (Dest)</TableHead>
                        <TableHead className="text-right text-xs">Presión (m)</TableHead>
                        <TableHead className="text-right text-xs">Vel. (m/s)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tramos.map((t) => {
                        const nInicio = getNode(t.nudo_origen_id)
                        const nFin = getNode(t.nudo_destino_id)
                        const isSelected = selectedIds.has(t.id)

                        return (
                            <TableRow key={t.id} className={cn(isSelected && "bg-primary/5")}>
                                <TableCell>
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleSelectRow(t.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium bg-muted/20">
                                    {t.codigo}
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-mono bg-muted/30 px-1 py-0.5 rounded">{nInicio?.codigo}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-mono bg-muted/30 px-1 py-0.5 rounded">{nFin?.codigo}</span>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">
                                    {nInicio?.elevacion?.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">
                                    {nFin?.elevacion?.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        defaultValue={t.longitud}
                                        className="h-8 text-right font-mono focus-visible:ring-primary/50"
                                        onBlur={(e) => handleTramoUpdate(t.id, 'longitud', e.target.value)}
                                        step="0.01"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        defaultValue={t.diametro_comercial}
                                        className="h-8 text-right font-mono focus-visible:ring-primary/50"
                                        onBlur={(e) => handleTramoUpdate(t.id, 'diametro_comercial', e.target.value)}
                                        step="0.1"
                                    />
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-muted-foreground">{t.clase_tuberia || 'CL-10'}</span>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        defaultValue={t.material}
                                        className="h-8 text-center text-xs uppercase focus-visible:ring-primary/50"
                                        onBlur={(e) => handleTramoUpdate(t.id, 'material', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        defaultValue={nFin?.numero_viviendas || 0}
                                        className="h-8 text-center focus-visible:ring-primary/50"
                                        onBlur={(e) => nFin && handleViviendasUpdate(nFin.id, e.target.value)}
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                    {nFin?.presion_calc?.toFixed(2) || '-'}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                    {t.velocidad?.toFixed(2) || '-'}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                <TableFooter className="bg-muted/10 border-t-2 border-primary/20">
                    <TableRow>
                        <TableCell colSpan={2} className="font-semibold text-primary text-xs uppercase tracking-wider pl-4">Nuevo Tramo</TableCell>
                        <TableCell>
                            <select
                                className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono"
                                value={newRow.nudo_origen_id}
                                onChange={(e) => setNewRow({ ...newRow, nudo_origen_id: e.target.value })}
                            >
                                <option value="">Origen...</option>
                                {sortedNodes.map(n => (
                                    <option key={n.id} value={n.id}>
                                        {n.tipo === 'reservorio' ? '💧 ' : (n.codigo.includes('CRP') ? '⚡ ' : '')}{n.codigo}
                                    </option>
                                ))}
                            </select>
                        </TableCell>
                        <TableCell>
                            <select
                                className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs font-mono"
                                value={newRow.nudo_destino_id}
                                onChange={(e) => setNewRow({ ...newRow, nudo_destino_id: e.target.value })}
                            >
                                <option value="">Destino...</option>
                                {sortedNodes.map(n => (
                                    <option key={n.id} value={n.id}>
                                        {n.tipo === 'reservorio' ? '💧 ' : (n.codigo.includes('CRP') ? '⚡ ' : '')}{n.codigo}
                                    </option>
                                ))}
                            </select>
                        </TableCell>
                        <TableCell colSpan={2} className="text-center text-xs text-muted-foreground italic">
                            <span className="flex items-center justify-center gap-2">
                                <Copy className="w-3 h-3" /> Pega desde Excel
                            </span>
                        </TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                placeholder="Long (m)"
                                value={newRow.longitud}
                                onChange={(e) => setNewRow({ ...newRow, longitud: e.target.value })}
                                className="h-8 text-right font-mono"
                            />
                        </TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                placeholder="Ø"
                                value={newRow.diametro_comercial}
                                onChange={(e) => setNewRow({ ...newRow, diametro_comercial: e.target.value })}
                                className="h-8 text-right font-mono"
                            />
                        </TableCell>
                        <TableCell>
                            <Input
                                value={newRow.material}
                                onChange={(e) => setNewRow({ ...newRow, material: e.target.value })}
                                className="h-8 text-center text-xs"
                            />
                        </TableCell>
                        <TableCell colSpan={3} className="text-right">
                            <Button size="sm" onClick={handleCreateTramo} disabled={!newRow.nudo_origen_id || !newRow.nudo_destino_id}>
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
