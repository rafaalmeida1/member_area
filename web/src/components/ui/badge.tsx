import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-secondary)] text-[var(--color-background)] hover:bg-[var(--color-primary)]",
        secondary:
          "border-transparent bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-secondary)]",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "border-[var(--color-secondary)] text-[var(--color-secondary)] bg-transparent hover:bg-[var(--color-secondary)] hover:text-[var(--color-background)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
