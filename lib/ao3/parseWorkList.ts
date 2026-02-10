import type {
  Author,
  Pagination,
  SeriesInfo,
  WorkBlurb,
  WorkListPage,
  WorkStats,
  WorkTags,
} from './types'
import { toISODate } from './date'

function parseNum(text: string | null | undefined): number {
  return parseInt(text?.replace(/,/g, '') ?? '0', 10) || 0
}

function textOf(el: Element | null): string {
  return el?.textContent?.trim() ?? ''
}

export function parseWorkBlurb(el: Element): WorkBlurb {
  // Title
  const titleEl = el.querySelector('.header.module h4.heading a:first-child')

  // Work ID: from element id (work list) or from title link href (bookmark list)
  const id = el.id.startsWith('work_')
    ? el.id.replace('work_', '')
    : titleEl?.getAttribute('href')?.match(/\/works\/(\d+)/)?.[1] ?? el.id
  const title = textOf(titleEl)

  // Authors
  const authors: Author[] = Array.from(
    el.querySelectorAll('.header.module h4.heading a[rel="author"]'),
  ).map((a) => ({
    name: textOf(a),
    url: a.getAttribute('href') ?? '',
  }))

  // Fandoms
  const fandoms = Array.from(
    el.querySelectorAll('h5.fandoms a.tag'),
  ).map(textOf)

  // Required tags (rating, warnings, categories, completion)
  const requiredTags = el.querySelectorAll('.required-tags li span')
  const rating = requiredTags[0]?.getAttribute('title') ?? ''
  const warnings = (requiredTags[1]?.getAttribute('title') ?? '')
    .split(', ')
    .filter(Boolean)
  const categories = (requiredTags[2]?.getAttribute('title') ?? '')
    .split(', ')
    .filter(Boolean)
  const complete =
    requiredTags[3]?.classList.contains('complete-yes') ?? false

  // Date
  const date = toISODate(textOf(el.querySelector('p.datetime')))

  // Tags
  const tags: WorkTags = {
    warnings: Array.from(
      el.querySelectorAll('ul.tags li.warnings a.tag'),
    ).map(textOf),
    relationships: Array.from(
      el.querySelectorAll('ul.tags li.relationships a.tag'),
    ).map(textOf),
    characters: Array.from(
      el.querySelectorAll('ul.tags li.characters a.tag'),
    ).map(textOf),
    freeforms: Array.from(
      el.querySelectorAll('ul.tags li.freeforms a.tag'),
    ).map(textOf),
  }

  // Summary (preserve HTML)
  const summary =
    el.querySelector('blockquote.userstuff.summary')?.innerHTML?.trim() ?? ''

  // Series
  const series: SeriesInfo[] = Array.from(
    el.querySelectorAll('ul.series li'),
  ).map((li) => {
    const a = li.querySelector('a')
    const strong = li.querySelector('strong')
    const url = a?.getAttribute('href') ?? ''
    return {
      id: url.split('/').pop() ?? '',
      name: textOf(a),
      part: parseInt(strong?.textContent ?? '0', 10) || 0,
      url,
    }
  })

  // Stats
  const stats: WorkStats = {
    words: parseNum(
      el.querySelector('dl.stats dd.words')?.textContent,
    ),
    chapters:
      el.querySelector('dl.stats dd.chapters')?.textContent?.trim() ?? '0/0',
    comments: parseNum(
      el.querySelector('dl.stats dd.comments')?.textContent,
    ),
    kudos: parseNum(
      el.querySelector('dl.stats dd.kudos')?.textContent,
    ),
    bookmarks: parseNum(
      el.querySelector('dl.stats dd.bookmarks')?.textContent,
    ),
    hits: parseNum(
      el.querySelector('dl.stats dd.hits')?.textContent,
    ),
  }

  // Language
  const language = textOf(el.querySelector('dl.stats dd.language'))

  return {
    id,
    title,
    authors,
    fandoms,
    rating,
    warnings,
    categories,
    complete,
    date,
    tags,
    summary,
    series,
    stats,
    language,
  }
}

function parsePagination(doc: Document): Pagination {
  const paginationEl = doc.querySelector('ol.pagination')
  if (!paginationEl) {
    return { currentPage: 1, totalPages: 1 }
  }

  const currentEl = paginationEl.querySelector('a.current')
  const currentPage = parseInt(currentEl?.textContent ?? '1', 10) || 1

  // Find the last numbered page link (before "Next")
  const pageLinks = paginationEl.querySelectorAll('li:not(.previous):not(.next) a')
  let totalPages = currentPage
  for (const link of pageLinks) {
    const pageNum = parseInt(link.textContent ?? '0', 10)
    if (pageNum > totalPages) {
      totalPages = pageNum
    }
  }

  return { currentPage, totalPages }
}

export function parseWorkList(doc: Document): WorkListPage {
  const blurbEls = doc.querySelectorAll(
    'ol.work.index.group > li.work.blurb',
  )
  const works = Array.from(blurbEls).map(parseWorkBlurb)
  const pagination = parsePagination(doc)
  return { works, pagination }
}
