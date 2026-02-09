import { useMemo, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { parseFandomList } from '@/lib/ao3/parseFandomList'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type SortBy = 'alpha' | 'count'

const ROW_HEIGHT = 32

export function FandomListPage({ doc }: { doc: Document }) {
  const data = useMemo(() => parseFandomList(doc), [doc])
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('alpha')

  const allFandoms = useMemo(
    () => data.groups.flatMap((g) => g.fandoms),
    [data.groups],
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {data.title && (
        <h1 className="text-2xl font-bold">{data.title}</h1>
      )}

      {/* Toolbar */}
      <div className="sticky top-12 z-40 bg-background py-2 flex items-center gap-4 flex-wrap">
        <Input
          type="search"
          placeholder="Filter fandoms..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm flex-1"
        />
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground shrink-0">
            Sort by
          </Label>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-9 w-auto"
          >
            <option value="alpha">Alphabetical</option>
            <option value="count">Work Count</option>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {displayedFandoms.length.toLocaleString()} fandoms
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
