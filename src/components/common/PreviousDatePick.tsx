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
}: CommonDatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
        maxDate={today}
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
