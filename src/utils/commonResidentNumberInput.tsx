import React, { useState, useEffect } from 'react'

type CommonResidentNumberInputProps = {
  value: string // 원본 값 (예: "960313-1121234" 또는 "9603131121234")
  onChange: (value: string) => void
  className?: string
}

function formatResidentNumber(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 7) return digits
  return `${digits.slice(0, 6)}-${digits.slice(6, 13)}`
}

function maskResidentNumber(formatted: string) {
  // formatted: "960313-1121234"
  const match = formatted.match(/^(\d{6})-(\d)(\d{6})$/)
  if (!match) return formatted
  const [, front, firstBack, rest] = match
  return `${front}-${firstBack}${'*'.repeat(rest.length)}`
}

export default function CommonResidentNumberInput({
  value,
  onChange,
  className,
}: CommonResidentNumberInputProps) {
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    setInputValue(maskResidentNumber(formatResidentNumber(value)))
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    const formatted = formatResidentNumber(raw)
    // 백엔드로 보낼 때 하이픈 포함 전체 주민번호 전달
    if (formatted.length === 14) {
      onChange(formatted)
    } else {
      onChange(formatted.replace('-', '')) // 입력 중에는 하이픈 없이 전달
    }
  }

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      maxLength={14}
      className={`border p-2 rounded ${className || ''}`}
      placeholder="'-'없이 숫자만 입력"
      inputMode="numeric"
    />
  )
}
