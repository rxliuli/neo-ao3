import { describe, expect, it } from 'vitest'
import { parseLoginForm, parseCurrentUser } from './parseLoginForm'
import loginHtml from './__fixtures__/login.html?raw'
import loggedInHtml from './__fixtures__/logged-in-page.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseLoginForm', () => {
  const doc = parseHTML(loginHtml)

  it('should parse authenticity token', () => {
    const result = parseLoginForm(doc)
    expect(result.authenticityToken).toBe('abc123token456def')
  })

  it('should throw when no token found', () => {
    const emptyDoc = parseHTML('<html><body></body></html>')
    expect(() => parseLoginForm(emptyDoc)).toThrow(
      'Could not find authenticity_token',
    )
  })
})

describe('parseCurrentUser', () => {
  it('should parse logged-in user', () => {
    const doc = parseHTML(loggedInHtml)
    const user = parseCurrentUser(doc)
    expect(user).toEqual({
      username: 'testuser',
      url: '/users/testuser',
      avatarUrl: '/images/skins/iconsets/default/icon_user.png',
    })
  })

  it('should return null for logged-out page', () => {
    const doc = parseHTML(loginHtml)
    const user = parseCurrentUser(doc)
    expect(user).toBeNull()
  })
})
