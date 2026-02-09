import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/integrations/theme/ThemeToggle'
import { useNavigate } from '../navigation'

export function AppHeader(props: { onShowOriginal: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/works/search?work_search[query]=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto flex h-12 items-center justify-between gap-4 px-4">
        <a href="/" className="font-bold text-lg shrink-0">
          NeoAO3
        </a>
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search works..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </form>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={props.onShowOriginal}>
            Show Original
          </Button>
        </div>
      </div>
    </header>
  )
}
