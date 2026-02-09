export interface Fandom {
  name: string
  url: string
  count: number
}

export interface FandomGroup {
  letter: string
  fandoms: Fandom[]
}

export interface FandomListPage {
  title: string
  groups: FandomGroup[]
}

export function parseFandomList(doc: Document): FandomListPage {
  const title =
    doc.querySelector('#main h2.heading')?.textContent?.trim() ?? ''

  const groups: FandomGroup[] = []

  // Structure: <ol class="alphabet fandom index group"> > <li id="letter-." class="letter listbox group">
  const letterItems = doc.querySelectorAll('ol.alphabet.fandom li.letter[id^="letter-"]')

  for (const letterLi of letterItems) {
    const letter = letterLi.id.replace('letter-', '')
    const fandoms: Fandom[] = []

    // Fandoms: <ul class="tags index group"> > <li> > <a class="tag">
    for (const li of letterLi.querySelectorAll('ul.tags li')) {
      const a = li.querySelector('a.tag')
      if (!a) continue

      const name = a.textContent?.trim() ?? ''
      const url = a.getAttribute('href') ?? ''

      // Work count is in parentheses after the link, e.g. "(861)"
      const text = li.textContent ?? ''
      const countMatch = text.match(/\((\d[\d,]*)\)\s*$/)
      const count = countMatch
        ? parseInt(countMatch[1].replace(/,/g, ''), 10)
        : 0

      fandoms.push({ name, url, count })
    }

    if (fandoms.length > 0) {
      groups.push({ letter, fandoms })
    }
  }

  return { title, groups }
}
