import * as React from "react"

import { fieldVariants } from "@/components/ui/field-variants"
import { cn } from "@/lib/utils"

/** Textarea: min 96 high, radius 20, wraps. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldVariants({ shape: "textarea" }), className)}
      {...props}
    />
  )
}

export { Textarea }
