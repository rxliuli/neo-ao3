import type { Pagination, WorkBlurb } from './types'
import { parseWorkBlurb } from './parseWorkList'
import { toISODate } from './date'

export interface ReadingMeta {
  lastVisited: string
  visitCount: number
  isLatestVersion: boolean
}

export interface ReadingBlurb {
  work: WorkBlurb
  reading: ReadingMeta
}

export interface ReadingListPage {
  readings: ReadingBlurb[]
  pagination: Pagination
}

function parseReadingMeta(el: Element): ReadingMeta {
  const viewedEl = el.querySelector('.user.module h4.viewed.heading')
  if (!viewedEl) {
    return { lastVisited: '', visitCount: 0, isLatestVersion: false }
  }

  const text = viewedEl.textContent ?? ''

  // Extract date after "Last visited:" and convert to YYYY-MM-DD
  const dateMatch = text.match(/Last visited:\s*(.+?)(?:\(|Visited)/s)
  const rawDate = dateMatch?.[1]?.trim() ?? ''
  const lastVisited = toISODate(rawDate)

  // Check for "(Latest version.)"
  const isLatestVersion = text.includes('Latest version')

  // Extract visit count
  const visitMatch = text.match(/Visited\s+(\d+)\s+times?/)
  const visitCount = parseInt(visitMatch?.[1] ?? '0', 10) || 0

  return { lastVisited, visitCount, isLatestVersion }
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

export function parseReadingList(doc: Document): ReadingListPage {
  const blurbEls = doc.querySelectorAll(
    'ol.reading.work.index.group > li.reading.work.blurb',
  )

  const readings: ReadingBlurb[] = Array.from(blurbEls).map((el) => {
    const work = parseWorkBlurb(el)
    const reading = parseReadingMeta(el)
    return { work, reading }
  })

  const pagination = parsePagination(doc)

  return { readings, pagination }
}
