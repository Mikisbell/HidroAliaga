"use client"

import { useEffect, useState } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const { ref, isVisible } = useScrollAnimation()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setCount(value)
      return
    }

    const startTime = Date.now()
    const endTime = startTime + duration

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = easeOut * value

      setCount(currentCount)

      if (now < endTime) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(value)
      }
    }

    requestAnimationFrame(updateCount)
  }, [isVisible, value, duration])

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  )
}
