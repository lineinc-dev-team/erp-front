export const getTodayDateString = (dataString: string) => {
  const today = new Date(dataString)

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // 두 자리 수
  const day = String(today.getDate()).padStart(2, '0') // 두 자리 수

  return `${year}-${month}-${day}`
}
