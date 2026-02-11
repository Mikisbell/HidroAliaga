"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Droplets, CheckCircle } from "lucide-react"

const projects = [
    {
        name: "Sistema de Agua Potable - Huancayo",
        type: "Red de Distribución",
        location: "Junín, Perú",
        users: "12,500 habitantes",
        status: "Completado",
    },
    {
        name: "Ampliación Red - Cajamarca",
        type: "Ampliación",
        location: "Cajamarca, Perú",
        users: "8,200 habitantes",
        status: "Completado",
    },
    {
        name: "Proyecto San Ramón",
        type: "Nueva Infraestructura",
        location: "Junín, Perú",
        users: "5,800 habitantes",
        status: "En Ejecución",
    },
    {
        name: "Sistema Rural - Andahuaylas",
        type: "Sistema Rural",
        location: "Apurímac, Perú",
        users: "3,400 habitantes",
        status: "Completado",
    },
]

const stats = [
    { icon: Building2, value: "50+", label: "Proyectos Completados" },
    { icon: Droplets, value: "30M+", label: "Litros/Día Diseñados" },
    { icon: MapPin, value: "15", label: "Departamentos del Perú" },
    { icon: CheckCircle, value: "100%", label: "Cumplimiento RNE" },
]

export function ProjectsShowcase() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24">
            <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                            Proyectos
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Experiencia en <span className="text-gradient">todo el Perú</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Proyectos de infraestructura hidráulica diseñados y validados con Hidroaliaga 
                            en diferentes regiones del país
                        </p>
                    </div>
                </ScrollReveal>
                
                {/* Stats */}
                <ScrollReveal delay={0.1}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-6 rounded-2xl glass-card">
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
                
                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {projects.map((project, index) => (
                        <ScrollReveal key={index} delay={0.2 + index * 0.1}>
                            <div className="group p-6 rounded-2xl glass-card hover:bg-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-500/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{project.type}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full ${
                                        project.status === "Completado" 
                                            ? "bg-green-500/10 text-green-400" 
                                            : "bg-blue-500/10 text-blue-400"
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{project.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Droplets className="w-4 h-4" />
                                        <span>{project.users}</span>
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
