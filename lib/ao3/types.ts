export interface Author {
  name: string
  url: string
}

export interface SeriesInfo {
  id: string
  name: string
  part: number
  url: string
}

export interface WorkStats {
  words: number
  chapters: string // e.g. "17/?" or "1/1"
  comments: number
  kudos: number
  bookmarks: number
  hits: number
}

export interface WorkTags {
  warnings: string[]
  relationships: string[]
  characters: string[]
  freeforms: string[]
}

export interface Pagination {
  currentPage: number
  totalPages: number
}

/** Work item from listing/search pages */
export interface WorkBlurb {
  id: string
  title: string
  authors: Author[]
  fandoms: string[]
  rating: string
  warnings: string[]
  categories: string[]
  complete: boolean
  date: string
  tags: WorkTags
  summary: string
  series: SeriesInfo[]
  stats: WorkStats
  language: string
}

export interface WorkListPage {
  works: WorkBlurb[]
  pagination: Pagination
}

export interface Chapter {
  id: string
  number: number
  title: string
  content: string
  summary?: string
  beginNotes?: string
  endNotes?: string
}

/** Full work detail from individual work pages */
export interface WorkDetail {
  id: string
  title: string
  authors: Author[]
  rating: string
  warnings: string[]
  categories: string[]
  fandoms: string[]
  tags: WorkTags
  language: string
  publishedDate: string
  updatedDate?: string
  stats: WorkStats
  summary: string
  beginNotes?: string
  endNotes?: string
  series: SeriesInfo[]
  chapters: Chapter[]
}
