/** Encode a tag name for use in AO3 URLs. AO3 uses *s* for / and *a* for & instead of percent-encoding. */
export function encodeTagName(tag: string): string {
  return tag.replace(/\//g, '*s*').replace(/&/g, '*a*').replace(/ /g, '%20')
}

/** Build a /tags/{tag}/works URL */
export function tagWorksUrl(tag: string): string {
  return `/tags/${encodeTagName(tag)}/works`
}
