import type { WorkBlurb } from './types'
import { parseWorkBlurb } from './parseWorkList'

export interface TagPage {
  name: string
  category: string
  parentTags: string[]
  isCommon: boolean
  works: WorkBlurb[]
}

export function parseTagPage(doc: Document): TagPage {
  const root = doc.querySelector('.tag.home.profile')

  const name = root?.querySelector('.primary.header.module h2.heading')?.textContent?.trim() ?? ''

  // "This tag belongs to the <strong>Additional Tags</strong> Category."
  const categoryStrong = root?.querySelector('p > strong')
  const category = categoryStrong?.textContent?.trim() ?? ''

  const parentTags = Array.from(
    root?.querySelectorAll('.parent.listbox.group ul li a.tag') ?? [],
  ).map((a) => a.textContent?.trim() ?? '')

  // Check for "not been marked common"
  const paragraphs = Array.from(root?.querySelectorAll('p') ?? [])
  const isCommon = !paragraphs.some((p) =>
    p.textContent?.includes('not been marked common'),
  )

  const blurbEls = root?.querySelectorAll('.work.listbox.group ul.index.group > li.work.blurb') ?? []
  const works = Array.from(blurbEls).map(parseWorkBlurb)

  return { name, category, parentTags, isCommon, works }
}
