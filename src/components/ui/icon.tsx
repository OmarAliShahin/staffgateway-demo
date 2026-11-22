import * as React from "react"

import chevronDown16 from "@/assets/icons/chevron-down-16.svg"
import eye20 from "@/assets/icons/eye-20.svg"
import mail20 from "@/assets/icons/mail-20.svg"
import plus16 from "@/assets/icons/plus-16.svg"
import plus18 from "@/assets/icons/plus-18.svg"
import trash16 from "@/assets/icons/trash-16.svg"
import trash18 from "@/assets/icons/trash-18.svg"
import { cn } from "@/lib/utils"

/**
 * Icons exported from Figma. The SVG files ship with light-mode stroke colors
 * baked in, so they're drawn as a CSS mask filled with `currentColor`:
 * the exact Figma geometry, but the color follows the text token
 * (and therefore light/dark mode).
 *
 * Each icon has a native size; `size` picks the matching Figma export.
 */
const icons = {
  plus: { 16: plus16, 18: plus18 },
  trash: { 16: trash16, 18: trash18 },
  mail: { 20: mail20 },
  eye: { 20: eye20 },
  "chevron-down": { 16: chevronDown16 },
} as const

type IconName = keyof typeof icons
type IconSize = 16 | 18 | 20

function pickSource(name: IconName, size: IconSize) {
  const sources = icons[name] as Partial<Record<IconSize, string>>
  if (sources[size]) return sources[size]
  // Fall back to the closest export; the mask scales it cleanly.
  const available = Object.keys(sources).map(Number) as IconSize[]
  const closest = available.sort(
    (a, b) => Math.abs(a - size) - Math.abs(b - size)
  )[0]
  return sources[closest]!
}

type IconProps = Omit<React.ComponentProps<"span">, "children"> & {
  name: IconName
  size?: IconSize
}

function Icon({ name, size = 18, className, style, ...props }: IconProps) {
  const src = pickSource(name, size)
  return (
    <span
      data-slot="icon"
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        width: size,
        height: size,
        maskImage: `url("${src}")`,
        maskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        ...style,
      }}
      {...props}
    />
  )
}

export { Icon, type IconName, type IconSize }
