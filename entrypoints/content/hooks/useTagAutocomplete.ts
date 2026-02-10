import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTagAutocomplete } from '@/lib/ao3/fetchTagAutocomplete'

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useTagAutocomplete(term: string, type: string = 'tag') {
  const debouncedTerm = useDebouncedValue(term, 300)
  return useQuery({
    queryKey: ['ao3-autocomplete', type, debouncedTerm],
    queryFn: ({ signal }) => fetchTagAutocomplete(debouncedTerm, type, signal),
    enabled: debouncedTerm.length >= 1,
    staleTime: 5 * 60 * 1000,
  })
}
