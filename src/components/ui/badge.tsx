import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#E63946] text-white shadow-[0_2px_8px_rgba(230,57,70,0.3)]",
        secondary:
          "bg-[#1D3557] text-white shadow-[0_2px_8px_rgba(29,53,87,0.25)]",
        destructive:
          "bg-[#E63946]/10 text-[#E63946] focus-visible:ring-destructive/30",
        outline:
          "border border-[#1D3557]/15 text-[#1D3557] bg-white/50 backdrop-blur-sm",
        ghost:
          "text-[#1D3557]/60 hover:bg-white/50",
        link: "text-[#E63946] underline-offset-4 hover:underline",
        success:
          "bg-[#2A9D8F] text-white shadow-[0_2px_8px_rgba(42,157,143,0.3)]",
        warning:
          "bg-[#F4A261] text-[#1D1D1D] shadow-[0_2px_8px_rgba(244,162,97,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
