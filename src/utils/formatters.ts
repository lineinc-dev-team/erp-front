import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

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

export const formatDateSecondTime = (dateString: string) => {
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 숫자를 세 자리마다 콤마 붙인 문자열로 변환
// export function formatNumber(value: number | string): string {
//   const num = Number(value)
//   if (isNaN(num) || num === 0) return ''
//   return num.toLocaleString()
// }
// 숫자를 세 자리마다 콤마 붙인 문자열로 변환
export function formatNumber(value: number | string): string {
  if (value === null || value === undefined || value === '') return ''

  const num = Number(value)
  if (isNaN(num)) return ''

  // 소수점 전체 유지하면서 3자리마다 콤마
  const [integerPart, decimalPart] = num.toString().split('.')
  const formattedInteger = Number(integerPart).toLocaleString() // 3자리마다 콤마
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

export function unformatNumber(value: string): number {
  if (!value) return 0
  const numericString = value.replace(/[^0-9.]/g, '') // 숫자와 소수점만 허용
  return Number(numericString) || 0
}

export const formatDateTime = (dateStr: string) => {
  return dayjs.utc(dateStr).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
}
