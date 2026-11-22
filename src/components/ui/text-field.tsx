import * as React from "react"
import { EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fieldVariants } from "@/components/ui/field-variants"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/* --------------------------------------------------------------------------
 * Figma "Text field" (node 8:3132)
 * Label above (sentence case), field 40 high, hint or error below.
 * Required fields show a red asterisk. Disabled fades the whole field to 50%.
 *
 * Typography per Figma variant:
 *  - Input · Shape=Default    → label 13 Medium, hint 12.5 (Caption)
 *  - Input · Shape=Pill,
 *    Select, Textarea         → label 14 Medium, hint 12 / 18
 * ------------------------------------------------------------------------ */

type FieldTypography = "compact" | "regular"

type FieldShellProps = {
  id: string
  label?: React.ReactNode
  hint?: React.ReactNode
  /** `true` turns the hint red; a string replaces the hint with the message. */
  error?: boolean | string
  required?: boolean
  disabled?: boolean
  typography: FieldTypography
  className?: string
  children: React.ReactNode
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  disabled,
  typography,
  className,
  children,
}: FieldShellProps) {
  const message = typeof error === "string" && error ? error : hint
  return (
    <div
      data-slot="text-field"
      data-disabled={disabled || undefined}
      data-invalid={error ? true : undefined}
      className={cn(
        "flex w-full flex-col items-stretch gap-1.5",
        disabled && "opacity-50",
        className
      )}
    >
      {label && (
        <Label
          htmlFor={id}
          className={cn(typography === "regular" && "text-body font-medium")}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {message && (
        <p
          id={`${id}-hint`}
          className={cn(
            typography === "compact" ? "text-caption" : "text-hint",
            error ? "text-destructive" : "text-text-muted"
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}

type SharedFieldProps = {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: boolean | string
  /** Renders the Focus state without real focus (docs / showcases only). */
  forceFocus?: boolean
  className?: string
}

function describedBy(id: string, hint?: React.ReactNode, error?: boolean | string) {
  return hint || (typeof error === "string" && error) ? `${id}-hint` : undefined
}

/* ------------------------------------------------------------------ Input */

type TextFieldProps = SharedFieldProps &
  Omit<React.ComponentProps<"input">, "className"> & {
    shape?: "default" | "pill"
    /** Short = 140px field for a short value with a unit beside it (Pill). */
    width?: "fill" | "short"
    leadingIcon?: React.ReactNode
    trailingIcon?: React.ReactNode
    /** Suffix next to the field, e.g. "meters". */
    unit?: React.ReactNode
    /** Exposed action button next to the field, e.g. Add. */
    action?: { label: React.ReactNode; onClick?: () => void }
    inputClassName?: string
  }

function TextField({
  id: idProp,
  label,
  hint,
  error,
  required,
  disabled,
  forceFocus,
  className,
  inputClassName,
  shape = "default",
  width = "fill",
  leadingIcon,
  trailingIcon,
  unit,
  action,
  type = "text",
  ...inputProps
}: TextFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  const [revealed, setRevealed] = React.useState(false)
  const isPassword = type === "password"
  const effectiveType = isPassword && revealed ? "text" : type

  const trailing =
    trailingIcon ??
    (isPassword ? (
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        disabled={disabled}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        className="-me-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-pill text-text-muted outline-none hover:bg-hover focus-visible:outline-2 focus-visible:outline-primary"
      >
        {revealed ? <EyeOffIcon className="size-5" strokeWidth={2} /> : <Icon name="eye" size={20} />}
      </button>
    ) : null)

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      typography={shape === "pill" ? "regular" : "compact"}
      className={className}
    >
      <div data-slot="text-field-row" className="flex w-full items-center gap-2.5">
        <div
          data-focused={forceFocus || undefined}
          className={cn(
            fieldVariants({ shape }),
            "cursor-text",
            width === "short" ? "w-[140px] shrink-0" : "flex-1",
            error && "border-destructive text-text-muted"
          )}
          onMouseDown={(e) => {
            // Clicking the padding/icon area focuses the input.
            if (e.target === e.currentTarget) {
              e.preventDefault()
              e.currentTarget.querySelector("input")?.focus()
            }
          }}
        >
          {leadingIcon && (
            <span className="flex shrink-0 text-text-muted [&_svg]:size-5">
              {leadingIcon}
            </span>
          )}
          <input
            id={id}
            type={effectiveType}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className={cn(
              "h-full w-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-text-muted disabled:cursor-not-allowed",
              inputClassName
            )}
            {...inputProps}
          />
          {trailing && (
            <span className="flex shrink-0 text-text-muted [&_svg]:size-5">
              {trailing}
            </span>
          )}
        </div>
        {unit && (
          <span className="shrink-0 text-body whitespace-nowrap text-text-secondary">
            {unit}
          </span>
        )}
        {action && (
          <Button
            type="button"
            variant="secondary"
            icon="plus"
            disabled={disabled}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </FieldShell>
  )
}

/* --------------------------------------------------------------- Textarea */

type TextareaFieldProps = SharedFieldProps &
  Omit<React.ComponentProps<"textarea">, "className"> & {
    textareaClassName?: string
  }

function TextareaField({
  id: idProp,
  label,
  hint,
  error,
  required,
  disabled,
  forceFocus,
  className,
  textareaClassName,
  ...props
}: TextareaFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      typography="regular"
      className={className}
    >
      <Textarea
        id={id}
        required={required}
        disabled={disabled}
        data-focused={forceFocus || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={textareaClassName}
        {...props}
      />
    </FieldShell>
  )
}

/* ----------------------------------------------------------------- Select */

type SelectFieldProps = SharedFieldProps &
  Omit<React.ComponentProps<typeof Select>, "children"> & {
    id?: string
    placeholder?: React.ReactNode
    /** `<SelectItem>` elements. */
    children: React.ReactNode
    triggerClassName?: string
  }

function SelectField({
  id: idProp,
  label,
  hint,
  error,
  required,
  disabled,
  forceFocus,
  className,
  triggerClassName,
  placeholder,
  children,
  ...selectProps
}: SelectFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      typography="regular"
      className={className}
    >
      <Select disabled={disabled} required={required} {...selectProps}>
        <SelectTrigger
          id={id}
          data-focused={forceFocus || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={triggerClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FieldShell>
  )
}

export { SelectField, TextareaField, TextField }
export type { SelectFieldProps, TextareaFieldProps, TextFieldProps }
