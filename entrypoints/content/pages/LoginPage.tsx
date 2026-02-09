import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { parseLoginForm, parseCurrentUser } from '@/lib/ao3/parseLoginForm'
import { useNavigate } from '../navigation'
import { useAo3Page } from '../hooks/useAo3Page'
import { useCurrentUrl } from '../hooks/useCurrentUrl'
import { useSetCurrentUser } from '../auth'
import { PageSkeleton } from '../components/PageSkeleton'
import { PageError } from '../components/PageError'
import { queryClient } from '../queryClient'

export function LoginPage() {
  const url = useCurrentUrl()
  const { data: doc, isLoading, error: fetchError } = useAo3Page(url)
  const setCurrentUser = useSetCurrentUser()
  const navigate = useNavigate()

  const loginForm = useMemo(
    () => (doc ? parseLoginForm(doc) : null),
    [doc],
  )

  useEffect(() => {
    if (doc) setCurrentUser(parseCurrentUser(doc))
  }, [doc])

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!loginForm) return
    setError('')
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('authenticity_token', loginForm.authenticityToken)
      formData.set('user[login]', login)
      formData.set('user[password]', password)
      formData.set('user[remember_me]', rememberMe ? '1' : '0')

      const response = await fetch('/users/login', {
        method: 'POST',
        body: formData,
      })

      if (response.redirected) {
        const html = await response.text()
        const redirectDoc = new DOMParser().parseFromString(html, 'text/html')
        const user = parseCurrentUser(redirectDoc)
        if (user) {
          setCurrentUser(user)
          // Pre-seed cache for redirect target
          queryClient.setQueryData(['ao3-page', response.url], redirectDoc)
          navigate(response.url)
        } else {
          navigate('/')
        }
        return
      }

      setError('Invalid username or password. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <PageSkeleton />
  if (fetchError) return <PageError error={fetchError} url={url} />
  if (!loginForm) return null

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="login">Username or email</Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border"
              />
              <Label htmlFor="remember-me">Remember me</Label>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
