import { Button } from '@/components/ui/button'
import { queryClient } from '../queryClient'
import { RateLimitError } from '../hooks/useAo3Page'

export function PageError({ error, url }: { error: Error; url: string }) {
  const originalUrl = new URL(url)
  originalUrl.searchParams.set('neo-ao3-original', '')
  const isRateLimit = error instanceof RateLimitError

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <h2 className="text-lg font-semibold">
        {isRateLimit ? 'Slow down!' : 'Something went wrong'}
      </h2>
      <p className="text-sm text-muted-foreground">
        {isRateLimit
          ? 'AO3 is rate-limiting requests. Retrying automatically...'
          : error.message}
      </p>
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['ao3-page', url] })}
        >
          Retry
        </Button>
        <a href={originalUrl.toString()}>
          <Button variant="ghost">View Original</Button>
        </a>
      </div>
    </div>
  )
}
