import { describe, expect, it } from 'vitest'
import {
  parseBookmarkFilterParams,
  buildBookmarkFilterUrl,
  defaultBookmarkFilterState,
} from './parseBookmarkFilterParams'

describe('parseBookmarkFilterParams', () => {
  it('should return defaults for URL with no params', () => {
    const state = parseBookmarkFilterParams('https://archiveofourown.org/users/testuser/bookmarks')
    expect(state.sortColumn).toBe('created_at')
    expect(state.query).toBe('')
    expect(state.bookmarkQuery).toBe('')
    expect(state.rec).toBe('')
    expect(state.withNotes).toBe('')
    expect(state.includeFandomIds).toEqual([])
    expect(state.excludeBookmarkerTagIds).toEqual([])
  })

  it('should parse sort column', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?bookmark_search[sort_column]=bookmarkable_date',
    )
    expect(state.sortColumn).toBe('bookmarkable_date')
  })

  it('should parse rec and with_notes', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?bookmark_search[rec]=1&bookmark_search[with_notes]=1',
    )
    expect(state.rec).toBe('1')
    expect(state.withNotes).toBe('1')
  })

  it('should parse queries', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?bookmark_search[bookmarkable_query]=fluff&bookmark_search[bookmark_query]=favorite',
    )
    expect(state.query).toBe('fluff')
    expect(state.bookmarkQuery).toBe('favorite')
  })

  it('should parse word count range', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?bookmark_search[bookmarkable_word_count]=1000-50000',
    )
    expect(state.wordCountFrom).toBe('1000')
    expect(state.wordCountTo).toBe('50000')
  })

  it('should parse include tag IDs', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?include_bookmark_search[fandom_ids][]=27&include_bookmark_search[tag_ids][]=801',
    )
    expect(state.includeFandomIds).toEqual(['27'])
    expect(state.includeBookmarkerTagIds).toEqual(['801'])
  })

  it('should parse exclude tag IDs', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?exclude_bookmark_search[rating_ids][]=13&exclude_bookmark_search[tag_ids][]=803',
    )
    expect(state.excludeRatingIds).toEqual(['13'])
    expect(state.excludeBookmarkerTagIds).toEqual(['803'])
  })

  it('should parse text tag inputs', () => {
    const state = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?bookmark_search[other_tag_names]=fluff&bookmark_search[other_bookmark_tag_names]=favs',
    )
    expect(state.otherTagsToInclude).toBe('fluff')
    expect(state.otherBookmarkTagsToInclude).toBe('favs')
  })
})

describe('buildBookmarkFilterUrl', () => {
  const baseUrl = 'https://archiveofourown.org/users/testuser/bookmarks'

  it('should build URL with default state (only sort)', () => {
    const state = defaultBookmarkFilterState()
    const url = buildBookmarkFilterUrl(baseUrl, state)
    expect(url).toContain('bookmark_search%5Bsort_column%5D=created_at')
  })

  it('should include rec and with_notes when set', () => {
    const state = { ...defaultBookmarkFilterState(), rec: '1', withNotes: '1' }
    const url = buildBookmarkFilterUrl(baseUrl, state)
    expect(url).toContain('bookmark_search%5Brec%5D=1')
    expect(url).toContain('bookmark_search%5Bwith_notes%5D=1')
  })

  it('should include word count', () => {
    const state = { ...defaultBookmarkFilterState(), wordCountFrom: '1000', wordCountTo: '50000' }
    const url = buildBookmarkFilterUrl(baseUrl, state)
    expect(url).toContain('bookmark_search%5Bbookmarkable_word_count%5D=1000-50000')
  })

  it('should remove page param', () => {
    const state = defaultBookmarkFilterState()
    const url = buildBookmarkFilterUrl(baseUrl + '?page=3', state)
    expect(url).not.toContain('page=')
  })

  it('should round-trip parse → build → parse', () => {
    const original = parseBookmarkFilterParams(
      'https://archiveofourown.org/users/testuser/bookmarks?bookmark_search[sort_column]=word_count&bookmark_search[rec]=1&bookmark_search[bookmarkable_query]=test&include_bookmark_search[fandom_ids][]=27&exclude_bookmark_search[tag_ids][]=803&bookmark_search[bookmarkable_word_count]=100-5000',
    )
    const rebuilt = buildBookmarkFilterUrl(baseUrl, original)
    const reparsed = parseBookmarkFilterParams(rebuilt)
    expect(reparsed.sortColumn).toBe(original.sortColumn)
    expect(reparsed.rec).toBe(original.rec)
    expect(reparsed.query).toBe(original.query)
    expect(reparsed.includeFandomIds).toEqual(original.includeFandomIds)
    expect(reparsed.excludeBookmarkerTagIds).toEqual(original.excludeBookmarkerTagIds)
    expect(reparsed.wordCountFrom).toBe(original.wordCountFrom)
    expect(reparsed.wordCountTo).toBe(original.wordCountTo)
  })
})
