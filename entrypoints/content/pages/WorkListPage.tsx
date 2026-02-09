import { useMemo, useState } from 'react'
import { parseWorkList } from '@/lib/ao3/parseWorkList'
import {
  parseFilterParams,
  buildFilterUrl,
  defaultFilterState,
  type FilterState,
} from '@/lib/ao3/parseFilterParams'
import type { WorkBlurb, Pagination } from '@/lib/ao3/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useNavigate } from '../navigation'

// --- Constants ---

const SORT_OPTIONS = [
  { label: 'Date Updated', value: 'revised_at' },
  { label: 'Date Posted', value: 'created_at' },
  { label: 'Author', value: 'authors_to_sort_on' },
  { label: 'Title', value: 'title_to_sort_on' },
  { label: 'Word Count', value: 'word_count' },
  { label: 'Hits', value: 'hits' },
  { label: 'Kudos', value: 'kudos_count' },
  { label: 'Comments', value: 'comments_count' },
  { label: 'Bookmarks', value: 'bookmarks_count' },
]

const RATING_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Not Rated', value: '9' },
  { label: 'General Audiences', value: '10' },
  { label: 'Teen And Up Audiences', value: '11' },
  { label: 'Mature', value: '12' },
  { label: 'Explicit', value: '13' },
]

const WARNING_OPTIONS = [
  { label: 'Creator Chose Not To Use Archive Warnings', value: '14' },
  { label: 'No Archive Warnings Apply', value: '16' },
  { label: 'Graphic Depictions Of Violence', value: '17' },
  { label: 'Major Character Death', value: '18' },
  { label: 'Rape/Non-Con', value: '19' },
  { label: 'Underage', value: '20' },
]

const CATEGORY_OPTIONS = [
  { label: 'F/F', value: '116' },
  { label: 'F/M', value: '22' },
  { label: 'Gen', value: '21' },
  { label: 'M/M', value: '23' },
  { label: 'Multi', value: '2246' },
  { label: 'Other', value: '24' },
]

const COMPLETION_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Complete', value: 'T' },
  { label: 'Work in Progress', value: 'F' },
]

const LANGUAGE_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'English', value: 'en' },
  { label: '中文-普通话 國語', value: 'zh' },
  { label: '日本語', value: 'ja' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Italiano', value: 'it' },
  { label: 'Português', value: 'pt' },
  { label: 'Русский', value: 'ru' },
  { label: '한국어', value: 'ko' },
]

// --- Sub-components ---

function WorkCard({ work }: { work: WorkBlurb }) {
  return (
    <article className="border-b py-4 space-y-2">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">
          <a
            href={`/works/${work.id}`}
            className="text-primary hover:underline"
          >
            {work.title}
          </a>
        </h3>
        <p className="text-sm text-muted-foreground">
          by{' '}
          {work.authors.map((a, i) => (
            <span key={a.url}>
              {i > 0 && ', '}
              <a href={a.url} className="hover:underline">
                {a.name}
              </a>
            </span>
          ))}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {work.fandoms.map((f) => (
          <Badge key={f} variant="secondary">
            {f}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {work.tags.relationships.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
        {work.tags.characters.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
        {work.tags.freeforms.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>

      {work.summary && (
        <div
          className="text-sm text-muted-foreground line-clamp-3"
          dangerouslySetInnerHTML={{ __html: work.summary }}
        />
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{work.language}</span>
        <span>Words: {work.stats.words.toLocaleString()}</span>
        <span>Chapters: {work.stats.chapters}</span>
        {work.stats.kudos > 0 && (
          <span>Kudos: {work.stats.kudos.toLocaleString()}</span>
        )}
        {work.stats.comments > 0 && (
          <span>Comments: {work.stats.comments.toLocaleString()}</span>
        )}
        {work.stats.bookmarks > 0 && (
          <span>Bookmarks: {work.stats.bookmarks.toLocaleString()}</span>
        )}
        <span>Hits: {work.stats.hits.toLocaleString()}</span>
        <span>{work.date}</span>
      </div>
    </article>
  )
}

function CheckboxGroup(props: {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {props.options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={props.selected.includes(opt.value)}
            onChange={(e) => {
              if (e.target.checked) {
                props.onChange([...props.selected, opt.value])
              } else {
                props.onChange(props.selected.filter((v) => v !== opt.value))
              }
            }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

function FilterPanel(props: {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onApply: () => void
  onReset: () => void
}) {
  const { filters, onChange } = props

  function update(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Rating</Label>
          <Select
            value={filters.ratingId}
            onChange={(e) => update({ ratingId: e.target.value })}
          >
            {RATING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Completion</Label>
          <Select
            value={filters.complete}
            onChange={(e) => update({ complete: e.target.value })}
          >
            {COMPLETION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Language</Label>
          <Select
            value={filters.languageId}
            onChange={(e) => update({ languageId: e.target.value })}
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Word Count</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="From"
              value={filters.wordCountFrom}
              onChange={(e) => update({ wordCountFrom: e.target.value })}
              className="h-8"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="To"
              value={filters.wordCountTo}
              onChange={(e) => update({ wordCountTo: e.target.value })}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Warnings</Label>
        <CheckboxGroup
          options={WARNING_OPTIONS}
          selected={filters.warningIds}
          onChange={(warningIds) => update({ warningIds })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Categories</Label>
        <CheckboxGroup
          options={CATEGORY_OPTIONS}
          selected={filters.categoryIds}
          onChange={(categoryIds) => update({ categoryIds })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Search within results</Label>
        <Input
          type="text"
          placeholder="Search..."
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
          className="h-8 max-w-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={props.onApply}>
          Apply Filters
        </Button>
        <Button size="sm" variant="outline" onClick={props.onReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}

function PaginationControls(props: { pagination: Pagination; url: string }) {
  const { currentPage, totalPages } = props.pagination
  if (totalPages <= 1) return null

  function pageUrl(page: number): string {
    const u = new URL(props.url)
    if (page <= 1) {
      u.searchParams.delete('page')
    } else {
      u.searchParams.set('page', String(page))
    }
    return u.toString()
  }

  // Build page number list with ellipsis
  const pages: (number | '...')[] = []
  const delta = 2
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 py-6">
      {currentPage > 1 && (
        <a href={pageUrl(currentPage - 1)}>
          <Button variant="outline" size="sm">
            Previous
          </Button>
        </a>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <a key={p} href={pageUrl(p)}>
            <Button
              variant={p === currentPage ? 'default' : 'outline'}
              size="sm"
              className="min-w-[2rem]"
            >
              {p}
            </Button>
          </a>
        ),
      )}
      {currentPage < totalPages && (
        <a href={pageUrl(currentPage + 1)}>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </a>
      )}
    </nav>
  )
}

// --- Main Page ---

export function WorkListPage({ doc, url }: { doc: Document; url: string }) {
  const navigate = useNavigate()
  const data = useMemo(() => parseWorkList(doc), [doc])
  const initialFilters = useMemo(() => parseFilterParams(url), [url])

  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  function handleSortChange(sortColumn: string) {
    const updated = { ...filters, sortColumn }
    navigate(buildFilterUrl(url, updated))
  }

  function handleApplyFilters() {
    navigate(buildFilterUrl(url, filters))
  }

  function handleResetFilters() {
    const reset = defaultFilterState()
    navigate(buildFilterUrl(url, reset))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Toolbar: sort + filter toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground shrink-0">
            Sort by
          </Label>
          <Select
            value={filters.sortColumn}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-8 w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      )}

      {/* Work list */}
      <div>
        {data.works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>

      {data.works.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No works found.
        </p>
      )}

      {/* Pagination */}
      <PaginationControls pagination={data.pagination} url={url} />
    </div>
  )
}
