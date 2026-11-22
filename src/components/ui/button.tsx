import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Figma: Button (node 8:3078)
 * Primary   = the one main action (blue + glow)
 * Secondary = glass
 * Ghost     = quiet actions
 * Danger    = red text, no fill (tint only on hover)
 * Pills, 40 high (small 32). Disabled = 45% opacity.
 */
const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,filter,opacity] duration-150",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary drop-shadow-primary-glow hover:bg-primary/90 active:bg-primary-dark",
        secondary:
          "border border-glass-edge bg-glass-surface text-text backdrop-blur-md hover:bg-hover active:bg-selection",
        ghost: "text-text hover:bg-hover active:bg-selection",
        danger: "text-destructive hover:bg-destructive-bg",
        link: "h-auto! px-0! text-link underline-offset-4 hover:underline",
        // Aliases so stock shadcn components (dialog, calendar, ...) keep working.
        default:
          "bg-primary text-on-primary drop-shadow-primary-glow hover:bg-primary/90 active:bg-primary-dark",
        outline:
          "border border-glass-edge bg-glass-surface text-text backdrop-blur-md hover:bg-hover active:bg-selection",
        destructive: "text-destructive hover:bg-destructive-bg",
      },
      size: {
        default:
          "h-10 px-[18px] text-button [&_svg:not([class*='size-'])]:size-[18px]",
        sm: "h-8 px-[14px] text-button-sm [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-[18px]",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
        // shadcn aliases
        lg: "h-10 px-[18px] text-button [&_svg:not([class*='size-'])]:size-[18px]",
        xs: "h-8 px-[14px] text-button-sm [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-[18px]",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Leading Figma icon; sized 18 (default) or 16 (small) automatically. */
    icon?: IconName
  }

const smallSizes = new Set(["sm", "xs", "icon-sm", "icon-xs"])

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  icon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const iconSize = smallSizes.has(size ?? "default") ? 16 : 18

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSize} />}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants, type ButtonProps }
