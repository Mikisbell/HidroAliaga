import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/constants"
import { AnimatedWaves } from "@/components/animated-waves"
import { AnimatedGrid } from "@/components/animated-grid"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCounter } from "@/components/animated-counter"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // Default values for unauthenticated state
  let totalProyectos = 0
  let ultimosProyectos: any[] = []
  let totalCalculos = 0

  if (userId) {
    // All queries filtered by the authenticated user
    const { count: pc } = await supabase
      .from("proyectos")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", userId)
    totalProyectos = pc || 0

    const { data: up } = await supabase
      .from("proyectos")
      .select("id, nombre, ambito, tipo_red, estado, updated_at")
      .eq("usuario_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5)
    ultimosProyectos = up || []

    // Get user's project IDs to filter calculos
    const projectIds = ultimosProyectos.map((p: any) => p.id)
    if (projectIds.length > 0) {
      const { count } = await supabase
        .from("calculos")
        .select("*", { count: "exact", head: true })
        .in("proyecto_id", projectIds)
      totalCalculos = count || 0
    }
  }

  return (
    <div className="relative p-6 md:p-8 space-y-8 max-w-7xl">
      {/* Animated Background Effects */}
      <AnimatedGrid />
      <AnimatedWaves />
      
      {/* Header */}
      <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
            Panel de Control
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">{BRAND.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {BRAND.shortDescription}
          </p>
        </div>
        <Link href="/proyectos/nuevo">
          <Button className="btn-primary text-white rounded-xl h-11 md:h-12 px-6 md:px-8 font-semibold hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-200">
            + Nuevo Proyecto
          </Button>
        </Link>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={100}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="stat-card stat-card-blue bg-card/80 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Proyectos</p>
              <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                <AnimatedCounter value={totalProyectos || 0} />
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">redes diseñadas</p>
            </CardContent>
          </Card>

          <Card className="stat-card stat-card-green bg-card/80 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cálculos</p>
              <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                <AnimatedCounter value={totalCalculos || 0} />
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">simulaciones hidráulicas</p>
            </CardContent>
          </Card>

        <Card className="stat-card stat-card-amber bg-card/80 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Norma</p>
            <p className="text-3xl font-bold mt-2 text-amber-600 dark:text-amber-400">
              OS.050
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">RNE · RM 107-2025</p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-purple bg-card/80 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Motor</p>
            <p className="text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400">
              Hardy Cross
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Hazen-Williams</p>
          </CardContent>
        </Card>

          <Card className="stat-card stat-card-cyan bg-card/80 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IA</p>
              <p className="text-3xl font-bold mt-2 text-cyan-600 dark:text-cyan-400">
                AG + LLM
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">Optimizador + Copiloto</p>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      {/* Capacidades del Sistema */}
      <AnimatedSection delay={200}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border border-border/20 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
              🔬
            </div>
            <div>
              <h3 className="font-semibold text-sm">Motor Hidráulico Híbrido</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Redes cerradas (Hardy Cross), abiertas (balance de masa) y mixtas con tolerancia 10⁻⁷.
                Transparencia académica con tabla de iteraciones.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 px-2">Mallas</Badge>
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 px-2">Ramales</Badge>
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 px-2">Mixtas</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/20 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">
              🗺️
            </div>
            <div>
              <h3 className="font-semibold text-sm">GIS + Cotas Automáticas</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Trazado con Leaflet, obtención de cotas por DEM, y mapa de calor de presiones
                y velocidades en la red.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 px-2">Leaflet</Badge>
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 px-2">DEM</Badge>
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 px-2">PostGIS</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-border/20 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
              🧬
            </div>
            <div>
              <h3 className="font-semibold text-sm">Optimización + Copiloto IA</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Algoritmo Genético para diámetros óptimos y copiloto normativo basado en LLM
                para consultas técnicas en tiempo real.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 px-2">AG</Badge>
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 px-2">LLM</Badge>
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 px-2">RAG</Badge>
            </div>
          </CardContent>
        </Card>
        </div>
      </AnimatedSection>

      {/* Últimos Proyectos */}
      <AnimatedSection delay={300}>
        <Card className="glass-card border border-border/20 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Proyectos Recientes</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Últimas redes diseñadas</p>
            </div>
            <Link href="/proyectos">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary transition-all duration-200">
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
                  className="flex items-center justify-between p-4 rounded-xl border border-border/20 hover:border-primary/30 hover:bg-accent/20 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "status-dot",
                      proyecto.estado === 'borrador' ? "status-dot-draft" : "status-dot-active"
                    )} />
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{proyecto.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs h-5 px-2 border-border/30">
                          {proyecto.ambito}
                        </Badge>
                        <span className="text-xs text-muted-foreground/50">
                          Red {proyecto.tipo_red}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground/50">
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
                <Button className="btn-primary text-white rounded-xl h-11 md:h-12 px-6 md:px-8 font-semibold hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-200">
                  Crear Primer Proyecto
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      </AnimatedSection>

      {/* Normativa Quick Reference */}
      <AnimatedSection delay={300}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">P. Dinámica Mín</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">10 <span className="text-xs font-normal text-muted-foreground">m.c.a.</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Urbano · OS.050</p>
          <div className="mt-3 h-1.5 rounded-full bg-muted-foreground/10 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: '20%' }} />
          </div>
        </div>
        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-amber-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">P. Estática Máx</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">50 <span className="text-xs font-normal text-muted-foreground">m.c.a.</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Ambos ámbitos</p>
          <div className="mt-3 h-1.5 rounded-full bg-muted-foreground/10 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: '83%' }} />
          </div>
        </div>
        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-green-500/30 hover:shadow-lg transition-all duration-300">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Vel. Rango</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-green-600 dark:text-green-400">0.6–3.0 <span className="text-xs font-normal text-muted-foreground">m/s</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Ambos ámbitos</p>
          <div className="mt-3 h-1.5 rounded-full bg-muted-foreground/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-purple-500/30 hover:shadow-lg transition-all duration-300">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Ø Mín Urbano</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">75 <span className="text-xs font-normal text-muted-foreground">mm</span></p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">3" · OS.050</p>
        </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
