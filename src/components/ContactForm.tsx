import { useState, type FormEvent } from 'react'
import { isLocalBackend } from '../content/backend'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage(null)

    if (isLocalBackend()) {
      setStatus('success')
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(
          [...data.entries()].map(([key, value]) => [
            key,
            typeof value === 'string' ? value : value.name,
          ]),
        ).toString(),
      })

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.')
      }

      form.reset()
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    }
  }

  return (
    <form
      className="contact-form"
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="contact-form__honeypot" aria-hidden="true">
        <label>
          Don’t fill this out:{' '}
          <input tabIndex={-1} autoComplete="off" name="bot-field" />
        </label>
      </p>

      <div className="contact-form__row">
        <label className="contact-form__field">
          <span>First Name</span>
          <input
            type="text"
            name="first-name"
            required
            autoComplete="given-name"
          />
        </label>

        <label className="contact-form__field">
          <span>Last Name</span>
          <input
            type="text"
            name="last-name"
            required
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="contact-form__field">
        <span>Email</span>
        <input type="email" name="email" required autoComplete="email" />
      </label>

      <label className="contact-form__field">
        <span>Phone</span>
        <input type="tel" name="phone" required autoComplete="tel" />
      </label>

      <label className="contact-form__field">
        <span>Tell me a bit about why you&apos;re getting in touch</span>
        <textarea name="message" required rows={6} />
      </label>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send'}
      </button>

      {status === 'success' ? (
        <p className="contact-form__status" role="status">
          {isLocalBackend()
            ? 'Prototype mode: the form UI works here, but submissions are only delivered when the site is hosted on Netlify.'
            : 'Thank you. Your message has been sent.'}
        </p>
      ) : null}

      {status === 'error' && errorMessage ? (
        <p className="contact-form__status contact-form__status--error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  )
}
