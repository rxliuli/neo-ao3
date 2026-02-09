import { parseTagOptions, type TagOption } from './parseFilterSidebar'

export interface BookmarkFilterSidebar {
  includeRatings: TagOption[]
  includeFandoms: TagOption[]
  includeCharacters: TagOption[]
  includeRelationships: TagOption[]
  includeFreeforms: TagOption[]
  includeBookmarkerTags: TagOption[]
  excludeRatings: TagOption[]
  excludeWarnings: TagOption[]
  excludeCategories: TagOption[]
  excludeFandoms: TagOption[]
  excludeCharacters: TagOption[]
  excludeRelationships: TagOption[]
  excludeFreeforms: TagOption[]
  excludeBookmarkerTags: TagOption[]
}

export function parseBookmarkFilterSidebar(doc: Document): BookmarkFilterSidebar | null {
  const form = doc.querySelector('form#bookmark-filters')
  if (!form) return null

  return {
    includeRatings: parseTagOptions(form.querySelector('#include_rating_tags ul')),
    includeFandoms: parseTagOptions(form.querySelector('#include_fandom_tags ul')),
    includeCharacters: parseTagOptions(form.querySelector('#include_character_tags ul')),
    includeRelationships: parseTagOptions(form.querySelector('#include_relationship_tags ul')),
    includeFreeforms: parseTagOptions(form.querySelector('#include_freeform_tags ul')),
    includeBookmarkerTags: parseTagOptions(form.querySelector('#include_tag_tags ul')),
    excludeRatings: parseTagOptions(form.querySelector('#exclude_rating_tags ul')),
    excludeWarnings: parseTagOptions(form.querySelector('#exclude_warning_tags ul')),
    excludeCategories: parseTagOptions(form.querySelector('#exclude_category_tags ul')),
    excludeFandoms: parseTagOptions(form.querySelector('#exclude_fandom_tags ul')),
    excludeCharacters: parseTagOptions(form.querySelector('#exclude_character_tags ul')),
    excludeRelationships: parseTagOptions(form.querySelector('#exclude_relationship_tags ul')),
    excludeFreeforms: parseTagOptions(form.querySelector('#exclude_freeform_tags ul')),
    excludeBookmarkerTags: parseTagOptions(form.querySelector('#exclude_tag_tags ul')),
  }
}
