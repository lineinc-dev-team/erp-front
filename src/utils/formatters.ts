export const getTodayDateString = (
  dateInput: Date | string | null | undefined,
): string | undefined => {
  if (!dateInput) return undefined

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  if (isNaN(date.getTime())) return undefined // 유효하지 않은 날짜 방지

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
