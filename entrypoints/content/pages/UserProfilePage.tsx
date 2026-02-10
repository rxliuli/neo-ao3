import { useEffect, useMemo } from 'react'
import { parseUserProfile } from '@/lib/ao3/parseUserProfile'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { Badge } from '@/components/ui/badge'
import { tagWorksUrl } from '@/lib/ao3/tagUrl'
import { Button } from '@/components/ui/button'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useCurrentUser, useSetCurrentUser } from '../auth'
import { useSetDashboardLinks } from '../components/UserDashboardLayout'
import { ContentSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'
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
            <a key={f} href={tagWorksUrl(f)}>
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

export function UserProfilePage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error } = useAo3Page(url)
  const currentUser = useCurrentUser()
  const setCurrentUser = useSetCurrentUser()
  const setDashboardLinks = useSetDashboardLinks()
  const profile = useMemo(() => doc ? parseUserProfile(doc) : null, [doc])
  const profileUsername = useMemo(() => {
    try {
      return new URL(url).pathname.match(/^\/users\/([^/]+)/)?.[1] ?? null
    } catch { return null }
  }, [url])
  const isOwnProfile = !!(currentUser?.username && profileUsername && currentUser.username === decodeURIComponent(profileUsername))

  useEffect(() => {
    if (doc) {
      setCurrentUser(parseCurrentUser(doc))
    }
  }, [doc])

  useEffect(() => {
    if (profile) {
      setDashboardLinks(profile.dashboardLinks)
    }
  }, [profile])

  if (isLoading) return <ContentSkeleton />
  if (error) return <PageError error={error} url={url} />
  if (!profile) return null

  return (
    <>
      {/* Bio */}
      {profile.bio && (
        <div
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: profile.bio }}
        />
      )}

      {/* Meta info */}
      {(profile.pseuds.length > 0 || profile.joinDate || profile.userIdNum) && (
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
    </>
  )
}
