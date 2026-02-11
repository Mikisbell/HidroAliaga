import { Loader2, Droplets } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
            {/* Animated Logo */}
            <div className="relative mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-500 flex items-center justify-center animate-pulse">
                    <Droplets className="w-8 h-8 text-white" />
                </div>
                {/* Rotating ring */}
                <div className="absolute -inset-2 border-2 border-violet-500/30 rounded-2xl animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">Cargando...</h2>
                <p className="text-sm text-slate-500">Preparando tu experiencia</p>
            </div>
            
            {/* Progress bar */}
            <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 animate-shimmer"></div>
            </div>
        </div>
    )
}
