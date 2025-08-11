// components/common/AmountInput.tsx
import React from 'react'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function AmountInput({
  value,
  onChange,
  placeholder = '',
  disabled,
  className = '',
}: AmountInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        text-end border rounded p-2
        focus:outline-none focus:ring-0 focus:border-black
        ${disabled ? 'bg-[#dadada] text-gray-400 cursor-not-allowed' : ''}
        
        ${className}
      `}
    />
  )
}
