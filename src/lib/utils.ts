import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge must know the design-system font sizes, otherwise a size
 * token (`text-label`) and a color token (`text-text-muted`) are seen as the
 * same group and one of them gets dropped.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "section-title",
            "body",
            "label",
            "caption",
            "hint",
            "button",
            "button-sm",
          ],
        },
      ],
      shadow: [{ shadow: ["panel", "lift", "section-card"] }],
      "drop-shadow": [{ "drop-shadow": ["primary-glow"] }],
      rounded: [
        {
          rounded: [
            "card",
            "block",
            "chart-box",
            "field",
            "textarea",
            "icon-box",
            "tick",
            "pill",
            "section-card",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
