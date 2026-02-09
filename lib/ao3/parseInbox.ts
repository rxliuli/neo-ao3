import type { Pagination } from './types'

export interface InboxComment {
  id: string
  authorName: string
  authorUrl: string
  isGuest: boolean
  avatarUrl: string
  chapterTitle: string
  chapterUrl: string
  date: string
  content: string
  isRead: boolean
}

export interface InboxPage {
  comments: InboxComment[]
  pagination: Pagination
  totalComments: number
  unreadCount: number
}

function parsePagination(doc: Document): Pagination {
  const paginationEl = doc.querySelector('ol.pagination')
  if (!paginationEl) {
    return { currentPage: 1, totalPages: 1 }
  }

  const currentEl = paginationEl.querySelector('a.current')
  const currentPage = parseInt(currentEl?.textContent ?? '1', 10) || 1

  const pageLinks = paginationEl.querySelectorAll(
    'li:not(.previous):not(.next) a',
  )
  let totalPages = currentPage
  for (const link of pageLinks) {
    const pageNum = parseInt(link.textContent ?? '0', 10)
    if (pageNum > totalPages) {
      totalPages = pageNum
    }
  }

  return { currentPage, totalPages }
}

export function parseInbox(doc: Document): InboxPage {
  // Parse heading for total and unread counts
  // e.g. "My Inbox (3 comments, 3 unread)"
  const heading = doc.querySelector('#main h2.heading')
  const headingText = heading?.textContent?.trim() ?? ''
  const totalMatch = headingText.match(/(\d+)\s+comments?/)
  const unreadMatch = headingText.match(/(\d+)\s+unread/)
  const totalComments = parseInt(totalMatch?.[1] ?? '0', 10) || 0
  const unreadCount = parseInt(unreadMatch?.[1] ?? '0', 10) || 0

  // Parse comment items
  const commentEls = doc.querySelectorAll(
    'ol.comment.index.group > li.comment',
  )

  const comments: InboxComment[] = Array.from(commentEls).map((el) => {
    const id = el.id.replace('feedback_comment_', '')
    const isRead = !el.classList.contains('unread')
    const isGuest = el.classList.contains('guest')

    // Author
    const byline = el.querySelector('h4.heading.byline')
    const authorLink = byline?.querySelector('a[href*="/users/"]')
    let authorName = ''
    let authorUrl = ''

    if (isGuest) {
      // Guest: <span>guest</span><span class="role"> (Guest)</span>
      const spans = byline?.querySelectorAll(':scope > span')
      authorName = spans?.[0]?.textContent?.trim() ?? 'guest'
      const roleSpan = byline?.querySelector('span.role')
      if (roleSpan) {
        authorName += ' ' + roleSpan.textContent?.trim()
      }
    } else {
      authorName = authorLink?.textContent?.trim() ?? ''
      authorUrl = authorLink?.getAttribute('href') ?? ''
    }

    // Chapter link - the last <a> in byline (after "on")
    const bylineLinks = byline?.querySelectorAll('a') ?? []
    const chapterLink = bylineLinks[bylineLinks.length - 1]
    const chapterTitle = chapterLink?.textContent?.trim() ?? ''
    const chapterUrl = chapterLink?.getAttribute('href') ?? ''

    // Date
    const dateEl = byline?.querySelector('.posted.datetime')
    const date = dateEl?.textContent?.trim() ?? ''

    // Avatar
    const iconEl = el.querySelector('.icon img')
    const avatarUrl = iconEl?.getAttribute('src') ?? ''

    // Content
    const contentEl = el.querySelector('blockquote.userstuff')
    const content = contentEl?.innerHTML?.trim() ?? ''

    return {
      id,
      authorName,
      authorUrl,
      isGuest,
      avatarUrl,
      chapterTitle,
      chapterUrl,
      date,
      content,
      isRead,
    }
  })

  const pagination = parsePagination(doc)

  return { comments, pagination, totalComments, unreadCount }
}
