import { describe, expect, it } from 'vitest'
import { parseFilterSidebar } from './parseFilterSidebar'
import { parseFilterParams, buildFilterUrl, defaultFilterState } from './parseFilterParams'
import fixtureHtml from './__fixtures__/work-list-with-filters.html?raw'
import workListHtml from './__fixtures__/work-list.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseFilterSidebar', () => {
  const doc = parseHTML(fixtureHtml)
  const sidebar = parseFilterSidebar(doc)

  it('should return a sidebar object for tag pages', () => {
    expect(sidebar).not.toBeNull()
  })

  it('should return null for pages without filter form', () => {
    const noFilterDoc = parseHTML(workListHtml)
    expect(parseFilterSidebar(noFilterDoc)).toBeNull()
  })

  describe('include tag groups', () => {
    it('should parse include fandoms', () => {
      expect(sidebar!.includeFandoms).toEqual([
        { id: '27', name: 'Supernatural', count: 5000 },
        { id: '143', name: 'Marvel Cinematic Universe', count: 150 },
        { id: '289', name: 'Sherlock (TV)', count: 75 },
      ])
    })

    it('should parse include characters', () => {
      expect(sidebar!.includeCharacters).toHaveLength(4)
      expect(sidebar!.includeCharacters[0]).toEqual({
        id: '501',
        name: 'Dean Winchester',
        count: 4200,
      })
      expect(sidebar!.includeCharacters[3]).toEqual({
        id: '504',
        name: 'Bobby Singer',
        count: 500,
      })
    })

    it('should parse include relationships', () => {
      expect(sidebar!.includeRelationships).toEqual([
        { id: '601', name: 'Castiel/Dean Winchester', count: 2500 },
        { id: '602', name: 'Dean Winchester/Sam Winchester', count: 800 },
      ])
    })

    it('should parse include freeforms', () => {
      expect(sidebar!.includeFreeforms).toEqual([
        { id: '701', name: 'Angst', count: 1500 },
        { id: '702', name: 'Fluff', count: 1200 },
        { id: '703', name: 'Hurt/Comfort', count: 900 },
      ])
    })
  })

  describe('exclude tag groups', () => {
    it('should parse exclude ratings', () => {
      expect(sidebar!.excludeRatings).toEqual([
        { id: '13', name: 'Explicit', count: 1800 },
        { id: '12', name: 'Mature', count: 900 },
      ])
    })

    it('should parse exclude warnings', () => {
      expect(sidebar!.excludeWarnings).toHaveLength(3)
      expect(sidebar!.excludeWarnings[0]).toEqual({
        id: '17',
        name: 'Graphic Depictions Of Violence',
        count: 600,
      })
    })

    it('should parse exclude categories', () => {
      expect(sidebar!.excludeCategories).toHaveLength(2)
    })

    it('should parse exclude fandoms', () => {
      expect(sidebar!.excludeFandoms).toEqual([
        { id: '143', name: 'Marvel Cinematic Universe', count: 150 },
      ])
    })

    it('should parse exclude characters', () => {
      expect(sidebar!.excludeCharacters).toEqual([
        { id: '504', name: 'Bobby Singer', count: 500 },
      ])
    })

    it('should parse exclude relationships', () => {
      expect(sidebar!.excludeRelationships).toEqual([
        { id: '602', name: 'Dean Winchester/Sam Winchester', count: 800 },
      ])
    })

    it('should parse exclude freeforms', () => {
      expect(sidebar!.excludeFreeforms).toEqual([
        { id: '701', name: 'Angst', count: 1500 },
      ])
    })
  })
})

describe('parseFilterParams extended fields', () => {
  it('should parse crossover param', () => {
    const state = parseFilterParams('https://archiveofourown.org/tags/Test/works?work_search[crossover]=F')
    expect(state.crossover).toBe('F')
  })

  it('should parse date range', () => {
    const state = parseFilterParams('https://archiveofourown.org/tags/Test/works?work_search[date_from]=2024-01-01&work_search[date_to]=2024-12-31')
    expect(state.dateFrom).toBe('2024-01-01')
    expect(state.dateTo).toBe('2024-12-31')
  })

  it('should parse other tag names', () => {
    const state = parseFilterParams('https://archiveofourown.org/tags/Test/works?work_search[other_tag_names]=fluff,angst&work_search[excluded_tag_names]=smut')
    expect(state.otherTagsToInclude).toBe('fluff,angst')
    expect(state.otherTagsToExclude).toBe('smut')
  })

  it('should parse include tag IDs on tag pages', () => {
    const state = parseFilterParams('https://archiveofourown.org/tags/Test/works?include_work_search[fandom_ids][]=27&include_work_search[character_ids][]=501&include_work_search[relationship_ids][]=601&include_work_search[freeform_ids][]=701')
    expect(state.includeFandomIds).toEqual(['27'])
    expect(state.includeCharacterIds).toEqual(['501'])
    expect(state.includeRelationshipIds).toEqual(['601'])
    expect(state.includeFreeformIds).toEqual(['701'])
  })

  it('should parse exclude tag IDs on tag pages', () => {
    const state = parseFilterParams('https://archiveofourown.org/tags/Test/works?exclude_work_search[rating_ids][]=13&exclude_work_search[fandom_ids][]=143&exclude_work_search[character_ids][]=504&exclude_work_search[relationship_ids][]=602&exclude_work_search[freeform_ids][]=701&exclude_work_search[archive_warning_ids][]=17&exclude_work_search[category_ids][]=23')
    expect(state.excludeRatingIds).toEqual(['13'])
    expect(state.excludeWarningIds).toEqual(['17'])
    expect(state.excludeCategoryIds).toEqual(['23'])
    expect(state.excludeFandomIds).toEqual(['143'])
    expect(state.excludeCharacterIds).toEqual(['504'])
    expect(state.excludeRelationshipIds).toEqual(['602'])
    expect(state.excludeFreeformIds).toEqual(['701'])
  })

  it('should not parse include/exclude tag IDs on search pages', () => {
    const state = parseFilterParams('https://archiveofourown.org/works/search?include_work_search[fandom_ids][]=27')
    expect(state.includeFandomIds).toEqual([])
  })
})

describe('buildFilterUrl extended fields', () => {
  it('should serialize crossover param', () => {
    const state = { ...defaultFilterState(), crossover: 'F' }
    const url = buildFilterUrl('https://archiveofourown.org/tags/Test/works', state)
    expect(url).toContain('work_search%5Bcrossover%5D=F')
  })

  it('should serialize date range', () => {
    const state = { ...defaultFilterState(), dateFrom: '2024-01-01', dateTo: '2024-12-31' }
    const url = buildFilterUrl('https://archiveofourown.org/tags/Test/works', state)
    expect(url).toContain('work_search%5Bdate_from%5D=2024-01-01')
    expect(url).toContain('work_search%5Bdate_to%5D=2024-12-31')
  })

  it('should serialize text tag names', () => {
    const state = { ...defaultFilterState(), otherTagsToInclude: 'fluff', otherTagsToExclude: 'smut' }
    const url = buildFilterUrl('https://archiveofourown.org/tags/Test/works', state)
    expect(url).toContain('work_search%5Bother_tag_names%5D=fluff')
    expect(url).toContain('work_search%5Bexcluded_tag_names%5D=smut')
  })

  it('should serialize include/exclude tag IDs on tag pages', () => {
    const state = {
      ...defaultFilterState(),
      includeFandomIds: ['27'],
      includeCharacterIds: ['501'],
      excludeRatingIds: ['13'],
      excludeFandomIds: ['143'],
    }
    const url = buildFilterUrl('https://archiveofourown.org/tags/Test/works', state)
    expect(url).toContain('include_work_search%5Bfandom_ids%5D%5B%5D=27')
    expect(url).toContain('include_work_search%5Bcharacter_ids%5D%5B%5D=501')
    expect(url).toContain('exclude_work_search%5Brating_ids%5D%5B%5D=13')
    expect(url).toContain('exclude_work_search%5Bfandom_ids%5D%5B%5D=143')
  })

  it('should NOT serialize include/exclude tag IDs on search pages', () => {
    const state = {
      ...defaultFilterState(),
      includeFandomIds: ['27'],
      excludeRatingIds: ['13'],
    }
    const url = buildFilterUrl('https://archiveofourown.org/works/search', state)
    expect(url).not.toContain('include_work_search')
    expect(url).not.toContain('exclude_work_search')
  })

  it('should round-trip all extended fields', () => {
    const original = {
      ...defaultFilterState(),
      crossover: 'T',
      dateFrom: '2024-06-01',
      dateTo: '2024-12-31',
      otherTagsToInclude: 'slow burn',
      otherTagsToExclude: 'crack',
      includeFandomIds: ['27', '143'],
      includeCharacterIds: ['501'],
      includeRelationshipIds: ['601'],
      includeFreeformIds: ['701', '702'],
      excludeRatingIds: ['13'],
      excludeWarningIds: ['17'],
      excludeCategoryIds: ['23'],
      excludeFandomIds: ['143'],
      excludeCharacterIds: ['504'],
      excludeRelationshipIds: ['602'],
      excludeFreeformIds: ['701'],
    }
    const url = buildFilterUrl('https://archiveofourown.org/tags/Test/works', original)
    const parsed = parseFilterParams(url)
    expect(parsed.crossover).toBe('T')
    expect(parsed.dateFrom).toBe('2024-06-01')
    expect(parsed.dateTo).toBe('2024-12-31')
    expect(parsed.otherTagsToInclude).toBe('slow burn')
    expect(parsed.otherTagsToExclude).toBe('crack')
    expect(parsed.includeFandomIds).toEqual(['27', '143'])
    expect(parsed.includeCharacterIds).toEqual(['501'])
    expect(parsed.includeRelationshipIds).toEqual(['601'])
    expect(parsed.includeFreeformIds).toEqual(['701', '702'])
    expect(parsed.excludeRatingIds).toEqual(['13'])
    expect(parsed.excludeWarningIds).toEqual(['17'])
    expect(parsed.excludeCategoryIds).toEqual(['23'])
    expect(parsed.excludeFandomIds).toEqual(['143'])
    expect(parsed.excludeCharacterIds).toEqual(['504'])
    expect(parsed.excludeRelationshipIds).toEqual(['602'])
    expect(parsed.excludeFreeformIds).toEqual(['701'])
  })
})
