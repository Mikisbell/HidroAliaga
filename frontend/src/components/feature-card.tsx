

import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    badges: string[]
    color: "blue" | "slate"
}

const colorMap = {
    blue: {
        bg: "from-blue-500/20 to-blue-600/20",
        border: "group-hover:border-blue-500/30",
        badge: "border-blue-500/20 text-blue-400",
        line: "from-blue-500 via-blue-400 to-blue-600",
        text: "group-hover:text-blue-400",
    },
    slate: {
        bg: "from-slate-500/20 to-slate-600/20",
        border: "group-hover:border-slate-500/30",
        badge: "border-slate-500/20 text-slate-400",
        line: "from-slate-500 via-slate-400 to-slate-600",
        text: "group-hover:text-slate-400",
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
