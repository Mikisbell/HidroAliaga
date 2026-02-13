"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Award, TrendingUp } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Ing. Carlos Mendoza",
    role: "Ingeniero Sanitario Senior",
    company: "Consultora Hidráulica SAC",
    image: "/placeholder-avatar-1.jpg",
    rating: 5,
    text: "Hidroaliaga redujo nuestro tiempo de diseño de 3 días a 4 horas. La validación normativa automática nos da confianza total en cada proyecto.",
  },
  {
    name: "Ing. María Torres",
    role: "Jefa de Proyectos",
    company: "Municipalidad Provincial",
    image: "/placeholder-avatar-2.jpg",
    rating: 5,
    text: "El motor Hardy Cross es impecable. La tabla de iteraciones nos permite validar cada cálculo académicamente. Herramienta indispensable.",
  },
  {
    name: "Ing. Roberto Sánchez",
    role: "Consultor Independiente",
    company: "Freelance",
    image: "/placeholder-avatar-3.jpg",
    rating: 5,
    text: "La optimización por algoritmo genético me ahorra miles de soles en materiales. El ROI se recupera en el primer proyecto.",
  },
]

const stats = [
  { icon: Users, value: "50+", label: "Ingenieros activos" },
  { icon: Award, value: "100+", label: "Proyectos completados" },
  { icon: TrendingUp, value: "15h", label: "Ahorro promedio" },
  { icon: Star, value: "4.9/5", label: "Calificación" },
]

export function SocialProof() {
  return (
    <section className="relative px-6 md:px-12 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
          Confianza Profesional
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Ingenieros que confían en{" "}
          <span className="text-gradient">Hidroaliaga</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Profesionales de toda Latinoamérica optimizando sus proyectos hidráulicos
        </p>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="glass-card p-6 rounded-2xl border border-border/20 text-center hover:border-primary/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold text-gradient mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="glass-card p-6 rounded-2xl border border-border/20 hover:border-primary/30 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Text */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              "{testimonial.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {testimonial.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                <p className="text-xs text-muted-foreground/50">{testimonial.company}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <motion.div
        className="mt-16 flex flex-wrap justify-center items-center gap-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="w-5 h-5 text-primary" />
          <span>Cumplimiento RNE 100%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-5 h-5 text-amber-400" />
          <span>Calificación 4.9/5</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-5 h-5 text-primary" />
          <span>50+ ingenieros activos</span>
        </div>
      </motion.div>
    </section>
  )
}
