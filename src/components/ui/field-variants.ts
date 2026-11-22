import { cva, type VariantProps } from "class-variance-authority"

/**
 * The field box from Figma "Text field" (node 8:3132).
 *  - 40 high, field fill, 1px input-edge border
 *  - Shape=Default: radius 14 · Shape=Pill: radius 999 · Textarea: radius 20, min 96
 *  - Focus: 2px primary border (drawn as border + 1px inset ring so the
 *    content never shifts by a pixel)
 *  - Error: destructive border, value in text-muted
 *
 * Works on the control itself (`focus-visible`, `aria-invalid`) or on a
 * wrapper around it (`has-[...]`) when the field has icons.
 * `data-focused` lets docs/showcases render the focus state statically.
 */
export const fieldVariants = cva(
  [
    "flex w-full min-w-0 border border-input-edge bg-field text-body text-text backdrop-blur-md",
    "transition-[border-color,box-shadow] duration-150 outline-none",
    "placeholder:text-text-muted [&_input::placeholder]:text-text-muted",
    // focus (control or wrapper)
    "focus-visible:border-primary focus-visible:shadow-[inset_0_0_0_1px_var(--color-primary)]",
    "has-[:focus-visible]:border-primary has-[:focus-visible]:shadow-[inset_0_0_0_1px_var(--color-primary)]",
    "data-[focused=true]:border-primary data-[focused=true]:shadow-[inset_0_0_0_1px_var(--color-primary)]",
    // error
    "aria-invalid:border-destructive aria-invalid:text-text-muted aria-invalid:shadow-none",
    "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:text-text-muted",
    // disabled (the TextField wrapper also fades label + hint)
    "disabled:cursor-not-allowed disabled:text-text-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:text-text-muted",
  ],
  {
    variants: {
      shape: {
        default: "h-10 items-center gap-2 rounded-field px-[14px]",
        pill: "h-10 items-center gap-2 rounded-pill ps-[13px] pe-[14px]",
        textarea:
          "field-sizing-content min-h-24 resize-y rounded-textarea px-[13px] py-[10px]",
      },
    },
    defaultVariants: { shape: "default" },
  }
)

export type FieldShape = NonNullable<VariantProps<typeof fieldVariants>["shape"]>
