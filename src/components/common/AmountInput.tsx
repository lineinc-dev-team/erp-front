// components/common/AmountInput.tsx
import React from 'react'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function AmountInput({ value, onChange, placeholder = '' }: AmountInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-end w-full border rounded p-2 border-black focus:outline-none focus:ring-0 focus:border-black"
    />
  )
}
