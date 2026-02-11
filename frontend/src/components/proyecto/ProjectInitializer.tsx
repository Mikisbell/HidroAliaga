
"use client"

import { useEffect, useRef } from "react"
import { useProjectStore } from "@/store/project-store"
import { Nudo, Tramo } from "@/types/models"

interface ProjectInitializerProps {
    proyecto: any // Using specific type would be better if available
    nudos: Nudo[]
    tramos: Tramo[]
}

export function ProjectInitializer({ proyecto, nudos, tramos }: ProjectInitializerProps) {
    const setProject = useProjectStore(state => state.setProject)
    const setElements = useProjectStore(state => state.setElements)
    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            console.log("Initializing Project Store for:", proyecto.nombre)
            setProject(proyecto)
            setElements(nudos, tramos)
            initialized.current = true
        }
    }, [proyecto, nudos, tramos, setProject, setElements])

    return null
}
