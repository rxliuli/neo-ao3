import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { DashboardLink } from '@/lib/ao3/parseUserProfile'
import { UserDashboardNav } from './UserDashboardNav'

const SetDashboardLinksContext = createContext<Dispatch<SetStateAction<DashboardLink[]>> | null>(null)

export function useSetDashboardLinks() {
  const ctx = useContext(SetDashboardLinksContext)
  if (!ctx) throw new Error('useSetDashboardLinks must be used inside UserDashboardLayout')
  return ctx
}

export function useSetDashboardLinksOptional() {
  return useContext(SetDashboardLinksContext)
}

export function UserDashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const [links, setLinks] = useState<DashboardLink[]>([])
  return (
    <SetDashboardLinksContext.Provider value={setLinks}>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {links.length > 0 && <UserDashboardNav links={links} />}
        {children}
      </div>
    </SetDashboardLinksContext.Provider>
  )
}
