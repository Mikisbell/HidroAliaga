import { api } from "@/lib/api-client"

export const swrFetcher = async <T>(url: string): Promise<T> => {
    return api.get<T>(url)
}
