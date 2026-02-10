import { useEffect, useMemo } from 'react'
import { parseTagPage } from '@/lib/ao3/parseTagPage'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { WorkCard } from '../components/WorkCard'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { PageSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'
import { Badge } from '@/components/ui/badge'
import { encodeTagName } from '@/lib/ao3/tagUrl'

export function TagPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const data = useMemo(() => (doc ? parseTagPage(doc) : null), [doc])

  useEffect(() => {
    if (doc) {
      setCurrentUser(parseCurrentUser(doc))
    }
  }, [doc])

  if (isLoading) return <PageSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!data) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        {data.category && (
          <p className="text-sm text-muted-foreground">
            {data.category} Tag
          </p>
        )}
        {data.parentTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.parentTags.map((tag) => (
              <a key={tag} href={`/tags/${encodeTagName(tag)}`}>
                <Badge variant="secondary" className="text-xs hover:bg-accent">
                  {tag}
                </Badge>
              </a>
            ))}
          </div>
        )}
        {!data.isCommon && (
          <p className="text-sm text-muted-foreground italic">
            This tag has not been marked common and can't be filtered on yet.
          </p>
        )}
      </div>

      <div>
        {data.works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>

      {data.works.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No works found.
        </p>
      )}
    </div>
  )
}
