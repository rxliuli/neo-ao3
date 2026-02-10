import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { queryClient } from './queryClient'
import styles from './style.css?inline'
import { matchRoute } from './router'
import { parseCurrentUser } from '@/lib/ao3/parseLoginForm'

export default defineContentScript({
  matches: ['*://archiveofourown.org/*'],
  cssInjectionMode: 'manual',
  runAt: 'document_start',

  async main(ctx) {
    const route = matchRoute(window.location.href)
    if (!route) {
      // In original mode, intercept links to propagate the ?neo-ao3-original param
      const currentUrl = new URL(window.location.href)
      if (currentUrl.searchParams.has('neo-ao3-original')) {
        document.addEventListener('click', (e) => {
          const anchor = (e.target as Element).closest?.('a')
          if (!anchor) return
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
          if (anchor.target && anchor.target !== '_self') return

          const href = anchor.getAttribute('href')
          if (!href) return

          try {
            const linkUrl = new URL(href, window.location.origin)
            if (linkUrl.origin !== window.location.origin) return
            if (linkUrl.searchParams.has('neo-ao3-original')) return

            e.preventDefault()
            linkUrl.searchParams.set('neo-ao3-original', '')
            window.location.href = linkUrl.toString()
          } catch {
            // Invalid URL, let browser handle it
          }
        })
      }
      return
    }

    // Stop the page from loading any more resources (CSS, images, scripts)
    window.stop()

    // Replace document with our minimal shell
    document.documentElement.innerHTML =
      `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${styles}</style></head>` +
      `<body><div id="neo-ao3-root"></div></body>`

    // Fetch the original page HTML for data parsing (skip for pages that don't need it)
    let doc: Document | null = null
    let initialUser = null
    if (route.type !== 'home') {
      const response = await fetch(window.location.href)
      if (response.status === 403) {
        // Cloudflare challenge — render challenge page so scripts execute
        const html = await response.text()
        document.open()
        document.write(html)
        document.close()
        return
      }
      const html = await response.text()
      doc = new DOMParser().parseFromString(html, 'text/html')
      initialUser = parseCurrentUser(doc)

      // Pre-seed the query cache so the page doesn't double-fetch
      queryClient.setQueryData(['ao3-page', window.location.href], doc)
    }

    // Mount React
    const rootEl = document.getElementById('neo-ao3-root')!
    const root = ReactDOM.createRoot(rootEl)

    root.render(
      <QueryClientProvider client={queryClient}>
        <App
          initialRoute={route}
          initialUser={initialUser}
        />
      </QueryClientProvider>,
    )

    ctx.onInvalidated(() => {
      root.unmount()
    })
  },
})
