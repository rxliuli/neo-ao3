import ReactDOM from 'react-dom/client'
import { App } from './App'
import styles from './style.css?inline'
import { matchRoute } from './router'

export default defineContentScript({
  matches: ['*://archiveofourown.org/*'],
  cssInjectionMode: 'manual',
  runAt: 'document_start',

  async main(ctx) {
    const route = matchRoute(window.location.href)
    if (!route) return

    // Stop the page from loading any more resources (CSS, images, scripts)
    window.stop()

    // Replace document with our minimal shell
    document.documentElement.innerHTML =
      `<head><style>${styles}</style></head>` +
      `<body><div id="neo-ao3-root"></div></body>`

    // Fetch the original page HTML for data parsing (skip for pages that don't need it)
    let doc: Document | null = null
    if (route.type !== 'home') {
      const response = await fetch(window.location.href)
      const html = await response.text()
      doc = new DOMParser().parseFromString(html, 'text/html')
    }

    // Mount React
    const rootEl = document.getElementById('neo-ao3-root')!
    const root = ReactDOM.createRoot(rootEl)

    function showOriginal() {
      const url = new URL(window.location.href)
      url.searchParams.set('neo-ao3-original', '')
      window.location.href = url.toString()
    }

    root.render(
      <App
        initialRoute={route}
        initialDoc={doc}
        onShowOriginal={showOriginal}
      />,
    )

    ctx.onInvalidated(() => {
      root.unmount()
    })
  },
})
