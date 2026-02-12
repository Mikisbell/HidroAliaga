

import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    badges: string[]
    color: "blue" | "green" | "purple" | "amber" | "cyan" | "red"
}

const colorMap = {
    blue: {
        bg: "from-blue-500/20 to-cyan-400/20",
        border: "group-hover:border-blue-500/30",
        badge: "border-blue-500/20 text-blue-400",
        line: "from-blue-500 via-blue-400 to-cyan-400",
        text: "group-hover:text-blue-400",
    },
    green: {
        bg: "from-green-500/20 to-emerald-400/20",
        border: "group-hover:border-green-500/30",
        badge: "border-green-500/20 text-green-400",
        line: "from-green-500 via-green-400 to-emerald-400",
        text: "group-hover:text-green-400",
    },
    purple: {
        bg: "from-purple-500/20 to-pink-400/20",
        border: "group-hover:border-purple-500/30",
        badge: "border-purple-500/20 text-purple-400",
        line: "from-purple-500 via-purple-400 to-pink-400",
        text: "group-hover:text-purple-400",
    },
    amber: {
        bg: "from-amber-500/20 to-yellow-400/20",
        border: "group-hover:border-amber-500/30",
        badge: "border-amber-500/20 text-amber-400",
        line: "from-amber-500 via-amber-400 to-yellow-400",
        text: "group-hover:text-amber-400",
    },
    cyan: {
        bg: "from-cyan-500/20 to-sky-400/20",
        border: "group-hover:border-cyan-500/30",
        badge: "border-cyan-500/20 text-cyan-400",
        line: "from-cyan-500 via-cyan-400 to-sky-400",
        text: "group-hover:text-cyan-400",
    },
    red: {
        bg: "from-red-500/20 to-rose-400/20",
        border: "group-hover:border-red-500/30",
        badge: "border-red-500/20 text-red-400",
        line: "from-red-500 via-red-400 to-rose-400",
        text: "group-hover:text-red-400",
    },
}

export function FeatureCard({ icon: Icon, title, description, badges, color }: FeatureCardProps) {
    const colors = colorMap[color]

    return (
        <div className={`group relative p-8 rounded-2xl glass-card overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${colors.border}`}>
            {/* Fondo degradado que aparece en hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-all duration-500`} />

            {/* Icono animado */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="w-8 h-8" />
                {/* Brillo */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Contenido */}
            <h3 className={`relative text-xl font-semibold mb-3 transition-colors duration-300 ${colors.text}`}>
                {title}
            </h3>
            <p className="relative text-sm text-muted-foreground/70 leading-relaxed">
                {description}
            </p>

            {/* Badges */}
            <div className="flex gap-1.5 flex-wrap pt-4 relative">
                {badges.map((badge, i) => (
                    <Badge
                        key={i}
                        variant="outline"
                        className={`text-[10px] ${colors.badge} transition-all duration-300 group-hover:scale-105`}
                        style={{ transitionDelay: `${i * 50}ms` }}
                    >
                        {badge}
                    </Badge>
                ))}
            </div>

            {/* Línea decorativa inferior */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.line} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </div>
    )
}
