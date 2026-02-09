import { createContext, useContext } from 'react'
import type { CurrentUser } from '@/lib/ao3/parseLoginForm'

const CurrentUserContext = createContext<CurrentUser | null>(null)

export const CurrentUserProvider = CurrentUserContext.Provider

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
