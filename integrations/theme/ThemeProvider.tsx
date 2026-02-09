import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
} from 'next-themes'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemeProvider
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      attribute="class"
      enableSystem
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
}

export const useTheme = useNextTheme
