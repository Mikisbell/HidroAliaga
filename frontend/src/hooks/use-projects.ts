import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-fetcher"
import { Proyecto } from "@/types/models"

export function useProjects() {
    const { data, error, isLoading, mutate } = useSWR<Proyecto[]>("/proyectos/", swrFetcher)

    return {
        projects: data || [],
        isLoading,
        isError: error,
        mutate,
    }
}

export function useProject(id: string) {
    const { data, error, isLoading, mutate } = useSWR<Proyecto>(id ? `/proyectos/${id}` : null, swrFetcher)

    return {
        project: data,
        isLoading,
        isError: error,
        mutate,
    }
}
