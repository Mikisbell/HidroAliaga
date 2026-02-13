import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { HeroNetwork } from "@/components/hero-network"
import { FeatureCard } from "@/components/feature-card"
import { ProblemSection } from "@/components/problem-section"
import { ProfessionalProfile } from "@/components/professional-profile"
import { ProfessionalServices } from "@/components/professional-services"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Testimonials } from "@/components/testimonials"
import { ProjectsShowcase } from "@/components/projects-showcase"
import { CTASection } from "@/components/cta-section"
import { ElegantContact } from "@/components/elegant-contact"
import { ModernFooter } from "@/components/modern-footer"
import { ModernNavbar } from "@/components/modern-navbar"
import { ProfessionalHero } from "@/components/professional-hero"
import { TechnicalShowcase } from "@/components/technical-showcase"
import { SocialProof } from "@/components/social-proof"
import { ProcessTimeline } from "@/components/process-timeline"
import { FinalCTA } from "@/components/final-cta"
import { FlaskConical, Map, Dna, ClipboardCheck, BarChart3, FileText, Rocket } from "lucide-react"

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
        color: "slate" as const,
    },
    {
        icon: Dna,
        title: "Optimización + Copiloto IA",
        description: "Algoritmo Genético para diámetros óptimos y copiloto normativo con LLM para consultas técnicas en tiempo real.",
        badges: ["AG", "LLM/RAG", "Copiloto"],
        color: "blue" as const,
    },
    {
        icon: ClipboardCheck,
        title: "Validación Normativa",
        description: "Verificación automática contra RNE OS.050, RM 192-2018 y RM 107-2025. Alertas por presión, velocidad, diámetro y cobertura.",
        badges: ["OS.050", "RM 192", "RM 107"],
        color: "slate" as const,
    },
    {
        icon: BarChart3,
        title: "Transparencia Académica",
        description: "Tabla de iteraciones Hardy Cross con evolución de ΔQ, error acumulado y convergencia. Ideal para validación y enseñanza.",
        badges: ["Iteraciones", "ΔQ", "Convergencia"],
        color: "blue" as const,
    },
    {
        icon: FileText,
        title: "Reportes y Exportación",
        description: "Expediente técnico digital en PDF, exportación Excel compatible con plantillas, formato INP para EPANET, GeoJSON/DXF.",
        badges: ["PDF", "Excel", "EPANET"],
        color: "slate" as const,
    },
]

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen water-bg relative overflow-hidden">
            {/* Skip to main content - Accesibilidad */}
            <a href="#main-content" className="skip-to-main">
                Saltar al contenido principal
            </a>

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

            {/* Modern Navigation Bar */}
            <ModernNavbar />

            {/* Main Content */}
            <main id="main-content">
                {/* Professional Hero Section with Animations */}
                <ProfessionalHero />

                {/* Technical Showcase with Pressure Gauges */}
                <TechnicalShowcase />

                {/* Process Timeline */}
                <ProcessTimeline />

                {/* Social Proof & Testimonials */}
                <SocialProof />

                {/* Sección de Problema - NUEVO */}
                <ProblemSection />

                {/* Perfil Profesional Tipo LinkedIn */}
                <ProfessionalProfile />

            {/* Servicios Profesionales */}
            <div id="servicios">
                <ProfessionalServices />
            </div>

            {/* Normative Quick Strip */}
            <section className="relative z-10 px-6 md:px-12 pb-16 md:pb-20">
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-blue-500/30 hover:shadow-lg transition-all duration-300">
                            <p className="text-2xl font-bold text-blue-400">10</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">m.c.a. Presión Mín</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-blue-500/30 transition-colors">OS.050</Badge>
                        </div>
                        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-slate-500/30 hover:shadow-lg transition-all duration-300">
                            <p className="text-2xl font-bold text-slate-400">50</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">m.c.a. Presión Máx</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-slate-500/30 transition-colors">Ambos</Badge>
                        </div>
                        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-green-500/30 hover:shadow-lg transition-all duration-300">
                            <p className="text-2xl font-bold text-green-400">0.6–3.0</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">m/s Velocidad</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-green-500/30 transition-colors">RNE</Badge>
                        </div>
                        <div className="p-4 md:p-5 rounded-xl glass-card border border-border/20 text-center group hover:border-blue-500/30 hover:shadow-lg transition-all duration-300">
                            <p className="text-2xl font-bold text-blue-400">10⁻⁷</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">Tolerancia convergencia</p>
                            <Badge variant="outline" className="text-[9px] mt-1.5 border-border/20 group-hover:border-blue-500/30 transition-colors">Hardy Cross</Badge>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Capacidades */}
            <section id="capacidades" className="relative z-10 px-6 md:px-12 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-12 md:mb-16">
                            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                                Capacidades
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                                Ingeniería hidráulica <span className="text-gradient">de nivel profesional</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
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
                        <div className="rounded-2xl glass-card border border-border/20 p-6 md:p-8 space-y-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                            <div className="text-center">
                                <Badge variant="outline" className="text-xs border-primary/30 text-primary mb-3">RM 107-2025-VIVIENDA</Badge>
                                <h3 className="text-xl font-bold">Dotaciones por Clima</h3>
                                <p className="text-sm text-muted-foreground/50 mt-1">Litros por habitante por día — Nueva normativa vigente</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-xl bg-slate-500/5 border border-slate-500/10 hover:bg-slate-500/10 transition-colors">
                                    <p className="text-3xl font-bold text-slate-400">169</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                    <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">☀️ Clima Cálido</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                    <p className="text-3xl font-bold text-blue-400">155</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">L/hab/día</p>
                                    <p className="text-[10px] text-muted-foreground/30 mt-0.5 font-medium">🌤️ Clima Templado</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-slate-500/5 border border-slate-500/10 hover:bg-slate-500/10 transition-colors">
                                    <p className="text-3xl font-bold text-slate-400">129</p>
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

            {/* CTA Intermedio - NUEVO */}
            <CTASection />

            {/* Proyectos */}
            <div id="proyectos">
                <ProjectsShowcase />
            </div>

            {/* Final CTA - Impactante */}
            <FinalCTA />

            {/* Contacto Elegante */}
            <div id="contacto">
                <ElegantContact />
            </div>
            </main>

            {/* Footer Moderno */}
            <ModernFooter />
        </div>
    )
}
