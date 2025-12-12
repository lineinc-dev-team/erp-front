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
  maxDate, // 서버에서 내려오는 제한 날짜
}: CommonDatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // maxDate 기준점도 00:00 으로 맞추기
  const cleanedMaxDate = maxDate
    ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
    : null

  // 👉 "두 날짜 중 더 작은 날짜"를 선택
  const effectiveMaxDate = cleanedMaxDate && cleanedMaxDate < today ? cleanedMaxDate : today

  console.log('minDate:', minDate)
  console.log('props maxDate:', maxDate)
  console.log('effectiveMaxDate:', effectiveMaxDate)

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
        maxDate={effectiveMaxDate} // ← 여기만 바뀜
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
