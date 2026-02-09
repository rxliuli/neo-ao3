import { useMemo } from 'react'
import {
  parseStats,
  type FandomStat,
  type StatsTotals,
  type WorkStat,
  type YearOption,
} from '@/lib/ao3/parseStats'
import { parseDashboardLinks } from '@/lib/ao3/parseUserProfile'
import { UserDashboardNav } from '../components/UserDashboardNav'

function TotalsCard({ totals }: { totals: StatsTotals }) {
  const items = [
    { label: 'User Subscriptions', value: totals.userSubscriptions },
    { label: 'Kudos', value: totals.kudos },
    { label: 'Comment Threads', value: totals.commentThreads },
    { label: 'Bookmarks', value: totals.bookmarks },
    { label: 'Subscriptions', value: totals.subscriptions },
    { label: 'Word Count', value: totals.wordCount },
    { label: 'Hits', value: totals.hits },
  ]

  return (
    <div className="border rounded-md p-4">
      <h2 className="font-semibold mb-3">Totals</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function YearNav({ years }: { years: YearOption[] }) {
  if (years.length === 0) return null

  return (
    <div className="flex gap-1 border-b">
      {years.map((year) =>
        year.isCurrent ? (
          <span
            key={year.label}
            className="text-sm px-3 py-2 border-b-2 border-primary font-medium shrink-0"
          >
            {year.label}
          </span>
        ) : (
          <a
            key={year.label}
            href={year.url}
            className="text-sm px-3 py-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted-foreground/30 shrink-0"
          >
            {year.label}
          </a>
        ),
      )}
    </div>
  )
}

function WorkStatRow({ work }: { work: WorkStat }) {
  const stats = [
    { label: 'Hits', value: work.hits },
    { label: 'Kudos', value: work.kudos },
    { label: 'Comments', value: work.commentThreads },
    { label: 'Bookmarks', value: work.bookmarks },
    ...(work.subscriptions > 0
      ? [{ label: 'Subscriptions', value: work.subscriptions }]
      : []),
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b last:border-b-0 gap-1">
      <div className="min-w-0">
        <a href={work.url} className="text-sm text-primary hover:underline">
          {work.title}
        </a>
        <span className="text-xs text-muted-foreground ml-2">
          ({work.wordCount.toLocaleString()} words)
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground shrink-0">
        {stats.map((s) => (
          <span key={s.label}>
            {s.label}: {s.value.toLocaleString()}
          </span>
        ))}
      </div>
    </div>
  )
}

function FandomSection({ fandom }: { fandom: FandomStat }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded">
        {fandom.fandom}
      </h3>
      <div className="px-3">
        {fandom.works.map((work) => (
          <WorkStatRow key={work.url} work={work} />
        ))}
      </div>
    </div>
  )
}

export function UserStatsPage({ doc }: { doc: Document }) {
  const data = useMemo(() => parseStats(doc), [doc])
  const dashboardLinks = useMemo(() => parseDashboardLinks(doc), [doc])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <UserDashboardNav links={dashboardLinks} />

      <YearNav years={data.years} />

      <TotalsCard totals={data.totals} />

      {/* Per-fandom work stats */}
      <div className="space-y-4">
        {data.fandoms.map((fandom) => (
          <FandomSection key={fandom.fandom} fandom={fandom} />
        ))}
      </div>

      {data.fandoms.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No statistics available.
        </p>
      )}
    </div>
  )
}
