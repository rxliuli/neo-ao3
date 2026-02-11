import { keepPreviousData, useQuery } from '@tanstack/react-query'

export class RateLimitError extends Error {
  constructor() {
    super('Too many requests. Please wait a moment and try again.')
    this.name = 'RateLimitError'
  }
}

async function fetchAo3Document(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal })
  if (response.status === 403) {
    // Cloudflare challenge — set flag and navigate so the browser
    // renders the challenge page natively with scripts executing
    sessionStorage.setItem('neo-ao3-cf-challenge', '1')
    window.location.href = url
    return new Promise<never>(() => {})
  }
  if (response.status === 429) throw new RateLimitError()
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  return new DOMParser().parseFromString(html, 'text/html')
}

export function useAo3Page(url: string) {
  return useQuery({
    queryKey: ['ao3-page', url],
    queryFn: ({ signal }) => fetchAo3Document(url, signal),
    placeholderData: keepPreviousData,
    retry(failureCount, error) {
      if (error instanceof RateLimitError) return failureCount < 3
      return failureCount < 1
    },
    retryDelay(failureCount, error) {
      if (error instanceof RateLimitError) return (failureCount + 1) * 5000
      return 1000
    },
  })
}
