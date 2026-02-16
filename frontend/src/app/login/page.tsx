"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"
import { WaterParticlesCanvas } from "@/components/water-particles-canvas"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [mode, setMode] = useState<"login" | "registro">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nombre, setNombre] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mensaje, setMensaje] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // E2E test bypass: skip Supabase auth when SKIP_AUTH is enabled
        if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
            setLoading(false)
            router.push("/dashboard")
            router.refresh()
            return
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(
                error.message === "Invalid login credentials"
                    ? "Credenciales inválidas. Verifica tu email y contraseña."
                    : error.message
            )
            setLoading(false)
            return
        }

        // Reset loading before navigation to allow Playwright to detect completion
        setLoading(false)

        // Small delay to ensure state updates, then navigate
        setTimeout(() => {
            router.push("/dashboard")
            router.refresh()
        }, 100)
    }

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMensaje(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { nombre } },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setMensaje("Cuenta creada. Revisa tu email para confirmar.")
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex relative">
            {/* Water Particles Background */}
            <WaterParticlesCanvas />

            {/* ─── LEFT PANEL: Brand & Features ─── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, oklch(0.18 0.04 250), oklch(0.13 0.03 260), oklch(0.10 0.02 240))' }}>

                {/* Animated mesh gradient overlay */}
                <div className="absolute inset-0 opacity-30"
                    style={{
                        background: `
                            radial-gradient(ellipse 600px 400px at 20% 30%, oklch(0.45 0.20 230 / 0.4), transparent),
                            radial-gradient(ellipse 500px 500px at 80% 70%, oklch(0.35 0.15 200 / 0.3), transparent),
                            radial-gradient(ellipse 400px 300px at 60% 20%, oklch(0.30 0.18 260 / 0.2), transparent)
                        `,
                    }}
                />

                {/* Floating grid lines */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Water flow decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-[40%] opacity-10"
                    style={{
                        background: 'linear-gradient(to top, oklch(0.50 0.20 230 / 0.3), transparent)',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xl relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 230), oklch(0.65 0.18 200))' }}>
                            <span className="relative z-10">H</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                        </div>
                        <div>
                            <p className="text-white/90 font-semibold text-lg tracking-tight">Hidroaliaga</p>
                            <p className="text-white/30 text-[10px] font-medium tracking-[0.15em] uppercase">by Jhonatan Aliaga</p>
                        </div>
                    </div>

                    {/* Main message */}
                    <div className="space-y-8 max-w-lg">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide"
                                style={{ background: 'oklch(0.50 0.15 230 / 0.15)', color: 'oklch(0.75 0.15 210)', border: '1px solid oklch(0.50 0.15 230 / 0.2)' }}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'oklch(0.70 0.20 150)' }} />
                                Plataforma Activa — v0.1.0
                            </div>
                            <h1 className="text-5xl md:text-6xl leading-[1.1] font-bold text-white tracking-tight">
                                Diseño de redes<br />
                                de agua potable con<br />
                                <span style={{ color: 'oklch(0.75 0.18 210)' }}>precisión normativa</span>
                            </h1>
                            <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-md">
                                Motor hidráulico Hardy Cross, validación automatizada conforme al RNE OS.050 y optimización por algoritmo genético.
                            </p>
                        </div>

                        {/* Feature pills */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: "⚡", label: "Hardy Cross", desc: "Hazen-Williams N=1.852", color: "230" },
                                { icon: "🗺️", label: "GIS + DEM", desc: "Cotas automáticas", color: "160" },
                                { icon: "📋", label: "RNE OS.050", desc: "Validación normativa", color: "50" },
                                { icon: "🧬", label: "IA Optimizer", desc: "Algoritmo genético", color: "280" },
                            ].map((f) => (
                                <div key={f.label} className="flex items-start gap-3 p-3.5 rounded-xl transition-colors"
                                    style={{ background: 'oklch(0.16 0.01 260)', border: '1px solid oklch(0.25 0.02 260 / 0.2)' }}>
                                    <span className="text-lg mt-0.5">{f.icon}</span>
                                    <div>
                                        <p className="text-white/80 text-sm font-medium">{f.label}</p>
                                        <p className="text-white/30 text-[11px]">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {["OS.050", "RM 192-2018", "RM 107-2025"].map((n) => (
                                <span key={n} className="text-[10px] font-medium px-2.5 py-1 rounded-md"
                                    style={{ background: 'oklch(0.16 0.01 260)', color: 'rgba(255,255,255,0.3)', border: '1px solid oklch(0.25 0.02 260 / 0.2)' }}>
                                    {n}
                                </span>
                            ))}
                        </div>
                        <p className="text-white/20 text-[10px]">© 2026 Hidroaliaga — by Jhonatan Aliaga</p>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT PANEL: Auth Form ─── */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 relative"
                style={{ background: 'oklch(0.14 0.01 260)' }}>

                {/* Subtle bg texture */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(oklch(0.90 0 0 / 0.5) 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative z-10 w-full max-w-[380px] space-y-6">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                            style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 230), oklch(0.65 0.18 200))' }}>
                            H
                        </div>
                        <div>
                            <p className="text-white/90 font-semibold">Hidroaliaga</p>
                            <p className="text-white/30 text-[10px] tracking-widest uppercase">by Jhonatan Aliaga</p>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
                        </h2>
                        <p className="text-white/35 text-sm">
                            {mode === "login"
                                ? "Ingresa tus credenciales para acceder al sistema"
                                : "Registra una nueva cuenta de ingeniero"}
                        </p>
                    </div>

                    {/* Social Login */}
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`,
                                    queryParams: {
                                        access_type: 'offline',
                                        prompt: 'consent',
                                    },
                                },
                            });
                        }}
                        className="w-full h-12 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group mb-4"
                        style={{
                            background: 'oklch(0.18 0.01 260)',
                            color: 'oklch(0.93 0.01 250)',
                            border: '1px solid oklch(0.25 0.02 260 / 0.3)',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Image src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} className="w-5 h-5" />
                        <span>Continuar con Google</span>
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px" style={{ background: 'oklch(0.25 0.01 260)' }} />
                        <span className="text-[11px]" style={{ color: 'oklch(0.35 0 0)' }}>
                            O usa tu correo
                        </span>
                        <div className="flex-1 h-px" style={{ background: 'oklch(0.25 0.01 260)' }} />
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
                            style={{ background: 'oklch(0.30 0.12 25 / 0.15)', border: '1px solid oklch(0.55 0.20 25 / 0.25)', color: 'oklch(0.75 0.15 25)' }}>
                            <span className="text-base mt-0.5">⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}
                    {mensaje && (
                        <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
                            style={{ background: 'oklch(0.30 0.12 155 / 0.15)', border: '1px solid oklch(0.55 0.15 155 / 0.25)', color: 'oklch(0.75 0.12 155)' }}>
                            <span className="text-base mt-0.5">✅</span>
                            <p>{mensaje}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={mode === "login" ? handleLogin : handleRegistro} className="space-y-5">
                        {mode === "registro" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium uppercase tracking-[0.1em]"
                                    style={{ color: 'oklch(0.55 0 0)' }}>
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ing. Juan Pérez López"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                                    style={{
                                        background: 'oklch(0.16 0.01 260)',
                                        border: '1px solid oklch(0.25 0.02 260)',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'oklch(0.55 0.18 230)'
                                        e.target.style.boxShadow = '0 0 0 3px oklch(0.55 0.18 230 / 0.1)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'oklch(0.25 0.02 260)'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-[0.1em]"
                                style={{ color: 'oklch(0.55 0 0)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                data-testid="login-email"
                                placeholder="admin@hidroaliaga.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                                style={{
                                    background: 'oklch(0.16 0.01 260)',
                                    border: '1px solid oklch(0.25 0.02 260)',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'oklch(0.55 0.18 230)'
                                    e.target.style.boxShadow = '0 0 0 3px oklch(0.55 0.18 230 / 0.1)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'oklch(0.25 0.02 260)'
                                    e.target.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-[0.1em]"
                                style={{ color: 'oklch(0.55 0 0)' }}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    data-testid="login-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                                    style={{
                                        background: 'oklch(0.16 0.01 260)',
                                        border: '1px solid oklch(0.25 0.02 260)',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'oklch(0.55 0.18 230)'
                                        e.target.style.boxShadow = '0 0 0 3px oklch(0.55 0.18 230 / 0.1)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'oklch(0.25 0.02 260)'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors text-sm"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            data-testid="login-submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all duration-300 relative overflow-hidden group disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, oklch(0.55 0.20 230), oklch(0.50 0.18 250))',
                                boxShadow: '0 4px 24px oklch(0.55 0.20 230 / 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                        >
                            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {mode === "login" ? "Ingresando..." : "Creando cuenta..."}
                                    </>
                                ) : (
                                    <>
                                        {mode === "login" ? "Ingresar al Sistema" : "Crear Cuenta"}
                                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px" style={{ background: 'oklch(0.25 0.01 260)' }} />
                        <span className="text-[11px]" style={{ color: 'oklch(0.35 0 0)' }}>
                            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                        </span>
                        <div className="flex-1 h-px" style={{ background: 'oklch(0.25 0.01 260)' }} />
                    </div>

                    {/* Toggle mode */}
                    <button
                        onClick={() => { setMode(mode === "login" ? "registro" : "login"); setError(null); setMensaje(null) }}
                        className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                            color: 'oklch(0.65 0.12 230)',
                            background: 'oklch(0.55 0.18 230 / 0.06)',
                            border: '1px solid oklch(0.55 0.18 230 / 0.12)',
                        }}
                    >
                        {mode === "login" ? "Crear una cuenta nueva" : "Iniciar sesión"}
                    </button>

                    {/* Footer */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-center gap-1.5">
                            {["OS.050", "RM 192", "RM 107"].map((norm, i) => (
                                <span key={norm}>
                                    <span className="text-[10px]" style={{ color: 'oklch(0.35 0 0)' }}>{norm}</span>
                                    {i < 2 && <span className="text-white/10 mx-1.5">·</span>}
                                </span>
                            ))}
                        </div>
                        <p className="text-center text-[10px]" style={{ color: 'oklch(0.28 0 0)' }}>
                            Reglamento Nacional de Edificaciones — Perú
                        </p>
                        <div className="flex items-center justify-center">
                            <Link href="/" className="text-[11px] font-medium transition-colors"
                                style={{ color: 'oklch(0.45 0.10 230)' }}>
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
