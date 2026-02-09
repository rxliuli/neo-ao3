import { createContext, useContext } from 'react'

const NavigationContext = createContext<(url: string) => void>(() => {
  throw new Error('NavigationContext not provided')
})

export const NavigationProvider = NavigationContext.Provider

export function useNavigate() {
  return useContext(NavigationContext)
}
