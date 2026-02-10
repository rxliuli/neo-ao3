import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { WorkBlurb } from '@/lib/ao3/types'
import { Badge } from '@/components/ui/badge'

export function WorkCard({ work }: { work: WorkBlurb }) {
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

    // Remove constraints to measure true layout
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
        {work.stats.comments > 0 && (
          <span>Comments: {work.stats.comments.toLocaleString()}</span>
        )}
        {work.stats.bookmarks > 0 && (
          <span>Bookmarks: {work.stats.bookmarks.toLocaleString()}</span>
        )}
        <span>Hits: {work.stats.hits.toLocaleString()}</span>
        <span>{work.date}</span>
      </div>
    </article>
  )
}
