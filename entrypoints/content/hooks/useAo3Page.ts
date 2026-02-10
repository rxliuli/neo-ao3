import { keepPreviousData, useQuery } from '@tanstack/react-query'

async function fetchAo3Document(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  if (response.status === 403) {
    // Cloudflare challenge — set flag and navigate so the browser
    // renders the challenge page natively with scripts executing
    sessionStorage.setItem('neo-ao3-cf-challenge', '1')
    window.location.href = url
    return new Promise<never>(() => {})
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  return new DOMParser().parseFromString(html, 'text/html')
}

export function useAo3Page(url: string) {
  return useQuery({
    queryKey: ['ao3-page', url],
    queryFn: ({ signal }) => fetchAo3Document(url, signal),
    placeholderData: keepPreviousData,
  })
}
