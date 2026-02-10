import type { Pagination } from '@/lib/ao3/types'
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

function buildPages(currentPage: number, totalPages: number): (number | '...')[] {
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
  return pages
}

export function PaginationControls({
  pagination,
  url,
  onNavigate,
}: {
  pagination: Pagination
  url: string
  onNavigate?: (url: string) => void
}) {
  const { currentPage, totalPages } = pagination
  if (totalPages <= 1) return null

  function pageUrl(page: number): string {
    const u = new URL(url)
    if (page <= 1) {
      u.searchParams.delete('page')
    } else {
      u.searchParams.set('page', String(page))
    }
    return u.toString()
  }

  function handleClick(e: React.MouseEvent, href: string) {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  const pages = buildPages(currentPage, totalPages)

  return (
    <PaginationRoot className="py-6">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href={pageUrl(currentPage - 1)}
              onClick={(e) => handleClick(e, pageUrl(currentPage - 1))}
            />
          </PaginationItem>
        )}
        {pages.map((p, i) => (
          <PaginationItem key={p === '...' ? `ellipsis-${i}` : p}>
            {p === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={pageUrl(p)}
                isActive={p === currentPage}
                onClick={(e) => handleClick(e, pageUrl(p))}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              href={pageUrl(currentPage + 1)}
              onClick={(e) => handleClick(e, pageUrl(currentPage + 1))}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationRoot>
  )
}

export function ChapterPagination({
  currentIndex,
  totalChapters,
  chapterUrls,
  chapterNames,
  onNavigate,
}: {
  currentIndex: number
  totalChapters: number
  chapterUrls: string[]
  chapterNames: string[]
  onNavigate?: (url: string) => void
}) {
  if (totalChapters <= 1) return null

  function handleNavClick(e: React.MouseEvent, url: string) {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(url)
    }
  }

  return (
    <div className="border-t pt-6 flex items-center justify-center gap-2">
      <Button variant="ghost" size="sm" asChild disabled={currentIndex === 0}>
        <a
          href={currentIndex > 0 ? chapterUrls[currentIndex - 1] : undefined}
          onClick={(e) => currentIndex > 0 && handleNavClick(e, chapterUrls[currentIndex - 1])}
        >
          ← Previous
        </a>
      </Button>
      <Select
        value={currentIndex}
        onChange={(e) => {
          const url = chapterUrls[Number(e.target.value)]
          if (onNavigate) {
            onNavigate(url)
          } else {
            window.location.href = url
          }
        }}
        className="min-w-0 max-w-xs w-auto"
      >
        {chapterNames.map((name, i) => (
          <option key={i} value={i}>
            {name}
          </option>
        ))}
      </Select>
      <Button variant="ghost" size="sm" asChild disabled={currentIndex >= totalChapters - 1}>
        <a
          href={currentIndex < totalChapters - 1 ? chapterUrls[currentIndex + 1] : undefined}
          onClick={(e) => currentIndex < totalChapters - 1 && handleNavClick(e, chapterUrls[currentIndex + 1])}
        >
          Next →
        </a>
      </Button>
    </div>
  )
}
