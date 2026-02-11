"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const reasons = [
    {
        title: "Experiencia Local",
        description: "Conocimiento profundo de la normativa peruana y las realidades del sector hidráulico en el país.",
    },
    {
        title: "Tecnología Moderna",
        description: "Herramientas desarrolladas con las últimas tecnologías, accesibles desde cualquier dispositivo.",
    },
    {
        title: "Soporte Personalizado",
        description: "Atención directa del creador. No hay call centers, hablas con quien conoce el sistema a fondo.",
    },
    {
        title: "Actualizaciones Constantes",
        description: "El software evoluciona según las necesidades reales de los usuarios y cambios normativos.",
    },
    {
        title: "Precio Accesible",
        description: "Democratizando el acceso a herramientas profesionales con precios competitivos para el mercado peruano.",
    },
    {
        title: "Transparencia Total",
        description: "Metodologías validadas y documentadas. Sabes exactamente cómo funciona cada cálculo.",
    },
]

export function WhyChooseUs() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <ScrollReveal>
                        <div>
                            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                                ¿Por qué elegirnos?
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                La diferencia entre <span className="text-gradient">herramientas genéricas</span> y soluciones hechas para ti
                            </h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Hidroaliaga no es solo otro software de ingeniería. Es el resultado de años de 
                                experiencia en el campo, entendiendo las necesidades reales de ingenieros peruanos.
                            </p>
                            
                            {/* Imagen decorativa */}
                            <div className="relative">
                                <div className="glass-card rounded-2xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                                            98%
                                        </div>
                                        <div>
                                            <p className="font-semibold">Satisfacción de Clientes</p>
                                            <p className="text-sm text-muted-foreground">Basado en encuestas 2025</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full w-[98%] bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                    
                    <ScrollReveal delay={0.2}>
                        <div className="space-y-4">
                            {reasons.map((reason, index) => (
                                <div 
                                    key={index}
                                    className="flex gap-4 p-4 rounded-xl glass-card hover:bg-blue-500/5 transition-colors group"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <Check className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                                            {reason.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {reason.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
