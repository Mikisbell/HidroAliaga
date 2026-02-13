"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Nudo } from "@/types/models"
import { useProjectStore } from "@/store/project-store"
import { updateNudo } from "@/app/actions/nudos"
import { X, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface NodeEditPopoverProps {
    nudo: Nudo
    position: { x: number; y: number }
    onClose: () => void
}

export function NodeEditPopover({ nudo, position, onClose }: NodeEditPopoverProps) {
    const updateNudoStore = useProjectStore(state => state.updateNudo)
    const ref = useRef<HTMLDivElement>(null)

    const [form, setForm] = useState({
        codigo: nudo.codigo,
        cota_terreno: nudo.cota_terreno ?? 0,
        demanda_base: nudo.demanda_base ?? 0,
        numero_viviendas: nudo.numero_viviendas ?? 0,
    })

    // Close on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [onClose])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [onClose])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === "number" ? (parseFloat(value) || 0) : value
        }))
    }

    const handleSave = useCallback(async () => {
        // Optimistic update
        const updated = { ...nudo, ...form }
        updateNudoStore(updated)

        try {
            await updateNudo(nudo.id, form)
            toast.success(`${form.codigo} actualizado`)
        } catch {
            toast.error("Error al guardar")
        }
        onClose()
    }, [nudo, form, updateNudoStore, onClose])

    // Node type emoji
    const typeEmoji: Record<string, string> = {
        reservorio: "🏗️",
        camara_rompe_presion: "⚡",
        union: "🔵",
        cisterna: "🏗️",
        consumo: "🏠",
        tanque_elevado: "🏗️",
        valvula: "🔧",
        bomba: "⚙️",
    }

    return (
        <div
            ref={ref}
            className="fixed z-[9999] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{
                left: position.x,
                top: position.y,
                width: 260,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-muted/20 rounded-t-xl">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">{typeEmoji[nudo.tipo] || '🔵'}</span>
                    <span className="text-xs font-bold text-foreground">{nudo.tipo.replace('_', ' ').toUpperCase()}</span>
                </div>
                <button onClick={onClose} className="p-0.5 rounded hover:bg-muted transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
            </div>

            {/* Form */}
            <div className="p-3 space-y-2.5">
                <Field label="Código" name="codigo" value={form.codigo} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-2">
                    <Field label="Cota (m)" name="cota_terreno" value={form.cota_terreno} onChange={handleChange} type="number" />
                    <Field label="Demanda (L/s)" name="demanda_base" value={form.demanda_base} onChange={handleChange} type="number" step="0.01" />
                </div>
                <Field label="N° Viviendas" name="numero_viviendas" value={form.numero_viviendas} onChange={handleChange} type="number" step="1" />
            </div>

            {/* Footer */}
            <div className="px-3 pb-3">
                <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                    <Save className="w-3.5 h-3.5" />
                    Guardar
                </button>
            </div>
        </div>
    )
}

// Simple field component
function Field({ label, name, value, onChange, type = "text", step }: {
    label: string
    name: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    step?: string
}) {
    return (
        <div className="space-y-0.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                step={step}
                onChange={onChange}
                className="flex h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-mono"
            />
        </div>
    )
}
