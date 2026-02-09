import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { parseBookmarkList, type BookmarkBlurb } from '@/lib/ao3/parseBookmarkList'
import {
  parseBookmarkFilterParams,
  buildBookmarkFilterUrl,
  defaultBookmarkFilterState,
  type BookmarkFilterState,
} from '@/lib/ao3/parseBookmarkFilterParams'
import {
  parseBookmarkFilterSidebar,
  type BookmarkFilterSidebar,
} from '@/lib/ao3/parseBookmarkFilterSidebar'
import type { TagOption } from '@/lib/ao3/parseFilterSidebar'
import { parseDashboardLinks } from '@/lib/ao3/parseUserProfile'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ArrowUpDown, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { useNavigate } from '../navigation'
import { PaginationControls } from '../components/PaginationControls'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { useSetDashboardLinks } from '../components/UserDashboardLayout'
import { ContentSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'

const SORT_OPTIONS = [
  { label: 'Date Bookmarked', value: 'created_at' },
  { label: 'Date Updated', value: 'bookmarkable_date' },
  { label: 'Word Count', value: 'word_count' },
]

function BookmarkCard({ bookmark }: { bookmark: BookmarkBlurb }) {
  const { work, bookmark: meta } = bookmark
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
          {meta.isRec && (
            <Badge variant="default" className="ml-2 text-xs">
              Rec
            </Badge>
          )}
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
        {work.stats.hits > 0 && (
          <span>Hits: {work.stats.hits.toLocaleString()}</span>
        )}
      </div>

      {/* Bookmark metadata */}
      <div className="border-t pt-2 mt-2 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Bookmarked {meta.bookmarkDate}</span>
        </div>

        {meta.bookmarkerTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meta.bookmarkerTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {meta.bookmarkerNotes && (
          <div
            className="text-sm text-muted-foreground italic"
            dangerouslySetInnerHTML={{ __html: meta.bookmarkerNotes }}
          />
        )}
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

function BookmarkFilterPanel(props: {
  filters: BookmarkFilterState
  onChange: (filters: BookmarkFilterState) => void
  onApply: () => void
  onReset: () => void
  sidebar: BookmarkFilterSidebar | null
}) {
  const { filters, onChange, sidebar } = props

  function update(partial: Partial<BookmarkFilterState>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      {/* Bookmark-specific toggles */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={filters.rec === '1'}
            onChange={(e) => update({ rec: e.target.checked ? '1' : '' })}
          />
          Rec only
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={filters.withNotes === '1'}
            onChange={(e) => update({ withNotes: e.target.checked ? '1' : '' })}
          />
          With notes
        </label>
      </div>

      {/* Include Tags */}
      <CollapsibleSection title="Include Tags">
        {sidebar && (
          <>
            <TagCheckboxGroup
              label="Ratings"
              options={sidebar.includeRatings}
              selected={filters.includeRatingIds}
              onChange={(includeRatingIds) => update({ includeRatingIds })}
            />
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
            <TagCheckboxGroup
              label="Bookmarker's Tags"
              options={sidebar.includeBookmarkerTags}
              selected={filters.includeBookmarkerTagIds}
              onChange={(includeBookmarkerTagIds) => update({ includeBookmarkerTagIds })}
            />
          </>
        )}
        <div className="space-y-1.5">
          <Label>Other work tags to include</Label>
          <Input
            type="text"
            placeholder="Tag names, comma separated"
            value={filters.otherTagsToInclude}
            onChange={(e) => update({ otherTagsToInclude: e.target.value })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Other bookmarker's tags to include</Label>
          <Input
            type="text"
            placeholder="Tag names, comma separated"
            value={filters.otherBookmarkTagsToInclude}
            onChange={(e) => update({ otherBookmarkTagsToInclude: e.target.value })}
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
            <TagCheckboxGroup
              label="Bookmarker's Tags"
              options={sidebar.excludeBookmarkerTags}
              selected={filters.excludeBookmarkerTagIds}
              onChange={(excludeBookmarkerTagIds) => update({ excludeBookmarkerTagIds })}
            />
          </>
        )}
        <div className="space-y-1.5">
          <Label>Other work tags to exclude</Label>
          <Input
            type="text"
            placeholder="Tag names, comma separated"
            value={filters.otherTagsToExclude}
            onChange={(e) => update({ otherTagsToExclude: e.target.value })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Other bookmarker's tags to exclude</Label>
          <Input
            type="text"
            placeholder="Tag names, comma separated"
            value={filters.otherBookmarkTagsToExclude}
            onChange={(e) => update({ otherBookmarkTagsToExclude: e.target.value })}
            className="h-8"
          />
        </div>
      </CollapsibleSection>

      {/* More Options */}
      <CollapsibleSection title="More Options">
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

        <div className="space-y-1.5">
          <Label>Search within results</Label>
          <Input
            type="text"
            placeholder="Search works..."
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            className="h-8"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Search bookmarker's tags and notes</Label>
          <Input
            type="text"
            placeholder="Search bookmarks..."
            value={filters.bookmarkQuery}
            onChange={(e) => update({ bookmarkQuery: e.target.value })}
            className="h-8"
          />
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


export function UserBookmarksPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const setDashboardLinks = useSetDashboardLinks()
  const navigate = useNavigate()
  const data = useMemo(() => doc ? parseBookmarkList(doc) : null, [doc])
  const initialFilters = useMemo(() => parseBookmarkFilterParams(url), [url])
  const sidebar = useMemo(() => doc ? parseBookmarkFilterSidebar(doc) : null, [doc])

  useEffect(() => {
    if (doc) {
      setCurrentUser(parseCurrentUser(doc))
      setDashboardLinks(parseDashboardLinks(doc))
    }
  }, [doc])

  const [filters, setFilters] = useState<BookmarkFilterState>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  if (isLoading) return <ContentSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!data) return null

  function handleSortChange(sortColumn: string) {
    const updated = { ...filters, sortColumn }
    navigate(buildBookmarkFilterUrl(url, updated))
  }

  function handleApplyFilters() {
    navigate(buildBookmarkFilterUrl(url, filters))
  }

  function handleResetFilters() {
    const reset = defaultBookmarkFilterState()
    navigate(buildBookmarkFilterUrl(url, reset))
  }

  return (
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
        <BookmarkFilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          sidebar={sidebar}
        />
      )}

      {/* Bookmark list */}
      <div>
        {data.bookmarks.map((bm) => (
          <BookmarkCard key={bm.bookmarkId} bookmark={bm} />
        ))}
      </div>

      {data.bookmarks.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No bookmarks found.
        </p>
      )}

      <PaginationControls pagination={data.pagination} url={url} />
    </>
  )
}
