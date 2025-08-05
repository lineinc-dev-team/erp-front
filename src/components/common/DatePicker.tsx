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
}

export default function CommonDatePicker({
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
}: CommonDatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <MUIDatePicker
        value={value}
        onChange={(date) => {
          if (!date) return onChange(null)

          // 🔥 시간 보정: 오전 9시로 세팅
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
        slotProps={{
          textField: {
            required,
            error,
            helperText,
            size: 'small',
            sx: {
              width: '8rem',
              '@media (min-width:1455px)': {
                width: '8.8rem',
                '& .MuiPickersInputBase-sectionsContainer': {
                  fontSize: '0.75rem',
                },
              },
              '@media (min-width:1900px)': {
                width: '12rem',
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
