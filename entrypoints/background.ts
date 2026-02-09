export default defineBackground(() => {
  browser.contextMenus.create({
    id: 'show-original',
    title: 'Show Original Page',
    contexts: ['action'],
  })

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'show-original' || !tab?.id || !tab.url) return
    const url = new URL(tab.url)
    url.searchParams.set('neo-ao3-original', '')
    await browser.tabs.update(tab.id, { url: url.toString() })
  })
})
