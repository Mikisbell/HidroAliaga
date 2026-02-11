import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { HeroNetwork } from "@/components/hero-network"
import { FeatureCard } from "@/components/feature-card"
import { ProfessionalProfile } from "@/components/professional-profile"
import { ProfessionalServices } from "@/components/professional-services"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Testimonials } from "@/components/testimonials"
import { ProjectsShowcase } from "@/components/projects-showcase"
import { ElegantContact } from "@/components/elegant-contact"
import { ModernFooter } from "@/components/modern-footer"
import { FlaskConical, Map, Dna, ClipboardCheck, BarChart3, FileText } from "lucide-react"

const features = [
    {
        icon: FlaskConical,
        title: "Motor Hidráulico Híbrido",
        description: "Redes cerradas con Hardy Cross, abiertas por balance de masa, y mixtas con algoritmo híbrido. Ecuación de Hazen-Williams con exponente N=1.852.",
        badges: ["Mallas", "Ramales", "Mixtas"],
        color: "blue" as const,
    },
    {
        icon: Map,
        title: "GIS + Cotas Automáticas",
        description: "Trazado interactivo con Leaflet, obtención de cotas por DEM, y mapa de calor de presiones y velocidades en la red.",
        badges: ["Leaflet", "DEM", "PostGIS"],
        color: "green" as const,
    },
    {
        icon: Dna,
        title: "Optimización + Copiloto IA",
        description: "Algoritmo Genético para diámetros óptimos y copiloto normativo con LLM para consultas técnicas en tiempo real.",
        badges: ["AG", "LLM/RAG", "Copiloto"],
        color: "purple" as const,
    },
    {
        icon: ClipboardCheck,
        title: "Validación Normativa",
        description: "Verificación automática contra RNE OS.050, RM 192-2018 y RM 107-2025. Alertas por presión, velocidad, diámetro y cobertura.",
        badges: ["OS.050", "RM 192", "RM 107"],
        color: "amber" as const,
    },
    {
        icon: BarChart3,
        title: "Transparencia Académica",
        description: "Tabla de iteraciones Hardy Cross con evolución de ΔQ, error acumulado y convergencia. Ideal para validación y enseñanza.",
        badges: ["Iteraciones", "ΔQ", "Convergencia"],
        color: "cyan" as const,
    },
    {
        icon: FileText,
        title: "Reportes y Exportación",
        description: "Expediente técnico digital en PDF, exportación Excel compatible con plantillas, formato INP para EPANET, GeoJSON/DXF.",
        badges: ["PDF", "Excel", "EPANET"],
        color: "red" as const,
    },
]

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
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-gradient">Hidroaliaga</span>
                        <span className="text-[10px] text-muted-foreground/50">by Jhonatan Aliaga</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <Link href="#perfil" className="hover:text-foreground transition-colors">Perfil</Link>
                    <Link href="#servicios" className="hover:text-foreground transition-colors">Servicios</Link>
                    <Link href="#capacidades" className="hover:text-foreground transition-colors">Software</Link>
                    <Link href="#proyectos" className="hover:text-foreground transition-colors">Proyectos</Link>
                    <Link href="#contacto" className="hover:text-foreground transition-colors">Contacto</Link>
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
            <section className="relative z-10 px-6 md:px-12 pt-12 pb-16 max-w-7xl mx-auto">
                <ScrollReveal>
                    <div className="text-center space-y-6">
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
                </ScrollReveal>

                {/* Hero Network Visualization */}
                <ScrollReveal delay={0.2}>
                    <HeroNetwork />
                </ScrollReveal>
            </section>

            {/* Perfil Profesional Tipo LinkedIn */}
            <ProfessionalProfile />

            {/* Servicios Profesionales */}
            <div id="servicios">
                <ProfessionalServices />
            </div>

            {/* Normative Quick Strip */}
            <section className="relative z-10 px-6 md:px-12 pb-16">
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-4 rounded-xl glass-card text-center group hover:border-blue-500/30 transition-all duration-300">
                            <p className="text-2xl font-bold text-blue-400">10</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">m.c.a. Presión Mín</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-blue-500/30 transition-colors">OS.050</Badge>
                        </div>
                        <div className="p-4 rounded-xl glass-card text-center group hover:border-amber-500/30 transition-all duration-300">
                            <p className="text-2xl font-bold text-amber-400">50</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">m.c.a. Presión Máx</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-amber-500/30 transition-colors">Ambos</Badge>
                        </div>
                        <div className="p-4 rounded-xl glass-card text-center group hover:border-green-500/30 transition-all duration-300">
                            <p className="text-2xl font-bold text-green-400">0.6–3.0</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">m/s Velocidad</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-green-500/30 transition-colors">RNE</Badge>
                        </div>
                        <div className="p-4 rounded-xl glass-card text-center group hover:border-purple-500/30 transition-all duration-300">
                            <p className="text-2xl font-bold text-purple-400">10⁻⁷</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">Tolerancia convergencia</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-purple-500/30 transition-colors">Hardy Cross</Badge>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Capacidades */}
            <section id="capacidades" className="relative z-10 px-6 md:px-12 pb-20">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Capacidades</p>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Ingeniería hidráulica <span className="text-gradient">de nivel profesional</span>
                            </h2>
                            <p className="text-muted-foreground/60 mt-3 max-w-lg mx-auto">
                                Cada herramienta diseñada para cumplir las exigencias del Reglamento Nacional de Edificaciones
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <ScrollReveal key={index} delay={index * 0.1}>
                                <FeatureCard {...feature} />
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dotaciones RM 107-2025 */}
            <section className="relative z-10 px-6 md:px-12 pb-20">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto">
                        <div className="rounded-2xl glass-card p-8 space-y-6">
                            <div className="text-center">
                                <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-3">RM 107-2025-VIVIENDA</Badge>
                                <h3 className="text-xl font-bold">Dotaciones por Clima</h3>
                                <p className="text-sm text-muted-foreground/50 mt-1">Litros por habitante por día — Nueva normativa vigente</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                    <p className="text-3xl font-bold text-red-400">169</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                    <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">☀️ Clima Cálido</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                                    <p className="text-3xl font-bold text-amber-400">155</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                    <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">🌤️ Clima Templado</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                    <p className="text-3xl font-bold text-blue-400">129</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                    <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">❄️ Clima Frío</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Por qué elegirnos */}
            <WhyChooseUs />

            {/* Testimonios */}
            <Testimonials />

            {/* Proyectos */}
            <div id="proyectos">
                <ProjectsShowcase />
            </div>

            {/* CTA Final */}
            <section className="relative z-10 px-6 md:px-12 pb-20">
                <ScrollReveal>
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
                </ScrollReveal>
            </section>

            {/* Contacto Elegante */}
            <div id="contacto">
                <ElegantContact />
            </div>

            {/* Footer Moderno */}
            <ModernFooter />
        </div>
    )
}
