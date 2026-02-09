import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { parseWorkDetail } from '@/lib/ao3/parseWorkDetail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Chapter, ChapterNav, WorkDetail } from '@/lib/ao3/types'

function ChapterSection({ chapter }: { chapter: Chapter }) {
  return (
    <section className="space-y-4">
      {chapter.title && (
        <h2 className="text-xl font-semibold">
          Chapter {chapter.number}: {chapter.title}
        </h2>
      )}

      {chapter.summary && (
        <details className="border rounded-md p-3">
          <summary className="text-sm font-medium cursor-pointer">
            Chapter Summary
          </summary>
          <div
            className="mt-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: chapter.summary }}
          />
        </details>
      )}

      {chapter.beginNotes && (
        <details className="border rounded-md p-3">
          <summary className="text-sm font-medium cursor-pointer">
            Notes
          </summary>
          <div
            className="mt-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: chapter.beginNotes }}
          />
        </details>
      )}

      <div
        className="prose dark:prose-invert max-w-none leading-relaxed [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />

      {chapter.endNotes && (
        <details className="border rounded-md p-3">
          <summary className="text-sm font-medium cursor-pointer">
            End Notes
          </summary>
          <div
            className="mt-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: chapter.endNotes }}
          />
        </details>
      )}
    </section>
  )
}

function CollapsibleTags({ work }: { work: WorkDetail }) {
  const [expanded, setExpanded] = useState(false)
  const tagsRef = useRef<HTMLDivElement>(null)
  const [hiddenCount, setHiddenCount] = useState(0)

  const allTags = useMemo(
    () => [
      { label: work.rating, variant: 'default' as const },
      ...work.categories.map((c) => ({ label: c, variant: 'secondary' as const })),
      ...work.fandoms.map((f) => ({ label: f, variant: 'secondary' as const })),
      ...work.tags.relationships.map((t) => ({ label: t, variant: 'outline' as const })),
      ...work.tags.characters.map((t) => ({ label: t, variant: 'outline' as const })),
      ...work.tags.freeforms.map((t) => ({ label: t, variant: 'outline' as const })),
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

  if (allTags.length === 0) return null

  return (
    <div>
      <div ref={tagsRef} className="flex flex-wrap gap-1">
        {allTags.map((tag) => (
          <a
            key={tag.label}
            href={`/tags/${encodeURIComponent(tag.label)}/works`}
          >
            <Badge
              variant={tag.variant}
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
  )
}

function ChapterNavigation({ nav }: { nav: ChapterNav }) {
  return (
    <nav className="flex items-center justify-between border-t pt-6">
      <div>
        {nav.prevUrl ? (
          <Button variant="outline" asChild>
            <a href={nav.prevUrl}>&larr; Previous Chapter</a>
          </Button>
        ) : (
          <div />
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {nav.currentIndex + 1} / {nav.totalChapters}
      </span>
      <div>
        {nav.nextUrl ? (
          <Button variant="outline" asChild>
            <a href={nav.nextUrl}>Next Chapter &rarr;</a>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}

export function WorkDetailPage({ doc }: { doc: Document }) {
  const work = useMemo(() => parseWorkDetail(doc), [doc])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">{work.title}</h1>
        <p className="text-muted-foreground">
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
      </header>

      {/* Tags */}
      <CollapsibleTags work={work} />

      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>Words: {work.stats.words.toLocaleString()}</span>
        <span>Chapters: {work.stats.chapters}</span>
        {work.stats.kudos > 0 && (
          <span>Kudos: {work.stats.kudos.toLocaleString()}</span>
        )}
        {work.stats.comments > 0 && (
          <span>Comments: {work.stats.comments.toLocaleString()}</span>
        )}
        {work.stats.bookmarks > 0 && (
          <span>Bookmarks: {work.stats.bookmarks.toLocaleString()}</span>
        )}
        <span>Hits: {work.stats.hits.toLocaleString()}</span>
        <span>Published: {work.publishedDate}</span>
        {work.updatedDate && <span>Updated: {work.updatedDate}</span>}
      </div>

      {/* Summary */}
      {work.summary && (
        <div className="border rounded-md p-4">
          <h2 className="text-sm font-medium mb-2">Summary</h2>
          <div
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: work.summary }}
          />
        </div>
      )}

      {/* Work begin notes */}
      {work.beginNotes && (
        <details className="border rounded-md p-3">
          <summary className="text-sm font-medium cursor-pointer">
            Notes
          </summary>
          <div
            className="mt-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: work.beginNotes }}
          />
        </details>
      )}

      {/* Chapters */}
      <div className="space-y-8">
        {work.chapters.map((chapter) => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}
      </div>

      {/* Work end notes */}
      {work.endNotes && (
        <details className="border rounded-md p-3">
          <summary className="text-sm font-medium cursor-pointer">
            End Notes
          </summary>
          <div
            className="mt-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: work.endNotes }}
          />
        </details>
      )}

      {/* Chapter navigation */}
      {work.chapterNav && <ChapterNavigation nav={work.chapterNav} />}
    </div>
  )
}
