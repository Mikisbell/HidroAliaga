"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { MapPin, Settings, Zap, FileCheck, Download } from "lucide-react"

const steps = [
  {
    icon: MapPin,
    title: "1. Traza tu red",
    description: "Dibuja nodos y tuberías en el mapa interactivo. Las cotas se obtienen automáticamente del DEM.",
    time: "2 min",
    color: "blue",
  },
  {
    icon: Settings,
    title: "2. Configura parámetros",
    description: "Define población, dotación, coeficientes y material de tubería. Valores por defecto según norma.",
    time: "1 min",
    color: "green",
  },
  {
    icon: Zap,
    title: "3. Calcula automáticamente",
    description: "Motor Hardy Cross resuelve la red en segundos. Validación normativa en tiempo real.",
    time: "5 seg",
    color: "purple",
  },
  {
    icon: FileCheck,
    title: "4. Revisa resultados",
    description: "Tabla de iteraciones, mapa de calor de presiones, alertas normativas y recomendaciones.",
    time: "3 min",
    color: "amber",
  },
  {
    icon: Download,
    title: "5. Exporta tu proyecto",
    description: "Genera expediente técnico PDF, exporta a Excel, EPANET (INP) o formatos GIS (GeoJSON/DXF).",
    time: "1 min",
    color: "cyan",
  },
]

export function ProcessTimeline() {
  return (
    <section className="relative px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
          Proceso Simplificado
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          De la idea al expediente técnico{" "}
          <span className="text-gradient">en 12 minutos</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Flujo de trabajo optimizado para máxima productividad
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500 opacity-20" />

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`relative flex items-center gap-8 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl bg-${step.color}-500/10 border-2 border-${step.color}-500/30 flex items-center justify-center`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-400`} />
                </div>
                {/* Time badge */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`bg-${step.color}-500/20 text-${step.color}-400 border-${step.color}-500/30 text-xs`}>
                    {step.time}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 glass-card p-6 rounded-2xl border border-border/20 hover:border-primary/30 transition-all duration-300 ${
                index % 2 === 0 ? "md:text-right" : "md:text-left"
              }`}>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Total time */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="inline-block glass-card px-8 py-4 rounded-2xl border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Tiempo total estimado</p>
          <p className="text-4xl font-bold text-gradient">~12 minutos</p>
          <p className="text-xs text-muted-foreground mt-2">vs. 2-3 días con métodos tradicionales</p>
        </div>
      </motion.div>
    </section>
  )
}
