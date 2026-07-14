import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-control h-auto min-h-24 field-sizing-content px-4 py-3",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
