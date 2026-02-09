import { Button } from '@/components/ui/button'
import { queryClient } from '../queryClient'

export function PageError({ error, url }: { error: Error; url: string }) {
  const originalUrl = new URL(url)
  originalUrl.searchParams.set('neo-ao3-original', '')

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
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
