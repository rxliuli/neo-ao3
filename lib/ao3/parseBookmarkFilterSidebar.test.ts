import { describe, expect, it } from 'vitest'
import { parseBookmarkFilterSidebar } from './parseBookmarkFilterSidebar'
import bookmarksHtml from './__fixtures__/user-bookmarks.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseBookmarkFilterSidebar', () => {
  const doc = parseHTML(bookmarksHtml)
  const sidebar = parseBookmarkFilterSidebar(doc)

  it('should return non-null for page with bookmark-filters form', () => {
    expect(sidebar).not.toBeNull()
  })

  it('should return null when no form found', () => {
    const emptyDoc = parseHTML('<html><body></body></html>')
    expect(parseBookmarkFilterSidebar(emptyDoc)).toBeNull()
  })

  describe('include tags', () => {
    it('should parse include ratings', () => {
      expect(sidebar!.includeRatings).toHaveLength(3)
      expect(sidebar!.includeRatings[0]).toEqual({ id: '10', name: 'General Audiences', count: 15 })
    })

    it('should parse include fandoms', () => {
      expect(sidebar!.includeFandoms).toHaveLength(3)
      expect(sidebar!.includeFandoms[0]).toEqual({ id: '27', name: 'Marvel Cinematic Universe', count: 20 })
    })

    it('should parse include characters', () => {
      expect(sidebar!.includeCharacters).toHaveLength(3)
      expect(sidebar!.includeCharacters[0]).toEqual({ id: '501', name: 'Steve Rogers', count: 18 })
    })

    it('should parse include relationships', () => {
      expect(sidebar!.includeRelationships).toHaveLength(2)
      expect(sidebar!.includeRelationships[0]).toEqual({ id: '601', name: 'Steve Rogers/Tony Stark', count: 10 })
    })

    it('should parse include freeforms', () => {
      expect(sidebar!.includeFreeforms).toHaveLength(2)
      expect(sidebar!.includeFreeforms[0]).toEqual({ id: '701', name: 'Fluff', count: 12 })
    })

    it('should parse include bookmarker tags', () => {
      expect(sidebar!.includeBookmarkerTags).toHaveLength(3)
      expect(sidebar!.includeBookmarkerTags[0]).toEqual({ id: '801', name: 'favorites', count: 25 })
      expect(sidebar!.includeBookmarkerTags[2]).toEqual({ id: '803', name: 'comfort fic', count: 5 })
    })
  })

  describe('exclude tags', () => {
    it('should parse exclude ratings', () => {
      expect(sidebar!.excludeRatings).toHaveLength(2)
      expect(sidebar!.excludeRatings[0]).toEqual({ id: '13', name: 'Explicit', count: 8 })
    })

    it('should parse exclude warnings', () => {
      expect(sidebar!.excludeWarnings).toHaveLength(2)
    })

    it('should parse exclude categories', () => {
      expect(sidebar!.excludeCategories).toHaveLength(1)
    })

    it('should parse exclude fandoms', () => {
      expect(sidebar!.excludeFandoms).toHaveLength(1)
    })

    it('should parse exclude characters', () => {
      expect(sidebar!.excludeCharacters).toHaveLength(1)
    })

    it('should parse exclude relationships', () => {
      expect(sidebar!.excludeRelationships).toHaveLength(1)
    })

    it('should parse exclude freeforms', () => {
      expect(sidebar!.excludeFreeforms).toHaveLength(1)
    })

    it('should parse exclude bookmarker tags', () => {
      expect(sidebar!.excludeBookmarkerTags).toHaveLength(1)
      expect(sidebar!.excludeBookmarkerTags[0]).toEqual({ id: '803', name: 'comfort fic', count: 5 })
    })
  })
})
