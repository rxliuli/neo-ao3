import { useMemo } from 'react'
import { parseUserProfile } from '@/lib/ao3/parseUserProfile'
import { Badge } from '@/components/ui/badge'
import type { WorkBlurb } from '@/lib/ao3/types'

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
      </div>

      {work.fandoms.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {work.fandoms.map((f) => (
            <a key={f} href={`/tags/${encodeURIComponent(f)}/works`}>
              <Badge variant="secondary" className="text-xs hover:bg-accent">
                {f}
              </Badge>
            </a>
          ))}
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
        <span>{work.date}</span>
      </div>
    </article>
  )
}

export function UserProfilePage({ doc }: { doc: Document }) {
  const profile = useMemo(() => parseUserProfile(doc), [doc])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <img
          src={profile.avatarUrl}
          alt=""
          className="size-16 rounded-full bg-muted"
        />
        <h1 className="text-2xl font-bold">{profile.username}</h1>
      </header>

      {/* Bio */}
      {profile.bio && (
        <div
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: profile.bio }}
        />
      )}

      {/* Dashboard tabs */}
      {profile.dashboardLinks.length > 0 && (
        <nav className="flex gap-1 border-b">
          {profile.dashboardLinks.map((link) =>
            link.isCurrent ? (
              <span
                key={link.label}
                className="text-sm px-3 py-2 border-b-2 border-primary font-medium"
              >
                {link.label}
              </span>
            ) : (
              <a
                key={link.url}
                href={link.url}
                className="text-sm px-3 py-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-muted-foreground/30"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      )}

      {/* Fandoms */}
      {profile.fandoms.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Fandoms</h2>
          <div className="flex flex-wrap gap-1">
            {profile.fandoms.map((f) => (
              <a key={f.url} href={f.url}>
                <Badge variant="secondary" className="hover:bg-accent">
                  {f.name} ({f.count})
                </Badge>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Recent works */}
      {profile.recentWorks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Recent Works</h2>
          <div>
            {profile.recentWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
