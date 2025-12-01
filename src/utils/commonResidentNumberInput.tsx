import React, { useState, useEffect } from 'react'

type CommonResidentNumberInputProps = {
  value?: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export const CommonResidentNumberInput: React.FC<CommonResidentNumberInputProps> = ({
  value = '',
  onChange,
  className = '',
  placeholder = '주민등록번호',
}) => {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '') // 숫자만
    if (raw.length > 13) raw = raw.slice(0, 13) // 13자리 제한

    // 7번째 자리 뒤에 '-' 넣기
    let formatted = raw
    if (raw.length > 6) {
      formatted = raw.slice(0, 6) + '-' + raw.slice(6)
    }

    setInternalValue(formatted)
    onChange(formatted)
  }

  return (
    <input
      type="text"
      value={internalValue}
      onChange={handleChange}
      className={`border px-2 py-1 ${className}`}
      placeholder={placeholder}
    />
  )
}
