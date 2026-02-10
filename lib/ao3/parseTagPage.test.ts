import { describe, expect, it } from 'vitest'
import { parseTagPage } from './parseTagPage'
import tagPageHtml from './__fixtures__/tag-page.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseTagPage', () => {
  const doc = parseHTML(tagPageHtml)
  const result = parseTagPage(doc)

  it('should parse tag name', () => {
    expect(result.name).toBe('Mime Power!')
  })

  it('should parse category', () => {
    expect(result.category).toBe('Additional Tags')
  })

  it('should parse parent tags', () => {
    expect(result.parentTags).toEqual(['Supernatural Elements', 'Magic'])
  })

  it('should detect uncommon tag', () => {
    expect(result.isCommon).toBe(false)
  })

  it('should parse the correct number of works', () => {
    expect(result.works).toHaveLength(2)
  })

  describe('work 1', () => {
    const work = result.works[0]

    it('should parse id', () => {
      expect(work.id).toBe('50001')
    })

    it('should parse title', () => {
      expect(work.title).toBe("The Mime's Silent Power")
    })

    it('should parse author', () => {
      expect(work.authors).toEqual([
        { name: 'mimewriter', url: '/users/mimewriter/pseuds/mimewriter' },
      ])
    })

    it('should parse fandoms', () => {
      expect(work.fandoms).toEqual(['Original Work'])
    })

    it('should parse rating', () => {
      expect(work.rating).toBe('Teen And Up Audiences')
    })

    it('should parse stats', () => {
      expect(work.stats.words).toBe(3456)
      expect(work.stats.kudos).toBe(12)
      expect(work.stats.hits).toBe(234)
    })
  })

  describe('work 2', () => {
    const work = result.works[1]

    it('should parse id', () => {
      expect(work.id).toBe('50002')
    })

    it('should parse title', () => {
      expect(work.title).toBe('Silence Speaks Louder')
    })

    it('should parse stats', () => {
      expect(work.stats.words).toBe(1200)
      expect(work.stats.hits).toBe(89)
      expect(work.stats.kudos).toBe(0)
    })
  })
})
