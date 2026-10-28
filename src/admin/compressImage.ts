export type CompressResult = {
  file: File
  originalSize: number
  compressedSize: number
  wasCompressed: boolean
}

const MAX_DIMENSION = 2000
const QUALITY = 0.82

function canEncodeType(type: string): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL(type).startsWith(`data:${type}`)
}

function preferredOutputType(inputType: string): string {
  const wantsAlpha =
    inputType === 'image/png' ||
    inputType === 'image/webp' ||
    inputType === 'image/avif'

  if (canEncodeType('image/webp')) return 'image/webp'
  if (wantsAlpha && canEncodeType('image/png')) return 'image/png'
  return 'image/jpeg'
}

function extensionForType(type: string): string {
  if (type === 'image/webp') return 'webp'
  if (type === 'image/png') return 'png'
  return 'jpg'
}

function replaceExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^.]+$/, '') || name
  return `${base}.${extension}`
}

type DrawableImage = {
  width: number
  height: number
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
  close?: () => void
}

async function loadDrawable(file: File): Promise<DrawableImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    })
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, width, height) => ctx.drawImage(bitmap, 0, 0, width, height),
      close: () => bitmap.close(),
    }
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not decode image'))
      img.src = objectUrl
    })
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (ctx, width, height) => ctx.drawImage(image, 0, 0, width, height),
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

/**
 * Downscale and recompress images in the browser before upload.
 * Already-small or non-raster files (SVG, GIF) are returned unchanged.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size

  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
    }
  }

  const drawable = await loadDrawable(file)
  try {
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(drawable.width, drawable.height),
    )
    const width = Math.max(1, Math.round(drawable.width * scale))
    const height = Math.max(1, Math.round(drawable.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not prepare image canvas')
    }
    drawable.draw(ctx, width, height)

    const outputType = preferredOutputType(file.type)
    const blob = await canvasToBlob(canvas, outputType, QUALITY)
    if (!blob) {
      throw new Error('Image compression failed')
    }

    // Keep the original when recompression does not help.
    if (blob.size >= originalSize && scale === 1) {
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        wasCompressed: false,
      }
    }

    const compressed = new File(
      [blob],
      replaceExtension(file.name, extensionForType(outputType)),
      {
        type: outputType,
        lastModified: Date.now(),
      },
    )

    return {
      file: compressed,
      originalSize,
      compressedSize: compressed.size,
      wasCompressed: true,
    }
  } finally {
    drawable.close?.()
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function compressionSummary(
  originalSize: number,
  compressedSize: number,
  wasCompressed: boolean,
): string {
  if (!wasCompressed || compressedSize >= originalSize) {
    return `${formatBytes(originalSize)} (already optimised)`
  }
  const saved = Math.round((1 - compressedSize / originalSize) * 100)
  return `${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${saved}% smaller)`
}
