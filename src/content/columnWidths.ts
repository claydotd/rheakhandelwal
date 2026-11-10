import type { ColumnCount } from './types'

/** Common width presets shown in the admin selector (percent). */
export const COLUMN_WIDTH_PRESETS = [
  20, 25, 30, 33, 40, 50, 60, 67, 70, 75, 80,
] as const

/** Round positive floats so they sum exactly to `total`. */
function roundToTotal(values: number[], total: number): number[] {
  if (values.length === 0) return []
  if (values.length === 1) return [total]

  const floored = values.map((value) => Math.floor(value))
  let remainder = total - floored.reduce((sum, value) => sum + value, 0)

  const order = values
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac)

  const next = [...floored]
  for (const entry of order) {
    if (remainder <= 0) break
    next[entry.index] += 1
    remainder -= 1
  }

  return next.map((value) => Math.max(1, value))
}

/** Equal split that always sums to 100. */
export function equalColumnWidths(count: ColumnCount): number[] {
  return roundToTotal(
    Array.from({ length: count }, () => 100 / count),
    100,
  )
}

/**
 * Normalize stored widths to `columnCount` entries that sum to 100.
 * Missing / invalid input falls back to an equal split.
 */
export function normalizeColumnWidths(
  raw: unknown,
  columnCount: ColumnCount,
): number[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return equalColumnWidths(columnCount)
  }

  const parsed = Array.from({ length: columnCount }, (_, index) => {
    const value = Number(raw[index])
    return Number.isFinite(value) && value > 0 ? value : 0
  })

  const sum = parsed.reduce((total, value) => total + value, 0)
  if (sum <= 0) return equalColumnWidths(columnCount)

  return roundToTotal(
    parsed.map((value) => (value / sum) * 100),
    100,
  )
}

/** Minimum percent any single column may shrink to. */
function minColumnPercent(count: number): number {
  if (count <= 1) return 100
  return Math.min(10, Math.floor(100 / count))
}

/** Max percent one column may take, leaving the minimum for each sibling. */
export function maxColumnPercent(count: number): number {
  if (count <= 1) return 100
  return 100 - minColumnPercent(count) * (count - 1)
}

/** Presets valid for a given column count. */
export function widthPresetsForCount(columnCount: ColumnCount): number[] {
  if (columnCount <= 1) return [100]
  const max = maxColumnPercent(columnCount)
  const min = minColumnPercent(columnCount)
  return COLUMN_WIDTH_PRESETS.filter((value) => value >= min && value <= max)
}

/**
 * Set one column to `percent` and redistribute the remainder across the
 * others, keeping their relative proportions.
 */
export function setColumnWidthPercent(
  widths: number[],
  index: number,
  percent: number,
): number[] {
  const count = widths.length
  if (count <= 1) return [100]
  if (index < 0 || index >= count) {
    return normalizeColumnWidths(widths, count as ColumnCount)
  }

  const min = minColumnPercent(count)
  const max = maxColumnPercent(count)
  const clamped = Math.min(max, Math.max(min, Math.round(percent)))
  const remaining = 100 - clamped

  const otherIndices = widths
    .map((_, i) => i)
    .filter((i) => i !== index)
  const prevOtherSum = otherIndices.reduce((sum, i) => sum + widths[i], 0)

  const otherShares =
    prevOtherSum > 0
      ? otherIndices.map((i) => (widths[i] / prevOtherSum) * remaining)
      : otherIndices.map(() => remaining / otherIndices.length)

  const roundedOthers = roundToTotal(otherShares, remaining)
  const next = Array.from({ length: count }, () => min)
  next[index] = clamped
  otherIndices.forEach((columnIndex, i) => {
    next[columnIndex] = Math.max(min, roundedOthers[i])
  })

  // Re-assert exact sum after min clamping.
  const drift = 100 - next.reduce((sum, value) => sum + value, 0)
  if (drift !== 0) {
    next[index] = Math.max(min, next[index] + drift)
  }

  return next
}

/** Resize width array when column count changes (equal split). */
export function resizeColumnWidths(columnCount: ColumnCount): number[] {
  return equalColumnWidths(columnCount)
}
