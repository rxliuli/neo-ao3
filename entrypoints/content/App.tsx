import { useCallback, useEffect, useRef, useState } from 'react'
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
import { NavigationProvider } from './navigation'
import { CurrentUserProvider } from './auth'
import { parseCurrentUser, type CurrentUser } from '@/lib/ao3/parseLoginForm'
import { matchRoute, type Route } from './router'

export function App(props: {
  initialRoute: Route
  initialDoc: Document | null
}) {
  const [route, setRoute] = useState<Route>(props.initialRoute)
  const [doc, setDoc] = useState<Document | null>(props.initialDoc)
  const [currentUrl, setCurrentUrl] = useState(window.location.href)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    props.initialDoc ? parseCurrentUser(props.initialDoc) : null,
  )
  const navIdRef = useRef(0)

  const handleLoginSuccess = useCallback(
    (user: CurrentUser, redirectDoc: Document, redirectUrl: string) => {
      setCurrentUser(user)
      const matched = matchRoute(redirectUrl)
      if (matched) {
        history.pushState(null, '', redirectUrl)
        setRoute(matched)
        setDoc(redirectDoc)
        setCurrentUrl(redirectUrl)
        window.scrollTo(0, 0)
      } else {
        // Redirect target isn't a supported route, full navigation
        window.location.href = redirectUrl
      }
    },
    [],
  )

  const navigate = useCallback(async (url: string) => {
    // Resolve to absolute URL
    const resolved = new URL(url, window.location.href).href
    const matched = matchRoute(resolved)

    // If we can't handle this route, do a full navigation
    if (!matched) {
      window.location.href = resolved
      return
    }

    const id = ++navIdRef.current
    setLoading(true)

    try {
      let newDoc: Document | null = null
      if (matched.type !== 'home') {
        const response = await fetch(resolved)
        if (response.status === 403) {
          // Cloudflare challenge — full navigation, content script will handle it
          window.location.href = resolved
          return
        }
        const html = await response.text()
        if (id !== navIdRef.current) return // stale
        newDoc = new DOMParser().parseFromString(html, 'text/html')
      }

      if (id !== navIdRef.current) return // stale

      history.pushState(null, '', resolved)
      setRoute(matched)
      setDoc(newDoc)
      setCurrentUrl(resolved)
      if (newDoc) setCurrentUser(parseCurrentUser(newDoc))
      window.scrollTo(0, 0)
    } finally {
      if (id === navIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Global <a> click interceptor
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Skip if modifier keys held (new tab behavior)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      // Skip non-left clicks
      if (e.button !== 0) return

      // Find the closest <a> element
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return

      // Skip if target attribute is set (e.g. target="_blank")
      if (anchor.target) return

      const href = anchor.href
      if (!href) return

      // Skip external origins
      try {
        const linkUrl = new URL(href, window.location.href)
        if (linkUrl.origin !== window.location.origin) return

        const matched = matchRoute(linkUrl.href)
        if (matched) {
          e.preventDefault()
          navigate(linkUrl.href)
        }
        // Unmatched routes: normal browser navigation
      } catch {
        // Invalid URL, let browser handle it
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [navigate])

  // popstate listener for back/forward
  useEffect(() => {
    async function handlePopState() {
      const matched = matchRoute(window.location.href)
      if (!matched) {
        window.location.reload()
        return
      }

      const id = ++navIdRef.current
      setLoading(true)

      try {
        let newDoc: Document | null = null
        if (matched.type !== 'home') {
          const response = await fetch(window.location.href)
          if (response.status === 403) {
            window.location.reload()
            return
          }
          const html = await response.text()
          if (id !== navIdRef.current) return
          newDoc = new DOMParser().parseFromString(html, 'text/html')
        }

        if (id !== navIdRef.current) return

        setRoute(matched)
        setDoc(newDoc)
        setCurrentUrl(window.location.href)
        if (newDoc) setCurrentUser(parseCurrentUser(newDoc))
      } finally {
        if (id === navIdRef.current) {
          setLoading(false)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <ThemeProvider>
      <CurrentUserProvider value={currentUser}>
        <NavigationProvider value={navigate}>
          {loading && (
            <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary animate-pulse" />
          )}
          <AppHeader />
          {route.type === 'home' && <HomePage key={currentUrl} />}
          {route.type === 'login' && doc && (
            <LoginPage key={currentUrl} doc={doc} onLoginSuccess={handleLoginSuccess} />
          )}
          {route.type === 'work-list' && doc && (
            <WorkListPage key={currentUrl} doc={doc} url={currentUrl} />
          )}
          {route.type === 'work-detail' && doc && (
            <WorkDetailPage key={currentUrl} doc={doc} />
          )}
          {route.type === 'fandom-list' && doc && (
            <FandomListPage key={currentUrl} doc={doc} />
          )}
          {route.type === 'user-bookmarks' && doc && (
            <UserBookmarksPage key={currentUrl} doc={doc} url={currentUrl} />
          )}
          {route.type === 'user-preferences' && doc && (
            <UserPreferencesPage key={currentUrl} doc={doc} />
          )}
          {route.type === 'user-history' && doc && (
            <UserHistoryPage key={currentUrl} doc={doc} url={currentUrl} />
          )}
          {route.type === 'user-inbox' && doc && (
            <UserInboxPage key={currentUrl} doc={doc} url={currentUrl} />
          )}
          {route.type === 'user-stats' && doc && (
            <UserStatsPage key={currentUrl} doc={doc} />
          )}
          {route.type === 'user-profile' && doc && (
            <UserProfilePage key={currentUrl} doc={doc} />
          )}
        </NavigationProvider>
      </CurrentUserProvider>
    </ThemeProvider>
  )
}
