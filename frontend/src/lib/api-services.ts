/**
 * Servicios API - HidroAliaga
 * Funciones para interactuar con el backend Python/FastAPI
 */

import { api } from "./api-client"
import type { Proyecto, Nudo, Tramo, Calculo } from "@/types/models"

// ============== PROYECTOS ==============

/**
 * Lista todos los proyectos del usuario autenticado
 */
export async function listarProyectos(skip = 0, limit = 100): Promise<Proyecto[]> {
    return api.get("/proyectos/", { skip, limit })
}

/**
 * Obtiene un proyecto por ID
 */
export async function obtenerProyecto(id: string): Promise<Proyecto> {
    return api.get(`/proyectos/${id}`)
}

/**
 * Crea un nuevo proyecto
 */
export async function crearProyecto(proyecto: Partial<Proyecto>): Promise<Proyecto> {
    return api.post("/proyectos/", proyecto)
}

/**
 * Actualiza un proyecto existente
 */
export async function actualizarProyecto(
    id: string, 
    proyecto: Partial<Proyecto>
): Promise<Proyecto> {
    return api.put(`/proyectos/${id}`, proyecto)
}

/**
 * Elimina un proyecto
 */
export async function eliminarProyecto(id: string): Promise<void> {
    return api.delete(`/proyectos/${id}`)
}

// ============== NUDOS ==============

/**
 * Lista los nudos de un proyecto
 */
export async function listarNudos(proyectoId: string): Promise<Nudo[]> {
    return api.get(`/proyectos/${proyectoId}/nudos`)
}

/**
 * Obtiene un nudo específico
 */
export async function obtenerNudo(proyectoId: string, nudoId: string): Promise<Nudo> {
    return api.get(`/proyectos/${proyectoId}/nudos/${nudoId}`)
}

/**
 * Crea un nuevo nudo
 */
export async function crearNudo(
    proyectoId: string, 
    nudo: Partial<Nudo>
): Promise<Nudo> {
    return api.post(`/proyectos/${proyectoId}/nudos`, nudo)
}

/**
 * Actualiza un nudo
 */
export async function actualizarNudo(
    proyectoId: string,
    nudoId: string,
    nudo: Partial<Nudo>
): Promise<Nudo> {
    return api.put(`/proyectos/${proyectoId}/nudos/${nudoId}`, nudo)
}

/**
 * Elimina un nudo
 */
export async function eliminarNudo(proyectoId: string, nudoId: string): Promise<void> {
    return api.delete(`/proyectos/${proyectoId}/nudos/${nudoId}`)
}

// ============== TRAMOS ==============

/**
 * Lista los tramos de un proyecto
 */
export async function listarTramos(proyectoId: string): Promise<Tramo[]> {
    return api.get(`/proyectos/${proyectoId}/tramos`)
}

/**
 * Obtiene un tramo específico
 */
export async function obtenerTramo(proyectoId: string, tramoId: string): Promise<Tramo> {
    return api.get(`/proyectos/${proyectoId}/tramos/${tramoId}`)
}

/**
 * Crea un nuevo tramo
 */
export async function crearTramo(
    proyectoId: string, 
    tramo: Partial<Tramo>
): Promise<Tramo> {
    return api.post(`/proyectos/${proyectoId}/tramos`, tramo)
}

/**
 * Actualiza un tramo
 */
export async function actualizarTramo(
    proyectoId: string,
    tramoId: string,
    tramo: Partial<Tramo>
): Promise<Tramo> {
    return api.put(`/proyectos/${proyectoId}/tramos/${tramoId}`, tramo)
}

/**
 * Elimina un tramo
 */
export async function eliminarTramo(proyectoId: string, tramoId: string): Promise<void> {
    return api.delete(`/proyectos/${proyectoId}/tramos/${tramoId}`)
}

// ============== CÁLCULOS ==============

/**
 * Ejecuta el cálculo hidráulico
 */
export async function calcularHidraulico(
    proyectoId: string,
    metodo: "hardy_cross" | "deterministico" | "hibrido" = "hardy_cross",
    tolerancia = 1e-7,
    maxIteraciones = 1000
): Promise<Calculo> {
    return api.post(`/calculos/${proyectoId}/calcular`, {
        metodo,
        tolerancia,
        max_iteraciones: maxIteraciones
    })
}

/**
 * Obtiene los resultados del último cálculo
 */
export async function obtenerResultadosCalculo(proyectoId: string): Promise<Calculo> {
    return api.get(`/calculos/${proyectoId}/resultados`)
}

/**
 * Valida el proyecto según normativa
 */
export async function validarProyecto(proyectoId: string): Promise<{
    passed: boolean
    total_verificaciones: number
    passed_verificaciones: number
    failed_verificaciones: number
    alertas: unknown[]
}> {
    return api.post(`/calculos/${proyectoId}/validar`, {})
}

/**
 * Obtiene la tabla de iteraciones
 */
export async function obtenerIteraciones(proyectoId: string): Promise<{
    iteraciones: unknown[]
    convergencia: boolean
    error_final: number
}> {
    return api.get(`/calculos/${proyectoId}/iteraciones`)
}

// ============== GIS ==============

/**
 * Obtiene las cotas del proyecto
 */
export async function obtenerCotas(proyectoId: string): Promise<{
    nudos: Array<{
        id: string
        codigo: string
        longitud: number
        latitud: number
        cota_terreno: number
        cota_source: string
    }>
}> {
    return api.get(`/gis/${proyectoId}/cotas`)
}

/**
 * Obtiene cotas desde servicio DEM
 */
export async function obtenerCotasDEM(proyectoId: string): Promise<{
    mensaje: string
    nudos_actualizados: number
    servicio: string
}> {
    return api.post(`/gis/${proyectoId}/cotas/desdem`, {})
}

/**
 * Interpola cotas faltantes
 */
export async function interpolarCotas(proyectoId: string): Promise<{
    mensaje: string
    metodo: string
    nudos_actualizados: number
}> {
    return api.post(`/gis/${proyectoId}/cotas/interpolar`, {})
}

/**
 * Obtiene datos para mapa de calor
 */
export async function obtenerMapaCalor(
    proyectoId: string,
    tipo: "presion" | "cota" | "velocidad" = "presion"
): Promise<{
    tipo: string
    datos: Array<{
        lat: number
        lng: number
        valor: number
        codigo: string
    }>
    rango: {
        minimo: number
        maximo: number
    }
}> {
    return api.get(`/gis/${proyectoId}/mapa-calor`, { tipo })
}

// ============== OPTIMIZACIÓN ==============

/**
 * Ejecuta la optimización de diámetros
 */
export async function optimizarDiametros(
    proyectoId: string,
    algoritmo = "algoritmo_genetico",
    poblacionSize = 100,
    generaciones = 50,
    crossoverRate = 0.8,
    mutationRate = 0.1
): Promise<{
    id: string
    convergencia: boolean
    costo_total: number
    costo_optimizado: number
    ahorro_porcentaje: number
    generaciones: number
    tiempo_optimizacion: number
    diametros_propuestos: Record<string, number>
}> {
    return api.post(`/optimizacion/${proyectoId}/optimizar`, {
        algoritmo,
        poblacion_size: poblacionSize,
        generaciones,
        crossover_rate: crossoverRate,
        mutation_rate: mutationRate
    })
}

/**
 * Obtiene resultados de optimización
 */
export async function obtenerResultadosOptimizacion(proyectoId: string): Promise<{
    id: string
    algoritmo: string
    convergencia: boolean
    costo_total: number
    costo_optimizado: number
    ahorro_porcentaje: number
    generaciones: number
    tiempo_optimizacion: number
    diametros_optimizados: Record<string, number>
}> {
    return api.get(`/optimizacion/${proyectoId}/resultados`)
}

// ============== REPORTES ==============

/**
 * Genera expediente técnico
 */
export async function generarExpediente(proyectoId: string): Promise<{
    expediente: {
        titulo: string
        fecha_generacion: string
        memoria_descriptiva: string
        cuadro_nudos: unknown[]
        cuadro_tramos: unknown[]
        resumen_calculo: unknown
    }
}> {
    return api.get(`/reportes/${proyectoId}/expediente`)
}

/**
 * Exporta proyecto en formato JSON
 */
export async function exportarExcel(proyectoId: string): Promise<Blob> {
    const token = await import("./api-client").then(m => m.getAuthToken())
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/reportes/${proyectoId}/excel`
    
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        throw new Error("Error exportando Excel")
    }
    
    return response.blob()
}

/**
 * Exporta proyecto en formato EPANET
 */
export async function exportarEPANET(proyectoId: string): Promise<Blob> {
    const token = await import("./api-client").then(m => m.getAuthToken())
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/reportes/${proyectoId}/epanet`
    
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        throw new Error("Error exportando EPANET")
    }
    
    return response.blob()
}

/**
 * Exporta proyecto en formato GeoJSON
 */
export async function exportarGeoJSON(proyectoId: string): Promise<Blob> {
    const token = await import("./api-client").then(m => m.getAuthToken())
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/reportes/${proyectoId}/geojson`
    
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        throw new Error("Error exportando GeoJSON")
    }
    
    return response.blob()
}

// ============== NORMATIVA ==============

/**
 * Consulta al copiloto normativo
 */
export async function consultarNormativa(
    pregunta: string,
    contexto?: string,
    usarRAG = true
): Promise<{
    pregunta: string
    respuesta: string
    fuentes?: string[]
}> {
    return api.post("/normativa/consultar", {
        pregunta,
        contexto,
        usar_rag: usarRAG
    })
}

/**
 * Valida un parámetro contra normativa
 */
export async function validarParametro(
    parametro: string,
    valor: number,
    unidad: string,
    ambito: "urbano" | "rural" = "urbano"
): Promise<{
    valido: boolean
    mensaje: string
    limite?: number
}> {
    return api.post("/normativa/validar", {
        parametro,
        valor,
        unidad,
        ambito
    })
}

/**
 * Obtiene límites normativos
 */
export async function obtenerLimitesNormativos(
    ambito: "urbano" | "rural"
): Promise<{
    ambito: string
    limites: Record<string, { valor: number; unidad: string; norma: string }>
}> {
    return api.get(`/normativa/limites/${ambito}`)
}
