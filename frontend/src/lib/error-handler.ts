import { toast } from "sonner"

export function handleApiError(error: unknown, context: string) {
    console.error(`[API Error] ${context}:`, error)
    
    let message = "Ha ocurrido un error inesperado"
    let description = "Por favor, intenta nuevamente más tarde"
    
    if (error instanceof Error) {
        if (error.name === 'AbortError') {
            message = "La solicitud tardó demasiado tiempo"
            description = "Verifica tu conexión a internet e intenta de nuevo"
        } else if (error.message.includes('404')) {
            message = "Recurso no encontrado"
            description = "El elemento que buscas no existe"
        } else if (error.message.includes('403')) {
            message = "Acceso denegado"
            description = "No tienes permisos para realizar esta acción"
        } else if (error.message.includes('500')) {
            message = "Error del servidor"
            description = "Estamos experimentando problemas técnicos"
        } else {
            message = error.message
        }
    }
    
    toast.error(message, {
        description,
        action: {
            label: "Reintentar",
            onClick: () => window.location.reload()
        },
        duration: 5000,
    })
    
    return { success: false, error: message }
}

export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000
): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return response
    } catch (error) {
        clearTimeout(timeoutId)
        throw error
    }
}

export function showSuccess(message: string, description?: string) {
    toast.success(message, {
        description,
        duration: 3000,
    })
}

export function showInfo(message: string, description?: string) {
    toast.info(message, {
        description,
        duration: 4000,
    })
}

export function showWarning(message: string, description?: string) {
    toast.warning(message, {
        description,
        duration: 4000,
    })
}
