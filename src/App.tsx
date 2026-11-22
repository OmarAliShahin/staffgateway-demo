import * as React from "react"
import { LanguagesIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { SelectItem } from "@/components/ui/select"
import { SelectField, TextareaField, TextField } from "@/components/ui/text-field"
import { strings } from "@/i18n/strings"
import { cn } from "@/lib/utils"
import { useLocale, useTheme, type Theme } from "@/providers/app-providers"

function Block({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-card border border-glass-edge bg-glass-surface p-card-mobile shadow-panel backdrop-blur-xl md:p-page">
      <header className="mb-6 flex flex-col gap-1">
        <h2 className="text-section-title text-text">{title}</h2>
        <p className="max-w-[1100px] text-caption text-text-muted">{description}</p>
      </header>
      {children}
    </section>
  )
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const { locale } = useLocale()
  const t = strings[locale].theme
  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: t.light, icon: <SunIcon /> },
    { value: "dark", label: t.dark, icon: <MoonIcon /> },
    { value: "system", label: t.system, icon: <MonitorIcon /> },
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-1 rounded-pill border border-glass-edge bg-glass-rail p-1 backdrop-blur-md"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={theme === o.value}
          onClick={() => setTheme(o.value)}
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-pill px-3 text-button-sm text-text-muted outline-none transition-colors",
            "hover:text-text focus-visible:outline-2 focus-visible:outline-primary [&_svg]:size-4",
            theme === o.value && "bg-active-pill text-text shadow-section-card"
          )}
        >
          {o.icon}
          <span className="max-sm:sr-only">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

function ButtonBlock() {
  const { locale } = useLocale()
  const t = strings[locale].button
  return (
    <Block title={t.title} description={t.description}>
      <div className="flex flex-wrap items-center gap-4">
        <Button icon="plus">{t.createOffer}</Button>
        <Button icon="plus" disabled>{t.createOffer}</Button>
        <Button icon="plus" size="sm">{t.createOffer}</Button>
        <Button icon="plus" size="sm" disabled>{t.createOffer}</Button>
        <Button variant="secondary" icon="plus">{t.importCsv}</Button>
        <Button variant="secondary" icon="plus" disabled>{t.importCsv}</Button>
        <Button variant="secondary" icon="plus" size="sm">{t.importCsv}</Button>
        <Button variant="secondary" icon="plus" size="sm" disabled>{t.importCsv}</Button>
        <Button variant="ghost">{t.cancel}</Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button variant="ghost" icon="plus" disabled>{t.cancel}</Button>
        <Button variant="ghost" size="sm">{t.cancel}</Button>
        <Button variant="ghost" size="sm" disabled>{t.cancel}</Button>
        <Button variant="danger" icon="trash">{t.delete}</Button>
        <Button variant="danger" icon="trash" disabled>{t.delete}</Button>
        <Button variant="danger" icon="trash" size="sm">{t.delete}</Button>
        <Button variant="danger" icon="trash" size="sm" disabled>{t.delete}</Button>
      </div>
    </Block>
  )
}

function TextFieldBlock() {
  const { locale } = useLocale()
  const t = strings[locale].textField
  const states = [
    { state: "default" },
    { state: "focus", forceFocus: true },
    { state: "error", error: true },
    { state: "disabled", disabled: true },
  ] as const
  // Drop the descriptor's name before spreading the rest onto the field.
  const stateProps = ({ state: _state, ...rest }: (typeof states)[number]) => rest
  const options = t.options.map((o) => (
    <SelectItem key={o} value={o}>
      {o}
    </SelectItem>
  ))

  return (
    <Block title={t.title} description={t.description}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        {/* Type=Input · Shape=Default */}
        {states.map((s) => (
          <TextField
            key={`input-${s.state}`}
            label={t.label}
            defaultValue={t.value}
            hint={t.hint}
            {...stateProps(s)}
            error={s.state === "error" ? t.required : undefined}
          />
        ))}

        {/* Type=Select */}
        {states.map((s) => (
          <SelectField
            key={`select-${s.state}`}
            label={t.label}
            defaultValue={t.value}
            hint={t.hint}
            {...stateProps(s)}
          >
            {options}
          </SelectField>
        ))}

        {/* Type=Textarea */}
        {states.map((s) => (
          <TextareaField
            key={`textarea-${s.state}`}
            label={t.label}
            defaultValue={t.value}
            hint={t.hint}
            {...stateProps(s)}
          />
        ))}

        {/* Type=Input · Shape=Pill · Width=Fill */}
        {states.map((s) => (
          <TextField
            key={`pill-${s.state}`}
            shape="pill"
            label={t.label}
            defaultValue={t.value}
            hint={t.hint}
            {...stateProps(s)}
          />
        ))}

        {/* Type=Input · Shape=Pill · Width=Short (+ unit) */}
        {states.map((s) => (
          <TextField
            key={`short-${s.state}`}
            shape="pill"
            width="short"
            label={t.distance}
            defaultValue="120"
            inputMode="decimal"
            unit={t.unit}
            hint={t.hint}
            {...stateProps(s)}
          />
        ))}
      </div>

      {/* Input options: leading icon, trailing icon (password), unit, action */}
      <div className="mt-section grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        <TextField
          label={t.email}
          type="email"
          placeholder="name@company.com"
          leadingIcon={<Icon name="mail" size={20} />}
          hint={t.emailHint}
          required
        />
        <TextField label={t.password} type="password" defaultValue="hunter22" />
        <TextField label={t.distance} defaultValue="120" unit={t.unit} inputMode="decimal" />
        <TextField
          label={t.label}
          defaultValue={t.value}
          action={{ label: t.add }}
          shape="pill"
        />
      </div>
    </Block>
  )
}

const tokenGroups: { title: string; tokens: string[] }[] = [
  { title: "Brand", tokens: ["primary", "primary-dark", "on-primary"] },
  {
    title: "Surfaces and text",
    tokens: [
      "background", "text", "text-secondary", "text-muted", "link", "glass-surface",
      "glass-rail", "glass-edge", "glass-nested", "popover", "selection", "active-pill",
      "chip", "chip-edge", "hover", "hairline", "input-edge", "field", "opaque", "scrim",
      "card-section", "section-bg",
    ],
  },
  {
    title: "Status",
    tokens: [
      "success", "success-bg", "warning", "warning-bg", "destructive", "destructive-bg",
      "info", "info-bg", "neutral", "neutral-bg", "unread",
    ],
  },
  { title: "Tag", tokens: ["walaa", "walaa-bg", "direct", "direct-bg"] },
  {
    title: "Chart",
    tokens: [
      "chart-positive", "chart-neutral", "chart-negative", "chart-track",
      "chart-series-2", "chart-series-3", "chart-series-4", "chart-series-5",
    ],
  },
]

function TokenBlock() {
  const { locale } = useLocale()
  const t = strings[locale].tokens
  return (
    <Block title={t.title} description={t.description}>
      <div className="flex flex-col gap-6">
        {tokenGroups.map((g) => (
          <div key={g.title} dir="ltr">
            <h3 className="mb-2 text-label text-text-muted">{g.title}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {g.tokens.map((token) => (
                <div
                  key={token}
                  className="rounded-block border border-glass-edge bg-glass-nested p-2.5"
                >
                  <div
                    className="h-10 rounded-icon-box border border-hairline"
                    style={{ background: `var(--${token})` }}
                  />
                  <p className="mt-2 truncate text-label text-text">{token}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Block>
  )
}

export default function App() {
  const { locale, setLocale } = useLocale()
  const t = strings[locale]

  React.useEffect(() => {
    document.title = `${t.appTitle} · ${t.appSubtitle}`
  }, [t])

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-section px-page-mobile py-page md:px-page">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-section-title font-medium text-text">{t.appTitle}</h1>
          <p className="text-caption text-text-muted">{t.appSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitch />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            lang={locale === "en" ? "ar" : "en"}
          >
            <LanguagesIcon />
            {t.language}
          </Button>
        </div>
      </header>

      <ButtonBlock />
      <TextFieldBlock />
      <TokenBlock />
    </div>
  )
}
