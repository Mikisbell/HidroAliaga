"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        return (
            <div className="relative inline-flex items-center justify-center w-4 h-4 align-middle">
                <input
                    type="checkbox"
                    className={cn(
                        "peer appearance-none h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground transition-colors",
                        className
                    )}
                    ref={ref}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    {...props}
                />
                <Check className="h-3 w-3 absolute text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
