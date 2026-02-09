import { useEffect, useMemo, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { ArrowDownAZ, ArrowDown01 } from 'lucide-react'
import { parseFandomList } from '@/lib/ao3/parseFandomList'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { PageSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'

type SortBy = 'alpha' | 'count'

const ROW_HEIGHT = 32

export function FandomListPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const data = useMemo(() => doc ? parseFandomList(doc) : null, [doc])

  useEffect(() => {
    if (doc) setCurrentUser(parseCurrentUser(doc))
  }, [doc])

  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('alpha')

  const allFandoms = useMemo(
    () => data ? data.groups.flatMap((g) => g.fandoms) : [],
    [data],
  )

  const displayedFandoms = useMemo(() => {
    let list = allFandoms
    if (filter.trim()) {
      const q = filter.toLowerCase()
      list = list.filter((f) => f.name.toLowerCase().includes(q))
    }
    if (sortBy === 'count') {
      list = [...list].sort((a, b) => b.count - a.count)
    }
    return list
  }, [allFandoms, filter, sortBy])

  const virtualizer = useWindowVirtualizer({
    count: displayedFandoms.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  })

  if (isLoading) return <PageSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!data) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {data.title && (
        <h1 className="text-2xl font-bold">{data.title}</h1>
      )}

      {/* Toolbar */}
      <div className="sticky top-12 z-40 bg-background py-2 flex items-center gap-2">
        <Input
          type="search"
          placeholder="Filter fandoms..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 min-w-0"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              {sortBy === 'alpha' ? (
                <ArrowDownAZ className="size-4" />
              ) : (
                <ArrowDown01 className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortBy)}
            >
              <DropdownMenuRadioItem value="alpha">
                Alphabetical
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="count">
                Work Count
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-muted-foreground shrink-0">
          {displayedFandoms.length.toLocaleString()}
        </span>
      </div>

      {/* Virtualized fandom list */}
      {displayedFandoms.length > 0 ? (
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
            width: '100%',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const fandom = displayedFandoms[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                className="absolute left-0 w-full flex items-center text-sm truncate px-1"
                style={{
                  height: ROW_HEIGHT,
                  top: virtualRow.start,
                }}
              >
                <a
                  href={fandom.url}
                  className="text-primary hover:underline truncate"
                >
                  {fandom.name}
                </a>
                <span className="text-muted-foreground ml-1 shrink-0">
                  ({fandom.count.toLocaleString()})
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No fandoms found.
        </p>
      )}
    </div>
  )
}
