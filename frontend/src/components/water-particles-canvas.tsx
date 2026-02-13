"use client"

import { useEffect, useRef } from "react"

interface WaterParticle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  wobble: number
  wobbleSpeed: number
}

export function WaterParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<WaterParticle[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const particleCount = window.innerWidth < 768 ? 25 : 50
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2, // 2-6px
      speedY: Math.random() * 0.5 + 0.3, // 0.3-0.8 px/frame upward
      speedX: (Math.random() - 0.5) * 0.3, // -0.15 to 0.15 px/frame horizontal
      opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
    }))

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.y -= particle.speedY
        particle.wobble += particle.wobbleSpeed
        particle.x += Math.sin(particle.wobble) * 0.5 + particle.speedX

        // Reset particle if it goes off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10
          particle.x = Math.random() * canvas.width
        }
        if (particle.x < -10) particle.x = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.x = -10

        // Draw particle (water droplet)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        // Use OKLCH colors from domain (blue 230°, cyan 200°)
        const hue = Math.random() > 0.5 ? 230 : 200
        ctx.fillStyle = `oklch(0.70 0.05 ${hue} / ${particle.opacity})`
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
