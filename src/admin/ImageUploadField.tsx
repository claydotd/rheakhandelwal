import { useId, useState } from 'react'
import {
  compressImage,
  compressionSummary,
  formatBytes,
} from './compressImage'

type UploadPhase = 'idle' | 'compressing' | 'uploading' | 'done' | 'error'

type UploadState = {
  phase: UploadPhase
  fileName: string | null
  originalSize: number | null
  compressedSize: number | null
  wasCompressed: boolean
  message: string | null
}

const idleState: UploadState = {
  phase: 'idle',
  fileName: null,
  originalSize: null,
  compressedSize: null,
  wasCompressed: false,
  message: null,
}

type ImageUploadFieldProps = {
  uploadImage: (file: File) => Promise<string>
  onUploaded: (src: string) => void
  onError?: (message: string) => void
  inputId?: string
}

export default function ImageUploadField({
  uploadImage,
  onUploaded,
  onError,
  inputId,
}: ImageUploadFieldProps) {
  const generatedId = useId()
  const id = inputId ?? generatedId
  const [state, setState] = useState<UploadState>(idleState)

  async function handleFile(file: File | undefined) {
    if (!file) return

    setState({
      phase: 'compressing',
      fileName: file.name,
      originalSize: file.size,
      compressedSize: null,
      wasCompressed: false,
      message: null,
    })

    try {
      const compressed = await compressImage(file)
      setState({
        phase: 'uploading',
        fileName: file.name,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        wasCompressed: compressed.wasCompressed,
        message: null,
      })

      const src = await uploadImage(compressed.file)
      setState({
        phase: 'done',
        fileName: file.name,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        wasCompressed: compressed.wasCompressed,
        message: null,
      })
      onUploaded(src)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setState({
        phase: 'error',
        fileName: file.name,
        originalSize: file.size,
        compressedSize: null,
        wasCompressed: false,
        message,
      })
      onError?.(message)
    }
  }

  const sizeLine =
    state.originalSize != null && state.compressedSize != null
      ? compressionSummary(
          state.originalSize,
          state.compressedSize,
          state.wasCompressed,
        )
      : state.originalSize != null
        ? formatBytes(state.originalSize)
        : null

  let statusLabel: string | null = null
  if (state.phase === 'compressing') statusLabel = 'Optimising image…'
  else if (state.phase === 'uploading') statusLabel = 'Uploading…'
  else if (state.phase === 'done') statusLabel = 'Uploaded'
  else if (state.phase === 'error') statusLabel = state.message ?? 'Upload failed'

  return (
    <div className="admin-image-upload">
      <input
        id={id}
        type="file"
        accept="image/*"
        disabled={state.phase === 'compressing' || state.phase === 'uploading'}
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {statusLabel ? (
        <p
          className={`admin-upload-status${state.phase === 'error' ? ' admin-upload-status--error' : ''}${state.phase === 'done' ? ' admin-upload-status--ok' : ''}${state.phase === 'compressing' || state.phase === 'uploading' ? ' admin-upload-status--busy' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="admin-upload-status__phase">{statusLabel}</span>
          {state.fileName ? (
            <span className="admin-upload-status__name">{state.fileName}</span>
          ) : null}
          {sizeLine ? (
            <span className="admin-upload-status__sizes">{sizeLine}</span>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
