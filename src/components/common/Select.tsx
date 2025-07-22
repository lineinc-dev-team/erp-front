// components/common/CommonSelect.tsx
import { FormControl, MenuItem, Select } from '@mui/material'

type CommonSelectProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  options: { label: string; value: T }[]
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
  console.log('해당 데이터', value, onChange)
  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled} size="small">
      <Select
        value={value}
        className={className}
        onChange={(e) => onChange(e.target.value as T)}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 200, // 스크롤 생기게
            },
          },
          // MenuListProps: {
          //   onScroll: (e: React.UIEvent<HTMLUListElement>) => {
          //     const target = e.currentTarget
          //     if (target.scrollHeight - target.scrollTop === target.clientHeight) {
          //     }
          //   },
          // },
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
          <MenuItem key={opt.value} value={opt.value}>
            {displayLabel ? opt.label : opt.value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
