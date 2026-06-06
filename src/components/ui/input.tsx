import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl bg-[#F0EDE8] px-3.5 py-2 text-sm font-medium text-[#1D1D1D] placeholder:text-[#9CA3AF] transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/30",
        "shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]",
        "focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.08),inset_-3px_-3px_6px_rgba(255,255,255,0.85),0_0_0_2px_rgba(230,57,70,0.25)]",
        "md:text-sm dark:bg-[#1a1a24] dark:text-[#F1FAEE] dark:placeholder:text-[#6B7280]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
