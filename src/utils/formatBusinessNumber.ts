// utils/CommonInputnumber.ts

export default function CommonInputnumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
  const parts = [digitsOnly.slice(0, 3), digitsOnly.slice(3, 5), digitsOnly.slice(5)].filter(
    Boolean,
  )

  return parts.join('-')
}
