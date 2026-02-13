"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { PressureGauge } from "./pressure-gauge"
import { Code2, Gauge, Network, Zap } from "lucide-react"

export function TechnicalShowcase() {
  return (
    <section className="relative px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
          <Zap className="w-3 h-3 mr-1" />
          Tecnología de Punta
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Motor hidráulico <span className="text-gradient">de nivel profesional</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Algoritmos validados académicamente con precisión de 10⁻⁷ en convergencia
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Technical specs */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="glass-card p-6 rounded-2xl border border-border/20 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Hardy Cross Híbrido</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Implementación optimizada del método Hardy Cross para redes cerradas, 
                  balance de masa para ramales abiertos, y algoritmo híbrido para redes mixtas. 
                  Ecuación de Hazen-Williams con exponente N=1.852.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">Mallas</Badge>
                  <Badge variant="outline" className="text-xs">Ramales</Badge>
                  <Badge variant="outline" className="text-xs">Mixtas</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border/20 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Gauge className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Validación Normativa Automática</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verificación en tiempo real contra RNE OS.050, RM 192-2018 y RM 107-2025. 
                  Alertas inteligentes por presión dinámica, presión estática, velocidad, 
                  diámetro mínimo y cobertura de servicio.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">OS.050</Badge>
                  <Badge variant="outline" className="text-xs">RM 192</Badge>
                  <Badge variant="outline" className="text-xs">RM 107</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border/20 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Network className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Optimización por Algoritmo Genético</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Selección automática de diámetros óptimos minimizando costos de tubería 
                  mientras cumple restricciones normativas. Población de 100 individuos, 
                  50 generaciones, convergencia garantizada.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">Población 100</Badge>
                  <Badge variant="outline" className="text-xs">50 Gen</Badge>
                  <Badge variant="outline" className="text-xs">Costo mín</Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Pressure gauges */}
        <motion.div
          className="grid grid-cols-2 gap-8"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col items-center">
            <PressureGauge value={28.5} max={50} label="Presión Dinámica" unit="m.c.a." color="blue" />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Rango normativo: 10-50 m.c.a.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <PressureGauge value={1.8} max={3.0} label="Velocidad" unit="m/s" color="green" />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Rango normativo: 0.6-3.0 m/s
            </p>
          </div>
          <div className="flex flex-col items-center">
            <PressureGauge value={42.3} max={50} label="Presión Estática" unit="m.c.a." color="amber" />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Máximo permitido: 50 m.c.a.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <PressureGauge value={0.000001} max={0.001} label="Error Convergencia" unit="" color="blue" />
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Tolerancia: 10⁻⁷
            </p>
          </div>
        </motion.div>
      </div>

      {/* Technical metrics */}
      <motion.div
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {[
          { value: "10⁻⁷", label: "Tolerancia de convergencia" },
          { value: "N=1.852", label: "Exponente Hazen-Williams" },
          { value: "100%", label: "Cumplimiento normativo" },
          { value: "<5 seg", label: "Tiempo de cálculo promedio" },
        ].map((metric, i) => (
          <div key={i} className="glass-card p-4 rounded-xl border border-border/20 text-center">
            <p className="text-2xl font-bold text-gradient">{metric.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
