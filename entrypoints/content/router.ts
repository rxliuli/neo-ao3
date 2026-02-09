export type Route =
  | { type: 'home' }
  | { type: 'work-list' }
  | { type: 'work-detail'; workId: string }
  | { type: 'fandom-list' }
  | { type: 'user-profile' }

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

  // Work list: /tags/*/works, /works/search, /users/*/works, /users/*/pseuds/*/works
  if (
    /^\/tags\/[^/]+\/works/.test(path) ||
    /^\/works\/search/.test(path) ||
    /^\/users\/[^/]+\/(pseuds\/[^/]+\/)?works/.test(path)
  ) {
    return { type: 'work-list' }
  }

  // Fandom list: /media/*/fandoms
  if (/^\/media\/[^/]+\/fandoms/.test(path)) {
    return { type: 'fandom-list' }
  }

  // User profile: /users/{name}, /users/{name}/profile, /users/{name}/pseuds/{pseudo}[/profile]
  if (/^\/users\/[^/]+(\/pseuds\/[^/]+)?(\/profile)?$/.test(path)) {
    return { type: 'user-profile' }
  }

  return null
}
