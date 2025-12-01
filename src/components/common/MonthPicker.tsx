import { ko } from 'date-fns/locale'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker'

interface CommonMonthPickerProps {
  value: Date | null
  onChange: (value: Date | null) => void
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export default function CommonMonthPicker({
  value,
  onChange,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
}: CommonMonthPickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <MUIDatePicker
        views={['year', 'month']} // 🌟 연/월 둘 다 선택 가능
        openTo="month" // 🌟 달력 열면 바로 월 선택 화면부터 시작
        value={value} // 🌟 기본값 = 현재 날짜
        disabled={disabled}
        onChange={(date) => {
          if (!date) return onChange(null)

          // 선택된 연/월의 1일 오전 9시로 고정
          const fixed = new Date(date.getFullYear(), date.getMonth(), 1, 9, 0, 0)

          onChange(fixed)
        }}
        format="yyyy/MM"
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
