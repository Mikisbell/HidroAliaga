import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // All queries filtered by the authenticated user
  const { count: totalProyectos } = await supabase
    .from("proyectos")
    .select("*", { count: "exact", head: true })
    .eq("usuario_id", userId || "")

  const { data: ultimosProyectos } = await supabase
    .from("proyectos")
    .select("id, nombre, ambito, tipo_red, estado, updated_at")
    .eq("usuario_id", userId || "")
    .order("updated_at", { ascending: false })
    .limit(5)

  // Get user's project IDs to filter calculos
  const { data: userProjects } = await supabase
    .from("proyectos")
    .select("id")
    .eq("usuario_id", userId || "")

  const projectIds = userProjects?.map(p => p.id) || []

  let totalCalculos = 0
  if (projectIds.length > 0) {
    const { count } = await supabase
      .from("calculos")
      .select("*", { count: "exact", head: true })
      .in("proyecto_id", projectIds)
    totalCalculos = count || 0
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Panel de Control
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            H-Redes <span className="text-gradient">Perú</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Diseño, análisis y optimización de redes de agua potable
          </p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button className="btn-primary text-white rounded-xl px-6 h-11 font-semibold">
            + Nuevo Proyecto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in-up-delay-1">
        <Card className="stat-card stat-card-blue bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proyectos</p>
            <p className="text-3xl font-bold mt-2 text-[oklch(0.70_0.18_230)] dark:text-[oklch(0.70_0.18_230)] text-blue-600 dark:text-blue-400">
              {totalProyectos || 0}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">redes diseñadas</p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-green bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cálculos</p>
            <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
              {totalCalculos || 0}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">simulaciones hidráulicas</p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-amber bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Norma</p>
            <p className="text-lg font-bold mt-2 text-amber-600 dark:text-amber-400">
              OS.050
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">RNE · RM 107-2025</p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-purple bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Motor</p>
            <p className="text-lg font-bold mt-2 text-purple-600 dark:text-purple-400">
              Hardy Cross
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Hazen-Williams</p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-cyan bg-card/80">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IA</p>
            <p className="text-lg font-bold mt-2 text-cyan-600 dark:text-cyan-400">
              AG + LLM
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Optimizador + Copiloto</p>
          </CardContent>
        </Card>
      </div>

      {/* Capacidades del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up-delay-2">
        <Card className="bg-card/60 border-border/30">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">
              🔬
            </div>
            <div>
              <h3 className="font-semibold text-sm">Motor Hidráulico Híbrido</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Redes cerradas (Hardy Cross), abiertas (balance de masa) y mixtas con tolerancia 10⁻⁷.
                Transparencia académica con tabla de iteraciones.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Mallas</Badge>
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Ramales</Badge>
              <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Mixtas</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/30">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
              🗺️
            </div>
            <div>
              <h3 className="font-semibold text-sm">GIS + Cotas Automáticas</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Trazado con Leaflet, obtención de cotas por DEM, y mapa de calor de presiones
                y velocidades en la red.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Leaflet</Badge>
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">DEM</Badge>
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">PostGIS</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/30">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">
              🧬
            </div>
            <div>
              <h3 className="font-semibold text-sm">Optimización + Copiloto IA</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Algoritmo Genético para diámetros óptimos y copiloto normativo basado en LLM
                para consultas técnicas en tiempo real.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">AG</Badge>
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">LLM</Badge>
              <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">RAG</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos Proyectos */}
      <Card className="bg-card/60 border-border/30 animate-fade-in-up-delay-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Proyectos Recientes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Últimas redes diseñadas</p>
            </div>
            <Link href="/proyectos">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                Ver todos →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ultimosProyectos && ultimosProyectos.length > 0 ? (
            <div className="space-y-2">
              {ultimosProyectos.map((proyecto) => (
                <Link
                  key={proyecto.id}
                  href={`/proyectos/${proyecto.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/20 hover:border-primary/30 hover:bg-accent/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "status-dot",
                      proyecto.estado === 'borrador' ? "status-dot-draft" : "status-dot-active"
                    )} />
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{proyecto.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-border/30">
                          {proyecto.ambito}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground/50">
                          Red {proyecto.tipo_red}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/40 font-mono">
                    {new Date(proyecto.updated_at).toLocaleDateString("es-PE")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-3xl mx-auto mb-4">
                💧
              </div>
              <p className="font-medium">Sin proyectos aún</p>
              <p className="text-sm mt-1 text-muted-foreground/60">Comienza diseñando tu primera red de agua potable</p>
              <Link href="/proyectos/nuevo">
                <Button className="btn-primary text-white rounded-xl mt-6 px-6">
                  Crear Primer Proyecto
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Normativa Quick Reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up-delay-3">
        <div className="p-4 rounded-xl bg-card/40 border border-border/20">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">P. Dinámica Mín</p>
          <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">10 <span className="text-xs font-normal text-muted-foreground">m.c.a.</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Urbano · OS.050</p>
        </div>
        <div className="p-4 rounded-xl bg-card/40 border border-border/20">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">P. Estática Máx</p>
          <p className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">50 <span className="text-xs font-normal text-muted-foreground">m.c.a.</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Ambos ámbitos</p>
        </div>
        <div className="p-4 rounded-xl bg-card/40 border border-border/20">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Vel. Rango</p>
          <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">0.6–3.0 <span className="text-xs font-normal text-muted-foreground">m/s</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Ambos ámbitos</p>
        </div>
        <div className="p-4 rounded-xl bg-card/40 border border-border/20">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Ø Mín Urbano</p>
          <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">75 <span className="text-xs font-normal text-muted-foreground">mm</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">3" · OS.050</p>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
