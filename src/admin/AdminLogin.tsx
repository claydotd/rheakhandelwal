import { useState, type FormEvent } from 'react'
import { loginWithPassword } from '../content/auth'
import './admin.css'

type AdminLoginProps = {
  onSuccess: () => void
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await loginWithPassword(password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-login">
        <h1>Admin sign in</h1>
        <p>Enter the shared admin password to edit site content.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          {error ? (
            <p className="admin-status admin-status--error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}
