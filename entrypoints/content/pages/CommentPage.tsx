import { useEffect, useMemo } from 'react'
import { parseSingleComment } from '@/lib/ao3/parseComments'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { CommentThread } from '../components/CommentThread'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { PageSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'

export function CommentPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const data = useMemo(() => doc ? parseSingleComment(doc) : null, [doc])

  useEffect(() => {
    if (doc) setCurrentUser(parseCurrentUser(doc))
  }, [doc])

  if (isLoading) return <PageSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!data) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-semibold">
        Comment on{' '}
        <a href={data.workUrl} className="text-primary hover:underline">
          {data.workTitle}
        </a>
      </h1>

      <CommentThread comments={data.comments} />

      {data.comments.length === 0 && (
        <p className="text-sm text-muted-foreground">Comment not found.</p>
      )}
    </div>
  )
}
