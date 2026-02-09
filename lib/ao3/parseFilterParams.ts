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

  if (isTagPage(u.pathname)) {
    // Tag pages use include_work_search[rating_ids][]
    state.ratingId = params.getAll('include_work_search[rating_ids][]')[0] ?? ''
    state.warningIds = params.getAll('include_work_search[archive_warning_ids][]')
    state.categoryIds = params.getAll('include_work_search[category_ids][]')
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

  return u.toString()
}
