export interface FilterState {
  query: string
  sortColumn: string
  sortDirection: string
  ratingId: string
  warningIds: string[]
  categoryIds: string[]
  complete: string // "" | "T" | "F"
  wordCountFrom: string
  wordCountTo: string
  languageId: string

  // Include tags (tag pages: dynamic checkboxes)
  includeFandomIds: string[]
  includeCharacterIds: string[]
  includeRelationshipIds: string[]
  includeFreeformIds: string[]

  // Exclude tags (tag pages: dynamic checkboxes)
  excludeRatingIds: string[]
  excludeWarningIds: string[]
  excludeCategoryIds: string[]
  excludeFandomIds: string[]
  excludeCharacterIds: string[]
  excludeRelationshipIds: string[]
  excludeFreeformIds: string[]

  // Text tag inputs
  otherTagsToInclude: string
  otherTagsToExclude: string

  // More options
  crossover: string // "" | "T" | "F"
  dateFrom: string
  dateTo: string
}

export function defaultFilterState(): FilterState {
  return {
    query: '',
    sortColumn: 'revised_at',
    sortDirection: '',
    ratingId: '',
    warningIds: [],
    categoryIds: [],
    complete: '',
    wordCountFrom: '',
    wordCountTo: '',
    languageId: '',
    includeFandomIds: [],
    includeCharacterIds: [],
    includeRelationshipIds: [],
    includeFreeformIds: [],
    excludeRatingIds: [],
    excludeWarningIds: [],
    excludeCategoryIds: [],
    excludeFandomIds: [],
    excludeCharacterIds: [],
    excludeRelationshipIds: [],
    excludeFreeformIds: [],
    otherTagsToInclude: '',
    otherTagsToExclude: '',
    crossover: '',
    dateFrom: '',
    dateTo: '',
  }
}

/**
 * Detect whether the current page is a tag-filtered page or a search page.
 */
export function isTagPage(pathname: string): boolean {
  return /^\/tags\/[^/]+\/works/.test(pathname)
}

/**
 * Parse the current URL search params into a FilterState.
 * Handles both tag page and search page param formats.
 */
export function parseFilterParams(url: string): FilterState {
  const u = new URL(url)
  const params = u.searchParams
  const state = defaultFilterState()

  state.query = params.get('work_search[query]') ?? ''
  state.sortColumn = params.get('work_search[sort_column]') ?? 'revised_at'
  state.sortDirection = params.get('work_search[sort_direction]') ?? ''
  state.complete = params.get('work_search[complete]') ?? ''
  state.languageId = params.get('work_search[language_id]') ?? ''

  // Crossover, date range, text tag names (same param format for both page types)
  state.crossover = params.get('work_search[crossover]') ?? ''
  state.dateFrom = params.get('work_search[date_from]') ?? ''
  state.dateTo = params.get('work_search[date_to]') ?? ''
  state.otherTagsToInclude = params.get('work_search[other_tag_names]') ?? ''
  state.otherTagsToExclude = params.get('work_search[excluded_tag_names]') ?? ''

  if (isTagPage(u.pathname)) {
    // Tag pages use include_work_search[rating_ids][]
    state.ratingId = params.getAll('include_work_search[rating_ids][]')[0] ?? ''
    state.warningIds = params.getAll('include_work_search[archive_warning_ids][]')
    state.categoryIds = params.getAll('include_work_search[category_ids][]')

    // Include tag IDs
    state.includeFandomIds = params.getAll('include_work_search[fandom_ids][]')
    state.includeCharacterIds = params.getAll('include_work_search[character_ids][]')
    state.includeRelationshipIds = params.getAll('include_work_search[relationship_ids][]')
    state.includeFreeformIds = params.getAll('include_work_search[freeform_ids][]')

    // Exclude tag IDs
    state.excludeRatingIds = params.getAll('exclude_work_search[rating_ids][]')
    state.excludeWarningIds = params.getAll('exclude_work_search[archive_warning_ids][]')
    state.excludeCategoryIds = params.getAll('exclude_work_search[category_ids][]')
    state.excludeFandomIds = params.getAll('exclude_work_search[fandom_ids][]')
    state.excludeCharacterIds = params.getAll('exclude_work_search[character_ids][]')
    state.excludeRelationshipIds = params.getAll('exclude_work_search[relationship_ids][]')
    state.excludeFreeformIds = params.getAll('exclude_work_search[freeform_ids][]')
  } else {
    // Search pages
    state.ratingId = params.get('work_search[rating_ids]') ?? ''
    state.warningIds = params.getAll('work_search[archive_warning_ids][]')
    state.categoryIds = params.getAll('work_search[category_ids][]')
  }

  // Word count: "100-50000" format in work_search[word_count]
  const wordCount = params.get('work_search[word_count]') ?? ''
  if (wordCount.includes('-')) {
    const [from, to] = wordCount.split('-')
    state.wordCountFrom = from ?? ''
    state.wordCountTo = to ?? ''
  } else if (wordCount) {
    state.wordCountFrom = wordCount
  }

  return state
}

/**
 * Build URL search params from a FilterState.
 * Preserves the base URL path and non-filter params (like page).
 */
export function buildFilterUrl(
  baseUrl: string,
  state: FilterState,
): string {
  const u = new URL(baseUrl)
  const tagPage = isTagPage(u.pathname)

  // Remove all existing filter params
  const keysToRemove: string[] = []
  for (const key of u.searchParams.keys()) {
    if (
      key.startsWith('work_search[') ||
      key.startsWith('include_work_search[') ||
      key.startsWith('exclude_work_search[')
    ) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    u.searchParams.delete(key)
  }

  // Remove page param (applying filters resets to page 1)
  u.searchParams.delete('page')

  // Set filter params
  if (state.query) {
    u.searchParams.set('work_search[query]', state.query)
  }
  if (state.sortColumn) {
    u.searchParams.set('work_search[sort_column]', state.sortColumn)
  }
  if (state.sortDirection) {
    u.searchParams.set('work_search[sort_direction]', state.sortDirection)
  }
  if (state.complete) {
    u.searchParams.set('work_search[complete]', state.complete)
  }
  if (state.languageId) {
    u.searchParams.set('work_search[language_id]', state.languageId)
  }

  // Rating
  if (state.ratingId) {
    if (tagPage) {
      u.searchParams.append('include_work_search[rating_ids][]', state.ratingId)
    } else {
      u.searchParams.set('work_search[rating_ids]', state.ratingId)
    }
  }

  // Warnings
  for (const id of state.warningIds) {
    if (tagPage) {
      u.searchParams.append('include_work_search[archive_warning_ids][]', id)
    } else {
      u.searchParams.append('work_search[archive_warning_ids][]', id)
    }
  }

  // Categories
  for (const id of state.categoryIds) {
    if (tagPage) {
      u.searchParams.append('include_work_search[category_ids][]', id)
    } else {
      u.searchParams.append('work_search[category_ids][]', id)
    }
  }

  // Word count
  if (state.wordCountFrom || state.wordCountTo) {
    const wc = `${state.wordCountFrom}-${state.wordCountTo}`
    u.searchParams.set('work_search[word_count]', wc)
  }

  // Crossover, date range, text tag names
  if (state.crossover) {
    u.searchParams.set('work_search[crossover]', state.crossover)
  }
  if (state.dateFrom) {
    u.searchParams.set('work_search[date_from]', state.dateFrom)
  }
  if (state.dateTo) {
    u.searchParams.set('work_search[date_to]', state.dateTo)
  }
  if (state.otherTagsToInclude) {
    u.searchParams.set('work_search[other_tag_names]', state.otherTagsToInclude)
  }
  if (state.otherTagsToExclude) {
    u.searchParams.set('work_search[excluded_tag_names]', state.otherTagsToExclude)
  }

  // Tag page only: include/exclude tag ID arrays
  if (tagPage) {
    for (const id of state.includeFandomIds) {
      u.searchParams.append('include_work_search[fandom_ids][]', id)
    }
    for (const id of state.includeCharacterIds) {
      u.searchParams.append('include_work_search[character_ids][]', id)
    }
    for (const id of state.includeRelationshipIds) {
      u.searchParams.append('include_work_search[relationship_ids][]', id)
    }
    for (const id of state.includeFreeformIds) {
      u.searchParams.append('include_work_search[freeform_ids][]', id)
    }

    for (const id of state.excludeRatingIds) {
      u.searchParams.append('exclude_work_search[rating_ids][]', id)
    }
    for (const id of state.excludeWarningIds) {
      u.searchParams.append('exclude_work_search[archive_warning_ids][]', id)
    }
    for (const id of state.excludeCategoryIds) {
      u.searchParams.append('exclude_work_search[category_ids][]', id)
    }
    for (const id of state.excludeFandomIds) {
      u.searchParams.append('exclude_work_search[fandom_ids][]', id)
    }
    for (const id of state.excludeCharacterIds) {
      u.searchParams.append('exclude_work_search[character_ids][]', id)
    }
    for (const id of state.excludeRelationshipIds) {
      u.searchParams.append('exclude_work_search[relationship_ids][]', id)
    }
    for (const id of state.excludeFreeformIds) {
      u.searchParams.append('exclude_work_search[freeform_ids][]', id)
    }
  }

  return u.toString()
}
