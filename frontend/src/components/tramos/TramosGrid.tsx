'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateTramoAction, updateNudoViviendasAction, createTramo } from "@/app/actions/tramos"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus, Save } from "lucide-react"

interface TramosGridProps {
    tramos: any[]
    nudos: any[]
    proyectoId: string
}

export function TramosGrid({ tramos, nudos, proyectoId }: TramosGridProps) {
    const router = useRouter()

    // Helper to find node by ID
    const getNode = (id: string) => nudos.find(n => n.id === id)

    const handleTramoUpdate = async (id: string, field: string, value: any) => {
        // Convert string inputs to numbers
        let numValue = value
        if (field === 'longitud' || field === 'diametro_comercial') {
            numValue = parseFloat(value)
            if (isNaN(numValue)) return // Don't save invalid numbers
        }

        const payload: any = { id }
        payload[field] = numValue

        const res = await updateTramoAction(payload)
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
        if (res.error) {
            toast.error(res.error)
        } else {
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

    // Sort nodes for dropdown: Reservoirs first, then CRPs, then alphanumeric
    const sortedNodes = [...nudos].sort((a, b) => {
        // Reservoirs first
        if (a.tipo === 'reservorio' && b.tipo !== 'reservorio') return -1
        if (a.tipo !== 'reservorio' && b.tipo === 'reservorio') return 1

        // CRPs second
        const isC_A = a.codigo.includes('CRP') || a.tipo === 'camara_rompe_presion'
        const isC_B = b.codigo.includes('CRP') || b.tipo === 'camara_rompe_presion'
        if (isC_A && !isC_B) return -1
        if (!isC_A && isC_B) return 1

        // Then alphabetic code
        return a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
    })

    const PIPE_CLASSES = [
        { value: 'CL-5', label: 'Clase 5' },
        { value: 'CL-7.5', label: 'Clase 7.5 (CRP)' },
        { value: 'CL-10', label: 'Clase 10 (Std)' },
        { value: 'CL-15', label: 'Clase 15' },
        { value: 'S-25', label: 'Sch 40' }
    ]

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
            // Auto-chain: Set Start Node of next row to End Node of this row
            setNewRow({
                nudo_origen_id: newRow.nudo_destino_id, // Chain the end node to start
                nudo_destino_id: '',
                longitud: '',
                diametro_comercial: newRow.diametro_comercial, // Keep diameter
                material: newRow.material, // Keep material
                clase_tuberia: newRow.clase_tuberia // Keep class
            })
            router.refresh()

            // Focus on destination select (optional, requires ref)
        }
    }

    return (
        <div className="rounded-md border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
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

                        return (
                            <TableRow key={t.id}>
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
                                        className="h-8 text-right font-mono"
                                        onBlur={(e) => handleTramoUpdate(t.id, 'longitud', e.target.value)}
                                        step="0.01"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        defaultValue={t.diametro_comercial}
                                        className="h-8 text-right font-mono"
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
                                        className="h-8 text-center text-xs uppercase"
                                        onBlur={(e) => handleTramoUpdate(t.id, 'material', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        defaultValue={nFin?.numero_viviendas || 0}
                                        className="h-8 text-center"
                                        onBlur={(e) => nFin && handleViviendasUpdate(nFin.id, e.target.value)}
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                    {nFin?.presion_calc?.toFixed(2) || '-'}
                                    {nFin?.presion_diseno && <span className="text-[10px] text-muted-foreground block text-emerald-600/70">Ref: {nFin.presion_diseno}</span>}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                    {t.velocidad?.toFixed(2) || '-'}
                                    {t.velocidad_diseno && <span className="text-[10px] text-muted-foreground block text-emerald-600/70">Ref: {t.velocidad_diseno}</span>}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                <TableFooter className="bg-muted/10 border-t-2 border-primary/20">
                    <TableRow>
                        <TableCell colSpan={1} className="font-semibold text-primary text-xs uppercase tracking-wider pl-4">Nuevo Tramo</TableCell>
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
                            Cotas automáticas
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
