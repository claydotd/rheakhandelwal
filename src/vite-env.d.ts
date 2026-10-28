/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_BACKEND?: 'local' | 'netlify'
  readonly VITE_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
