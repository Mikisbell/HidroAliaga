"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "Ing. Carlos Mendoza Rojas",
        role: "Gerente de Proyectos",
        company: "Constructora Andina S.A.C.",
        avatar: "CM",
        content: "Hidroaliaga ha revolucionado nuestra forma de trabajar. El cumplimiento automático con el RNE nos ahorra horas de revisión manual y los reportes son impecables para presentar a las municipalidades.",
        rating: 5,
    },
    {
        name: "Ing. María Elena Torres",
        role: "Consultora Hidráulica Independiente",
        company: "Torres & Asociados",
        avatar: "MT",
        content: "Como consultora, necesito herramientas confiables. El motor Hardy Cross integrado funciona perfectamente y la validación normativa automática me da tranquilidad en cada proyecto.",
        rating: 5,
    },
    {
        name: "Ing. Luis Alberto Rojas",
        role: "Director de Obras",
        company: "Ingeniería San Marcos E.I.R.L.",
        avatar: "LR",
        content: "La capacitación que recibimos de Jhonatan fue excelente. No solo implementamos el software, sino que mejoramos todo nuestro proceso de diseño hidráulico. Totalmente recomendado.",
        rating: 5,
    },
    {
        name: "Ing. Diana Quispe Flores",
        role: "Jefa de Proyectos",
        company: "Agua Potable Rural - Cajamarca",
        avatar: "DQ",
        content: "El soporte personalizado marca la diferencia. Cualquier duda que tengo, Jhonatan responde rápidamente. Se nota que conoce a fondo tanto la ingeniería como el desarrollo.",
        rating: 5,
    },
]

export function Testimonials() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
            <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                            Testimonios
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Lo que dicen los <span className="text-gradient">profesionales</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Ingenieros y empresas de todo el Perú confían en Hidroaliaga para sus proyectos 
                            de infraestructura hídrica
                        </p>
                    </div>
                </ScrollReveal>
                
                <div className="grid md:grid-cols-2 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <ScrollReveal key={index} delay={index * 0.1}>
                            <div className="relative p-6 rounded-2xl glass-card h-full">
                                {/* Quote icon */}
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/20" />
                                
                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                
                                {/* Content */}
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                                
                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        <p className="text-xs text-blue-400">{testimonial.company}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
