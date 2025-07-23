export const formatPhoneNumber = (value: string) => {
  const numbersOnly = value.replace(/\D/g, '') // 숫자만 남기기

  if (numbersOnly.length < 4) return numbersOnly
  if (numbersOnly.length < 7) return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`
  if (numbersOnly.length < 11)
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 6)}-${numbersOnly.slice(6)}`
  return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`
}
