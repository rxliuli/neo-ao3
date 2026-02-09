export type Route =
  | { type: 'home' }
  | { type: 'work-list' }
  | { type: 'work-detail'; workId: string }
  | { type: 'fandom-list' }

export function matchRoute(url: string): Route | null {
  const u = new URL(url)
  if (u.hostname !== 'archiveofourown.org') return null

  // Allow viewing original page via URL param
  if (u.searchParams.has('neo-ao3-original')) return null

  const path = u.pathname

  // Home page
  if (path === '/') {
    return { type: 'home' }
  }

  // Work detail: /works/{id} or /works/{id}/chapters/{chapterId}
  const workDetailMatch = path.match(/^\/works\/(\d+)(\/chapters\/\d+)?$/)
  if (workDetailMatch) {
    return { type: 'work-detail', workId: workDetailMatch[1] }
  }

  // Work list: /tags/*/works or /works/search
  if (/^\/tags\/[^/]+\/works/.test(path) || /^\/works\/search/.test(path)) {
    return { type: 'work-list' }
  }

  // Fandom list: /media/*/fandoms
  if (/^\/media\/[^/]+\/fandoms/.test(path)) {
    return { type: 'fandom-list' }
  }

  return null
}
