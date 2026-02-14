"use client"

import dynamic from "next/dynamic"
import { Nudo, Tramo } from "@/types/models"
import { updateNudoCoordinates, createNudo } from "@/app/actions/nudos"
import { createTramo } from "@/app/actions/tramos"
import { MapBottomPalette } from "./MapBottomPalette"
import { MapSideTools } from "./MapSideTools"
import { useProjectStore } from "@/store/project-store"
import { toast } from "sonner"

const MapEditor = dynamic(() => import("./MapEditor"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted/10 rounded-xl border border-border/30 animate-pulse">
            <div className="text-center space-y-2">
                <p className="text-4xl animate-bounce">🗺️</p>
                <p className="text-sm text-muted-foreground">Cargando mapa...</p>
            </div>
        </div>
    )
})

interface MapWrapperProps {
    nudos: Nudo[]
    tramos: Tramo[]
    proyectoId: string
    initialPlanoConfig?: {
        url: string
        opacity: number
        rotation?: number
        bounds: [[number, number], [number, number]] | null
    } | null
}

export default function MapWrapper({ nudos, tramos, proyectoId, initialPlanoConfig }: MapWrapperProps) {
    const activeComponentType = useProjectStore(state => state.activeComponentType)

    const handleDragEnd = async (id: string, lat: number, lng: number) => {
        const result = await updateNudoCoordinates(id, lat, lng)
        if (!result.success) {
            console.error("Failed to update node:", result.message)
            toast.error(result.message || "Error al actualizar la posición del nudo")
        }
    }

    const handleMapClick = async (lat: number, lng: number) => {
        if (!proyectoId) return

        const typeToCreate = activeComponentType || 'union'
        const result = await createNudo(proyectoId, lat, lng, typeToCreate)

        if (!result.success) {
            console.error("Failed to create node:", result.message)
            if (result.errors) {
                // Show first validation error
                const firstError = Object.values(result.errors).flat()[0]
                toast.error(firstError || "Datos inválidos")
            } else {
                toast.error(result.message || "Error al crear el nudo")
            }
        } else {
            toast.success("Nudo creado correctamente")
        }
    }

    const handleCreatePipe = async (origenId: string, destinoId: string) => {
        if (!proyectoId) return

        const result = await createTramo({
            proyecto_id: proyectoId,
            nudo_origen_id: origenId,
            nudo_destino_id: destinoId
        })

        if (!result.success) {
            console.error("Failed to create pipe:", result.message)
            if (result.errors) {
                const firstError = Object.values(result.errors).flat()[0]
                toast.error(firstError || "Datos inválidos")
            } else {
                toast.error(result.message || "Error al crear el tramo")
            }
        } else {
            toast.success("Tramo creado correctamente")
        }
    }

    // Calcular centro promedio si hay nudos
    const center: [number, number] | undefined = nudos.length > 0
        ? [nudos.reduce((acc, n) => acc + (n.latitud || 0), 0) / nudos.length,
        nudos.reduce((acc, n) => acc + (n.longitud || 0), 0) / nudos.length]
        : undefined

    return (
        <div className="relative w-full h-full">
            {/* New Layout: Bottom Palette + Side Tools */}
            <MapBottomPalette />
            <MapSideTools />

            <MapEditor
                nudos={nudos}
                tramos={tramos}
                onNudoDragEnd={handleDragEnd}
                onMapClick={handleMapClick}
                onCreatePipe={handleCreatePipe}
                center={center}
                initialPlanoConfig={initialPlanoConfig}
                proyectoId={proyectoId}
            />
        </div>
    )
}
