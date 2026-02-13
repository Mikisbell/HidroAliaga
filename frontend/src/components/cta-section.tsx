import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Rocket, Calendar, CheckCircle2, Sparkles } from "lucide-react"

const benefits = [
  "Sin tarjeta de crédito",
  "Acceso completo 14 días",
  "Soporte técnico incluido",
  "Cancela cuando quieras",
]

export function CTASection() {
  return (
    <section className="relative z-10 px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-600/10 border border-blue-500/20 p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-3xl" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-gradient-to-tr from-blue-600/20 to-blue-500/20 rounded-full blur-3xl" aria-hidden="true"></div>

            <div className="relative text-center space-y-6">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20">
                <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                Oferta de Lanzamiento
              </Badge>

              <h2 className="text-3xl md:text-5xl font-bold">
                Prueba Hidroaliaga{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  gratis por 14 días
                </span>
              </h2>

              <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
                Diseña tu primera red de agua potable con todas las funcionalidades profesionales.
                Sin compromisos, sin tarjeta de crédito.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-400" aria-hidden="true" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-0 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-200"
                  >
                    <Rocket className="w-5 h-5 mr-2" aria-hidden="true" />
                    Comenzar Prueba Gratis
                  </Button>
                </Link>
                <Link href="#contacto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 rounded-xl transition-all duration-200"
                  >
                    <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
                    Agendar Demo
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 pt-6 text-xs text-muted-foreground/60">
                <span>✓ 300+ ingenieros confían</span>
                <span>✓ 80+ proyectos aprobados</span>
                <span>✓ 100% cumplimiento RNE</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
