"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface PressureGaugeProps {
  value: number
  max: number
  label: string
  unit: string
  color?: "blue" | "green" | "amber" | "red"
}

export function PressureGauge({ value, max, label, unit, color = "blue" }: PressureGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = (value / max) * 100

  const colorMap = {
    blue: "oklch(0.60 0.18 230)",
    green: "oklch(0.65 0.18 160)",
    amber: "oklch(0.75 0.16 80)",
    red: "oklch(0.65 0.22 25)",
  }

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="relative w-full aspect-square max-w-[200px]">
      {/* Gauge background */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="oklch(0.25 0.02 250)"
          strokeWidth="8"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 45}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - percentage / 100) }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          className="text-3xl font-bold"
          style={{ color: colorMap[color] }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {displayValue.toFixed(1)}
        </motion.p>
        <p className="text-xs text-muted-foreground mt-1">{unit}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
