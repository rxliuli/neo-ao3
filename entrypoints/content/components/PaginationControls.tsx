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
}: {
  currentIndex: number
  totalChapters: number
  chapterUrls: string[]
}) {
  if (totalChapters <= 1) return null

  const currentPage = currentIndex + 1
  const pages = buildPages(currentPage, totalChapters)

  return (
    <PaginationRoot className="border-t pt-6">
      <PaginationContent>
        {currentIndex > 0 && (
          <PaginationItem>
            <PaginationPrevious href={chapterUrls[currentIndex - 1]} />
          </PaginationItem>
        )}
        {pages.map((p, i) => (
          <PaginationItem key={p === '...' ? `ellipsis-${i}` : p}>
            {p === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={chapterUrls[(p as number) - 1]}
                isActive={p === currentPage}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        {currentIndex < totalChapters - 1 && (
          <PaginationItem>
            <PaginationNext href={chapterUrls[currentIndex + 1]} />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationRoot>
  )
}
