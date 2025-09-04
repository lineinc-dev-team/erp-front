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

// 숫자를 세 자리마다 콤마 붙인 문자열로 변환
export function formatNumber(value: number | string): string {
  const num = Number(value)
  if (isNaN(num)) return ''
  return num.toLocaleString()
}

export // 입력받은 문자열에서 숫자만 남기기
function unformatNumber(value: string): number {
  const numericString = value.replace(/[^0-9]/g, '')
  return Number(numericString)
}

export const formatDateTime = (dateStr: string) => {
  return dayjs.utc(dateStr).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
}
