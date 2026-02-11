import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen water-bg relative overflow-hidden">
            {/* Floating water bubbles */}
            {[
                { w: 50, h: 50, l: 8, b: 30, d: 14, dl: 0 },
                { w: 70, h: 40, l: 20, b: 60, d: 10, dl: 2 },
                { w: 30, h: 80, l: 35, b: 15, d: 16, dl: 4 },
                { w: 60, h: 45, l: 50, b: 75, d: 11, dl: 1 },
                { w: 80, h: 30, l: 65, b: 40, d: 9, dl: 3 },
                { w: 40, h: 65, l: 78, b: 55, d: 13, dl: 0.5 },
                { w: 55, h: 55, l: 92, b: 85, d: 12, dl: 2.5 },
                { w: 25, h: 70, l: 5, b: 90, d: 15, dl: 1.5 },
            ].map((b, i) => (
                <div
                    key={i}
                    className="water-bubble"
                    style={{
                        width: `${b.w}px`,
                        height: `${b.h}px`,
                        left: `${b.l}%`,
                        bottom: `-${b.b}px`,
                        animationDuration: `${b.d}s`,
                        animationDelay: `${b.dl}s`,
                    }}
                />
            ))}

            {/* Navigation Bar */}
            <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 relative overflow-hidden">
                        <span className="relative z-10">H</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-gradient">HidroAliaga</span>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/dashboard">
                            <Button className="btn-primary text-white rounded-xl text-sm px-6 h-10 font-semibold shadow-md shadow-blue-500/20">
                                Ir al Dashboard →
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button className="btn-primary text-white rounded-xl text-sm px-5 h-9 font-semibold">
                                    Registrarse
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-6 md:px-12 pt-16 pb-24 max-w-6xl mx-auto">
                <div className="text-center space-y-6 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Plataforma de Ingeniería Hidráulica — Perú
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                        Diseña redes de<br />
                        <span className="text-gradient">agua potable</span><br />
                        con precisión normativa
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
                        Motor hidráulico Hardy Cross + Hazen-Williams, visualización GIS con cotas automáticas,
                        y optimización por Algoritmo Genético. Todo conforme al <strong className="text-foreground/80">RNE OS.050</strong> y <strong className="text-foreground/80">RM 192-2018</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                        {user ? (
                            <Link href="/dashboard">
                                <Button className="btn-primary text-white rounded-xl h-12 px-8 text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                                    Continuar en Dashboard 🚀
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button className="btn-primary text-white rounded-xl h-12 px-8 text-base font-semibold">
                                    Comenzar Gratis →
                                </Button>
                            </Link>
                        )}
                        <Link href="#capacidades">
                            <Button variant="outline" className="rounded-xl h-12 px-8 text-base border-border/30 text-muted-foreground hover:text-foreground">
                                Ver Capacidades
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground/40">
                        <span>✓ Sin instalación</span>
                        <span>✓ Exporta PDF/Excel</span>
                        <span>✓ Compatible EPANET</span>
                    </div>
                </div>
            </section>

            {/* Normative Quick Strip */}
            <section className="relative z-10 px-6 md:px-12 pb-16">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up-delay-1">
                    <div className="p-4 rounded-xl glass-card text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.70 0.18 230)' }}>10</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">m.c.a. Presión Mín</p>
                        <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20">OS.050</Badge>
                    </div>
                    <div className="p-4 rounded-xl glass-card text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.78 0.15 80)' }}>50</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">m.c.a. Presión Máx</p>
                        <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20">Ambos</Badge>
                    </div>
                    <div className="p-4 rounded-xl glass-card text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.70 0.16 160)' }}>0.6–3.0</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">m/s Velocidad</p>
                        <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20">RNE</Badge>
                    </div>
                    <div className="p-4 rounded-xl glass-card text-center">
                        <p className="text-2xl font-bold" style={{ color: 'oklch(0.65 0.20 300)' }}>10⁻⁷</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Tolerancia convergencia</p>
                        <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20">Hardy Cross</Badge>
                    </div>
                </div>
            </section>

            {/* Capacidades */}
            <section id="capacidades" className="relative z-10 px-6 md:px-12 pb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 animate-fade-in-up-delay-2">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Capacidades</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Ingeniería hidráulica <span className="text-gradient">de nivel profesional</span>
                        </h2>
                        <p className="text-muted-foreground/60 mt-3 max-w-lg mx-auto">
                            Cada herramienta diseñada para cumplir las exigencias del Reglamento Nacional de Edificaciones
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up-delay-3">
                        {/* Card 1 */}
                        <div className="p-6 rounded-2xl glass-card space-y-4 group hover:border-blue-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🔬
                            </div>
                            <h3 className="font-semibold text-lg">Motor Hidráulico Híbrido</h3>
                            <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                Redes cerradas con <strong className="text-foreground/80">Hardy Cross</strong>, abiertas por balance de masa, y mixtas con algoritmo híbrido.
                                Ecuación de Hazen-Williams con exponente N=1.852.
                            </p>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                                <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400">Mallas</Badge>
                                <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400">Ramales</Badge>
                                <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400">Mixtas</Badge>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 rounded-2xl glass-card space-y-4 group hover:border-green-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🗺️
                            </div>
                            <h3 className="font-semibold text-lg">GIS + Cotas Automáticas</h3>
                            <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                Trazado interactivo con <strong className="text-foreground/80">Leaflet</strong>, obtención de cotas por DEM, y mapa de calor de presiones y velocidades en la red.
                            </p>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                                <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400">Leaflet</Badge>
                                <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400">DEM</Badge>
                                <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400">PostGIS</Badge>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 rounded-2xl glass-card space-y-4 group hover:border-purple-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🧬
                            </div>
                            <h3 className="font-semibold text-lg">Optimización + Copiloto IA</h3>
                            <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                <strong className="text-foreground/80">Algoritmo Genético</strong> para diámetros óptimos y copiloto normativo con LLM para consultas técnicas en tiempo real.
                            </p>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                                <Badge variant="outline" className="text-[10px] border-purple-500/20 text-purple-400">AG</Badge>
                                <Badge variant="outline" className="text-[10px] border-purple-500/20 text-purple-400">LLM/RAG</Badge>
                                <Badge variant="outline" className="text-[10px] border-purple-500/20 text-purple-400">Copiloto</Badge>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="p-6 rounded-2xl glass-card space-y-4 group hover:border-amber-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                📋
                            </div>
                            <h3 className="font-semibold text-lg">Validación Normativa</h3>
                            <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                Verificación automática contra <strong className="text-foreground/80">RNE OS.050</strong>, RM 192-2018 y RM 107-2025.
                                Alertas por presión, velocidad, diámetro y cobertura.
                            </p>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                                <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400">OS.050</Badge>
                                <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400">RM 192</Badge>
                                <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400">RM 107</Badge>
                            </div>
                        </div>

                        {/* Card 5 */}
                        <div className="p-6 rounded-2xl glass-card space-y-4 group hover:border-cyan-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                📊
                            </div>
                            <h3 className="font-semibold text-lg">Transparencia Académica</h3>
                            <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                Tabla de iteraciones Hardy Cross con evolución de <strong className="text-foreground/80">ΔQ</strong>, error acumulado y convergencia.
                                Ideal para validación y enseñanza.
                            </p>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                                <Badge variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-400">Iteraciones</Badge>
                                <Badge variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-400">ΔQ</Badge>
                                <Badge variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-400">Convergencia</Badge>
                            </div>
                        </div>

                        {/* Card 6 */}
                        <div className="p-6 rounded-2xl glass-card space-y-4 group hover:border-red-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                📄
                            </div>
                            <h3 className="font-semibold text-lg">Reportes y Exportación</h3>
                            <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                Expediente técnico digital en <strong className="text-foreground/80">PDF</strong>, exportación Excel compatible con plantillas, formato INP para EPANET, GeoJSON/DXF.
                            </p>
                            <div className="flex gap-1.5 flex-wrap pt-1">
                                <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-400">PDF</Badge>
                                <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-400">Excel</Badge>
                                <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-400">EPANET</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dotaciones RM 107-2025 */}
            <section className="relative z-10 px-6 md:px-12 pb-20">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-2xl glass-card p-8 space-y-6">
                        <div className="text-center">
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-3">RM 107-2025-VIVIENDA</Badge>
                            <h3 className="text-xl font-bold">Dotaciones por Clima</h3>
                            <p className="text-sm text-muted-foreground/50 mt-1">Litros por habitante por día — Nueva normativa vigente</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                <p className="text-3xl font-bold" style={{ color: 'oklch(0.70 0.18 25)' }}>169</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">☀️ Clima Cálido</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <p className="text-3xl font-bold" style={{ color: 'oklch(0.78 0.15 80)' }}>155</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">🌤️ Clima Templado</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <p className="text-3xl font-bold" style={{ color: 'oklch(0.70 0.18 230)' }}>129</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">❄️ Clima Frío</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="relative z-10 px-6 md:px-12 pb-20">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Empieza a diseñar tu red <span className="text-gradient">hoy</span>
                    </h2>
                    <p className="text-muted-foreground/60 max-w-lg mx-auto">
                        Crea tu cuenta gratuita y diseña redes de agua potable con la precisión que exige la normativa peruana.
                    </p>
                    <Link href="/login">
                        <Button className="btn-primary text-white rounded-xl h-12 px-10 text-base font-semibold">
                            Crear Cuenta Gratis →
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border/20 px-6 md:px-12 py-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                            H
                        </div>
                        <span className="text-sm font-semibold text-gradient">H-Redes Perú</span>
                        <span className="text-[10px] text-muted-foreground/30">v0.1.0</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/30 text-center md:text-right">
                        <p>Reglamento Nacional de Edificaciones · OS.050 · RM 192-2018 · RM 107-2025</p>
                        <p className="mt-1">Desarrollado para ingenieros civiles y sanitarios del Perú</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
