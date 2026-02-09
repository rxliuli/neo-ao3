import { useMemo } from 'react'
import { parseSingleComment } from '@/lib/ao3/parseComments'
import { CommentThread } from '../components/CommentThread'

export function CommentPage({ doc }: { doc: Document }) {
  const data = useMemo(() => parseSingleComment(doc), [doc])

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
