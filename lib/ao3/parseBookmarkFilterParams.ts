export interface BookmarkFilterState {
  sortColumn: string
  query: string
  bookmarkQuery: string
  rec: string // "" | "1"
  withNotes: string // "" | "1"
  wordCountFrom: string
  wordCountTo: string

  // Include tags
  includeRatingIds: string[]
  includeFandomIds: string[]
  includeCharacterIds: string[]
  includeRelationshipIds: string[]
  includeFreeformIds: string[]
  includeBookmarkerTagIds: string[]

  // Exclude tags
  excludeRatingIds: string[]
  excludeWarningIds: string[]
  excludeCategoryIds: string[]
  excludeFandomIds: string[]
  excludeCharacterIds: string[]
  excludeRelationshipIds: string[]
  excludeFreeformIds: string[]
  excludeBookmarkerTagIds: string[]

  // Text tag inputs
  otherTagsToInclude: string
  otherTagsToExclude: string
  otherBookmarkTagsToInclude: string
  otherBookmarkTagsToExclude: string
}

export function defaultBookmarkFilterState(): BookmarkFilterState {
  return {
    sortColumn: 'created_at',
    query: '',
    bookmarkQuery: '',
    rec: '',
    withNotes: '',
    wordCountFrom: '',
    wordCountTo: '',
    includeRatingIds: [],
    includeFandomIds: [],
    includeCharacterIds: [],
    includeRelationshipIds: [],
    includeFreeformIds: [],
    includeBookmarkerTagIds: [],
    excludeRatingIds: [],
    excludeWarningIds: [],
    excludeCategoryIds: [],
    excludeFandomIds: [],
    excludeCharacterIds: [],
    excludeRelationshipIds: [],
    excludeFreeformIds: [],
    excludeBookmarkerTagIds: [],
    otherTagsToInclude: '',
    otherTagsToExclude: '',
    otherBookmarkTagsToInclude: '',
    otherBookmarkTagsToExclude: '',
  }
}

export function parseBookmarkFilterParams(url: string): BookmarkFilterState {
  const u = new URL(url)
  const params = u.searchParams
  const state = defaultBookmarkFilterState()

  state.sortColumn = params.get('bookmark_search[sort_column]') ?? 'created_at'
  state.query = params.get('bookmark_search[bookmarkable_query]') ?? ''
  state.bookmarkQuery = params.get('bookmark_search[bookmark_query]') ?? ''
  state.rec = params.get('bookmark_search[rec]') ?? ''
  state.withNotes = params.get('bookmark_search[with_notes]') ?? ''

  state.otherTagsToInclude = params.get('bookmark_search[other_tag_names]') ?? ''
  state.otherTagsToExclude = params.get('bookmark_search[excluded_tag_names]') ?? ''
  state.otherBookmarkTagsToInclude = params.get('bookmark_search[other_bookmark_tag_names]') ?? ''
  state.otherBookmarkTagsToExclude = params.get('bookmark_search[excluded_bookmark_tag_names]') ?? ''

  // Include tag IDs
  state.includeRatingIds = params.getAll('include_bookmark_search[rating_ids][]')
  state.includeFandomIds = params.getAll('include_bookmark_search[fandom_ids][]')
  state.includeCharacterIds = params.getAll('include_bookmark_search[character_ids][]')
  state.includeRelationshipIds = params.getAll('include_bookmark_search[relationship_ids][]')
  state.includeFreeformIds = params.getAll('include_bookmark_search[freeform_ids][]')
  state.includeBookmarkerTagIds = params.getAll('include_bookmark_search[tag_ids][]')

  // Exclude tag IDs
  state.excludeRatingIds = params.getAll('exclude_bookmark_search[rating_ids][]')
  state.excludeWarningIds = params.getAll('exclude_bookmark_search[archive_warning_ids][]')
  state.excludeCategoryIds = params.getAll('exclude_bookmark_search[category_ids][]')
  state.excludeFandomIds = params.getAll('exclude_bookmark_search[fandom_ids][]')
  state.excludeCharacterIds = params.getAll('exclude_bookmark_search[character_ids][]')
  state.excludeRelationshipIds = params.getAll('exclude_bookmark_search[relationship_ids][]')
  state.excludeFreeformIds = params.getAll('exclude_bookmark_search[freeform_ids][]')
  state.excludeBookmarkerTagIds = params.getAll('exclude_bookmark_search[tag_ids][]')

  // Word count
  const wordCount = params.get('bookmark_search[bookmarkable_word_count]') ?? ''
  if (wordCount.includes('-')) {
    const [from, to] = wordCount.split('-')
    state.wordCountFrom = from ?? ''
    state.wordCountTo = to ?? ''
  } else if (wordCount) {
    state.wordCountFrom = wordCount
  }

  return state
}

export function buildBookmarkFilterUrl(
  baseUrl: string,
  state: BookmarkFilterState,
): string {
  const u = new URL(baseUrl)

  // Remove all existing filter params
  const keysToRemove: string[] = []
  for (const key of u.searchParams.keys()) {
    if (
      key.startsWith('bookmark_search[') ||
      key.startsWith('include_bookmark_search[') ||
      key.startsWith('exclude_bookmark_search[')
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
  if (state.sortColumn) {
    u.searchParams.set('bookmark_search[sort_column]', state.sortColumn)
  }
  if (state.query) {
    u.searchParams.set('bookmark_search[bookmarkable_query]', state.query)
  }
  if (state.bookmarkQuery) {
    u.searchParams.set('bookmark_search[bookmark_query]', state.bookmarkQuery)
  }
  if (state.rec) {
    u.searchParams.set('bookmark_search[rec]', state.rec)
  }
  if (state.withNotes) {
    u.searchParams.set('bookmark_search[with_notes]', state.withNotes)
  }

  // Word count
  if (state.wordCountFrom || state.wordCountTo) {
    const wc = `${state.wordCountFrom}-${state.wordCountTo}`
    u.searchParams.set('bookmark_search[bookmarkable_word_count]', wc)
  }

  // Text tag inputs
  if (state.otherTagsToInclude) {
    u.searchParams.set('bookmark_search[other_tag_names]', state.otherTagsToInclude)
  }
  if (state.otherTagsToExclude) {
    u.searchParams.set('bookmark_search[excluded_tag_names]', state.otherTagsToExclude)
  }
  if (state.otherBookmarkTagsToInclude) {
    u.searchParams.set('bookmark_search[other_bookmark_tag_names]', state.otherBookmarkTagsToInclude)
  }
  if (state.otherBookmarkTagsToExclude) {
    u.searchParams.set('bookmark_search[excluded_bookmark_tag_names]', state.otherBookmarkTagsToExclude)
  }

  // Include tag ID arrays
  for (const id of state.includeRatingIds) {
    u.searchParams.append('include_bookmark_search[rating_ids][]', id)
  }
  for (const id of state.includeFandomIds) {
    u.searchParams.append('include_bookmark_search[fandom_ids][]', id)
  }
  for (const id of state.includeCharacterIds) {
    u.searchParams.append('include_bookmark_search[character_ids][]', id)
  }
  for (const id of state.includeRelationshipIds) {
    u.searchParams.append('include_bookmark_search[relationship_ids][]', id)
  }
  for (const id of state.includeFreeformIds) {
    u.searchParams.append('include_bookmark_search[freeform_ids][]', id)
  }
  for (const id of state.includeBookmarkerTagIds) {
    u.searchParams.append('include_bookmark_search[tag_ids][]', id)
  }

  // Exclude tag ID arrays
  for (const id of state.excludeRatingIds) {
    u.searchParams.append('exclude_bookmark_search[rating_ids][]', id)
  }
  for (const id of state.excludeWarningIds) {
    u.searchParams.append('exclude_bookmark_search[archive_warning_ids][]', id)
  }
  for (const id of state.excludeCategoryIds) {
    u.searchParams.append('exclude_bookmark_search[category_ids][]', id)
  }
  for (const id of state.excludeFandomIds) {
    u.searchParams.append('exclude_bookmark_search[fandom_ids][]', id)
  }
  for (const id of state.excludeCharacterIds) {
    u.searchParams.append('exclude_bookmark_search[character_ids][]', id)
  }
  for (const id of state.excludeRelationshipIds) {
    u.searchParams.append('exclude_bookmark_search[relationship_ids][]', id)
  }
  for (const id of state.excludeFreeformIds) {
    u.searchParams.append('exclude_bookmark_search[freeform_ids][]', id)
  }
  for (const id of state.excludeBookmarkerTagIds) {
    u.searchParams.append('exclude_bookmark_search[tag_ids][]', id)
  }

  return u.toString()
}
