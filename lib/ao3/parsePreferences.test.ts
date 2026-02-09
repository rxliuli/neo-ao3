import { describe, expect, it } from 'vitest'
import { parsePreferences } from './parsePreferences'
import preferencesHtml from './__fixtures__/user-preferences.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parsePreferences', () => {
  const doc = parseHTML(preferencesHtml)
  const result = parsePreferences(doc)

  it('should parse authenticity token', () => {
    expect(result.authenticityToken).toBe('test_csrf_token_abc123')
  })

  it('should parse form action', () => {
    expect(result.formAction).toBe('/users/testuser/preferences')
  })

  it('should parse all sections', () => {
    expect(result.sections).toHaveLength(5)
    expect(result.sections.map((s) => s.legend)).toEqual([
      'Privacy',
      'Display',
      'Comments',
      'Collections, Challenges, and Gifts',
      'Miscellaneous',
    ])
  })

  describe('Privacy section', () => {
    const section = () => result.sections[0]

    it('should parse 3 fields', () => {
      expect(section().fields).toHaveLength(3)
    })

    it('should parse unchecked checkbox', () => {
      const field = section().fields[0]
      expect(field.name).toBe('preference[minimize_search_engines]')
      expect(field.label).toBe(
        'Hide my work from search engines when possible',
      )
      expect(field.type).toBe('checkbox')
      expect(field.value).toBe(false)
    })

    it('should parse checked checkbox', () => {
      const field = section().fields[1]
      expect(field.name).toBe('preference[disable_share_links]')
      expect(field.type).toBe('checkbox')
      expect(field.value).toBe(true)
    })
  })

  describe('Display section', () => {
    const section = () => result.sections[1]

    it('should parse checkboxes and selects', () => {
      const types = section().fields.map((f) => f.type)
      expect(types).toContain('checkbox')
      expect(types).toContain('select')
    })

    it('should parse select with options', () => {
      const skinField = section().fields.find(
        (f) => f.name === 'preference[skin_id]',
      )
      expect(skinField).toBeDefined()
      expect(skinField!.type).toBe('select')
      expect(skinField!.value).toBe('1') // Reversi is selected
      expect(skinField!.options).toHaveLength(3)
      expect(skinField!.options![0]).toEqual({ value: '', label: 'Default' })
      expect(skinField!.options![1]).toEqual({
        value: '1',
        label: 'Reversi',
      })
    })

    it('should parse time zone select', () => {
      const tzField = section().fields.find(
        (f) => f.name === 'preference[time_zone]',
      )
      expect(tzField).toBeDefined()
      expect(tzField!.value).toBe('Pacific Time (US & Canada)')
    })
  })

  describe('Comments section', () => {
    const section = () => result.sections[2]

    it('should parse 5 comment fields', () => {
      expect(section().fields).toHaveLength(5)
    })

    it('should parse kudos emails off as checked', () => {
      const field = section().fields.find(
        (f) => f.name === 'preference[kudos_emails_off]',
      )
      expect(field).toBeDefined()
      expect(field!.value).toBe(true)
    })
  })

  describe('Miscellaneous section', () => {
    const section = () => result.sections[4]

    it('should parse history enabled as checked', () => {
      const field = section().fields.find(
        (f) => f.name === 'preference[history_enabled]',
      )
      expect(field).toBeDefined()
      expect(field!.value).toBe(true)
    })
  })
})
