"use client"

import Link from "next/link"
import { 
    Linkedin, 
    Twitter, 
    Instagram, 
    Youtube,
    Mail,
    Phone,
    MapPin
} from "lucide-react"

const footerLinks = {
    producto: [
        { label: "Características", href: "#capacidades" },
        { label: "Precios", href: "#" },
        { label: "Actualizaciones", href: "#" },
        { label: "Roadmap", href: "#" },
    ],
    servicios: [
        { label: "Consultoría", href: "#" },
        { label: "Capacitación", href: "#" },
        { label: "Desarrollo", href: "#" },
        { label: "Soporte", href: "#" },
    ],
    empresa: [
        { label: "Sobre Jhonata", href: "#" },
        { label: "Proyectos", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Prensa", href: "#" },
    ],
    legal: [
        { label: "Términos de Uso", href: "#" },
        { label: "Privacidad", href: "#" },
        { label: "Cookies", href: "#" },
        { label: "Licencias", href: "#" },
    ],
}

const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
]

export function ProfessionalFooter() {
    return (
        <footer className="relative z-10 border-t border-border/20">
            {/* Main Footer */}
            <div className="px-6 md:px-12 py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                                    H
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-gradient">Hidroaliaga</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                Software profesional de ingeniería hidráulica desarrollado por Jhonata Aliaga. 
                                Diseñado para ingenieros civiles y sanitarios del Perú.
                            </p>
                            
                            {/* Contact Info */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span>jhonata@hidroaliaga.com</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>+51 999 888 777</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>Lima, Perú</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Links Columns */}
                        <div>
                            <h4 className="font-semibold mb-4">Producto</h4>
                            <ul className="space-y-3 text-sm">
                                {footerLinks.producto.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Servicios</h4>
                            <ul className="space-y-3 text-sm">
                                {footerLinks.servicios.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Empresa</h4>
                            <ul className="space-y-3 text-sm">
                                {footerLinks.empresa.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="border-t border-border/20 px-6 md:px-12 py-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground text-center md:text-left">
                        © 2026 Hidroaliaga by Jhonata Aliaga. Todos los derechos reservados. 
                        Reglamento Nacional de Edificaciones · OS.050 · RM 192-2018 · RM 107-2025
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-blue-500/10 transition-all"
                                aria-label={social.label}
                            >
                                <social.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
