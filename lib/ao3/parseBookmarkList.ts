import type {
  Author,
  Pagination,
  WorkBlurb,
  WorkStats,
  WorkTags,
} from './types'
import { parseWorkBlurb } from './parseWorkList'

export interface BookmarkMeta {
  bookmarkerName: string
  bookmarkerUrl: string
  bookmarkDate: string
  isRec: boolean
  bookmarkerTags: string[]
  bookmarkerNotes?: string
}

export interface BookmarkBlurb {
  bookmarkId: string
  work: WorkBlurb
  bookmark: BookmarkMeta
}

export interface BookmarkListPage {
  bookmarks: BookmarkBlurb[]
  pagination: Pagination
}

function parseBookmarkMeta(el: Element): BookmarkMeta {
  const userModule = el.querySelector('div.user.module')
  if (!userModule) {
    return {
      bookmarkerName: '',
      bookmarkerUrl: '',
      bookmarkDate: '',
      isRec: false,
      bookmarkerTags: [],
    }
  }

  const bylineLink = userModule.querySelector('h5.byline a')
  const bookmarkerName = bylineLink?.textContent?.trim() ?? ''
  const bookmarkerUrl = bylineLink?.getAttribute('href') ?? ''

  const dateEl = userModule.querySelector('p.datetime')
  const bookmarkDate = dateEl?.textContent?.trim() ?? ''

  // Check for rec
  const isRec = !!userModule.querySelector('.rec')

  // Bookmarker's tags
  const bookmarkerTags = Array.from(
    userModule.querySelectorAll('ul.meta.tags a.tag'),
  ).map((a) => a.textContent?.trim() ?? '')

  // Bookmarker's notes
  const notesEl = userModule.querySelector('blockquote.userstuff.notes')
  const bookmarkerNotes = notesEl?.innerHTML?.trim() || undefined

  return {
    bookmarkerName,
    bookmarkerUrl,
    bookmarkDate,
    isRec,
    bookmarkerTags,
    bookmarkerNotes,
  }
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

export function parseBookmarkList(doc: Document): BookmarkListPage {
  const blurbEls = doc.querySelectorAll(
    'ol.bookmark.index.group > li.bookmark.blurb',
  )

  const bookmarks: BookmarkBlurb[] = Array.from(blurbEls).map((el) => {
    const bookmarkId = el.id.replace('bookmark_', '')
    const work = parseWorkBlurb(el)
    const bookmark = parseBookmarkMeta(el)

    return { bookmarkId, work, bookmark }
  })

  const pagination = parsePagination(doc)

  return { bookmarks, pagination }
}
