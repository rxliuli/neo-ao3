import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from '../navigation'

export function AppHeader() {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/works/search?work_search[query]=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Desktop layout */}
      <div className="max-w-4xl mx-auto hidden md:flex h-12 items-center justify-between gap-4 px-4">
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
        <a href="/users/login" className="text-sm hover:underline shrink-0">
          Log In
        </a>
      </div>

      {/* Mobile layout */}
      <div className="max-w-4xl mx-auto flex md:hidden h-12 items-center justify-between gap-2 px-4">
        <a href="/" className="font-bold text-lg shrink-0">
          NeoAO3
        </a>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <a href="/users/login" className="text-sm hover:underline px-2">
            Log In
          </a>
        </div>
      </div>

      {/* Mobile search row */}
      {searchOpen && (
        <div className="md:hidden border-t px-4 py-2">
          <form onSubmit={handleSearch}>
            <Input
              type="search"
              placeholder="Search works..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  )
}
