import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TramosGrid } from "@/components/tramos/TramosGrid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
    params: Promise<{ id: string }>
}

export default async function TramosPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: proyecto } = await supabase
        .from("proyectos")
        .select("nombre")
        .eq("id", id)
        .single()

    if (!proyecto) notFound()

    const { data: nudos } = await supabase.from("nudos").select("*").eq("proyecto_id", id).order("codigo")
    const { data: tramos } = await supabase.from("tramos").select("*").eq("proyecto_id", id).order("codigo")

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header simple */}
            <div className="border-b px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/proyectos/${id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al Panel
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Editor de Tramos y Red</h1>
                        <p className="text-xs text-muted-foreground">{proyecto.nombre}</p>
                    </div>
                </div>
            </div>

            {/* Content - Scrollable area */}
            <div className="flex-1 overflow-auto p-6 bg-muted/10">
                <div className="max-w-[1600px] mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Tabla de Datos Hidráulicos</h2>
                        <div className="flex gap-2">
                            {/* Actions can go here */}
                        </div>
                    </div>

                    <TramosGrid tramos={tramos || []} nudos={nudos || []} proyectoId={id} />
                </div>
            </div>
        </div>
    )
}
