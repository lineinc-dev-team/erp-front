'use client'

import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MUIDatePicker
        value={value}
        onChange={onChange}
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
