import type { WorkComment } from '@/lib/ao3/parseComments'

function CommentCard({
  comment,
  depth,
}: {
  comment: WorkComment
  depth: number
}) {
  return (
    <div>
      <article
        id={`comment-${comment.id}`}
        className="py-4 space-y-2"
      >
        <div className="flex items-start gap-3">
          {comment.avatarUrl ? (
            <img
              src={comment.avatarUrl}
              alt=""
              className="size-8 rounded object-cover shrink-0"
            />
          ) : (
            <div className="size-8 rounded bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {comment.authorUrl ? (
                <a
                  href={comment.authorUrl}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {comment.authorName}
                </a>
              ) : (
                <span className="text-sm font-medium">
                  {comment.authorName}
                </span>
              )}
              {comment.chapterRef && (
                <span className="text-xs text-muted-foreground">
                  on{' '}
                  <a
                    href={comment.chapterRef.url}
                    className="text-primary hover:underline"
                  >
                    {comment.chapterRef.title}
                  </a>
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {comment.date}
              </span>
            </div>
            <div
              className="text-sm [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        </div>
      </article>

      {comment.children.length > 0 && (
        <div className="ml-6 border-l-2 border-muted pl-4">
          {comment.children.map((child) => (
            <CommentCard
              key={child.id}
              comment={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentThread({ comments }: { comments: WorkComment[] }) {
  if (comments.length === 0) return null

  return (
    <div className="divide-y">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} depth={0} />
      ))}
    </div>
  )
}
