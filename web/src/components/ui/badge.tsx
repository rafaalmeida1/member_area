import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D8C4A4] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#D8C4A4] text-white hover:bg-[#DBCFCB]",
        secondary:
          "border-transparent bg-[#DBCFCB] text-white hover:bg-[#D8C4A4]",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "border-[#D8C4A4] text-[#D8C4A4] bg-transparent hover:bg-[#D8C4A4] hover:text-white",
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
