export interface StatsTotals {
  userSubscriptions: number
  kudos: number
  commentThreads: number
  bookmarks: number
  subscriptions: number
  wordCount: number
  hits: number
}

export interface WorkStat {
  title: string
  url: string
  wordCount: number
  hits: number
  kudos: number
  commentThreads: number
  bookmarks: number
  subscriptions: number
}

export interface FandomStat {
  fandom: string
  works: WorkStat[]
}

export interface YearOption {
  label: string
  url: string
  isCurrent: boolean
}

export interface StatsPage {
  totals: StatsTotals
  fandoms: FandomStat[]
  years: YearOption[]
}

function parseNum(text: string | null | undefined): number {
  return parseInt(text?.replace(/,/g, '') ?? '0', 10) || 0
}

export function parseStats(doc: Document): StatsPage {
  // Parse totals from dl.statistics.meta.group
  const totalsDl = doc.querySelector('dl.statistics.meta.group')
  const totals: StatsTotals = {
    userSubscriptions: 0,
    kudos: 0,
    commentThreads: 0,
    bookmarks: 0,
    subscriptions: 0,
    wordCount: 0,
    hits: 0,
  }

  if (totalsDl) {
    const dts = totalsDl.querySelectorAll('dt')
    for (const dt of dts) {
      const dd = dt.nextElementSibling
      if (!dd || dd.tagName !== 'DD') continue
      const label = dt.className
      const value = parseNum(dd.textContent)
      if (label.includes('user subscriptions')) totals.userSubscriptions = value
      else if (label === 'kudos') totals.kudos = value
      else if (label.includes('comment')) totals.commentThreads = value
      else if (label === 'bookmarks') totals.bookmarks = value
      else if (label === 'subscriptions') totals.subscriptions = value
      else if (label === 'words') totals.wordCount = value
      else if (label === 'hits') totals.hits = value
    }
  }

  // Parse year options from ol.year.actions
  const yearEls = doc.querySelectorAll('ol.year.actions li')
  const years: YearOption[] = Array.from(yearEls).map((li) => {
    const a = li.querySelector('a')
    const span = li.querySelector('span.current')
    return {
      label: (a ?? span)?.textContent?.trim() ?? '',
      url: a?.getAttribute('href') ?? '',
      isCurrent: !!span,
    }
  })

  // Parse fandom stats from ul.statistics.index.group
  const fandomEls = doc.querySelectorAll(
    'ul.statistics.index.group > li.fandom',
  )
  const fandoms: FandomStat[] = Array.from(fandomEls).map((fandomEl) => {
    const fandom =
      fandomEl.querySelector('h5.heading')?.textContent?.trim() ?? ''

    const workEls = fandomEl.querySelectorAll('ul.index > li')
    const works: WorkStat[] = Array.from(workEls).map((workEl) => {
      const a = workEl.querySelector('dt a')
      const title = a?.textContent?.trim() ?? ''
      const url = a?.getAttribute('href') ?? ''
      const wordsSpan = workEl.querySelector('dt span.words')
      const wordCountMatch = wordsSpan?.textContent?.match(/[\d,]+/)
      const wordCount = parseNum(wordCountMatch?.[0])

      const statsDl = workEl.querySelector('dd dl.stats')
      const hits = parseNum(
        statsDl?.querySelector('dd.hits')?.textContent,
      )
      const kudos = parseNum(
        statsDl?.querySelector('dd.kudos')?.textContent,
      )
      const commentThreads = parseNum(
        statsDl?.querySelector('dd.comments')?.textContent,
      )
      const bookmarks = parseNum(
        statsDl?.querySelector('dd.bookmarks')?.textContent,
      )
      const subscriptions = parseNum(
        statsDl?.querySelector('dd.subscriptions')?.textContent,
      )

      return {
        title,
        url,
        wordCount,
        hits,
        kudos,
        commentThreads,
        bookmarks,
        subscriptions,
      }
    })

    return { fandom, works }
  })

  return { totals, fandoms, years }
}
