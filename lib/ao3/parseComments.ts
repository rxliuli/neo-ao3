import type { Pagination } from './types'

export interface WorkComment {
  id: string
  authorName: string
  authorUrl?: string
  avatarUrl?: string
  date: string
  content: string
  chapterRef?: { title: string; url: string }
  children: WorkComment[]
  canReply: boolean
  canEdit: boolean
  canDelete: boolean
  editUrl?: string
  deleteAction?: string
  deleteToken?: string
}

export interface CommentsData {
  comments: WorkComment[]
  pagination: Pagination
}

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04',
  May: '05', Jun: '06', Jul: '07', Aug: '08',
  Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function parseCommentDate(el: Element): string {
  const dateSpan = el.querySelector('span.posted.datetime')
  if (!dateSpan) return ''

  const day = dateSpan.querySelector('span.date')?.textContent?.trim() ?? ''
  const month = dateSpan.querySelector('abbr.month')?.textContent?.trim() ?? ''
  const year = dateSpan.querySelector('span.year')?.textContent?.trim() ?? ''

  const mm = MONTHS[month] ?? '01'
  const dd = day.padStart(2, '0')
  return year && dd ? `${year}-${mm}-${dd}` : ''
}

function parseOneComment(li: Element): WorkComment {
  const id = li.id?.replace('comment_', '') ?? ''

  const byline = li.querySelector('h4.heading.byline')
  const authorLink = byline?.querySelector('a')
  const authorName = authorLink?.textContent?.trim() ?? 'Anonymous'
  const authorUrl = authorLink?.getAttribute('href') ?? undefined

  const avatarImg = li.querySelector('div.icon img')
  let avatarUrl = avatarImg?.getAttribute('src') ?? undefined
  if (avatarUrl?.includes('/skins/iconsets/default/')) {
    avatarUrl = undefined
  }

  const date = parseCommentDate(li)

  const chapterLink = byline?.querySelector('span.parent a')
  const chapterRef = chapterLink
    ? {
        title: chapterLink.textContent?.trim() ?? '',
        url: chapterLink.getAttribute('href') ?? '',
      }
    : undefined

  const content =
    li.querySelector('blockquote.userstuff')?.innerHTML?.trim() ?? ''

  // Parse action links
  const actions = li.querySelector('ul.actions')
  const editLink = actions?.querySelector('a[href*="/edit"]')
  const editUrl = editLink?.getAttribute('href') ?? undefined
  const canEdit = !!editUrl

  const deleteForm = actions?.querySelector('form')
  let deleteAction: string | undefined
  let deleteToken: string | undefined
  if (deleteForm) {
    const methodInput = deleteForm.querySelector<HTMLInputElement>('input[name="_method"][value="delete"]')
    if (methodInput) {
      deleteAction = deleteForm.getAttribute('action') ?? undefined
      deleteToken = deleteForm.querySelector<HTMLInputElement>('input[name="authenticity_token"]')?.value
    }
  }
  const canDelete = !!deleteAction

  const replyLink = actions?.querySelector('a.reply')
  const canReply = !!replyLink

  return {
    id,
    authorName,
    authorUrl,
    avatarUrl,
    date,
    content,
    chapterRef,
    children: [],
    canReply,
    canEdit,
    canDelete,
    editUrl,
    deleteAction,
    deleteToken,
  }
}

function parseThread(ol: Element): WorkComment[] {
  const result: WorkComment[] = []
  const children = Array.from(ol.children) as Element[]

  for (let i = 0; i < children.length; i++) {
    const li = children[i]
    if (li.classList.contains('comment')) {
      const comment = parseOneComment(li)
      // Next sibling may be a reply wrapper (plain <li> without .comment)
      const next = children[i + 1]
      if (
        next &&
        !next.classList.contains('comment') &&
        !next.id?.startsWith('comment_')
      ) {
        const nestedThread = next.querySelector(':scope > ol.thread')
        if (nestedThread) {
          comment.children = parseThread(nestedThread)
        }
        i++ // skip the wrapper
      }
      result.push(comment)
    }
  }

  return result
}

function parseCommentPagination(container: Element): Pagination {
  const paginationEl = container.querySelector('ol.pagination.actions')
  if (!paginationEl) {
    return { currentPage: 1, totalPages: 1 }
  }

  let currentPage = 1
  let totalPages = 1

  for (const li of paginationEl.querySelectorAll(
    'li:not(.previous):not(.next)',
  )) {
    const span = li.querySelector(':scope > span')
    const a = li.querySelector(':scope > a')
    // Current page is a <span> without an <a>
    if (span && !a) {
      currentPage = parseInt(span.textContent ?? '1', 10) || 1
    }
    const pageNum = parseInt((a ?? span)?.textContent ?? '0', 10)
    if (pageNum > totalPages) totalPages = pageNum
  }

  return { currentPage, totalPages }
}

/** Parse comments from a work detail page */
export function parseWorkComments(doc: Document): CommentsData {
  const placeholder = doc.querySelector('#comments_placeholder')
  if (!placeholder) {
    return { comments: [], pagination: { currentPage: 1, totalPages: 1 } }
  }

  const thread = placeholder.querySelector(':scope > ol.thread')
  const comments = thread ? parseThread(thread) : []
  const pagination = parseCommentPagination(placeholder)

  return { comments, pagination }
}

/** Parse a single comment page (/works/{id}/comments/{commentId}) */
export function parseSingleComment(doc: Document): {
  workTitle: string
  workUrl: string
  comments: WorkComment[]
} {
  const heading = doc.querySelector('h3.heading')
  const workLink = heading?.querySelector('a')
  const workTitle = workLink?.textContent?.trim() ?? ''
  const workUrl = workLink?.getAttribute('href') ?? ''

  const thread = doc.querySelector('ol.thread')
  const comments = thread ? parseThread(thread) : []

  return { workTitle, workUrl, comments }
}
