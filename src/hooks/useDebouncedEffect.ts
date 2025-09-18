// hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// useDebouncedValues 훅 (위에서 제안한 예시)
export function useDebouncedArrayValue(keywords: string[], delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(() => keywords[keywords.length - 1] || '')

  useEffect(() => {
    if (keywords.length === 0) return

    // 마지막 keyword를 기준으로 debounce
    const lastKeyword = keywords[keywords.length - 1]
    const handler = setTimeout(() => {
      setDebouncedValue(lastKeyword)
    }, delay)

    return () => clearTimeout(handler)
  }, [keywords, delay])

  return debouncedValue
}
