import { TextField } from '@mui/material'
import React from 'react'

type CommonInputProps<T> = {
  label?: string
  value: T
  error?: boolean
  helperText?: string
  onChange: (value: T) => void
  type?: string
  fullWidth?: boolean
  required?: boolean
  placeholder?: string
  className: string
  disabled?: boolean

  onFocus?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function CommonInput<T>({
  value,
  error,
  helperText = '',
  onChange,
  type = 'text',
  placeholder,
  fullWidth = true,
  required = false,
  className,
  disabled,
  onFocus, // <-- 추가
  onKeyDown,
}: CommonInputProps<T>) {
  return (
    <TextField
      variant="outlined"
      value={value}
      error={error}
      placeholder={placeholder}
      helperText={helperText}
      onChange={(e) => {
        if (type === 'number') {
          onChange(Number(e.target.value) as T)
        } else {
          onChange(e.target.value as T)
        }
      }}
      onFocus={onFocus} // 🔥 여기에 연결
      onKeyDown={onKeyDown}
      type={type}
      className={className}
      fullWidth={fullWidth}
      required={required}
      size="small"
      disabled={disabled}
      sx={{
        my: 1,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'black',
          },
          '&:hover fieldset': {
            borderColor: 'black',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'black',
          },
          '&.Mui-disabled': {
            backgroundColor: '#dadada',
            color: '#999',
            cursor: 'not-allowed',
          },
        },
      }}
    />
  )
}
