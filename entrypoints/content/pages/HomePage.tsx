import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { useNavigate } from '../navigation'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useAo3Page } from '../hooks/useAo3Page'
import { useSetCurrentUser } from '../auth'

const FANDOM_CATEGORIES = [
  { name: 'Anime & Manga', path: '/media/Anime%20*a*%20Manga/fandoms' },
  { name: 'Books & Literature', path: '/media/Books%20*a*%20Literature/fandoms' },
  { name: 'Cartoons & Comics & Graphic Novels', path: '/media/Cartoons%20*a*%20Comics%20*a*%20Graphic%20Novels/fandoms' },
  { name: 'Celebrities & Real People', path: '/media/Celebrities%20*a*%20Real%20People/fandoms' },
  { name: 'Movies', path: '/media/Movies/fandoms' },
  { name: 'Music & Bands', path: '/media/Music%20*a*%20Bands/fandoms' },
  { name: 'Other Media', path: '/media/Other%20Media/fandoms' },
  { name: 'Theater', path: '/media/Theater/fandoms' },
  { name: 'TV Shows', path: '/media/TV%20Shows/fandoms' },
  { name: 'Video Games', path: '/media/Video%20Games/fandoms' },
  { name: 'Uncategorized Fandoms', path: '/media/Uncategorized%20Fandoms/fandoms' },
]

export function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { data: doc } = useAo3Page(useCurrentUrl())
  const setCurrentUser = useSetCurrentUser()

  useEffect(() => {
    if (doc) setCurrentUser(parseCurrentUser(doc))
  }, [doc, setCurrentUser])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/works/search?work_search[query]=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl font-bold">NeoAO3</h1>
        <p className="text-muted-foreground text-lg">
          A modern interface for Archive of Our Own
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <Input
            type="search"
            placeholder="Search works..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Browse by Fandom</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FANDOM_CATEGORIES.map((cat) => (
            <a
              key={cat.path}
              href={cat.path}
              className="block rounded-md border p-3 text-sm hover:bg-accent transition-colors"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
