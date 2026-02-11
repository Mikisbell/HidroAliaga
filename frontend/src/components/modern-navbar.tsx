"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
    Menu,
    X,
    ChevronDown,
    Search,
    Home,
    Briefcase,
    Code,
    Users,
    MessageCircle,
    Droplets,
    ArrowRight,
    Sparkles,
    Settings,
    FileText,
    BarChart3,
    Layers,
    Zap,
    ExternalLink
} from "lucide-react"

const menuItems = [
    {
        label: "Inicio",
        href: "/",
        icon: Home,
        description: "Página principal"
    },
    {
        label: "Servicios",
        href: "#servicios",
        icon: Briefcase,
        hasDropdown: true,
        megaMenu: {
            title: "Nuestros Servicios",
            subtitle: "Soluciones profesionales para ingeniería hidráulica",
            columns: [
                {
                    title: "Software",
                    items: [
                        { label: "Hidroaliaga Platform", description: "Diseño de redes", icon: Code, href: "/login", featured: true },
                        { label: "Cálculos Hidráulicos", description: "Hardy Cross & más", icon: BarChart3, href: "#" },
                        { label: "Validación Normativa", description: "RNE OS.050", icon: FileText, href: "/normativa" },
                    ]
                },
                {
                    title: "Consultoría",
                    items: [
                        { label: "Diseño de Redes", description: "Proyectos completos", icon: Layers, href: "#" },
                        { label: "Optimización", description: "Algoritmos genéticos", icon: Zap, href: "#" },
                        { label: "Capacitación", description: "Formación técnica", icon: Users, href: "#" },
                    ]
                },
                {
                    title: "Recursos",
                    items: [
                        { label: "Documentación", description: "Guías y manuales", icon: FileText, href: "/normativa" },
                        { label: "Blog Técnico", description: "Artículos especializados", icon: Sparkles, href: "#" },
                        { label: "Soporte", description: "Ayuda técnica", icon: MessageCircle, href: "#contacto" },
                    ]
                }
            ],
            cta: {
                title: "¿Necesitas un proyecto personalizado?",
                button: "Agendar Consulta",
                href: "#contacto"
            }
        }
    },
    {
        label: "Software",
        href: "#capacidades",
        icon: Code,
        hasDropdown: true,
        megaMenu: {
            title: "Hidroaliaga Platform",
            subtitle: "Tecnología de punta para ingenieros",
            featured: {
                title: "Motor Hidráulico",
                description: "Hardy Cross + Hazen-Williams con validación automática RNE",
                image: "gradient",
                href: "/login"
            },
            columns: [
                {
                    title: "Características",
                    items: [
                        { label: "Cálculo de Redes", description: "Cerradas y abiertas", icon: Layers },
                        { label: "GIS + DEM", description: "Cotas automáticas", icon: Map },
                        { label: "Optimización AG", description: "Algoritmos genéticos", icon: Zap },
                    ]
                },
                {
                    title: "Exportación",
                    items: [
                        { label: "PDF Técnico", description: "Expedientes", icon: FileText },
                        { label: "Excel", description: "Compatibilidad total", icon: BarChart3 },
                        { label: "EPANET", description: "Formato .inp", icon: Droplets },
                    ]
                }
            ]
        }
    },
    {
        label: "Proyectos",
        href: "#proyectos",
        icon: Briefcase,
        description: "Portfolio de trabajos"
    },
    {
        label: "Sobre Jhonatan",
        href: "#perfil",
        icon: Users,
        description: "Conoce al creador"
    },
    {
        label: "Contacto",
        href: "#contacto",
        icon: MessageCircle,
        description: "Hablemos de tu proyecto",
        highlight: true
    }
]

export function ModernNavbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isMobileMenuOpen])

    return (
        <>
            {/* Main Navbar */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                    isScrolled
                        ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl"
                        : "bg-transparent"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 group-hover:scale-110">
                                <Droplets className="w-5 h-5" />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                    {BRAND.name}
                                </span>
                                <span className="block text-[10px] text-slate-500 -mt-1">
                                    {BRAND.tagline}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {menuItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                                            item.highlight
                                                ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:shadow-lg hover:shadow-violet-500/25"
                                                : "text-slate-300 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                        {item.hasDropdown && (
                                            <ChevronDown className={cn(
                                                "w-3 h-3 transition-transform duration-300",
                                                activeDropdown === item.label && "rotate-180"
                                            )} />
                                        )}
                                    </Link>

                                    {/* Mega Menu Dropdown */}
                                    {item.hasDropdown && activeDropdown === item.label && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                                            <div className="w-[800px] bg-slate-950/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                                {/* Header */}
                                                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-violet-600/10 to-pink-600/10">
                                                    <h3 className="text-lg font-semibold text-white">{item.megaMenu?.title}</h3>
                                                    <p className="text-sm text-slate-400 mt-1">{item.megaMenu?.subtitle}</p>
                                                </div>

                                                <div className="p-6 grid grid-cols-3 gap-6">
                                                    {item.megaMenu?.columns?.map((column, idx) => (
                                                        <div key={idx}>
                                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                                                {column.title}
                                                            </h4>
                                                            <ul className="space-y-3">
                                                                {column.items.map((subItem, subIdx) => (
                                                                    <li key={subIdx}>
                                                                        <Link
                                                                            href={subItem.href || "#"}
                                                                            className="group/item flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                                                                        >
                                                                            <div className={cn(
                                                                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                                                                subItem.featured
                                                                                    ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                                                                                    : "bg-white/5 text-slate-400 group-hover/item:text-white"
                                                                            )}>
                                                                                <subItem.icon className="w-4 h-4" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm font-medium text-slate-200 group-hover/item:text-white">
                                                                                        {subItem.label}
                                                                                    </span>
                                                                                    {subItem.featured && (
                                                                                        <Sparkles className="w-3 h-3 text-pink-400" />
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-xs text-slate-500">{subItem.description}</p>
                                                                            </div>
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* CTA Footer */}
                                                {item.megaMenu?.cta && (
                                                    <div className="p-4 bg-gradient-to-r from-violet-600/20 to-pink-600/20 border-t border-white/10">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-300">{item.megaMenu.cta.title}</span>
                                                            <Link href={item.megaMenu.cta.href}>
                                                                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-pink-600 text-white">
                                                                    {item.megaMenu.cta.button}
                                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search Button */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* CTA Button */}
                            <Link href="/login" className="hidden sm:block">
                                <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white border-0">
                                    Comenzar
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu - Fullscreen */}
            <div
                className={cn(
                    "fixed inset-0 z-40 lg:hidden transition-all duration-500",
                    isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Content */}
                <div className="relative h-full flex flex-col pt-24 pb-8 px-6 overflow-y-auto">
                    <nav className="space-y-2">
                        {menuItems.map((item, index) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                                    item.highlight
                                        ? "bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-violet-500/30"
                                        : "hover:bg-white/5"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                    item.highlight
                                        ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                                        : "bg-white/10 text-slate-400"
                                )}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <span className={cn(
                                        "block text-lg font-semibold",
                                        item.highlight ? "text-white" : "text-slate-200"
                                    )}>
                                        {item.label}
                                    </span>
                                    {item.description && (
                                        <span className="text-sm text-slate-500">{item.description}</span>
                                    )}
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-600" />
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Footer */}
                    <div className="mt-auto pt-8 border-t border-white/10">
                        <p className="text-center text-sm text-slate-500">
                            {BRAND.copyright}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-start justify-center pt-32"
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl mx-4 animate-in fade-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar servicios, recursos, documentación..."
                                className="w-full h-16 pl-14 pr-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-lg"
                                autoFocus
                            />
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-slate-500 bg-white/5 rounded-lg"
                            >
                                ESC
                            </button>
                        </div>
                        <p className="mt-4 text-center text-sm text-slate-500">
                            Presiona Enter para buscar o ESC para cerrar
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
