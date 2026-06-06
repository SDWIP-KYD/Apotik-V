import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#E63946] text-white shadow-[0_4px_14px_rgba(230,57,70,0.35)] hover:bg-[#d4303c] hover:shadow-[0_6px_20px_rgba(230,57,70,0.45)] active:shadow-[0_2px_8px_rgba(230,57,70,0.3)]",
        outline:
          "bg-white/60 backdrop-blur-sm border border-white/70 text-[#1D3557] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] aria-expanded:bg-white/80",
        secondary:
          "bg-[#1D3557] text-white shadow-[0_4px_14px_rgba(29,53,87,0.3)] hover:bg-[#162a45] hover:shadow-[0_6px_18px_rgba(29,53,87,0.4)] aria-expanded:bg-[#1D3557]",
        ghost:
          "text-[#1D3557]/70 hover:bg-white/50 hover:text-[#1D3557] aria-expanded:bg-white/50",
        destructive:
          "bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946]/20 focus-visible:ring-destructive/30",
        link: "text-[#E63946] underline-offset-4 hover:underline",
        neu: "neu-btn text-[#1D3557] rounded-xl",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-xl has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-lg in-data-[slot=button-group]:rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-xl",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
