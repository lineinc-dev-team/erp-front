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
}

export default function CommonPreviousDatePicker({
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
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
        maxDate={today} // ⬅️ 오늘 이후는 선택 불가!!
        slotProps={{
          textField: {
            required,
            error,
            helperText,
            size: 'small',
            sx: {
              width: '8rem',
              '@media (min-width:1455px)': {
                width: '8rem',
                '& .MuiPickersInputBase-sectionsContainer': {
                  fontSize: '0.75rem',
                },
              },
              '@media (min-width:1900px)': {
                width: '9rem',
                '& .MuiPickersInputBase-sectionsContainer': {
                  fontSize: '0.9rem',
                },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  )
}
