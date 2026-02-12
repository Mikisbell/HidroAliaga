/**
 * API Client - Cliente HTTP para el Backend Python con autenticación JWT
 * 
 * Este módulo proporciona funciones para hacer llamadas al backend FastAPI
 * incluyendo automáticamente el token JWT de Supabase en el header Authorization.
 */

import { createClient } from "./supabase/client"

// URL base del backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

/**
 * Obtiene el token JWT del usuario actual desde Supabase
 */
export async function getAuthToken(): Promise<string | null> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
}

/**
 * Opciones para las peticiones HTTP
 */
interface ApiRequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>
}

/**
 * Realiza una petición autenticada al backend
 * 
 * @param endpoint - Ruta del endpoint (sin el prefijo /api/v1)
 * @param options - Opciones de la petición
 * @returns Promise con la respuesta parseada
 */
export async function apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    // Obtener token de autenticación
    const token = await getAuthToken()

    if (!token) {
        throw new Error("No autenticado. Por favor inicia sesión.")
    }

    // Construir URL con query params
    let url = `${BACKEND_URL}/api/v1${endpoint}`

    if (options.params) {
        const searchParams = new URLSearchParams()
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value))
            }
        })
        const queryString = searchParams.toString()
        if (queryString) {
            url += `?${queryString}`
        }
    }

    // Configurar headers
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
    }

    // Realizar petición
    const response = await fetch(url, {
        ...options,
        headers,
    })

    // Manejar errores
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || `Error ${response.status}: ${response.statusText}`

        if (response.status === 401) {
            throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.")
        } else if (response.status === 403) {
            throw new Error("No tienes permiso para realizar esta acción.")
        } else if (response.status === 404) {
            throw new Error("Recurso no encontrado.")
        }

        throw new Error(errorMessage)
    }

    // Parsear respuesta
    if (response.status === 204) {
        return {} as T
    }

    return response.json()
}

/**
 * Cliente API con métodos HTTP comunes
 */
export const api = {
    /**
     * GET request
     */
    get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
        apiRequest<T>(endpoint, { method: "GET", params }),

    /**
     * POST request
     */
    post: <T>(endpoint: string, body: unknown) =>
        apiRequest<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        }),

    /**
     * PUT request
     */
    put: <T>(endpoint: string, body: unknown) =>
        apiRequest<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body)
        }),

    /**
     * DELETE request
     */
    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: "DELETE" }),
}

// Exportar tipos
export type { ApiRequestOptions }
