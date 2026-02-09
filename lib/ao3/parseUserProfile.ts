import type { WorkBlurb } from './types'
import { parseWorkBlurb } from './parseWorkList'

export interface UserFandom {
  name: string
  url: string
  count: number
}

export interface DashboardLink {
  label: string
  url: string
  isCurrent: boolean
}

export interface UserProfile {
  username: string
  avatarUrl: string
  bio?: string
  dashboardLinks: DashboardLink[]
  fandoms: UserFandom[]
  recentWorks: WorkBlurb[]
}

export function parseUserProfile(doc: Document): UserProfile {
  const username =
    doc.querySelector('.primary.header h2.heading')?.textContent?.trim() ?? ''

  const avatarImg = doc.querySelector('.primary.header .icon img')
  const avatarUrl = avatarImg?.getAttribute('src') ?? ''

  const bioEl = doc.querySelector('.bio blockquote')
  const bio = bioEl?.innerHTML?.trim() || undefined

  // Dashboard navigation links (includes current page as <span class="current">)
  const dashboardLinks: DashboardLink[] = Array.from(
    doc.querySelectorAll('#dashboard ul.navigation.actions li'),
  ).map((li) => {
    const a = li.querySelector('a')
    const span = li.querySelector('span.current')
    return {
      label: (a ?? span)?.textContent?.trim() ?? '',
      url: a?.getAttribute('href') ?? '',
      isCurrent: !!span,
    }
  })

  // Fandoms
  const fandomBox = doc.querySelector('.fandom.listbox')
  const fandoms: UserFandom[] = fandomBox
    ? Array.from(fandomBox.querySelectorAll('ol.index li')).map((li) => {
        const a = li.querySelector('a')
        const text = li.textContent ?? ''
        const countMatch = text.match(/\((\d+)\)/)
        return {
          name: a?.textContent?.trim() ?? '',
          url: a?.getAttribute('href') ?? '',
          count: parseInt(countMatch?.[1] ?? '0', 10) || 0,
        }
      })
    : []

  // Recent works
  const workBlurbs = doc.querySelectorAll('.work.listbox li.work.blurb')
  const recentWorks = Array.from(workBlurbs).map(parseWorkBlurb)

  return { username, avatarUrl, bio, dashboardLinks, fandoms, recentWorks }
}
