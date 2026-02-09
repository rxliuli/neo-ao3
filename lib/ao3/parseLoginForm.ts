export interface LoginForm {
  authenticityToken: string
}

export interface CurrentUser {
  username: string
  url: string
  avatarUrl: string
}

export function parseLoginForm(doc: Document): LoginForm {
  const token = doc.querySelector<HTMLInputElement>(
    'input[name="authenticity_token"]',
  )
  if (!token?.value) {
    throw new Error('Could not find authenticity_token in login form')
  }
  return { authenticityToken: token.value }
}

export function parseCurrentUser(doc: Document): CurrentUser | null {
  // AO3 uses id="greeting" on the logged-in user dropdown
  const greetingEl =
    doc.querySelector('#greeting') ?? doc.querySelector('.greeting')
  if (!greetingEl) return null

  const link = greetingEl.querySelector('a[href^="/users/"]')
  if (!link) return null

  const url = link.getAttribute('href')!
  const match = url.match(/^\/users\/([^/]+)/)
  if (!match) return null

  const img = greetingEl.querySelector('img')
  const avatarUrl = img?.getAttribute('src') ?? ''

  return {
    username: match[1],
    url,
    avatarUrl,
  }
}
