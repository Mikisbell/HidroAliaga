"use client"

import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    Mail, 
    Phone, 
    MapPin, 
    Send, 
    Clock, 
    ArrowRight,
    Briefcase,
    Award,
    Users,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"

const benefits = [
    "Respuesta en menos de 24 horas",
    "Consulta inicial gratuita",
    "Presupuesto sin compromiso",
    "Soporte técnico continuo",
]

const stats = [
    { icon: Briefcase, value: "12+", label: "Años de Experiencia", color: "text-orange-400" },
    { icon: Award, value: "80+", label: "Proyectos Exitosos", color: "text-pink-400" },
    { icon: Users, value: "300+", label: "Clientes Satisfechos", color: "text-violet-400" },
    { icon: CheckCircle2, value: "100%", label: "Cumplimiento RNE", color: "text-green-400" },
]

export function ElegantContact() {
    return (
        <section className="relative z-10 px-6 md:px-12 py-24">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-l from-violet-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="max-w-6xl mx-auto relative">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-400 bg-orange-500/10">
                            Contacto Profesional
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Trabajemos <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">juntos</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Con más de 12 años de experiencia en ingeniería hidráulica, estoy listo 
                            para ayudarte a hacer realidad tu próximo proyecto.
                        </p>
                    </div>
                </ScrollReveal>
                
                {/* Stats Row */}
                <ScrollReveal delay={0.1}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-6 rounded-2xl glass-card hover:bg-white/5 transition-colors">
                                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                                <p className="text-3xl font-bold text-slate-200 mb-1">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
                
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Side - Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <ScrollReveal delay={0.2}>
                            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-orange-500">
                                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-white" />
                                    </span>
                                    Información de Contacto
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Email</p>
                                            <p className="font-medium text-slate-200">jhonata@hidroaliaga.com</p>
                                            <p className="text-xs text-slate-500 mt-1">Respuesta en 24h</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Teléfono / WhatsApp</p>
                                            <p className="font-medium text-slate-200">+51 999 888 777</p>
                                            <p className="text-xs text-slate-500 mt-1">Lun - Vie: 8:00 - 18:00</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Ubicación</p>
                                            <p className="font-medium text-slate-200">Lima, Perú</p>
                                            <p className="text-xs text-slate-500 mt-1">Atención nacional</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                        
                        <ScrollReveal delay={0.3}>
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-green-400" />
                                    ¿Por qué contactarme?
                                </h3>
                                <ul className="space-y-3">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                            </div>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>
                    
                    {/* Right Side - Form */}
                    <div className="lg:col-span-3">
                        <ScrollReveal delay={0.3}>
                            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                                {/* Decorative gradient */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                
                                <div className="relative">
                                    <h3 className="text-2xl font-semibold mb-2">Envíame un mensaje</h3>
                                    <p className="text-slate-500 mb-8">Cuéntame sobre tu proyecto y te responderé a la brevedad.</p>
                                    
                                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Nombre completo *</label>
                                                <Input 
                                                    placeholder="Juan Pérez" 
                                                    className="h-12 bg-slate-900/50 border-slate-700 focus:border-orange-500/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Empresa</label>
                                                <Input 
                                                    placeholder="Tu empresa (opcional)" 
                                                    className="h-12 bg-slate-900/50 border-slate-700 focus:border-orange-500/50"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Email *</label>
                                                <Input 
                                                    type="email"
                                                    placeholder="juan@email.com" 
                                                    className="h-12 bg-slate-900/50 border-slate-700 focus:border-orange-500/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">Teléfono</label>
                                                <Input 
                                                    placeholder="+51 999 888 777" 
                                                    className="h-12 bg-slate-900/50 border-slate-700 focus:border-orange-500/50"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Tipo de servicio *</label>
                                            <select className="w-full h-12 px-4 rounded-md border border-slate-700 bg-slate-900/50 text-sm text-slate-300 focus:border-orange-500/50 focus:outline-none">
                                                <option value="">Selecciona un servicio</option>
                                                <option value="software">Software Hidroaliaga</option>
                                                <option value="diseno">Diseño de Redes Hidráulicas</option>
                                                <option value="validacion">Validación Normativa</option>
                                                <option value="capacitacion">Capacitación</option>
                                                <option value="consultoria">Consultoría Técnica</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Mensaje *</label>
                                            <Textarea 
                                                placeholder="Cuéntame sobre tu proyecto: ubicación, número de habitantes, tipo de red, etc." 
                                                className="min-h-[140px] bg-slate-900/50 border-slate-700 focus:border-orange-500/50 resize-none"
                                            />
                                        </div>
                                        
                                        <Button className="w-full h-12 bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 hover:from-orange-400 hover:via-pink-400 hover:to-violet-400 text-white border-0 text-base font-medium">
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Mensaje
                                        </Button>
                                        
                                        <p className="text-xs text-slate-600 text-center">
                                            Al enviar, aceptas nuestra política de privacidad. Tus datos están protegidos.
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </section>
    )
}
