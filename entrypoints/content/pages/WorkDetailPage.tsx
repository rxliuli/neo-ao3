import { useMemo } from 'react'
import { parseWorkDetail } from '@/lib/ao3/parseWorkDetail'
import { Badge } from '@/components/ui/badge'
import type { Chapter } from '@/lib/ao3/types'

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

      {/* Metadata */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          <Badge>{work.rating}</Badge>
          {work.categories.map((c) => (
            <Badge key={c} variant="secondary">
              {c}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {work.fandoms.map((f) => (
            <Badge key={f} variant="secondary">
              {f}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {work.tags.relationships.map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
          {work.tags.characters.map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
          {work.tags.freeforms.map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
      </div>

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
    </div>
  )
}
