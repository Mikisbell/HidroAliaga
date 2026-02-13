"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="relative px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <motion.div
        className="relative overflow-hidden rounded-3xl glass-card border border-primary/30 p-12 md:p-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Rocket className="w-3 h-3 mr-1" />
            Comienza Hoy
          </Badge>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Transforma tu forma de diseñar{" "}
            <span className="text-gradient">redes de agua potable</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Únete a más de 50 ingenieros que ya están ahorrando 15+ horas por proyecto 
            con 100% de cumplimiento normativo
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              "14 días de prueba gratis",
              "Sin tarjeta de crédito",
              "Soporte técnico incluido",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center justify-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:-translate-y-1 transition-all duration-200"
              >
                <Rocket className="w-6 h-6 mr-2" />
                Comenzar Prueba Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#contacto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-16 px-10 text-xl rounded-2xl border-border/30 hover:border-border/50"
              >
                Hablar con un Experto
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <span>✓ Acceso inmediato</span>
            <span>✓ Cancela cuando quieras</span>
            <span>✓ Datos 100% seguros</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[
          { value: "15h+", label: "Ahorro por proyecto" },
          { value: "100%", label: "Cumplimiento RNE" },
          { value: "50+", label: "Ingenieros activos" },
          { value: "4.9/5", label: "Calificación" },
        ].map((stat, i) => (
          <div key={i}>
            <p className="text-3xl font-bold text-gradient mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
