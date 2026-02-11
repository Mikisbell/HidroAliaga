import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search, Droplets } from "lucide-react"
import { BRAND } from "@/lib/constants"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-slate-950">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                        <Droplets className="w-10 h-10" />
                    </div>
                </div>
                
                {/* Error Code */}
                <h1 className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    404
                </h1>
                
                {/* Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Página no encontrada
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                    Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
                </p>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white border-0 h-12 px-6">
                            <Home className="w-4 h-4 mr-2" />
                            Volver al inicio
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800 h-12 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Ir al Dashboard
                        </Button>
                    </Link>
                </div>
                
                {/* Search suggestion */}
                <div className="mt-12 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <p className="text-sm text-slate-500 mb-3 flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" />
                        ¿Buscas algo específico?
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Link href="/proyectos">
                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors cursor-pointer">
                                Proyectos
                            </span>
                        </Link>
                        <Link href="/normativa">
                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors cursor-pointer">
                                Normativa
                            </span>
                        </Link>
                        <Link href="/login">
                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors cursor-pointer">
                                Iniciar Sesión
                            </span>
                        </Link>
                    </div>
                </div>
                
                {/* Brand */}
                <p className="mt-12 text-xs text-slate-600">
                    {BRAND.copyright}
                </p>
            </div>
        </div>
    )
}
