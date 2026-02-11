"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ProfessionalContact() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
            <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Info Side */}
                    <ScrollReveal>
                        <div>
                            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                                Contacto
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                ¿Listo para tu <span className="text-gradient">próximo proyecto</span>?
                            </h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Estoy aquí para ayudarte con tus proyectos de ingeniería hidráulica. 
                                Ya sea que necesites el software, una consultoría o capacitación para tu equipo.
                            </p>
                            
                            {/* Contact Info */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 p-4 rounded-xl glass-card">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">jhonata@hidroaliaga.com</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 rounded-xl glass-card">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Teléfono</p>
                                        <p className="font-medium">+51 999 888 777</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 rounded-xl glass-card">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ubicación</p>
                                        <p className="font-medium">Lima, Perú (Atención nacional)</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 rounded-xl glass-card">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Horario de Atención</p>
                                        <p className="font-medium">Lun - Vie: 8:00 - 18:00</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/login">
                                    <Button className="btn-primary text-white rounded-xl h-12 px-8">
                                        Crear Cuenta Gratis
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Button variant="outline" className="rounded-xl h-12 px-8">
                                    Agendar Reunión
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>
                    
                    {/* Form Side */}
                    <ScrollReveal delay={0.2}>
                        <div className="glass-card rounded-2xl p-8">
                            <h3 className="text-xl font-semibold mb-6">Envíame un mensaje</h3>
                            
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre</label>
                                        <Input 
                                            placeholder="Tu nombre" 
                                            className="h-12 bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Empresa</label>
                                        <Input 
                                            placeholder="Tu empresa" 
                                            className="h-12 bg-background/50"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input 
                                        type="email" 
                                        placeholder="tu@email.com" 
                                        className="h-12 bg-background/50"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Teléfono</label>
                                    <Input 
                                        placeholder="+51 999 888 777" 
                                        className="h-12 bg-background/50"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Consulta</label>
                                    <select className="w-full h-12 px-4 rounded-md border border-input bg-background/50 text-sm">
                                        <option value="">Selecciona una opción</option>
                                        <option value="software">Adquirir Software</option>
                                        <option value="consultoria">Consultoría Técnica</option>
                                        <option value="capacitacion">Capacitación</option>
                                        <option value="proyecto">Desarrollo de Proyecto</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mensaje</label>
                                    <Textarea 
                                        placeholder="Cuéntame sobre tu proyecto..." 
                                        className="min-h-[120px] bg-background/50"
                                    />
                                </div>
                                
                                <Button className="w-full btn-primary text-white rounded-xl h-12">
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Mensaje
                                </Button>
                            </form>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    )
}
