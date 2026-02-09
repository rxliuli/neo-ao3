import { describe, expect, it } from 'vitest'
import { parseBookmarkList } from './parseBookmarkList'
import bookmarksHtml from './__fixtures__/user-bookmarks.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseBookmarkList', () => {
  const doc = parseHTML(bookmarksHtml)
  const result = parseBookmarkList(doc)

  it('should parse the correct number of bookmarks', () => {
    expect(result.bookmarks).toHaveLength(2)
  })

  describe('bookmark 1 (recommended, with tags and notes)', () => {
    const bm = result.bookmarks[0]

    it('should parse bookmark ID', () => {
      expect(bm.bookmarkId).toBe('90001')
    })

    it('should parse bookmarked work title', () => {
      expect(bm.work.title).toBe('Midnight Sun')
    })

    it('should parse bookmarked work author', () => {
      expect(bm.work.authors).toEqual([
        { name: 'authorone', url: '/users/authorone/pseuds/authorone' },
      ])
    })

    it('should parse bookmarked work fandoms', () => {
      expect(bm.work.fandoms).toEqual(['Marvel Cinematic Universe'])
    })

    it('should parse bookmarked work rating', () => {
      expect(bm.work.rating).toBe('Teen And Up Audiences')
    })

    it('should parse bookmarked work stats', () => {
      expect(bm.work.stats.words).toBe(5200)
      expect(bm.work.stats.chapters).toBe('1/1')
      expect(bm.work.stats.kudos).toBe(340)
    })

    it('should parse bookmarker name', () => {
      expect(bm.bookmark.bookmarkerName).toBe('testuser')
    })

    it('should parse bookmark date', () => {
      expect(bm.bookmark.bookmarkDate).toBe('25 Nov 2024')
    })

    it('should detect rec status', () => {
      expect(bm.bookmark.isRec).toBe(true)
    })

    it('should parse bookmarker tags', () => {
      expect(bm.bookmark.bookmarkerTags).toEqual(['favorites', 'to reread'])
    })

    it('should parse bookmarker notes', () => {
      expect(bm.bookmark.bookmarkerNotes).toContain(
        'One of my all-time favorite fics!',
      )
    })
  })

  describe('bookmark 2 (plain bookmark, no notes/tags)', () => {
    const bm = result.bookmarks[1]

    it('should parse bookmark ID', () => {
      expect(bm.bookmarkId).toBe('90002')
    })

    it('should parse bookmarked work title', () => {
      expect(bm.work.title).toBe('Echoes of Tomorrow')
    })

    it('should parse multiple authors', () => {
      expect(bm.work.authors).toHaveLength(2)
      expect(bm.work.authors[0].name).toBe('authortwo')
      expect(bm.work.authors[1].name).toBe('authorthree')
    })

    it('should parse multiple fandoms', () => {
      expect(bm.work.fandoms).toEqual(['Supernatural', 'Harry Potter'])
    })

    it('should have no rec', () => {
      expect(bm.bookmark.isRec).toBe(false)
    })

    it('should have no bookmarker tags', () => {
      expect(bm.bookmark.bookmarkerTags).toEqual([])
    })

    it('should have no bookmarker notes', () => {
      expect(bm.bookmark.bookmarkerNotes).toBeUndefined()
    })
  })

  describe('pagination', () => {
    it('should parse current page', () => {
      expect(result.pagination.currentPage).toBe(1)
    })

    it('should parse total pages', () => {
      expect(result.pagination.totalPages).toBe(3)
    })
  })
})
