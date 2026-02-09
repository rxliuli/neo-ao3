import { useMemo } from 'react'
import { parseInbox, type InboxComment } from '@/lib/ao3/parseInbox'
import { parseDashboardLinks } from '@/lib/ao3/parseUserProfile'
import { UserDashboardNav } from '../components/UserDashboardNav'
import { Badge } from '@/components/ui/badge'
import { PaginationControls } from '../components/PaginationControls'

function CommentCard({ comment }: { comment: InboxComment }) {
  return (
    <article
      className={`border-b py-4 space-y-2 ${!comment.isRead ? 'bg-accent/30 -mx-4 px-4 rounded' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {comment.avatarUrl ? (
            <img
              src={comment.avatarUrl}
              alt=""
              className="size-10 rounded object-cover shrink-0"
            />
          ) : (
            <div className="size-10 rounded bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-sm">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {comment.authorUrl ? (
                <a
                  href={comment.authorUrl}
                  className="text-primary hover:underline"
                >
                  {comment.authorName}
                </a>
              ) : (
                <span>{comment.authorName}</span>
              )}
              {' on '}
              <a
                href={comment.chapterUrl}
                className="text-primary hover:underline"
              >
                {comment.chapterTitle}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {comment.date}
              </span>
              {!comment.isRead && (
                <Badge variant="default" className="text-xs">
                  Unread
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="text-sm pl-[3.25rem]"
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />
    </article>
  )
}


export function UserInboxPage({
  doc,
  url,
}: {
  doc: Document
  url: string
}) {
  const data = useMemo(() => parseInbox(doc), [doc])
  const dashboardLinks = useMemo(() => parseDashboardLinks(doc), [doc])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Inbox
        {data.unreadCount > 0 && (
          <span className="text-base font-normal text-muted-foreground ml-2">
            ({data.totalComments} comments, {data.unreadCount} unread)
          </span>
        )}
      </h1>

      <UserDashboardNav links={dashboardLinks} />

      {/* Comment list */}
      <div>
        {data.comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>

      {data.comments.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No messages in your inbox.
        </p>
      )}

      <PaginationControls pagination={data.pagination} url={url} />
    </div>
  )
}
