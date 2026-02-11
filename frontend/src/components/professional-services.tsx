"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { 
    Calculator, 
    FileCheck, 
    GraduationCap, 
    HeadphonesIcon,
    Building,
    Wrench
} from "lucide-react"

const services = [
    {
        icon: Calculator,
        title: "Cálculo de Redes Hidráulicas",
        description: "Diseño y análisis de redes de agua potable utilizando métodos Hardy Cross y software especializado, cumpliendo con todas las normativas peruanas.",
        features: ["Redes cerradas y abiertas", "Análisis de presiones", "Optimización de diámetros"],
    },
    {
        icon: FileCheck,
        title: "Validación Normativa",
        description: "Revisión exhaustiva de proyectos para asegurar el cumplimiento del RNE OS.050, RM 192-2018, RM 107-2025 y demás normativas vigentes.",
        features: ["Revisión de expedientes", "Corrección de observaciones", "Cumplimiento RNE"],
    },
    {
        icon: GraduationCap,
        title: "Capacitación y Formación",
        description: "Cursos y talleres especializados en diseño hidráulico, uso de software y aplicación de normativas para equipos de ingeniería.",
        features: ["Talleres presenciales", "Capacitación online", "Material didáctico"],
    },
    {
        icon: HeadphonesIcon,
        title: "Consultoría Técnica",
        description: "Asesoría personalizada para resolver problemas complejos en sistemas de agua potable, desde el diseño hasta la implementación.",
        features: ["Soporte técnico", "Resolución de dudas", "Revisión de proyectos"],
    },
    {
        icon: Building,
        title: "Desarrollo de Software",
        description: "Creación de herramientas digitales personalizadas para empresas de ingeniería, adaptadas a sus flujos de trabajo específicos.",
        features: ["Aplicaciones web", "Automatización", "Integraciones"],
    },
    {
        icon: Wrench,
        title: "Implementación Tecnológica",
        description: "Ayuda a empresas e ingenieros a digitalizar sus procesos de diseño hidráulico con capacitación y soporte continuo.",
        features: ["Migración de datos", "Capacitación equipos", "Soporte continuo"],
    },
]

export function ProfessionalServices() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
            <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                            Servicios Profesionales
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Soluciones para tu <span className="text-gradient">proyecto hidráulico</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Más allá del software, ofrezco servicios especializados para garantizar el éxito 
                            de tus proyectos de infraestructura hídrica
                        </p>
                    </div>
                </ScrollReveal>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <ScrollReveal key={index} delay={index * 0.1}>
                            <div className="group h-full p-6 rounded-2xl glass-card hover:bg-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-500/20">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <service.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                                    {service.title}
                                </h3>
                                
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                    {service.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    {service.features.map((feature, i) => (
                                        <span 
                                            key={i}
                                            className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
