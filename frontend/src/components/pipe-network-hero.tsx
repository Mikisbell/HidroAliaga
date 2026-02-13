"use client"

import { motion } from "framer-motion"
import { HydraulicFlowAnimation } from "./hydraulic-flow-animation"

export function PipeNetworkHero() {
  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden glass-card border border-border/20">
      {/* Background animation */}
      <HydraulicFlowAnimation />

      {/* Network diagram overlay */}
      <div className="relative z-10 w-full h-full p-8">
        <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          {/* Main reservoir */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="100" cy="200" r="30" fill="oklch(0.60 0.18 230)" opacity="0.2" />
            <circle cx="100" cy="200" r="25" fill="oklch(0.60 0.18 230)" />
            <text x="100" y="205" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">R1</text>
          </motion.g>

          {/* Pipes with flow animation */}
          <motion.line
            x1="130" y1="200" x2="300" y2="200"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          <motion.line
            x1="300" y1="200" x2="450" y2="100"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          
          <motion.line
            x1="300" y1="200" x2="450" y2="300"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />

          <motion.line
            x1="450" y1="100" x2="600" y2="100"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          />

          <motion.line
            x1="450" y1="300" x2="600" y2="300"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          />

          <motion.line
            x1="600" y1="100" x2="700" y2="150"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2 }}
          />

          <motion.line
            x1="600" y1="300" x2="700" y2="250"
            stroke="oklch(0.60 0.18 230)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2 }}
          />

          {/* Nodes */}
          {[
            { x: 300, y: 200, label: "N1", delay: 1 },
            { x: 450, y: 100, label: "N2", delay: 1.5 },
            { x: 450, y: 300, label: "N3", delay: 1.5 },
            { x: 600, y: 100, label: "N4", delay: 2 },
            { x: 600, y: 300, label: "N5", delay: 2 },
            { x: 700, y: 150, label: "N6", delay: 2.5 },
            { x: 700, y: 250, label: "N7", delay: 2.5 },
          ].map((node, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: node.delay }}
            >
              <circle cx={node.x} cy={node.y} r="15" fill="oklch(0.65 0.18 160)" opacity="0.2" />
              <circle cx={node.x} cy={node.y} r="12" fill="oklch(0.65 0.18 160)" />
              <text x={node.x} y={node.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                {node.label}
              </text>
            </motion.g>
          ))}

          {/* Flow indicators */}
          <motion.circle
            cx="130"
            cy="200"
            r="3"
            fill="oklch(0.75 0.20 230)"
            animate={{
              cx: [130, 300, 450, 600, 700],
              cy: [200, 200, 100, 100, 150],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="glass-card px-3 py-2 rounded-lg border border-border/20">
          <p className="text-xs text-muted-foreground">Presión Promedio</p>
          <p className="text-lg font-bold text-blue-400">28.5 m.c.a.</p>
        </div>
        <div className="glass-card px-3 py-2 rounded-lg border border-border/20">
          <p className="text-xs text-muted-foreground">Velocidad Promedio</p>
          <p className="text-lg font-bold text-green-400">1.8 m/s</p>
        </div>
        <div className="glass-card px-3 py-2 rounded-lg border border-border/20">
          <p className="text-xs text-muted-foreground">Nodos</p>
          <p className="text-lg font-bold text-purple-400">7</p>
        </div>
      </div>
    </div>
  )
}
