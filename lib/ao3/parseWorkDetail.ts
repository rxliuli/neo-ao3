import type {
  Author,
  Chapter,
  SeriesInfo,
  WorkDetail,
  WorkStats,
  WorkTags,
} from './types'

function textOf(el: Element | null): string {
  return el?.textContent?.trim() ?? ''
}

function parseNum(text: string | null | undefined): number {
  return parseInt(text?.replace(/,/g, '') ?? '0', 10) || 0
}

function parseMetaTags(metaDl: Element, dtClass: string): string[] {
  const dd = metaDl.querySelector(`dd.${dtClass.replace(/\s+/g, '.')}`)
  if (!dd) return []
  return Array.from(dd.querySelectorAll('a.tag')).map(textOf)
}

export function parseWorkDetail(doc: Document): WorkDetail {
  // Work ID from URL or canonical link
  const canonicalLink = doc.querySelector('link[rel="canonical"]')
  const canonicalHref = canonicalLink?.getAttribute('href') ?? ''
  const idMatch = canonicalHref.match(/\/works\/(\d+)/)
  const id = idMatch?.[1] ?? ''

  // Title
  const title = textOf(doc.querySelector('#workskin .preface .title.heading'))

  // Authors
  const authors: Author[] = Array.from(
    doc.querySelectorAll('#workskin .preface .byline a[rel="author"]'),
  ).map((a) => ({
    name: textOf(a),
    url: a.getAttribute('href') ?? '',
  }))

  // Metadata from dl.work.meta.group
  const metaDl = doc.querySelector('dl.work.meta.group')

  const rating = parseMetaTags(metaDl!, 'rating tags')[0] ?? ''
  const warnings = parseMetaTags(metaDl!, 'warning tags')
  const categories = parseMetaTags(metaDl!, 'category tags')
  const fandoms = parseMetaTags(metaDl!, 'fandom tags')

  const tags: WorkTags = {
    warnings,
    relationships: parseMetaTags(metaDl!, 'relationship tags'),
    characters: parseMetaTags(metaDl!, 'character tags'),
    freeforms: parseMetaTags(metaDl!, 'freeform tags'),
  }

  // Language
  const language = textOf(metaDl?.querySelector('dd.language') ?? null)

  // Stats (nested dl.stats inside dd.stats)
  const statsDd = metaDl?.querySelector('dd.stats dl.stats')
  const stats: WorkStats = {
    words: parseNum(statsDd?.querySelector('dd.words')?.textContent),
    chapters:
      statsDd?.querySelector('dd.chapters')?.textContent?.trim() ?? '0/0',
    comments: parseNum(statsDd?.querySelector('dd.comments')?.textContent),
    kudos: parseNum(statsDd?.querySelector('dd.kudos')?.textContent),
    bookmarks: parseNum(statsDd?.querySelector('dd.bookmarks')?.textContent),
    hits: parseNum(statsDd?.querySelector('dd.hits')?.textContent),
  }

  // Dates
  const publishedDate = textOf(statsDd?.querySelector('dd.published') ?? null)
  const updatedEl = statsDd?.querySelector('dd.status')
  const updatedDate = updatedEl ? textOf(updatedEl) : undefined

  // Summary
  const summary =
    doc.querySelector('.summary.module blockquote.userstuff')?.innerHTML?.trim() ?? ''

  // Begin notes
  const beginNotesEl = doc.querySelector(
    '.notes.module:not(.end) blockquote.userstuff',
  )
  const beginNotes = beginNotesEl?.innerHTML?.trim() || undefined

  // End notes
  const endNotesEl = doc.querySelector(
    '#work_endnotes blockquote.userstuff',
  )
  const endNotes = endNotesEl?.innerHTML?.trim() || undefined

  // Series
  const series: SeriesInfo[] = Array.from(
    doc.querySelectorAll('dd.series span.position'),
  ).map((span) => {
    const a = span.querySelector('a')
    const url = a?.getAttribute('href') ?? ''
    const partText = span.textContent?.match(/Part\s+(\d+)/)?.[1]
    return {
      id: url.split('/').pop() ?? '',
      name: textOf(a),
      part: parseInt(partText ?? '0', 10) || 0,
      url,
    }
  })

  // Chapters
  const chapters = parseChapters(doc)

  return {
    id,
    title,
    authors,
    rating,
    warnings,
    categories,
    fandoms,
    tags,
    language,
    publishedDate,
    updatedDate,
    stats,
    summary,
    beginNotes,
    endNotes,
    series,
    chapters,
  }
}

function parseChapters(doc: Document): Chapter[] {
  const chaptersContainer = doc.querySelector('#chapters')
  if (!chaptersContainer) return []

  const chapterEls = chaptersContainer.querySelectorAll(':scope > .chapter')

  // Single-chapter work: no .chapter divs, content is directly in #chapters
  if (chapterEls.length === 0) {
    const content = chaptersContainer.querySelector('.userstuff')
    if (!content) return []

    // Remove the landmark heading if present
    const landmark = content.querySelector('h3.landmark')
    landmark?.remove()

    return [
      {
        id: '1',
        number: 1,
        title: '',
        content: content.innerHTML.trim(),
      },
    ]
  }

  // Multi-chapter work
  return Array.from(chapterEls).map((chapterEl, index) => {
    const chapterId =
      chapterEl.id?.replace('chapter-', '') ?? String(index + 1)

    // Chapter title
    const titleEl = chapterEl.querySelector(
      '.chapter.preface h3.title a',
    )
    let title = ''
    if (titleEl) {
      const fullTitle = textOf(titleEl)
      // Title format: "Chapter N: Title" or "Chapter N"
      const titleMatch = fullTitle.match(/^Chapter\s+\d+:\s*(.+)$/)
      title = titleMatch?.[1] ?? ''
    }

    // Chapter summary
    const summaryEl = chapterEl.querySelector(
      '.chapter.preface .summary blockquote.userstuff',
    )
    const summary = summaryEl?.innerHTML?.trim() || undefined

    // Chapter begin notes
    const notesEl = chapterEl.querySelector(
      '.chapter.preface .notes:not(.end) blockquote.userstuff',
    )
    const beginNotes = notesEl?.innerHTML?.trim() || undefined

    // Chapter end notes
    const endNotesEl = chapterEl.querySelector(
      '.end.chapter.notes blockquote.userstuff',
    )
    const endNotes = endNotesEl?.innerHTML?.trim() || undefined

    // Chapter content
    const contentEl = chapterEl.querySelector('.userstuff.module')
    if (contentEl) {
      const landmark = contentEl.querySelector('h3.landmark')
      landmark?.remove()
    }
    const content = contentEl?.innerHTML?.trim() ?? ''

    return {
      id: chapterId,
      number: index + 1,
      title,
      content,
      summary,
      beginNotes,
      endNotes,
    }
  })
}
