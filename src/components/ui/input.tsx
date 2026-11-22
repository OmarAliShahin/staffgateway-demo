import * as React from "react"

import { fieldVariants } from "@/components/ui/field-variants"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  shape?: "default" | "pill"
}

/** Bare field box. Use `TextField` for label + hint + icons. */
function Input({ className, type, shape = "default", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldVariants({ shape }),
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-label file:text-text",
        className
      )}
      {...props}
    />
  )
}

export { Input, type InputProps }
