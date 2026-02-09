import { createContext, useContext } from 'react'

const UrlContext = createContext<string>(window.location.href)

export const UrlProvider = UrlContext.Provider

export function useCurrentUrl() {
  return useContext(UrlContext)
}
