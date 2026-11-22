import * as React from "react"
import { Direction } from "radix-ui"

/* ------------------------------------------------------------------ Theme */

export type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const THEME_KEY = "sg-theme"
const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return allowed.includes(value as T) ? (value as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable (private mode etc.) — preference just won't persist */
  }
}

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)")

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    readStored(THEME_KEY, ["light", "dark", "system"] as const, "system")
  )
  const [systemDark, setSystemDark] = React.useState(() => systemQuery().matches)

  React.useEffect(() => {
    const mq = systemQuery()
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme

  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", resolvedTheme === "dark")
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: Theme) => {
    writeStored(THEME_KEY, next)
    setThemeState(next)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <AppProviders>")
  return ctx
}

/* ------------------------------------------------------- Locale / direction */

export type Locale = "en" | "ar"

type LocaleContextValue = {
  locale: Locale
  dir: "ltr" | "rtl"
  setLocale: (locale: Locale) => void
}

const LOCALE_KEY = "sg-locale"
const LocaleContext = React.createContext<LocaleContextValue | null>(null)

function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() =>
    readStored(LOCALE_KEY, ["en", "ar"] as const, "en")
  )
  const dir = locale === "ar" ? "rtl" : "ltr"

  React.useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  const setLocale = React.useCallback((next: Locale) => {
    writeStored(LOCALE_KEY, next)
    setLocaleState(next)
  }, [])

  const value = React.useMemo(() => ({ locale, dir, setLocale }) as const, [locale, dir, setLocale])
  return (
    <LocaleContext.Provider value={value}>
      {/* Radix primitives (Select, menus, ...) read direction from here. */}
      <Direction.Provider dir={dir}>{children}</Direction.Provider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used inside <AppProviders>")
  return ctx
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  )
}
