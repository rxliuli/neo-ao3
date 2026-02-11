export type Route =
  | { type: 'home' }
  | { type: 'tag-page' }
  | { type: 'work-list' }
  | { type: 'work-detail'; workId: string }
  | { type: 'comment-show'; workId: string; commentId: string }
  | { type: 'fandom-list' }
  | { type: 'user-bookmarks' }
  | { type: 'user-preferences' }
  | { type: 'user-profile' }
  | { type: 'user-history' }
  | { type: 'user-inbox' }
  | { type: 'user-stats' }
  | { type: 'login' }

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

  // Single comment: /works/{id}/comments/{commentId}
  const commentMatch = path.match(/^\/works\/(\d+)\/comments\/(\d+)$/)
  if (commentMatch) {
    return { type: 'comment-show', workId: commentMatch[1], commentId: commentMatch[2] }
  }

  // Work detail: /works/{id} or /works/{id}/chapters/{chapterId}
  const workDetailMatch = path.match(/^\/works\/(\d+)(\/chapters\/\d+)?$/)
  if (workDetailMatch) {
    return { type: 'work-detail', workId: workDetailMatch[1] }
  }

  // Tag page: /tags/{tagName} (bare tag, no sub-path like /works)
  if (/^\/tags\/[^/]+$/.test(path)) {
    return { type: 'tag-page' }
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

  // Login/Logout: let AO3 handle these natively
  if (path === '/users/login') {
    return { type: 'login' }
  }
  if (path === '/users/logout') {
    return null
  }

  // User bookmarks: /users/{name}/bookmarks, /users/{name}/pseuds/{pseudo}/bookmarks
  if (/^\/users\/[^/]+(\/pseuds\/[^/]+)?\/bookmarks/.test(path)) {
    return { type: 'user-bookmarks' }
  }

  // User preferences: /users/{name}/preferences
  if (/^\/users\/[^/]+\/preferences$/.test(path)) {
    return { type: 'user-preferences' }
  }

  // User history/readings: /users/{name}/readings
  if (/^\/users\/[^/]+\/readings/.test(path)) {
    return { type: 'user-history' }
  }

  // User inbox: /users/{name}/inbox
  if (/^\/users\/[^/]+\/inbox$/.test(path)) {
    return { type: 'user-inbox' }
  }

  // User stats: /users/{name}/stats
  if (/^\/users\/[^/]+\/stats$/.test(path)) {
    return { type: 'user-stats' }
  }

  // User profile: /users/{name}, /users/{name}/profile, /users/{name}/pseuds/{pseudo}[/profile]
  if (/^\/users\/[^/]+(\/pseuds\/[^/]+)?(\/profile)?$/.test(path)) {
    return { type: 'user-profile' }
  }

  return null
}
