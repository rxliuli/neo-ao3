import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  parseLoginForm,
  parseCurrentUser,
  type CurrentUser,
} from '@/lib/ao3/parseLoginForm'
import { useNavigate } from '../navigation'

export function LoginPage(props: {
  doc: Document
  onLoginSuccess: (user: CurrentUser, doc: Document, url: string) => void
}) {
  const { authenticityToken } = parseLoginForm(props.doc)
  const navigate = useNavigate()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('authenticity_token', authenticityToken)
      formData.set('user[login]', login)
      formData.set('user[password]', password)
      formData.set('user[remember_me]', rememberMe ? '1' : '0')

      const response = await fetch('/users/login', {
        method: 'POST',
        body: formData,
      })

      // AO3 redirects to user profile on success, stays on /users/login on failure
      if (response.redirected) {
        const html = await response.text()
        const redirectDoc = new DOMParser().parseFromString(html, 'text/html')
        const user = parseCurrentUser(redirectDoc)
        if (user) {
          props.onLoginSuccess(user, redirectDoc, response.url)
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
