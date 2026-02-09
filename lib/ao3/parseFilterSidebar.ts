export interface TagOption {
  id: string
  name: string
  count: number
}

export interface FilterSidebar {
  includeFandoms: TagOption[]
  includeCharacters: TagOption[]
  includeRelationships: TagOption[]
  includeFreeforms: TagOption[]
  excludeRatings: TagOption[]
  excludeWarnings: TagOption[]
  excludeCategories: TagOption[]
  excludeFandoms: TagOption[]
  excludeCharacters: TagOption[]
  excludeRelationships: TagOption[]
  excludeFreeforms: TagOption[]
}

function parseTagOptions(container: Element | null): TagOption[] {
  if (!container) return []
  const items = container.querySelectorAll('li')
  const options: TagOption[] = []
  for (const li of items) {
    const input = li.querySelector('input[type="checkbox"]')
    const label = li.querySelector('label')
    if (!input || !label) continue
    const id = input.getAttribute('value') ?? ''
    const text = label.textContent?.trim() ?? ''
    // Label format: "Tag Name (123)" or just "Tag Name"
    const match = text.match(/^(.+?)\s*\((\d+)\)\s*$/)
    if (match) {
      options.push({ id, name: match[1].trim(), count: parseInt(match[2], 10) })
    } else {
      options.push({ id, name: text, count: 0 })
    }
  }
  return options
}

/**
 * Parse the filter sidebar from an AO3 tag page.
 * Returns null if the sidebar form is not found (e.g. search pages).
 */
export function parseFilterSidebar(doc: Document): FilterSidebar | null {
  const form = doc.querySelector('form#work-filters')
  if (!form) return null

  return {
    includeFandoms: parseTagOptions(form.querySelector('#include_fandom_tags ul')),
    includeCharacters: parseTagOptions(form.querySelector('#include_character_tags ul')),
    includeRelationships: parseTagOptions(form.querySelector('#include_relationship_tags ul')),
    includeFreeforms: parseTagOptions(form.querySelector('#include_freeform_tags ul')),
    excludeRatings: parseTagOptions(form.querySelector('#exclude_rating_tags ul')),
    excludeWarnings: parseTagOptions(form.querySelector('#exclude_warning_tags ul')),
    excludeCategories: parseTagOptions(form.querySelector('#exclude_category_tags ul')),
    excludeFandoms: parseTagOptions(form.querySelector('#exclude_fandom_tags ul')),
    excludeCharacters: parseTagOptions(form.querySelector('#exclude_character_tags ul')),
    excludeRelationships: parseTagOptions(form.querySelector('#exclude_relationship_tags ul')),
    excludeFreeforms: parseTagOptions(form.querySelector('#exclude_freeform_tags ul')),
  }
}
