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
export function useDebouncedArrayValue(keywords: string[], delay: number): string[] {
  const [debouncedValues, setDebouncedValues] = useState<string[]>(keywords)

  useEffect(() => {
    const handlers = keywords.map((keyword, idx) =>
      setTimeout(() => {
        setDebouncedValues((prev) => {
          if (prev[idx] === keyword) return prev
          const newValues = [...prev]
          newValues[idx] = keyword
          return newValues
        })
      }, delay),
    )

    return () => {
      handlers.forEach(clearTimeout)
    }
  }, [keywords, delay])

  return debouncedValues
}
