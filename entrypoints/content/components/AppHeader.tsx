import { useState } from 'react'
import { Search, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from '../navigation'
import { useCurrentUser } from '../auth'

function UserMenu() {
  const currentUser = useCurrentUser()
  const navigate = useNavigate()

  if (!currentUser) {
    return (
      <a href="/users/login" className="text-sm hover:underline shrink-0">
        Log In
      </a>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="size-7 rounded-full bg-muted object-cover"
            />
          ) : (
            <div className="size-7 rounded-full bg-muted flex items-center justify-center">
              <User className="size-4 text-muted-foreground" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{currentUser.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => navigate(currentUser.url)}
        >
          <User />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            window.location.href = '/users/logout'
          }}
        >
          <LogOut />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
        <UserMenu />
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
          <UserMenu />
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
