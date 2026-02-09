export function ContentSkeleton() {
  return (
    <>
      <div className="space-y-3">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-3 pt-4">
        <div className="h-20 w-full bg-muted animate-pulse rounded" />
        <div className="h-20 w-full bg-muted animate-pulse rounded" />
        <div className="h-20 w-full bg-muted animate-pulse rounded" />
      </div>
    </>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <ContentSkeleton />
    </div>
  )
}
