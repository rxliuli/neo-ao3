import { useMemo } from 'react'
import { parseUserProfile } from '@/lib/ao3/parseUserProfile'
import { Badge } from '@/components/ui/badge'
import { UserDashboardNav } from '../components/UserDashboardNav'
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
        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          {profile.joinDate && (
            <p className="text-sm text-muted-foreground">
              Joined {profile.joinDate}
            </p>
          )}
        </div>
      </header>

      {/* Bio */}
      {profile.bio && (
        <div
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: profile.bio }}
        />
      )}

      {/* Dashboard tabs */}
      <UserDashboardNav links={profile.dashboardLinks} />

      {/* Meta info */}
      <section className="rounded-lg border p-4 space-y-3">
        {profile.pseuds.length > 0 && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground min-w-[100px]">Pseuds:</span>
            <div className="flex flex-wrap gap-1">
              {profile.pseuds.map((p) => (
                <a key={p.url} href={p.url} className="text-primary hover:underline">
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        )}
        {profile.joinDate && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground min-w-[100px]">Joined:</span>
            <span>{profile.joinDate}</span>
          </div>
        )}
        {profile.userIdNum && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground min-w-[100px]">User ID:</span>
            <span>{profile.userIdNum}</span>
          </div>
        )}
      </section>

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
