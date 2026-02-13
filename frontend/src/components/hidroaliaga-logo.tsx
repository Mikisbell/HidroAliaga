interface HidroaliagaLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
}

export function HidroaliagaLogo({ size = "md", showText = true, className = "" }: HidroaliagaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG inline para mejor control */}
      <div className={sizeClasses[size]}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0891b2", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Gota izquierda */}
          <path 
            d="M 22 12 C 22 12, 14 20, 14 28 C 14 35, 18 40, 24 40 C 30 40, 34 35, 34 28 C 34 20, 26 12, 22 12 Z"
            fill="url(#iconGradient)"
          />
          
          {/* Gota derecha */}
          <path 
            d="M 42 20 C 42 20, 34 28, 34 36 C 34 43, 38 48, 44 48 C 50 48, 54 43, 54 36 C 54 28, 46 20, 42 20 Z"
            fill="url(#iconGradient)"
          />
          
          {/* Brillo */}
          <ellipse cx="20" cy="20" rx="3" ry="5" fill="white" opacity="0.4"/>
          <ellipse cx="40" cy="28" rx="3" ry="5" fill="white" opacity="0.4"/>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Hidroaliaga
          </span>
          <span className="text-xs text-muted-foreground -mt-1">by Aron Aliaga</span>
        </div>
      )}
    </div>
  )
}
