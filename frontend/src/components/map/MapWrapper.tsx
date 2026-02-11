"use client"

import dynamic from "next/dynamic"
import { Nudo, Tramo } from "@/types/models"
import { updateNudoCoordinates, createNudo } from "@/app/actions/nudos"
import { createTramo } from "@/app/actions/tramos"
import { MapToolbar } from "./MapToolbar"

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
    const handleDragEnd = async (id: string, lat: number, lng: number) => {
        try {
            console.log(`Updating node ${id} to ${lat}, ${lng}`)
            await updateNudoCoordinates(id, lat, lng)
            console.log("Node updated successfully")
        } catch (error) {
            console.error("Failed to update node:", error)
            alert("Error al actualizar la posición del nudo")
        }
    }

    const handleMapClick = async (lat: number, lng: number) => {
        if (!proyectoId) return
        try {
            console.log(`Creating node at ${lat}, ${lng}`)
            await createNudo(proyectoId, lat, lng)
            console.log("Node created successfully")
        } catch (error) {
            console.error("Failed to create node:", error)
            alert("Error al crear el nudo")
        }
    }

    const handleCreatePipe = async (origenId: string, destinoId: string) => {
        if (!proyectoId) return
        try {
            console.log(`Creating pipe from ${origenId} to ${destinoId}`)
            await createTramo(proyectoId, origenId, destinoId)
            console.log("Pipe created successfully")
        } catch (error) {
            console.error("Failed to create pipe:", error)
            alert(error instanceof Error ? error.message : "Error al crear el tramo")
        }
    }

    // Calcular centro promedio si hay nudos
    const center: [number, number] | undefined = nudos.length > 0
        ? [nudos.reduce((acc, n) => acc + (n.latitud || 0), 0) / nudos.length,
        nudos.reduce((acc, n) => acc + (n.longitud || 0), 0) / nudos.length]
        : undefined

    return (
        <div className="relative w-full h-full">
            <MapToolbar />
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
