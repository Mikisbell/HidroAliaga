"use client"

export function HeroNetwork() {
    return (
        <div className="relative mt-12 mb-8">
            <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto transform hover:scale-[1.02] transition-all duration-500">
                {/* Visual abstracto de red hidráulica */}
                <svg viewBox="0 0 800 200" className="w-full h-auto opacity-80">
                    <defs>
                        <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="oklch(0.65 0.20 230 / 0.3)" />
                            <stop offset="50%" stopColor="oklch(0.70 0.18 210 / 0.6)" />
                            <stop offset="100%" stopColor="oklch(0.65 0.20 230 / 0.3)" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Líneas principales de tuberías */}
                    <line x1="50" y1="100" x2="750" y2="100" stroke="url(#pipeGradient)" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Ramales verticales */}
                    <line x1="200" y1="100" x2="200" y2="50" stroke="oklch(0.65 0.18 230 / 0.4)" strokeWidth="3" strokeLinecap="round" />
                    <line x1="400" y1="100" x2="400" y2="150" stroke="oklch(0.65 0.18 230 / 0.4)" strokeWidth="3" strokeLinecap="round" />
                    <line x1="600" y1="100" x2="600" y2="50" stroke="oklch(0.65 0.18 230 / 0.4)" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Nodos principales (círculos pulsantes) */}
                    {[100, 300, 500, 700].map((x, i) => (
                        <g key={i}>
                            {/* Halo */}
                            <circle cx={x} cy={100} r="12" fill="oklch(0.65 0.18 230 / 0.2)">
                                <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                                <animate attributeName="opacity" values="0.2;0.1;0.2" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                            </circle>
                            {/* Nodo */}
                            <circle cx={x} cy={100} r="8" fill="oklch(0.65 0.18 230)" filter="url(#glow)">
                                <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                            </circle>
                        </g>
                    ))}
                    
                    {/* Nodos secundarios */}
                    <circle cx="200" cy="50" r="6" fill="oklch(0.70 0.15 170)" />
                    <circle cx="400" cy="150" r="6" fill="oklch(0.70 0.15 170)" />
                    <circle cx="600" cy="50" r="6" fill="oklch(0.70 0.15 170)" />
                    
                    {/* Flujo animado (líneas punteadas moviéndose) */}
                    <line x1="100" y1="100" x2="300" y2="100" stroke="oklch(0.75 0.20 230 / 0.8)" strokeWidth="2" strokeDasharray="10,10">
                        <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" />
                    </line>
                    <line x1="300" y1="100" x2="500" y2="100" stroke="oklch(0.75 0.20 230 / 0.8)" strokeWidth="2" strokeDasharray="10,10">
                        <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" begin="0.3s" />
                    </line>
                    <line x1="500" y1="100" x2="700" y2="100" stroke="oklch(0.75 0.20 230 / 0.8)" strokeWidth="2" strokeDasharray="10,10">
                        <animate attributeName="stroke-dashoffset" values="0;20" dur="1s" repeatCount="indefinite" begin="0.6s" />
                    </line>
                    
                    {/* Etiquetas */}
                    <text x="400" y="30" textAnchor="middle" fill="oklch(0.6 0.02 250)" fontSize="12" opacity="0.7" fontWeight="500">
                        Red de Distribución Hidráulica
                    </text>
                    <text x="100" y="130" textAnchor="middle" fill="oklch(0.6 0.18 230)" fontSize="10" opacity="0.6">
                        Nudo 1
                    </text>
                    <text x="300" y="130" textAnchor="middle" fill="oklch(0.6 0.18 230)" fontSize="10" opacity="0.6">
                        Nudo 2
                    </text>
                    <text x="500" y="130" textAnchor="middle" fill="oklch(0.6 0.18 230)" fontSize="10" opacity="0.6">
                        Nudo 3
                    </text>
                    <text x="700" y="130" textAnchor="middle" fill="oklch(0.6 0.18 230)" fontSize="10" opacity="0.6">
                        Nudo 4
                    </text>
                </svg>
                
                {/* Métricas flotantes */}
                <div className="absolute -right-2 top-4 glass-card px-3 py-2 rounded-lg text-xs animate-pulse">
                    <span className="text-green-400">●</span> Hardy Cross Active
                </div>
                <div className="absolute -left-2 bottom-4 glass-card px-3 py-2 rounded-lg text-xs">
                    <span className="text-blue-400">●</span> RNE OS.050
                </div>
            </div>
        </div>
    )
}
