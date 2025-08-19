import { TextField } from '@mui/material'
import { formatNumber, unformatNumber } from './formatters'

type SupplyPriceInputProps = {
  value: number
  onChange: (supplyPrice: number) => void
}

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'black' },
    '&:hover fieldset': { borderColor: 'black' },
    '&.Mui-focused fieldset': { borderColor: 'black' },
  },
}

export function SupplyPriceInput({ value, onChange }: SupplyPriceInputProps) {
  return (
    <TextField
      size="small"
      placeholder="숫자 입력"
      value={formatNumber(value) || ''}
      onChange={(e) => {
        const numericValue = e.target.value === '' ? '' : unformatNumber(e.target.value)
        onChange(numericValue || 0)
      }}
      variant="outlined"
      inputProps={{
        style: {
          textAlign: 'right',
        },
      }}
      sx={textFieldStyle}
    />
  )
}

type VatInputProps = {
  supplyPrice: number
}

export function VatInput({ supplyPrice }: VatInputProps) {
  const vat = Math.floor(supplyPrice * 0.1)

  return (
    <TextField
      size="small"
      value={formatNumber(vat)}
      placeholder="자동 계산"
      InputProps={{ readOnly: true }}
      variant="outlined"
      sx={textFieldStyle}
      inputProps={{
        style: {
          textAlign: 'right',
        },
      }}
    />
  )
}

type TotalInputProps = {
  supplyPrice: number
}

export function TotalInput({ supplyPrice }: TotalInputProps) {
  const vat = Math.floor(supplyPrice * 0.1)
  const total = supplyPrice + vat

  return (
    <TextField
      size="small"
      value={formatNumber(total)}
      placeholder="자동 계산"
      InputProps={{ readOnly: true }}
      variant="outlined"
      sx={textFieldStyle}
      inputProps={{
        style: {
          textAlign: 'right',
        },
      }}
    />
  )
}
