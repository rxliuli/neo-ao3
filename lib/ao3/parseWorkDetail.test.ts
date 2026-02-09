import { describe, expect, it } from 'vitest'
import { parseWorkDetail } from './parseWorkDetail'
import workDetailHtml from './__fixtures__/work-detail.html?raw'

function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

describe('parseWorkDetail', () => {
  const doc = parseHTML(workDetailHtml)
  const result = parseWorkDetail(doc)

  it('should parse work id from canonical link', () => {
    expect(result.id).toBe('10001')
  })

  it('should parse title', () => {
    expect(result.title).toBe('The Long Journey Home')
  })

  it('should parse authors', () => {
    expect(result.authors).toEqual([
      { name: 'alice', url: '/users/alice/pseuds/alice' },
      { name: 'bob', url: '/users/bob/pseuds/bob' },
    ])
  })

  it('should parse rating', () => {
    expect(result.rating).toBe('Explicit')
  })

  it('should parse warnings', () => {
    expect(result.warnings).toEqual([
      'Graphic Depictions Of Violence',
    ])
  })

  it('should parse categories', () => {
    expect(result.categories).toEqual(['M/M'])
  })

  it('should parse fandoms', () => {
    expect(result.fandoms).toEqual(['Test Fandom', 'Another Fandom'])
  })

  it('should parse tags', () => {
    expect(result.tags.relationships).toEqual([
      'Character A/Character B',
    ])
    expect(result.tags.characters).toEqual([
      'Character A',
      'Character B',
    ])
    expect(result.tags.freeforms).toEqual(['Slow Burn', 'Angst'])
  })

  it('should parse language', () => {
    expect(result.language).toBe('English')
  })

  it('should parse dates', () => {
    expect(result.publishedDate).toBe('2025-01-01')
    expect(result.updatedDate).toBe('2025-02-01')
  })

  it('should parse stats', () => {
    expect(result.stats).toEqual({
      words: 60156,
      chapters: '17/?',
      comments: 42,
      kudos: 350,
      bookmarks: 85,
      hits: 12345,
    })
  })

  it('should parse summary as HTML', () => {
    expect(result.summary).toContain('<p>This is the work summary.</p>')
    expect(result.summary).toContain(
      '<p>It has multiple paragraphs.</p>',
    )
  })

  it('should parse begin notes', () => {
    expect(result.beginNotes).toContain(
      '<p>These are the beginning notes.</p>',
    )
  })

  it('should parse end notes', () => {
    expect(result.endNotes).toContain(
      '<p>Thank you for reading!</p>',
    )
  })

  it('should parse series', () => {
    expect(result.series).toEqual([
      {
        id: '5001',
        name: 'The Epic Series',
        part: 3,
        url: '/series/5001',
      },
    ])
  })

  describe('chapters', () => {
    it('should parse correct number of chapters', () => {
      expect(result.chapters).toHaveLength(2)
    })

    it('should parse chapter 1', () => {
      const ch1 = result.chapters[0]
      expect(ch1.id).toBe('100001')
      expect(ch1.number).toBe(1)
      expect(ch1.title).toBe('The Beginning')
      expect(ch1.content).toContain('It was a dark and stormy night.')
      expect(ch1.content).toContain('The wind howled through the trees.')
      expect(ch1.content).not.toContain('Chapter Text')
      expect(ch1.summary).toContain('<p>Chapter 1 summary.</p>')
      expect(ch1.beginNotes).toContain(
        '<p>Chapter 1 begin notes.</p>',
      )
      expect(ch1.endNotes).toContain('<p>Chapter 1 end notes.</p>')
    })

    it('should parse chapter 2 (no summary/notes)', () => {
      const ch2 = result.chapters[1]
      expect(ch2.id).toBe('100002')
      expect(ch2.number).toBe(2)
      expect(ch2.title).toBe('The Road')
      expect(ch2.content).toContain('They set off at dawn.')
      expect(ch2.summary).toBeUndefined()
      expect(ch2.beginNotes).toBeUndefined()
      expect(ch2.endNotes).toBeUndefined()
    })
  })
})

describe('parseWorkDetail - single chapter work', () => {
  const singleChapterHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="canonical" href="https://archiveofourown.org/works/20002" />
    </head>
    <body>
    <div id="main">
      <div class="wrapper">
        <dl class="work meta group">
          <dt class="rating tags">Rating:</dt>
          <dd class="rating tags"><ul class="commas"><li><a class="tag">General Audiences</a></li></ul></dd>
          <dt class="language">Language:</dt>
          <dd class="language">English</dd>
          <dt class="stats">Stats:</dt>
          <dd class="stats">
            <dl class="stats">
              <dt class="published">Published:</dt>
              <dd class="published">2025-03-15</dd>
              <dt class="words">Words:</dt>
              <dd class="words">1,200</dd>
              <dt class="chapters">Chapters:</dt>
              <dd class="chapters">1/1</dd>
              <dt class="hits">Hits:</dt>
              <dd class="hits">50</dd>
            </dl>
          </dd>
        </dl>
      </div>
      <div id="workskin">
        <div class="preface group">
          <h2 class="title heading">A Simple Tale</h2>
          <h3 class="byline heading">
            <a rel="author" href="/users/dan/pseuds/dan">dan</a>
          </h3>
        </div>
        <div id="chapters">
          <div class="userstuff">
            <h3 class="landmark heading" id="work">Chapter Text</h3>
            <p>Once upon a time, there was a story.</p>
            <p>The end.</p>
          </div>
        </div>
      </div>
    </div>
    </body>
    </html>
  `

  const doc = new DOMParser().parseFromString(singleChapterHtml, 'text/html')
  const result = parseWorkDetail(doc)

  it('should parse single chapter', () => {
    expect(result.chapters).toHaveLength(1)
    expect(result.chapters[0].id).toBe('1')
    expect(result.chapters[0].number).toBe(1)
    expect(result.chapters[0].title).toBe('')
    expect(result.chapters[0].content).toContain('Once upon a time')
    expect(result.chapters[0].content).not.toContain('Chapter Text')
  })

  it('should have no updated date', () => {
    expect(result.updatedDate).toBeUndefined()
  })
})
