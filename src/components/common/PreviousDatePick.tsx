'use client'

import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ko } from 'date-fns/locale'
import React from 'react'

type CommonDatePickerProps = {
  value: Date | null
  onChange: (value: Date | null) => void
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
  minDate: Date | null
  maxDate: Date | null
}

export default function CommonPreviousDatePicker({
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  minDate,
  maxDate,
}: CommonDatePickerProps) {
  console.log('DatePicker 적용 범위:', minDate, maxDate) // ✅ 디버깅용

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <MUIDatePicker
        value={value}
        disabled={disabled}
        onChange={(date) => {
          if (!date) return onChange(null)

          const adjustedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            9,
            0,
            0,
          )
          onChange(adjustedDate)
        }}
        format="yyyy/MM/dd"
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        slotProps={{
          textField: {
            required,
            error,
            helperText,
            size: 'small',
          },
        }}
      />
    </LocalizationProvider>
  )
}
