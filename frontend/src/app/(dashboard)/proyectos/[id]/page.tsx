import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PIPE_DATABASE } from "@/lib/optimization/cost-database"
import { ProjectInitializer } from "@/components/proyecto/ProjectInitializer"
import { EditorCanvas } from "@/components/editor/EditorCanvas"

type Props = { params: Promise<{ id: string }> }

export default async function ProyectoPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: proyecto, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !proyecto) notFound()

    const { data: nudos } = await supabase.from("nudos").select("*").eq("proyecto_id", id).order("codigo")
    const { data: tramos } = await supabase.from("tramos").select("*").eq("proyecto_id", id).order("codigo")
    const { data: calculos } = await supabase.from("calculos").select("*").eq("proyecto_id", id).order("created_at", { ascending: false }).limit(5)

    const ultimoCalculo = calculos?.[0]

    const initialCost = tramos?.reduce((acc, t) => {
        const pipe = PIPE_DATABASE.find(p => Math.abs(p.diametro_interior_mm - t.diametro_interior) < 1)
        const costPerMeter = pipe ? pipe.costo_usd_metro : 0
        return acc + (t.longitud * costPerMeter)
    }, 0) || 0

    return (
        <>
            <ProjectInitializer proyecto={proyecto} nudos={nudos || []} tramos={tramos || []} />
            <EditorCanvas
                proyecto={proyecto}
                nudos={nudos || []}
                tramos={tramos || []}
                ultimoCalculo={ultimoCalculo}
                initialCost={initialCost}
            />
        </>
    )
}
