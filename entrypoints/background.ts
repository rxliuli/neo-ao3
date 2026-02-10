export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url) return
    const url = new URL(tab.url)
    if (url.hostname !== 'archiveofourown.org') return

    if (url.searchParams.has('neo-ao3-original')) {
      url.searchParams.delete('neo-ao3-original')
    } else {
      url.searchParams.set('neo-ao3-original', '')
    }
    await browser.tabs.update(tab.id, { url: url.toString() })
  })
})
