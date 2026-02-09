import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  parseReadingList,
  type ReadingBlurb,
} from '@/lib/ao3/parseReadingList'
import { parseDashboardLinks } from '@/lib/ao3/parseUserProfile'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { Badge } from '@/components/ui/badge'
import { PaginationControls } from '../components/PaginationControls'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { useSetDashboardLinks } from '../components/UserDashboardLayout'
import { ContentSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'

function ReadingCard({ item }: { item: ReadingBlurb }) {
  const { work, reading } = item
  const [expanded, setExpanded] = useState(false)
  const tagsRef = useRef<HTMLDivElement>(null)
  const [hiddenCount, setHiddenCount] = useState(0)

  const allTags = useMemo(
    () => [
      ...work.fandoms.map((f) => ({ label: f, isFandom: true })),
      ...work.tags.relationships.map((t) => ({ label: t, isFandom: false })),
      ...work.tags.characters.map((t) => ({ label: t, isFandom: false })),
      ...work.tags.freeforms.map((t) => ({ label: t, isFandom: false })),
    ],
    [work],
  )

  useLayoutEffect(() => {
    const el = tagsRef.current
    if (!el) return

    if (expanded) {
      el.style.maxHeight = ''
      el.style.overflow = ''
      setHiddenCount(0)
      return
    }

    el.style.maxHeight = ''
    el.style.overflow = ''

    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return

    const firstTop = children[0].offsetTop
    const rowH = children[0].offsetHeight
    const gap = parseFloat(getComputedStyle(el).rowGap) || 4
    const cutoffTop = firstTop + 2 * (rowH + gap)

    let hidden = 0
    for (const child of children) {
      if (child.offsetTop >= cutoffTop) hidden++
    }

    if (hidden > 0) {
      el.style.maxHeight = `${2 * rowH + gap}px`
      el.style.overflow = 'hidden'
    }
    setHiddenCount(hidden)
  }, [allTags, expanded])

  return (
    <article className="border-b py-4 space-y-2">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">
          <a
            href={`/works/${work.id}`}
            className="text-primary hover:underline"
          >
            {work.title}
          </a>
        </h3>
        <p className="text-sm text-muted-foreground">
          by{' '}
          {work.authors.map((a, i) => (
            <span key={a.url}>
              {i > 0 && ', '}
              <a href={a.url} className="hover:underline">
                {a.name}
              </a>
            </span>
          ))}
        </p>
      </div>

      {allTags.length > 0 && (
        <div>
          <div ref={tagsRef} className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <a
                key={tag.label}
                href={`/tags/${encodeURIComponent(tag.label)}/works`}
              >
                <Badge
                  variant={tag.isFandom ? 'secondary' : 'outline'}
                  className="text-xs hover:bg-accent"
                >
                  {tag.label}
                </Badge>
              </a>
            ))}
          </div>
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground"
            >
              +{hiddenCount} more tags
            </button>
          )}
        </div>
      )}

      {work.summary && (
        <div
          className="text-sm text-muted-foreground line-clamp-3"
          dangerouslySetInnerHTML={{ __html: work.summary }}
        />
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{work.language}</span>
        <span>Words: {work.stats.words.toLocaleString()}</span>
        <span>Chapters: {work.stats.chapters}</span>
        {work.stats.kudos > 0 && (
          <span>Kudos: {work.stats.kudos.toLocaleString()}</span>
        )}
        {work.stats.hits > 0 && (
          <span>Hits: {work.stats.hits.toLocaleString()}</span>
        )}
        <span>{work.date}</span>
      </div>

      {/* Reading metadata */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t pt-2 mt-2">
        <span>Last visited: {reading.lastVisited}</span>
        {reading.isLatestVersion && (
          <Badge variant="outline" className="text-xs">
            Latest version
          </Badge>
        )}
        <span>Visited {reading.visitCount} times</span>
      </div>
    </article>
  )
}


export function UserHistoryPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const setDashboardLinks = useSetDashboardLinks()
  const data = useMemo(() => doc ? parseReadingList(doc) : null, [doc])

  useEffect(() => {
    if (doc) {
      setCurrentUser(parseCurrentUser(doc))
      setDashboardLinks(parseDashboardLinks(doc))
    }
  }, [doc])

  if (isLoading) return <ContentSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!data) return null

  // Determine current tab from URL
  const parsedUrl = new URL(url)
  const isMarkedForLater = parsedUrl.searchParams.get('show') === 'to-read'

  // Build tab URLs
  const baseUrl = parsedUrl.pathname
  const fullHistoryUrl = baseUrl
  const markedForLaterUrl = baseUrl + '?show=to-read'

  return (
    <>
      {/* History tabs */}
      <div className="flex gap-1 border-b">
        <a
          href={fullHistoryUrl}
          className={`text-sm px-3 py-2 border-b-2 ${
            !isMarkedForLater
              ? 'border-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          Full History
        </a>
        <a
          href={markedForLaterUrl}
          className={`text-sm px-3 py-2 border-b-2 ${
            isMarkedForLater
              ? 'border-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          Marked for Later
        </a>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {data.pagination.currentPage} of {data.pagination.totalPages}
        </span>
      </div>

      {/* Reading list */}
      <div>
        {data.readings.map((item) => (
          <ReadingCard key={item.work.id} item={item} />
        ))}
      </div>

      {data.readings.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No history found.
        </p>
      )}

      <PaginationControls pagination={data.pagination} url={url} />
    </>
  )
}
