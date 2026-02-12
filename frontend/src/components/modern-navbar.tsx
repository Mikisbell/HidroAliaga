"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
    Menu,
    X,
    Droplets,
    ArrowRight,
    ChevronDown
} from "lucide-react"

// Navegación simplificada - máximo 5 items para no abrumar
const navItems = [
    {
        label: "Inicio",
        href: "/",
    },
    {
        label: "Software",
        href: "#capacidades",
        dropdown: [
            { label: "Motor Hardy Cross", href: "#capacidades" },
            { label: "Validación RNE", href: "#capacidades" },
            { label: "Exportación PDF/Excel", href: "#capacidades" },
        ]
    },
    {
        label: "Servicios",
        href: "#servicios",
    },
    {
        label: "Sobre Jhonatan",
        href: "#perfil",
    },
]

export function ModernNavbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    // Detectar scroll para cambiar estilo del navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Bloquear scroll cuando menú mobile está abierto
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
            {/* Navbar Principal */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "bg-slate-950/90 backdrop-blur-md border-b border-white/10 py-3"
                        : "bg-transparent py-5"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo - Siempre visible */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                                <Droplets className="w-5 h-5" />
                            </div>
                            <div className="hidden sm:block">
                                <span className={cn(
                                    "text-lg font-bold tracking-tight transition-colors",
                                    isScrolled ? "text-white" : "text-slate-800"
                                )}>
                                    {BRAND.name}
                                </span>
                                <span className={cn(
                                    "block text-[10px] -mt-0.5 transition-colors",
                                    isScrolled ? "text-slate-400" : "text-slate-500"
                                )}>
                                    by Jhonatan Aliaga
                                </span>
                            </div>
                        </Link>

                        {/* Navegación Desktop - Solo lo esencial */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-colors",
                                            isScrolled
                                                ? "text-slate-300 hover:text-white hover:bg-white/5"
                                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                                        )}
                                    >
                                        <span>{item.label}</span>
                                        {item.dropdown && (
                                            <ChevronDown className={cn(
                                                "w-4 h-4 transition-transform duration-200",
                                                activeDropdown === item.label && "rotate-180"
                                            )} />
                                        )}
                                    </Link>

                                    {/* Dropdown simple - sin mega menú */}
                                    {item.dropdown && activeDropdown === item.label && (
                                        <div className="absolute top-full left-0 pt-2">
                                            <div className="bg-slate-900 border border-white/10 rounded-lg shadow-xl py-2 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-200">
                                                {item.dropdown.map((subItem) => (
                                                    <Link
                                                        key={subItem.label}
                                                        href={subItem.href}
                                                        className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* CTA Principal - Lo más importante */}
                        <div className="flex items-center gap-3">
                            <Link href="#contacto" className="hidden sm:block">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "hover:bg-white/5",
                                        isScrolled ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    Contacto
                                </Button>
                            </Link>

                            <Link href="/login">
                                <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-violet-500/20">
                                    Comenzar
                                    <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            </Link>

                            {/* Botón Mobile */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={cn(
                                    "lg:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
                                    isScrolled
                                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/50"
                                )}
                                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Menú Mobile - Fullscreen simplificado */}
            <div
                className={cn(
                    "fixed inset-0 z-40 lg:hidden transition-all duration-300",
                    isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-950/98 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Contenido */}
                <div className="relative h-full flex flex-col pt-20 px-6">
                    <nav className="space-y-1">
                        {navItems.map((item, index) => (
                            <div key={item.label}>
                                <Link
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between py-4 text-lg font-medium text-slate-200 hover:text-white border-b border-white/5 transition-colors"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span>{item.label}</span>
                                    <ArrowRight className="w-5 h-5 text-slate-600" />
                                </Link>

                                {/* Subitems en mobile */}
                                {item.dropdown && (
                                    <div className="pl-4 pb-2 space-y-1">
                                        {item.dropdown.map((subItem) => (
                                            <Link
                                                key={subItem.label}
                                                href={subItem.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* CTA en mobile */}
                        <div className="pt-6">
                            <Link
                                href="#contacto"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium rounded-xl"
                            >
                                Contactar Ahora
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </nav>

                    {/* Footer mobile */}
                    <div className="mt-auto py-6 border-t border-white/5">
                        <p className="text-center text-xs text-slate-600">
                            © 2026 {BRAND.name} by Jhonatan Aliaga
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
