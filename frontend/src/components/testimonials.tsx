import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "Ing. Carlos Mendoza Rojas",
        role: "Gerente de Proyectos",
        company: "Constructora Andina S.A.C.",
        avatar: "CM",
        content: "Antes tardábamos 4 días en diseñar una red para 5,000 habitantes. Con Hidroaliaga lo hacemos en 3 horas. El cumplimiento automático del RNE nos ahorra revisiones manuales y los reportes son impecables para las municipalidades.",
        rating: 5,
        metric: "93% más rápido",
    },
    {
        name: "Ing. María Elena Torres",
        role: "Consultora Hidráulica Independiente",
        company: "Torres & Asociados",
        avatar: "MT",
        content: "Como consultora independiente, necesito herramientas confiables que me den ventaja competitiva. El motor Hardy Cross funciona perfectamente y la validación normativa automática me permite entregar 3x más proyectos al mes con total confianza.",
        rating: 5,
        metric: "3x más proyectos/mes",
    },
    {
        name: "Ing. Luis Alberto Rojas",
        role: "Director de Obras",
        company: "Ingeniería San Marcos E.I.R.L.",
        avatar: "LR",
        content: "La capacitación de Jhonatan fue excelente. En 2 semanas implementamos el software en todo el equipo. Ahora nuestro proceso de diseño hidráulico es 5x más eficiente y hemos reducido rechazos municipales a cero.",
        rating: 5,
        metric: "0 rechazos en 6 meses",
    },
    {
        name: "Ing. Diana Quispe Flores",
        role: "Jefa de Proyectos",
        company: "Agua Potable Rural - Cajamarca",
        avatar: "DQ",
        content: "El soporte personalizado marca la diferencia. Jhonatan responde en menos de 2 horas y conoce a fondo tanto la ingeniería como el desarrollo. Recuperamos la inversión en el primer proyecto.",
        rating: 5,
        metric: "ROI en 1 proyecto",
    },
]

export function Testimonials() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
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
                            <div className="relative p-6 rounded-2xl glass-card h-full border border-border/20 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                                {/* Quote icon */}
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/20" aria-hidden="true" />
                                
                                {/* Rating */}
                                <div className="flex gap-1 mb-4" role="img" aria-label={`${testimonial.rating} de 5 estrellas`}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                                    ))}
                                </div>
                                
                                {/* Metric Badge */}
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                                        {testimonial.metric}
                                    </span>
                                </div>
                                
                                {/* Content */}
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                                
                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold" aria-hidden="true">
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
