import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-secondary)] text-[var(--color-background)] hover:bg-[var(--color-primary)] hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none",
        outline:
          "border border-[var(--color-secondary)] bg-transparent text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-background)] hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none",
        secondary:
          "bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-secondary)] hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none",
        ghost: "text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 hover:transform hover:-translate-y-0.5 disabled:transform-none",
        link: "text-[var(--color-secondary)] underline-offset-4 hover:underline hover:text-[var(--color-primary)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
