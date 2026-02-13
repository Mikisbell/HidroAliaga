"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface StatsCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
}

export function StatsCounter({ end, duration = 2000, suffix = "", prefix = "", decimals = 0 }: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const steps = 60
    const increment = end / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, end, duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <span className="text-4xl md:text-5xl font-bold text-gradient">
        {prefix}
        {count.toFixed(decimals)}
        {suffix}
      </span>
    </motion.div>
  )
}
