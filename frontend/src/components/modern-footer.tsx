"use client"

import Link from "next/link"
import { 
    Linkedin, 
    Twitter, 
    Instagram, 
    Youtube,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"

const footerLinks = {
    producto: {
        title: "Producto",
        links: [
            { label: "Características", href: "/#capacidades" },
            { label: "Software", href: "/#perfil" },
            { label: "Demo", href: "/login" },
        ]
    },
    recursos: {
        title: "Recursos",
        links: [
            { label: "Documentación", href: "/normativa" },
            { label: "Normativa", href: "/normativa" },
            { label: "Tutoriales", href: "https://youtube.com", target: "_blank" },
        ]
    },
    empresa: {
        title: "Empresa",
        links: [
            { label: "Sobre Jhonatan", href: "/#perfil" },
            { label: "Proyectos", href: "/#proyectos" },
            { label: "Contacto", href: "/#contacto" },
        ]
    },
    legal: {
        title: "Legal",
        links: [
            { label: "Privacidad", href: "/privacy" },
            { label: "Términos", href: "/terms" },
        ]
    },
}

const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:bg-blue-600" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" },
    { icon: Youtube, href: "#", label: "YouTube", color: "hover:bg-red-600" },
]

export function ModernFooter() {
    return (
        <footer className="relative z-10 mt-20">
            {/* Gradient Border Top */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500"></div>
            
            {/* CTA Section */}
            <div className="px-6 md:px-12 py-16 bg-gradient-to-b from-slate-900/50 to-slate-950">
                <div className="max-w-6xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/50 via-purple-900/50 to-pink-900/50 p-8 md:p-12 border border-white/10">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-gradient-to-tr from-violet-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    ¿Listo para tu próximo proyecto?
                                </h2>
                                <p className="text-slate-400 mb-6">
                                    Agenda una consulta gratuita y descubre cómo puedo ayudarte 
                                    con tu proyecto de ingeniería hidráulica.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white border-0">
                                        Agendar Reunión
                                        <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Button>
                                    <Button variant="outline" className="border-white/20 hover:bg-white/10">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Enviar Email
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Contact Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors">
                                    <Phone className="w-8 h-8 text-orange-400 mb-3" />
                                    <p className="text-xs text-slate-500 mb-1">Teléfono</p>
                                    <p className="font-semibold text-slate-200">+51 999 888 777</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-colors">
                                    <Mail className="w-8 h-8 text-pink-400 mb-3" />
                                    <p className="text-xs text-slate-500 mb-1">Email</p>
                                    <p className="font-semibold text-slate-200 text-sm">jhonatan@hidroaliaga.com</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors">
                                    <MapPin className="w-8 h-8 text-violet-400 mb-3" />
                                    <p className="text-xs text-slate-500 mb-1">Ubicación</p>
                                    <p className="font-semibold text-slate-200">Lima, Perú</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        {socialLinks.slice(0, 2).map((social, i) => (
                                            <social.icon key={i} className="w-6 h-6 text-blue-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-1">Redes Sociales</p>
                                    <p className="font-semibold text-slate-200">@jhonatanaliaga</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Footer */}
            <div className="px-6 md:px-12 py-16 bg-slate-950 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-6 gap-12">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                                    H
                                </div>
                                <div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                        Hidroaliaga
                                    </span>
                                    <p className="text-xs text-slate-500">by Jhonatan Aliaga</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                Software profesional de ingeniería hidráulica y servicios de consultoría 
                                para proyectos de infraestructura hídrica en el Perú.
                            </p>
                            
                            {/* Social Links */}
                            <div className="flex gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all ${social.color} hover:text-white hover:border-transparent`}
                                        aria-label={`Síguenos en ${social.label}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <social.icon className="w-5 h-5" aria-hidden="true" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        {/* Links Columns */}
                        {Object.entries(footerLinks).map(([key, section]) => (
                            <div key={key}>
                                <h4 className="font-semibold text-slate-200 mb-4">{section.title}</h4>
                                <ul className="space-y-3">
                                    {section.links.map((link: any) => (
                                        <li key={link.label}>
                                            {link.href.startsWith('http') ? (
                                                <a 
                                                    href={link.href}
                                                    target={link.target || "_blank"}
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-slate-500 hover:text-orange-400 transition-colors inline-flex items-center gap-1 group"
                                                >
                                                    {link.label}
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                                </a>
                                            ) : (
                                                <Link 
                                                    href={link.href} 
                                                    className="text-sm text-slate-500 hover:text-orange-400 transition-colors inline-flex items-center gap-1 group"
                                                >
                                                    {link.label}
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="px-6 md:px-12 py-6 bg-slate-950 border-t border-slate-800/50">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-600 text-center md:text-left">
                        © 2026 Hidroaliaga by Jhonatan Aliaga. Todos los derechos reservados.
                        <span className="hidden md:inline mx-2">|</span>
                        <br className="md:hidden" />
                        RNE OS.050 · RM 192-2018 · RM 107-2025
                    </p>
                    
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                        Hecho con <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> en Lima, Perú
                    </p>
                </div>
            </div>
        </footer>
    )
}
