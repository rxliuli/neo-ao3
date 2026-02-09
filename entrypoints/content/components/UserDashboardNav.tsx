import { useMemo } from 'react'
import type { DashboardLink } from '@/lib/ao3/parseUserProfile'
import { useCurrentUrl } from '../hooks/useCurrentUrl'

/** Priority order for dashboard tabs — most-used first */
const TAB_ORDER = [
  'Dashboard',
  'Profile',
  'Works',
  'Bookmarks',
  'History',
  'Inbox',
  'Statistics',
  'Series',
  'Drafts',
  'Collections',
  'Preferences',
  'Skins',
]

function tabPriority(label: string): number {
  const idx = TAB_ORDER.findIndex((prefix) => label.startsWith(prefix))
  return idx === -1 ? TAB_ORDER.length : idx
}

export function UserDashboardNav({ links }: { links: DashboardLink[] }) {
  const currentUrl = useCurrentUrl()
  const currentPath = useMemo(() => {
    try {
      return new URL(currentUrl).pathname
    } catch {
      return ''
    }
  }, [currentUrl])

  const sorted = useMemo(
    () => [...links].sort((a, b) => tabPriority(a.label) - tabPriority(b.label)),
    [links],
  )

  if (sorted.length === 0) return null

  return (
    <nav className="flex gap-1 border-b overflow-x-auto">
      {sorted.map((link) => {
        const linkPath = new URL(link.url, window.location.origin).pathname
        const isCurrent = linkPath === currentPath

        return isCurrent ? (
          <span
            key={link.label}
            className="text-sm px-3 py-2 border-b-2 border-primary font-medium shrink-0"
          >
            {link.label}
          </span>
        ) : (
          <a
            key={link.url}
            href={link.url}
            className="text-sm px-3 py-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted-foreground/30 shrink-0"
          >
            {link.label}
          </a>
        )
      })}
    </nav>
  )
}
