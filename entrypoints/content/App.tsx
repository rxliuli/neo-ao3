import { useCallback, useEffect, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { ThemeProvider } from '@/integrations/theme/ThemeProvider'
import { AppHeader } from './components/AppHeader'
import { HomePage } from './pages/HomePage'
import { WorkListPage } from './pages/WorkListPage'
import { WorkDetailPage } from './pages/WorkDetailPage'
import { FandomListPage } from './pages/FandomListPage'
import { UserProfilePage } from './pages/UserProfilePage'
import { UserBookmarksPage } from './pages/UserBookmarksPage'
import { UserPreferencesPage } from './pages/UserPreferencesPage'
import { UserHistoryPage } from './pages/UserHistoryPage'
import { UserInboxPage } from './pages/UserInboxPage'
import { UserStatsPage } from './pages/UserStatsPage'
import { LoginPage } from './pages/LoginPage'
import { CommentPage } from './pages/CommentPage'
import { NavigationProvider } from './navigation'
import { CurrentUserProviderWithState } from './auth'
import { UrlProvider } from './hooks/useCurrentUrl'
import { UserDashboardLayout } from './components/UserDashboardLayout'
import type { CurrentUser } from '@/lib/ao3/parseLoginForm'
import { matchRoute, type Route } from './router'

const USER_DASHBOARD_ROUTES = new Set<Route['type']>([
  'user-profile',
  'user-bookmarks',
  'user-history',
  'user-inbox',
  'user-stats',
  'user-preferences',
])

function extractUsername(url: string): string | null {
  const match = new URL(url).pathname.match(/^\/users\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function isUserWorksPage(url: string): boolean {
  return /^\/users\/[^/]+\/(pseuds\/[^/]+\/)?works/.test(new URL(url).pathname)
}

function getUserPageTitle(routeType: Route['type']): string {
  switch (routeType) {
    case 'user-profile': return 'Profile'
    case 'user-bookmarks': return 'Bookmarks'
    case 'user-history': return 'History'
    case 'user-inbox': return 'Inbox'
    case 'user-stats': return 'Statistics'
    case 'user-preferences': return 'Preferences'
    case 'work-list': return 'Works'
    default: return ''
  }
}

export function App(props: {
  initialRoute: Route
  initialUser: CurrentUser | null
}) {
  const [route, setRoute] = useState<Route>(props.initialRoute)
  const [currentUrl, setCurrentUrl] = useState(window.location.href)
  const isFetching = useIsFetching()

  const navigate = useCallback((url: string) => {
    const resolved = new URL(url, window.location.href).href
    const matched = matchRoute(resolved)

    if (!matched) {
      window.location.href = resolved
      return
    }

    history.pushState(null, '', resolved)
    setRoute(matched)
    setCurrentUrl(resolved)
    window.scrollTo(0, 0)
  }, [])

  // Global <a> click interceptor
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.button !== 0) return

      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      if (anchor.target) return

      const href = anchor.href
      if (!href) return

      try {
        const linkUrl = new URL(href, window.location.href)
        if (linkUrl.origin !== window.location.origin) return

        const matched = matchRoute(linkUrl.href)
        if (matched) {
          e.preventDefault()
          navigate(linkUrl.href)
        }
      } catch {
        // Invalid URL, let browser handle it
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [navigate])

  // popstate listener for back/forward
  useEffect(() => {
    function handlePopState() {
      const matched = matchRoute(window.location.href)
      if (!matched) {
        window.location.reload()
        return
      }

      setRoute(matched)
      setCurrentUrl(window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const username = extractUsername(currentUrl)
  const isUserDashboard =
    USER_DASHBOARD_ROUTES.has(route.type) ||
    (route.type === 'work-list' && isUserWorksPage(currentUrl))

  return (
    <ThemeProvider>
      <CurrentUserProviderWithState initialUser={props.initialUser}>
        <NavigationProvider value={navigate}>
          <UrlProvider value={currentUrl}>
            {isFetching > 0 && (
              <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary animate-pulse" />
            )}
            <AppHeader />
            {isUserDashboard && username ? (
              <UserDashboardLayout key={username} title={getUserPageTitle(route.type)}>
                {route.type === 'work-list' && <WorkListPage key={currentUrl} />}
                {route.type === 'user-bookmarks' && <UserBookmarksPage key={currentUrl} />}
                {route.type === 'user-history' && <UserHistoryPage key={currentUrl} />}
                {route.type === 'user-inbox' && <UserInboxPage key={currentUrl} />}
                {route.type === 'user-stats' && <UserStatsPage key={currentUrl} />}
                {route.type === 'user-preferences' && <UserPreferencesPage key={currentUrl} />}
                {route.type === 'user-profile' && <UserProfilePage key={currentUrl} />}
              </UserDashboardLayout>
            ) : (
              <>
                {route.type === 'home' && <HomePage key={currentUrl} />}
                {route.type === 'login' && <LoginPage key={currentUrl} />}
                {route.type === 'work-list' && <WorkListPage key={currentUrl} />}
                {route.type === 'work-detail' && <WorkDetailPage key={currentUrl} />}
                {route.type === 'comment-show' && <CommentPage key={currentUrl} />}
                {route.type === 'fandom-list' && <FandomListPage key={currentUrl} />}
              </>
            )}
          </UrlProvider>
        </NavigationProvider>
      </CurrentUserProviderWithState>
    </ThemeProvider>
  )
}
