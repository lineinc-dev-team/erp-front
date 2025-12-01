// components/common/CommonSelectByName.tsx
import { FormControl, MenuItem, Select } from '@mui/material'

type OptionType<T extends string> = {
  label?: string
  name?: T
  id?: string | number
  code?: string | number
  specification?: string
  vehicleNumber?: string
  typeDescription?: string
  itemTypeDescription?: string
}

type CommonSelectByNameProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: OptionType<T>[]
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
  onScrollToBottom?: () => void
  onInputChange?: (value: string) => void
  loading?: boolean
  displayLabel?: boolean
}

export default function CommonSelectByName<T extends string>({
  value,
  onChange,
  options,
  fullWidth = true,
  className,
  onScrollToBottom,
  required = false,
  disabled = false,
}: CommonSelectByNameProps<T>) {
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
              width: '50px', // 부모와 동일한 너비
            },
            onScroll: (e: React.UIEvent<HTMLDivElement>) => {
              const el = e.currentTarget
              const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5 // 5px 버퍼
              if (isBottom && onScrollToBottom) {
                onScrollToBottom()
              }
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
          '& .MuiSelect-select': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      >
        {options?.map((opt) => (
          <MenuItem
            key={opt.id}
            value={opt.name || opt.vehicleNumber || opt.typeDescription || opt.itemTypeDescription}
            sx={{
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {opt.label ||
              opt.name ||
              opt.vehicleNumber ||
              opt.typeDescription ||
              opt.itemTypeDescription}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
