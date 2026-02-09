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

export interface Pseud {
  name: string
  url: string
}

export interface UserProfile {
  username: string
  avatarUrl: string
  bio?: string
  joinDate?: string
  userIdNum?: string
  pseuds: Pseud[]
  dashboardLinks: DashboardLink[]
  fandoms: UserFandom[]
  recentWorks: WorkBlurb[]
}

export function parseDashboardLinks(doc: Document): DashboardLink[] {
  return Array.from(
    doc.querySelectorAll('#dashboard ul.navigation.actions li'),
  )
    .filter((li) => !li.querySelector('ul')) // skip pseudo-dropdown items with nested <ul>
    .map((li) => {
      const a = li.querySelector('a')
      const span = li.querySelector('span.current')
      return {
        label: (a ?? span)?.textContent?.trim() ?? '',
        url: a?.getAttribute('href') ?? '',
        isCurrent: !!span,
      }
    })
}

export function parseUserProfile(doc: Document): UserProfile {
  const username =
    doc.querySelector('.primary.header h2.heading')?.textContent?.trim() ?? ''

  const avatarImg = doc.querySelector('.primary.header .icon img')
  const avatarUrl = avatarImg?.getAttribute('src') ?? ''

  const bioEl = doc.querySelector('.bio.module blockquote.userstuff')
  const bio = bioEl?.innerHTML?.trim() || undefined

  // Meta info (pseuds, join date, user ID)
  let joinDate: string | undefined
  let userIdNum: string | undefined
  const pseuds: Pseud[] = []
  const dtEls = doc.querySelectorAll('dl.meta dt')
  for (const dt of dtEls) {
    const text = dt.textContent?.trim() ?? ''
    const dd = dt.nextElementSibling
    if (!dd) continue
    if (text.includes('pseuds')) {
      for (const a of dd.querySelectorAll('a')) {
        pseuds.push({
          name: a.textContent?.trim() ?? '',
          url: a.getAttribute('href') ?? '',
        })
      }
    } else if (text.includes('joined on')) {
      joinDate = dd.textContent?.trim()
    } else if (text.includes('user ID')) {
      userIdNum = dd.textContent?.trim()
    }
  }

  const dashboardLinks = parseDashboardLinks(doc)

  // Fandoms
  const fandoms: UserFandom[] = Array.from(
    doc.querySelectorAll('#user-fandoms ol.index li'),
  ).map((li) => {
    const a = li.querySelector('a')
    const text = li.textContent ?? ''
    const countMatch = text.match(/\((\d+)\)/)
    return {
      name: a?.textContent?.trim() ?? '',
      url: a?.getAttribute('href') ?? '',
      count: parseInt(countMatch?.[1] ?? '0', 10) || 0,
    }
  })

  // Recent works
  const workBlurbs = doc.querySelectorAll('#user-works li.work.blurb')
  const recentWorks = Array.from(workBlurbs).map(parseWorkBlurb)

  return {
    username,
    avatarUrl,
    bio,
    joinDate,
    userIdNum,
    pseuds,
    dashboardLinks,
    fandoms,
    recentWorks,
  }
}
