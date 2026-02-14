import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"
import { Nudo, Tramo } from "@/types/models"

export function useNudos(proyectoId: string) {
    const { data, error, isLoading, mutate } = useSWR<Nudo[]>(
        proyectoId ? `/proyectos/${proyectoId}/nudos` : null,
        swrFetcher
    )

    return {
        nudos: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}

export function useTramos(proyectoId: string) {
    const { data, error, isLoading, mutate } = useSWR<Tramo[]>(
        proyectoId ? `/proyectos/${proyectoId}/tramos` : null,
        swrFetcher
    )

    return {
        tramos: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}
