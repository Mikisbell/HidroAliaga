"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Linkedin, Mail, MapPin, Award, Building2, Users } from "lucide-react"

export function AboutCreator() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Imagen/Avatar del creador */}
                    <ScrollReveal>
                        <div className="relative">
                            {/* Fondo decorativo */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-purple-500/20 rounded-3xl blur-2xl" />
                            
                            {/* Contenedor principal */}
                            <div className="relative glass-card rounded-2xl p-8 md:p-12">
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar grande */}
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 flex items-center justify-center text-white text-5xl md:text-6xl font-bold mb-6 relative">
                                        <span>JA</span>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                                        {/* Anillo exterior */}
                                        <div className="absolute -inset-2 rounded-full border-2 border-blue-400/30 animate-pulse" />
                                    </div>
                                    
                                    <h3 className="text-2xl md:text-3xl font-bold mb-2">Jhonata Aliaga</h3>
                                    <p className="text-primary font-medium mb-4">Ingeniero Civil & Desarrollador de Software</p>
                                    
                                    <div className="flex gap-3 mb-6">
                                        <a 
                                            href="#" 
                                            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                                            aria-label="LinkedIn"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                        <a 
                                            href="mailto:jhonata@hidroaliaga.com" 
                                            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                                            aria-label="Email"
                                        >
                                            <Mail className="w-5 h-5" />
                                        </a>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>Lima, Perú</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                    
                    {/* Información del creador */}
                    <ScrollReveal delay={0.2}>
                        <div className="space-y-6">
                            <div>
                                <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                                    Sobre el Creador
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Transformando la <span className="text-gradient">ingeniería hidráulica</span> en Perú
                                </h2>
                            </div>
                            
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>
                                    Soy <strong className="text-foreground">Jhonata Aliaga</strong>, ingeniero civil con especialización en 
                                    sistemas de agua potable y saneamiento. A lo largo de mi carrera, he identificado las 
                                    necesidades reales de los profesionales peruanos en el diseño de redes hidráulicas.
                                </p>
                                <p>
                                    <strong className="text-foreground">Hidroaliaga</strong> nace de la experiencia directa en proyectos 
                                    de infraestructura hidráulica, combinando el conocimiento técnico normativo con tecnología 
                                    moderna para crear herramientas que realmente funcionan.
                                </p>
                                <p>
                                    Mi misión es democratizar el acceso a software profesional de ingeniería hidráulica, 
                                    manteniendo siempre el cumplimiento estricto del RNE OS.050 y las normativas vigentes 
                                    en el Perú.
                                </p>
                            </div>
                            
                            {/* Estadísticas */}
                            <div className="grid grid-cols-3 gap-4 pt-6">
                                <div className="text-center p-4 rounded-xl glass-card">
                                    <Award className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                    <p className="text-2xl font-bold">8+</p>
                                    <p className="text-xs text-muted-foreground">Años de Experiencia</p>
                                </div>
                                <div className="text-center p-4 rounded-xl glass-card">
                                    <Building2 className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                                    <p className="text-2xl font-bold">50+</p>
                                    <p className="text-xs text-muted-foreground">Proyectos Realizados</p>
                                </div>
                                <div className="text-center p-4 rounded-xl glass-card">
                                    <Users className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                    <p className="text-2xl font-bold">200+</p>
                                    <p className="text-xs text-muted-foreground">Ingenieros Usando</p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
