"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, Zap, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { PipeNetworkHero } from "./pipe-network-hero"
import { StatsCounter } from "./stats-counter"

export function ProfessionalHero() {
  return (
    <section className="relative px-6 md:px-12 pt-32 pb-20 max-w-7xl mx-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
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

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
              <Droplets className="w-3 h-3 mr-1" />
              Ingeniería Hidráulica Profesional
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Diseña redes de agua potable{" "}
              <span className="text-gradient">en tiempo récord</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Plataforma profesional con motor Hardy Cross, validación normativa RNE OS.050 
            y optimización por algoritmo genético. <strong className="text-foreground">Ahorra 15+ horas por proyecto</strong>.
          </motion.p>

          {/* Key benefits */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              { icon: Zap, label: "Cálculo automático", desc: "Hardy Cross" },
              { icon: Award, label: "100% normativo", desc: "RNE OS.050" },
              { icon: TrendingUp, label: "Optimización IA", desc: "Algoritmo genético" },
              { icon: Droplets, label: "GIS integrado", desc: "Cotas DEM" },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card p-4 rounded-xl border border-border/20 hover:border-primary/30 transition-all duration-300"
              >
                <item.icon className="w-6 h-6 text-primary mb-2" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-200"
              >
                Probar Gratis 14 Días
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl border-border/30 hover:border-border/50"
              >
                Ver Demo en Vivo
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex items-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sin tarjeta de crédito
            </span>
            <span>✓ Acceso completo</span>
            <span>✓ Soporte incluido</span>
          </motion.div>
        </div>

        {/* Right: Interactive visualization */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <PipeNetworkHero />
        </motion.div>
      </div>

      {/* Stats section */}
      <motion.div
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        {[
          { value: 15, suffix: "+", label: "Horas ahorradas por proyecto" },
          { value: 100, suffix: "%", label: "Cumplimiento normativo" },
          { value: 10, suffix: "⁻⁷", label: "Tolerancia de convergencia" },
          { value: 50, suffix: "+", label: "Proyectos completados" },
        ].map((stat, i) => (
          <div key={i} className="space-y-2">
            <StatsCounter end={stat.value} suffix={stat.suffix} />
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
