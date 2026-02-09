import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { parseWorkDetail } from '@/lib/ao3/parseWorkDetail'
import { parseWorkComments } from '@/lib/ao3/parseComments'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { Badge } from '@/components/ui/badge'
import type { Chapter, WorkDetail } from '@/lib/ao3/types'
import {
  ChapterPagination,
  PaginationControls,
} from '../components/PaginationControls'
import { CommentThread } from '../components/CommentThread'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { PageSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'

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
        className="prose dark:prose-invert max-w-none leading-relaxed [&_p]:mb-4 [&_hr]:my-4"
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


export function WorkDetailPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const work = useMemo(() => doc ? parseWorkDetail(doc) : null, [doc])
  const initialComments = useMemo(() => doc ? parseWorkComments(doc) : null, [doc])

  useEffect(() => {
    if (doc) setCurrentUser(parseCurrentUser(doc))
  }, [doc])

  const [comments, setComments] = useState(initialComments)
  const [commentsVisible, setCommentsVisible] = useState(false)

  // Sync comments state when initial doc loads
  useEffect(() => {
    if (initialComments) {
      setComments(initialComments)
      setCommentsVisible(initialComments.comments.length > 0)
    }
  }, [initialComments])
  const [loadingComments, setLoadingComments] = useState(false)

  const commentPaginationUrl = useMemo(() => {
    const u = new URL(url)
    u.searchParams.set('show_comments', 'true')
    u.hash = ''
    return u.toString()
  }, [url])

  async function handleShowComments() {
    setLoadingComments(true)
    try {
      const u = new URL(url)
      u.searchParams.set('show_comments', 'true')
      const response = await fetch(u.toString())
      const html = await response.text()
      const newDoc = new DOMParser().parseFromString(html, 'text/html')
      const newComments = parseWorkComments(newDoc)
      setComments(newComments)
      setCommentsVisible(true)
      u.hash = ''
      history.replaceState(null, '', u.toString())
    } finally {
      setLoadingComments(false)
    }
  }

  function handleToggleComments() {
    const next = !commentsVisible
    setCommentsVisible(next)
    const u = new URL(window.location.href)
    if (next) {
      u.searchParams.set('show_comments', 'true')
    } else {
      u.searchParams.delete('show_comments')
    }
    u.hash = ''
    history.replaceState(null, '', u.toString())
  }

  async function handleCommentPage(pageUrl: string) {
    setLoadingComments(true)
    try {
      const response = await fetch(pageUrl)
      const html = await response.text()
      const newDoc = new DOMParser().parseFromString(html, 'text/html')
      const newComments = parseWorkComments(newDoc)
      setComments(newComments)
      history.replaceState(null, '', pageUrl)
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
    } finally {
      setLoadingComments(false)
    }
  }

  if (isLoading) return <PageSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!work || !comments) return null

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
      {work.chapterNav && (
        <ChapterPagination
          currentIndex={work.chapterNav.currentIndex}
          totalChapters={work.chapterNav.totalChapters}
          chapterUrls={work.chapterNav.chapterUrls}
        />
      )}

      {/* Comments */}
      <section id="comments" className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Comments
            {work.stats.comments > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({work.stats.comments.toLocaleString()})
              </span>
            )}
          </h2>
          {work.stats.comments > 0 && (
            <button
              onClick={
                comments.comments.length > 0
                  ? handleToggleComments
                  : handleShowComments
              }
              disabled={loadingComments}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              {loadingComments
                ? 'Loading...'
                : commentsVisible && comments.comments.length > 0
                  ? 'Hide'
                  : 'Show'}
            </button>
          )}
        </div>

        {commentsVisible && comments.comments.length > 0 && (
          <>
            <CommentThread comments={comments.comments} />
            <PaginationControls
              pagination={comments.pagination}
              url={commentPaginationUrl}
              onNavigate={handleCommentPage}
            />
          </>
        )}
      </section>
    </div>
  )
}
