import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { parseWorkList } from '@/lib/ao3/parseWorkList'
import {
  parseFilterParams,
  buildFilterUrl,
  defaultFilterState,
  isTagPage,
  type FilterState,
} from '@/lib/ao3/parseFilterParams'
import {
  parseFilterSidebar,
  type FilterSidebar,
  type TagOption,
} from '@/lib/ao3/parseFilterSidebar'
import type { WorkBlurb } from '@/lib/ao3/types'
import { PaginationControls } from '../components/PaginationControls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ArrowUpDown, SlidersHorizontal, ChevronRight, CalendarIcon } from 'lucide-react'
import { format, parse } from 'date-fns'
import { parseDashboardLinks } from '@/lib/ao3/parseUserProfile'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { useSetDashboardLinksOptional } from '../components/UserDashboardLayout'
import { useNavigate } from '../navigation'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { PageSkeleton, ContentSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'

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

const CROSSOVER_OPTIONS = [
  { label: 'Include crossovers', value: '' },
  { label: 'Exclude crossovers', value: 'F' },
  { label: 'Only crossovers', value: 'T' },
]

// --- Sub-components ---

function WorkCard({ work }: { work: WorkBlurb }) {
  const [expanded, setExpanded] = useState(false)
  const tagsRef = useRef<HTMLDivElement>(null)
  const [hiddenCount, setHiddenCount] = useState(0)

  const allTags = useMemo(
    () => [
      ...work.fandoms.map((f) => ({ label: f, isFandom: true })),
      ...work.tags.relationships.map((t) => ({ label: t, isFandom: false })),
      ...work.tags.characters.map((t) => ({ label: t, isFandom: false })),
      ...work.tags.freeforms.map((t) => ({ label: t, isFandom: false })),
    ],
    [work],
  )

  useLayoutEffect(() => {
    const el = tagsRef.current
    if (!el) return

    if (expanded) {
      el.style.maxHeight = ''
      el.style.overflow = ''
      setHiddenCount(0)
      return
    }

    // Remove constraints to measure true layout
    el.style.maxHeight = ''
    el.style.overflow = ''

    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return

    const firstTop = children[0].offsetTop
    const rowH = children[0].offsetHeight
    const gap = parseFloat(getComputedStyle(el).rowGap) || 4
    const cutoffTop = firstTop + 2 * (rowH + gap)

    let hidden = 0
    for (const child of children) {
      if (child.offsetTop >= cutoffTop) hidden++
    }

    if (hidden > 0) {
      el.style.maxHeight = `${2 * rowH + gap}px`
      el.style.overflow = 'hidden'
    }
    setHiddenCount(hidden)
  }, [allTags, expanded])

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

      {allTags.length > 0 && (
        <div>
          <div ref={tagsRef} className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <a
                key={tag.label}
                href={`/tags/${encodeURIComponent(tag.label)}/works`}
              >
                <Badge
                  variant={tag.isFandom ? 'secondary' : 'outline'}
                  className="text-xs hover:bg-accent"
                >
                  {tag.label}
                </Badge>
              </a>
            ))}
          </div>
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground"
            >
              +{hiddenCount} more tags
            </button>
          )}
        </div>
      )}

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

function TagCheckboxGroup(props: {
  label: string
  options: TagOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  if (props.options.length === 0) return null
  return (
    <div className="space-y-1.5">
      <Label>{props.label}</Label>
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
        {props.options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={props.selected.includes(opt.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  props.onChange([...props.selected, opt.id])
                } else {
                  props.onChange(props.selected.filter((v) => v !== opt.id))
                }
              }}
            />
            <span className="truncate">{opt.name}</span>
            <span className="text-muted-foreground ml-auto shrink-0">({opt.count})</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function DatePicker(props: {
  value: string // "YYYY-MM-DD" or ""
  onChange: (value: string) => void
  placeholder?: string
}) {
  const date = props.value
    ? parse(props.value, 'yyyy-MM-dd', new Date())
    : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!props.value}
          className="h-8 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, 'yyyy-MM-dd') : <span>{props.placeholder ?? 'Pick a date'}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => props.onChange(d ? format(d, 'yyyy-MM-dd') : '')}
        />
      </PopoverContent>
    </Popover>
  )
}

function CollapsibleSection(props: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(props.defaultOpen ?? false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1 text-sm font-medium hover:text-foreground text-muted-foreground w-full py-1">
          <ChevronRight
            className={`size-4 transition-transform ${open ? 'rotate-90' : ''}`}
          />
          {props.title}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-5 space-y-3 pt-2 pb-1">
          {props.children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FilterPanel(props: {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onApply: () => void
  onReset: () => void
  sidebar: FilterSidebar | null
  tagPage: boolean
}) {
  const { filters, onChange, sidebar } = props

  function update(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      {/* Basic Filters */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Warnings</Label>
          <MultiSelect
            options={WARNING_OPTIONS}
            defaultValue={filters.warningIds}
            onValueChange={(warningIds) => update({ warningIds })}
            placeholder="Any"
            searchable={false}
            hideSelectAll
            maxCount={1}
            popoverClassName="!w-(--radix-popover-trigger-width) !min-w-0"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categories</Label>
          <MultiSelect
            options={CATEGORY_OPTIONS}
            defaultValue={filters.categoryIds}
            onValueChange={(categoryIds) => update({ categoryIds })}
            placeholder="Any"
            searchable={false}
            hideSelectAll
            maxCount={2}
            popoverClassName="!w-(--radix-popover-trigger-width) !min-w-0"
          />
        </div>
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

      {/* Include Tags */}
      <CollapsibleSection title="Include Tags">
        {sidebar && (
          <>
            <TagCheckboxGroup
              label="Fandoms"
              options={sidebar.includeFandoms}
              selected={filters.includeFandomIds}
              onChange={(includeFandomIds) => update({ includeFandomIds })}
            />
            <TagCheckboxGroup
              label="Characters"
              options={sidebar.includeCharacters}
              selected={filters.includeCharacterIds}
              onChange={(includeCharacterIds) => update({ includeCharacterIds })}
            />
            <TagCheckboxGroup
              label="Relationships"
              options={sidebar.includeRelationships}
              selected={filters.includeRelationshipIds}
              onChange={(includeRelationshipIds) => update({ includeRelationshipIds })}
            />
            <TagCheckboxGroup
              label="Additional Tags"
              options={sidebar.includeFreeforms}
              selected={filters.includeFreeformIds}
              onChange={(includeFreeformIds) => update({ includeFreeformIds })}
            />
          </>
        )}
        <div className="space-y-1.5">
          <Label>Other tags to include</Label>
          <Input
            type="text"
            placeholder="Tag names, comma separated"
            value={filters.otherTagsToInclude}
            onChange={(e) => update({ otherTagsToInclude: e.target.value })}
            className="h-8"
          />
        </div>
      </CollapsibleSection>

      {/* Exclude Tags */}
      <CollapsibleSection title="Exclude Tags">
        {sidebar && (
          <>
            <TagCheckboxGroup
              label="Ratings"
              options={sidebar.excludeRatings}
              selected={filters.excludeRatingIds}
              onChange={(excludeRatingIds) => update({ excludeRatingIds })}
            />
            <TagCheckboxGroup
              label="Warnings"
              options={sidebar.excludeWarnings}
              selected={filters.excludeWarningIds}
              onChange={(excludeWarningIds) => update({ excludeWarningIds })}
            />
            <TagCheckboxGroup
              label="Categories"
              options={sidebar.excludeCategories}
              selected={filters.excludeCategoryIds}
              onChange={(excludeCategoryIds) => update({ excludeCategoryIds })}
            />
            <TagCheckboxGroup
              label="Fandoms"
              options={sidebar.excludeFandoms}
              selected={filters.excludeFandomIds}
              onChange={(excludeFandomIds) => update({ excludeFandomIds })}
            />
            <TagCheckboxGroup
              label="Characters"
              options={sidebar.excludeCharacters}
              selected={filters.excludeCharacterIds}
              onChange={(excludeCharacterIds) => update({ excludeCharacterIds })}
            />
            <TagCheckboxGroup
              label="Relationships"
              options={sidebar.excludeRelationships}
              selected={filters.excludeRelationshipIds}
              onChange={(excludeRelationshipIds) => update({ excludeRelationshipIds })}
            />
            <TagCheckboxGroup
              label="Additional Tags"
              options={sidebar.excludeFreeforms}
              selected={filters.excludeFreeformIds}
              onChange={(excludeFreeformIds) => update({ excludeFreeformIds })}
            />
          </>
        )}
        <div className="space-y-1.5">
          <Label>Other tags to exclude</Label>
          <Input
            type="text"
            placeholder="Tag names, comma separated"
            value={filters.otherTagsToExclude}
            onChange={(e) => update({ otherTagsToExclude: e.target.value })}
            className="h-8"
          />
        </div>
      </CollapsibleSection>

      {/* More Options */}
      <CollapsibleSection title="More Options">
        <div className="space-y-1.5">
          <Label>Crossovers</Label>
          <Select
            value={filters.crossover}
            onChange={(e) => update({ crossover: e.target.value })}
          >
            {CROSSOVER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Date Updated</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <DatePicker
                value={filters.dateFrom}
                onChange={(dateFrom) => update({ dateFrom })}
                placeholder="From"
              />
            </div>
            <span className="text-muted-foreground shrink-0">to</span>
            <div className="flex-1 min-w-0">
              <DatePicker
                value={filters.dateTo}
                onChange={(dateTo) => update({ dateTo })}
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

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


// --- Main Page ---

export function WorkListPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const setDashboardLinks = useSetDashboardLinksOptional()
  const navigate = useNavigate()
  const data = useMemo(() => doc ? parseWorkList(doc) : null, [doc])
  const initialFilters = useMemo(() => parseFilterParams(url), [url])
  const sidebar = useMemo(() => doc ? parseFilterSidebar(doc) : null, [doc])
  const tagPage = useMemo(() => isTagPage(new URL(url).pathname), [url])
  const inDashboard = setDashboardLinks !== null

  useEffect(() => {
    if (doc) {
      setCurrentUser(parseCurrentUser(doc))
      if (setDashboardLinks) {
        setDashboardLinks(parseDashboardLinks(doc))
      }
    }
  }, [doc])

  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  if (isLoading) return inDashboard ? <ContentSkeleton /> : <PageSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!data) return null

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

  const content = (
    <>
      {/* Toolbar: sort + filter toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {data.pagination.currentPage} of {data.pagination.totalPages}
        </span>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ArrowUpDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.sortColumn}
                onValueChange={handleSortChange}
              >
                {SORT_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          sidebar={sidebar}
          tagPage={tagPage}
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
    </>
  )

  if (inDashboard) return content

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {content}
    </div>
  )
}
