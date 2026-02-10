export function parseAuthenticityToken(doc: Document): string {
  const meta = doc.querySelector('meta[name="csrf-token"]')
  if (meta) return meta.getAttribute('content') ?? ''
  const input = doc.querySelector('input[name="authenticity_token"]')
  return input?.getAttribute('value') ?? ''
}

export async function submitAo3Form(opts: {
  action: string
  token: string
  method?: 'put' | 'patch' | 'delete'
  fields: Record<string, string>
}): Promise<Response> {
  const body = new URLSearchParams()
  body.set('authenticity_token', opts.token)
  if (opts.method) {
    body.set('_method', opts.method)
  }
  for (const [key, value] of Object.entries(opts.fields)) {
    body.set(key, value)
  }
  return fetch(opts.action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
}
