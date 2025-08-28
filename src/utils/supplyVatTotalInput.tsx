import { Checkbox, FormControlLabel, TextField } from '@mui/material'
import { formatNumber, unformatNumber } from './formatters'
import { useState } from 'react'

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
  value?: number
  onChange?: (vat: number) => void
  enableManual?: boolean //  상세화면에서만 true로 전달
}
export function VatInput({ supplyPrice, value, onChange, enableManual = false }: VatInputProps) {
  const [autoCalc, setAutoCalc] = useState(true)

  const vat = autoCalc ? Math.floor(supplyPrice * 0.1) : value ?? 0

  return (
    <div className="flex items-center gap-2">
      {enableManual && (
        <FormControlLabel
          control={
            <Checkbox
              checked={autoCalc}
              onChange={(e) => {
                const checked = e.target.checked
                setAutoCalc(checked)

                if (checked && onChange) {
                  onChange(Math.floor(supplyPrice * 0.1))
                }

                if (!checked && onChange) {
                  onChange(0)
                }
              }}
              size="small"
            />
          }
          label=""
        />
      )}

      <TextField
        size="small"
        value={formatNumber(vat)}
        placeholder={autoCalc ? '자동 계산' : '숫자 입력'}
        onChange={(e) => {
          if (!autoCalc && onChange) {
            const numericValue = e.target.value === '' ? 0 : unformatNumber(e.target.value)
            onChange(numericValue)
          }
        }}
        InputProps={{ readOnly: autoCalc }}
        variant="outlined"
        sx={textFieldStyle}
        inputProps={{
          style: { textAlign: 'right' },
        }}
      />
    </div>
  )
}

type TotalInputProps = {
  supplyPrice: number
  vat: number
}

export function TotalInput({ supplyPrice, vat }: TotalInputProps) {
  const total = supplyPrice + (vat || 0)

  return (
    <TextField
      size="small"
      value={formatNumber(total)}
      InputProps={{ readOnly: true }}
      variant="outlined"
      sx={textFieldStyle}
      inputProps={{
        style: { textAlign: 'right' },
      }}
    />
  )
}
