export const formatPhoneNumber = (value: string) => {
  const numbersOnly = value.replace(/\D/g, '') // 숫자만 남기기

  if (numbersOnly.length < 4) return numbersOnly
  if (numbersOnly.length < 7) return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`
  if (numbersOnly.length < 11)
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 6)}-${numbersOnly.slice(6)}`
  return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`
}

export const formatPersonNumber = (value: string) => {
  const numbersOnly = value.replace(/\D/g, '') // 숫자만 추출

  if (numbersOnly.length <= 3) return numbersOnly // 3자리 이하
  if (numbersOnly.length <= 7) {
    // 3자리-4자리
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}`
  }
  // 4자리-4자리
  return `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4, 8)}`
}

export const formatAreaNumber = (value: string) => {
  const numbersOnly = value.replace(/\D/g, '') // 숫자만 추출

  if (numbersOnly.startsWith('02')) {
    // 서울 지역번호 (2자리)
    if (numbersOnly.length <= 2) return numbersOnly
    if (numbersOnly.length <= 5) return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2)}`
    if (numbersOnly.length <= 9)
      return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2, 5)}-${numbersOnly.slice(5)}`
    return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2, 6)}-${numbersOnly.slice(6, 10)}`
  } else {
    // 그 외 지역번호 (3자리)
    if (numbersOnly.length <= 3) return numbersOnly
    if (numbersOnly.length <= 6) return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`
    if (numbersOnly.length <= 10)
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 6)}-${numbersOnly.slice(6)}`
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`
  }
}
