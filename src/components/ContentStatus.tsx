type ContentStatusProps = {
  loading: boolean
  error: string | null
}

export default function ContentStatus({ loading, error }: ContentStatusProps) {
  if (loading) {
    return (
      <article className="page">
        <p>Loading…</p>
      </article>
    )
  }

  if (error) {
    return (
      <article className="page">
        <p role="alert">{error}</p>
      </article>
    )
  }

  return null
}
