// components/common/CommonSelect.tsx
import { FormControl, MenuItem, Select } from '@mui/material'

type OptionType<T extends string | number> = {
  label?: string
  id?: string | number
  code?: string | number
  name: T
}

type CommonSelectProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  options: OptionType<T>[]
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
  displayLabel?: boolean
  onScrollToBottom?: () => void
  onInputChange?: (value: string) => void
  loading?: boolean
}

export default function CommonSelect<T extends string | number>({
  value,
  onChange,
  options,
  fullWidth,
  className,
  displayLabel,
  required = false,
  disabled = false,
}: CommonSelectProps<T>) {
  console.log('받아온 상태 값 ', value)
  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled} size="small">
      <Select
        value={value}
        className={className}
        onChange={(e) => onChange(e.target.value as T)}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 200,
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.id} value={opt.code || opt.id}>
            {displayLabel ? opt.label ?? opt.name : opt.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
