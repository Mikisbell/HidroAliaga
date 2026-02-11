"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function CalcularButton({ proyectoId }: { proyectoId: string }) {
    const router = useRouter()
    const [isCalculating, setIsCalculating] = useState(false)
    const [resultado, setResultado] = useState<string | null>(null)

    const handleCalcular = async () => {
        setIsCalculating(true)
        setResultado(null)

        try {
            const response = await fetch("/api/calcular", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proyecto_id: proyectoId }),
            })

            const data = await response.json()

            if (!response.ok) {
                setResultado(`❌ Error: ${data.error}`)
                return
            }

            const { resultado: res, validacion } = data
            setResultado(
                `✅ ${res.convergencia ? "Convergencia" : "No convergió"} — ` +
                `${res.iteraciones_realizadas} iteraciones — ` +
                `Presión: ${res.presion_minima.toFixed(2)}–${res.presion_maxima.toFixed(2)} m.c.a. — ` +
                `${validacion.errores} errores, ${validacion.advertencias} advertencias`
            )

            // Refrescar los datos de la página
            router.refresh()
        } catch (err) {
            setResultado(`❌ Error: ${err instanceof Error ? err.message : "desconocido"}`)
        } finally {
            setIsCalculating(false)
        }
    }

    return (
        <div className="space-y-2">
            <Button
                onClick={handleCalcular}
                disabled={isCalculating}
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
            >
                {isCalculating ? "⏳ Calculando..." : "▶ Calcular Red"}
            </Button>
            {resultado && (
                <p className="text-xs max-w-lg">{resultado}</p>
            )}
        </div>
    )
}
