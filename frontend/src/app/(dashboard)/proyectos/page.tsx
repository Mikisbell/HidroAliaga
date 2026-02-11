import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export default async function ProyectosPage() {
    const supabase = await createClient()

    // Get authenticated user for per-user filtering
    const { data: { user } } = await supabase.auth.getUser()

    let proyectos: any[] = []
    if (user) {
        const { data } = await supabase
            .from("proyectos")
            .select("*, nudos(count), tramos(count), calculos(count)")
            .eq("usuario_id", user.id)
            .order("updated_at", { ascending: false })
        proyectos = data || []
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl">
            <div className="flex items-end justify-between animate-fade-in-up">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                        Gestión
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                        Redes de distribución de agua potable
                    </p>
                </div>
                <Link href="/proyectos/nuevo">
                    <Button className="btn-primary text-white rounded-xl px-6 h-10 font-semibold">
                        + Nuevo Proyecto
                    </Button>
                </Link>
            </div>

            {proyectos && proyectos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up-delay-1">
                    {proyectos.map((p) => (
                        <Link key={p.id} href={`/proyectos/${p.id}`}>
                            <Card className="project-card bg-card/60 h-full cursor-pointer">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                                                💧
                                            </div>
                                            <h3 className="font-semibold text-sm leading-tight">{p.nombre}</h3>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] ${p.estado === 'borrador'
                                                ? 'border-muted-foreground/20 text-muted-foreground/60'
                                                : 'border-green-500/30 text-green-400'
                                                }`}
                                        >
                                            {p.estado || 'borrador'}
                                        </Badge>
                                    </div>

                                    {p.descripcion && (
                                        <p className="text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed">
                                            {p.descripcion}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="text-[10px] border-border/30">{p.ambito}</Badge>
                                        <Badge variant="outline" className="text-[10px] border-border/30">Red {p.tipo_red}</Badge>
                                    </div>

                                    <div className="flex gap-4 pt-2.5 border-t border-border/20 text-[11px] text-muted-foreground/50">
                                        <span className="flex items-center gap-1">
                                            <span style={{ color: 'oklch(0.70 0.18 230)' }} className="font-semibold">{p.nudos?.[0]?.count || 0}</span> nudos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span style={{ color: 'oklch(0.70 0.15 200)' }} className="font-semibold">{p.tramos?.[0]?.count || 0}</span> tramos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span style={{ color: 'oklch(0.70 0.16 160)' }} className="font-semibold">{p.calculos?.[0]?.count || 0}</span> cálculos
                                        </span>
                                    </div>

                                    {p.departamento && (
                                        <p className="text-[10px] text-muted-foreground/40">
                                            📍 {p.distrito ? `${p.distrito}, ` : ''}{p.provincia ? `${p.provincia}, ` : ''}{p.departamento}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="bg-card/40 border-border/20">
                    <CardContent className="py-20 text-center text-muted-foreground">
                        <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center text-4xl mx-auto mb-5">
                            🏗️
                        </div>
                        <p className="font-semibold text-lg">Sin proyectos</p>
                        <p className="text-sm mt-1 text-muted-foreground/60 max-w-sm mx-auto">
                            Comienza diseñando tu primera red de distribución de agua potable
                        </p>
                        <Link href="/proyectos/nuevo">
                            <Button className="btn-primary text-white rounded-xl mt-6 px-6">
                                Crear Proyecto
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
