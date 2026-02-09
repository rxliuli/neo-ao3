import { describe, expect, it } from 'vitest'
import { parseWorkList } from './parseWorkList'
import workListHtml from './__fixtures__/work-list.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseWorkList', () => {
  const doc = parseHTML(workListHtml)
  const result = parseWorkList(doc)

  it('should parse the correct number of works', () => {
    expect(result.works).toHaveLength(2)
  })

  describe('work 1 (multi-chapter WIP)', () => {
    const work = result.works[0]

    it('should parse id', () => {
      expect(work.id).toBe('10001')
    })

    it('should parse title', () => {
      expect(work.title).toBe('The Long Journey Home')
    })

    it('should parse multiple authors', () => {
      expect(work.authors).toEqual([
        { name: 'alice', url: '/users/alice/pseuds/alice' },
        { name: 'bob', url: '/users/bob/pseuds/bob' },
      ])
    })

    it('should parse multiple fandoms', () => {
      expect(work.fandoms).toEqual(['Test Fandom', 'Another Fandom'])
    })

    it('should parse rating', () => {
      expect(work.rating).toBe('Explicit')
    })

    it('should parse warnings from required-tags', () => {
      expect(work.warnings).toEqual(['Graphic Depictions Of Violence'])
    })

    it('should parse categories', () => {
      expect(work.categories).toEqual(['M/M'])
    })

    it('should parse completion status', () => {
      expect(work.complete).toBe(false)
    })

    it('should parse date', () => {
      expect(work.date).toBe('2025-01-01')
    })

    it('should parse tags', () => {
      expect(work.tags.warnings).toEqual([
        'Graphic Depictions Of Violence',
      ])
      expect(work.tags.relationships).toEqual([
        'Character A/Character B',
        'Character C & Character D',
      ])
      expect(work.tags.characters).toEqual(['Character A', 'Character B'])
      expect(work.tags.freeforms).toEqual([
        'Slow Burn',
        'Angst',
        'Hurt/Comfort',
      ])
    })

    it('should parse summary as HTML', () => {
      expect(work.summary).toContain(
        '<p>This is the summary of the first work.</p>',
      )
      expect(work.summary).toContain(
        '<p>It has multiple paragraphs.</p>',
      )
    })

    it('should parse series info', () => {
      expect(work.series).toEqual([
        {
          id: '5001',
          name: 'The Epic Series',
          part: 3,
          url: '/series/5001',
        },
      ])
    })

    it('should parse stats', () => {
      expect(work.stats).toEqual({
        words: 60156,
        chapters: '17/?',
        comments: 42,
        kudos: 350,
        bookmarks: 85,
        hits: 12345,
      })
    })

    it('should parse language', () => {
      expect(work.language).toBe('English')
    })
  })

  describe('work 2 (single-chapter complete)', () => {
    const work = result.works[1]

    it('should parse id', () => {
      expect(work.id).toBe('10002')
    })

    it('should parse title', () => {
      expect(work.title).toBe('A Short Story')
    })

    it('should parse single author', () => {
      expect(work.authors).toEqual([
        { name: 'carol', url: '/users/carol/pseuds/carol' },
      ])
    })

    it('should parse single fandom', () => {
      expect(work.fandoms).toEqual(['Original Work'])
    })

    it('should parse rating', () => {
      expect(work.rating).toBe('Teen And Up Audiences')
    })

    it('should parse complete status', () => {
      expect(work.complete).toBe(true)
    })

    it('should have no warning/relationship/character tags', () => {
      expect(work.tags.warnings).toEqual([])
      expect(work.tags.relationships).toEqual([])
      expect(work.tags.characters).toEqual([])
    })

    it('should parse freeform tags', () => {
      expect(work.tags.freeforms).toEqual(['One Shot', 'Fluff'])
    })

    it('should have empty series', () => {
      expect(work.series).toEqual([])
    })

    it('should parse stats with missing optional fields as 0', () => {
      expect(work.stats.words).toBe(2500)
      expect(work.stats.chapters).toBe('1/1')
      expect(work.stats.comments).toBe(0)
      expect(work.stats.kudos).toBe(10)
      expect(work.stats.bookmarks).toBe(0)
      expect(work.stats.hits).toBe(200)
    })

    it('should parse non-English language', () => {
      expect(work.language).toBe('中文-普通话 國語')
    })
  })

  describe('pagination', () => {
    it('should parse current page', () => {
      expect(result.pagination.currentPage).toBe(1)
    })

    it('should parse total pages', () => {
      expect(result.pagination.totalPages).toBe(250)
    })
  })
})
