"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Project {
  id: string
  nombre: string
  descripcion: string
  ambito: string
  tipo_red: string
  imagen?: string
}

interface ProjectCarouselProps {
  projects: Project[]
}

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 6000, stopOnInteraction: true })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  if (!projects || projects.length === 0) return null

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-11px)] min-w-0"
            >
              <div className="glass-card rounded-xl border border-border/20 overflow-hidden group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {/* Image with overlay */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 overflow-hidden">
                  {project.imagen ? (
                    <Image
                      src={project.imagen}
                      alt={project.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                      💧
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1">{project.nombre}</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1 line-clamp-2">
                      {project.descripcion || "Red de agua potable"}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                      {project.ambito}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                      {project.tipo_red}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-background hover:border-primary/30 transition-all duration-200 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-background hover:border-primary/30 transition-all duration-200 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                ? "bg-primary w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
