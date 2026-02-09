import { describe, expect, it } from 'vitest'
import { parseUserProfile, parseDashboardLinks } from './parseUserProfile'
import profileHtml from './__fixtures__/user-profile.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseUserProfile', () => {
  const doc = parseHTML(profileHtml)
  const result = parseUserProfile(doc)

  it('should parse username', () => {
    expect(result.username).toBe('testuser')
  })

  it('should parse avatar URL', () => {
    expect(result.avatarUrl).toBe(
      '/images/skins/iconsets/default/icon_user.png',
    )
  })

  it('should parse bio', () => {
    expect(result.bio).toContain('Hello, I write fanfic!')
  })

  it('should parse join date', () => {
    expect(result.joinDate).toBe('2020-06-15')
  })

  it('should parse user ID', () => {
    expect(result.userIdNum).toBe('12345')
  })

  it('should parse pseuds', () => {
    expect(result.pseuds).toHaveLength(2)
    expect(result.pseuds[0]).toEqual({ name: 'testuser', url: '/users/testuser/pseuds/testuser' })
    expect(result.pseuds[1]).toEqual({ name: 'altpseud', url: '/users/testuser/pseuds/altpseud' })
  })

  it('should parse dashboard links', () => {
    expect(result.dashboardLinks.length).toBeGreaterThan(0)
    const profileLink = result.dashboardLinks.find(
      (l) => l.label === 'Profile',
    )
    expect(profileLink).toBeDefined()
    expect(profileLink!.isCurrent).toBe(true)
  })

  it('should mark non-current dashboard links', () => {
    const dashboardLink = result.dashboardLinks.find(
      (l) => l.label === 'Dashboard',
    )
    expect(dashboardLink).toBeDefined()
    expect(dashboardLink!.isCurrent).toBe(false)
    expect(dashboardLink!.url).toBe('/users/testuser')
  })

  it('should parse fandoms', () => {
    expect(result.fandoms).toHaveLength(3)
    expect(result.fandoms[0]).toEqual({
      name: 'Marvel Cinematic Universe',
      url: '/users/testuser/works?fandom_id=100',
      count: 8,
    })
    expect(result.fandoms[1]).toEqual({
      name: 'Supernatural',
      url: '/users/testuser/works?fandom_id=200',
      count: 5,
    })
  })

  it('should parse recent works', () => {
    expect(result.recentWorks).toHaveLength(2)
    expect(result.recentWorks[0].title).toBe('Stars Above')
    expect(result.recentWorks[0].id).toBe('50001')
    expect(result.recentWorks[1].title).toBe('The Road Not Taken')
    expect(result.recentWorks[1].id).toBe('50002')
  })

  it('should parse work stats', () => {
    const work = result.recentWorks[0]
    expect(work.stats.words).toBe(3456)
    expect(work.stats.chapters).toBe('1/1')
    expect(work.stats.kudos).toBe(120)
  })
})

describe('parseDashboardLinks', () => {
  const doc = parseHTML(profileHtml)
  const links = parseDashboardLinks(doc)

  it('should include links from all sections', () => {
    const labels = links.map((l) => l.label)
    expect(labels).toContain('Dashboard')
    expect(labels).toContain('Profile')
    expect(labels).toContain('Works (15)')
    expect(labels).toContain('Bookmarks (42)')
    expect(labels).toContain('Statistics')
  })
})
