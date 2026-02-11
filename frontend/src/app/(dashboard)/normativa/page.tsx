import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { NORMAS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

export default async function NormativaPage() {
    const supabase = await createClient()

    const { data: normativas } = await supabase
        .from("normativas")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl">
            <div className="animate-fade-in-up">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                    Referencia
                </p>
                <h1 className="text-2xl font-bold tracking-tight">Normativa Peruana</h1>
                <p className="text-sm text-muted-foreground/60 mt-1">
                    Regulaciones aplicables al diseño de redes de agua potable
                </p>
            </div>

            {/* Normas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up-delay-1">
                {NORMAS.map((norma) => (
                    <Card key={norma.codigo} className="bg-card/60 border-border/30 stat-card stat-card-amber">
                        <CardContent className="p-5 space-y-3">
                            <Badge variant="outline" className="text-[10px] border-amber-500/30" style={{ color: 'oklch(0.78 0.15 80)' }}>
                                {norma.codigo}
                            </Badge>
                            <h3 className="font-semibold text-sm">{norma.nombre}</h3>
                            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{norma.referencia}</p>
                            <div className="flex gap-1.5">
                                {norma.ambito.map((a: string) => (
                                    <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Límites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up-delay-2">
                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs">💧</span>
                            Presiones (m.c.a.)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: "Dinámica mínima urbana", value: "10.0", norma: "OS.050" },
                            { label: "Dinámica mínima rural", value: "5.0", norma: "RM 192" },
                            { label: "Dinámica mínima piletas", value: "3.5", norma: "RM 192" },
                            { label: "Estática máxima", value: "50.0", norma: "Ambos" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                                <span className="text-xs text-muted-foreground/70">{item.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-semibold text-sm" style={{ color: 'oklch(0.70 0.18 230)' }}>{item.value}</span>
                                    <Badge variant="outline" className="text-[9px] border-border/20">{item.norma}</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-card/60 border-border/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center text-xs">⚡</span>
                            Velocidades y Diámetros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: "Velocidad mínima", value: "0.60 m/s", color: "oklch(0.70 0.16 160)" },
                            { label: "Velocidad máxima", value: "3.00 m/s", color: "oklch(0.70 0.16 160)" },
                            { label: "Ø mínimo urbano", value: "75 mm (3\")", color: "oklch(0.65 0.20 300)" },
                            { label: "Ø mínimo rural", value: "25 mm (1\")", color: "oklch(0.65 0.20 300)" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                                <span className="text-xs text-muted-foreground/70">{item.label}</span>
                                <span className="font-mono font-semibold text-sm" style={{ color: item.color }}>{item.value}</span>
                            </div>
                        ))}

                        <div className="pt-2">
                            <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider mb-2">
                                Dotaciones RM 107-2025 (L/hab/día)
                            </p>
                            {[
                                { label: "Clima cálido", value: "169" },
                                { label: "Clima templado", value: "155" },
                                { label: "Clima frío", value: "129" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-xs text-muted-foreground/60">{item.label}</span>
                                    <span className="font-mono font-semibold text-sm" style={{ color: 'oklch(0.78 0.15 80)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* BBDD normativas */}
            {normativas && normativas.length > 0 && (
                <Card className="bg-card/60 border-border/30 animate-fade-in-up-delay-3">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs">📚</span>
                            Base de Conocimiento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {normativas.map((n) => (
                            <div key={n.id} className="p-3.5 rounded-xl border border-border/20 hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{n.tipo_norma}</Badge>
                                    <span className="font-medium text-xs">{n.titulo}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground/50 line-clamp-2 leading-relaxed">{n.contenido}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
