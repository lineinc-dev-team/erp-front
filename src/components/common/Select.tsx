// components/common/CommonSelect.tsx
import { FormControl, MenuItem, Select } from '@mui/material'

type CommonSelectProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  options: { label: string; value: T }[]
  fullWidth?: boolean
  required?: boolean
  disabled?: boolean
}

export default function CommonSelect<T extends string | number>({
  value,
  onChange,
  options,
  fullWidth = true,
  required = false,
  disabled = false,
}: CommonSelectProps<T>) {
  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled} size="small">
      <Select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
