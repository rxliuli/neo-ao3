export interface TagSuggestion {
  id: string
  name: string
}

export async function fetchTagAutocomplete(
  term: string,
  type: string = 'tag',
  signal?: AbortSignal,
): Promise<TagSuggestion[]> {
  if (!term.trim()) return []
  try {
    const url = `https://archiveofourown.org/autocomplete/${type}?term=${encodeURIComponent(term)}`
    const res = await fetch(url, { signal })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
