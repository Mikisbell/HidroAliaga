import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, FileX } from "lucide-react"

const problems = [
  {
    icon: Clock,
    title: "Lento y Tedioso",
    stat: "3-5 días",
    description: "Por cada red de distribución, perdiendo oportunidades de negocio y retrasando proyectos críticos",
    color: "red" as const,
  },
  {
    icon: AlertTriangle,
    title: "Propenso a Errores",
    stat: "40% rechazos",
    description: "Municipalidades rechazan proyectos por errores de cálculo, incumplimiento normativo o documentación incompleta",
    color: "amber" as const,
  },
  {
    icon: FileX,
    title: "Validación Compleja",
    stat: "8+ horas",
    description: "Verificar manualmente cumplimiento de RNE OS.050, RM 192-2018 y RM 107-2025 consume tiempo valioso",
    color: "orange" as const,
  },
]

const colorClasses = {
  red: {
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    hover: "hover:bg-red-500/10 hover:border-red-500/30",
    text: "text-red-400",
    icon: "text-red-400",
  },
  amber: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    hover: "hover:bg-amber-500/10 hover:border-amber-500/30",
    text: "text-amber-400",
    icon: "text-amber-400",
  },
  orange: {
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    hover: "hover:bg-orange-500/10 hover:border-orange-500/30",
    text: "text-orange-400",
    icon: "text-orange-400",
  },
}

export function ProblemSection() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400 bg-red-500/10">
              El Problema
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              El diseño manual de redes tiene{" "}
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                3 problemas críticos
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
              Ingenieros civiles en Perú pierden tiempo valioso y enfrentan rechazos costosos
              por limitaciones del diseño manual tradicional
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => {
            const colors = colorClasses[problem.color]
            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div
                  className={`p-6 rounded-2xl border ${colors.bg} ${colors.border} ${colors.hover} transition-all duration-300 group`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <problem.icon className={`w-8 h-8 ${colors.icon}`} aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                      <p className={`text-4xl font-bold ${colors.text} mb-3`}>
                        {problem.stat}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Impacto económico */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 p-6 md:p-8 rounded-2xl glass-card border border-border/20 text-center">
            <p className="text-sm text-muted-foreground mb-2">Impacto Económico Estimado</p>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              <span className="text-red-400">S/ 15,000 - S/ 25,000</span> perdidos por proyecto rechazado
            </p>
            <p className="text-xs text-muted-foreground/60">
              Entre retrabajos, tiempo perdido y oportunidades de negocio no aprovechadas
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
