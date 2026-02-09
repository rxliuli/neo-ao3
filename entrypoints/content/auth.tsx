import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CurrentUser } from '@/lib/ao3/parseLoginForm'

const CurrentUserContext = createContext<CurrentUser | null>(null)
const SetCurrentUserContext = createContext<(user: CurrentUser | null) => void>(() => {})

export function CurrentUserProviderWithState({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null
  children: ReactNode
}) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(initialUser)

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}

export function useSetCurrentUser() {
  return useContext(SetCurrentUserContext)
}
