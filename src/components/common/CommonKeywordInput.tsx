import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TextField, Paper, List, ListItem } from '@mui/material'

type OptionType = {
  code: string
  name: string
}

type CommonKeywordInputProps = {
  value: string
  options: OptionType[]
  onChange: (value: string) => void
  onSelect: (option: OptionType) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function CommonKeywordInput({
  value,
  options,
  onChange,
  onSelect,
  placeholder = '',
  disabled = false,
  className = '',
}: CommonKeywordInputProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState<OptionType[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [ignoreBlur, setIgnoreBlur] = useState(false)

  const itemRefs = useRef<(HTMLLIElement | HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const keyword = searchTerm.trim().toLowerCase()

    if (!isFocused) return

    if (keyword === '') {
      // 빈 입력이면 전체 옵션 표시
      setFilteredOptions(options)
    } else {
      // 입력값이 있으면 필터링
      const filtered = options.filter((opt) => opt.name.toLowerCase().includes(keyword))
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options, isFocused])

  useEffect(() => {
    if (value !== searchTerm) setSearchTerm(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (highlightIndex >= 0 && itemRefs.current[highlightIndex]) {
      itemRefs.current[highlightIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [highlightIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredOptions.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightIndex((prev) => (prev + 1) % filteredOptions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightIndex((prev) => (prev <= 0 ? filteredOptions.length - 1 : prev - 1))
      } else if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault()
        const selected = filteredOptions[highlightIndex]
        onSelect(selected)
        setSearchTerm(selected.name)
        setFilteredOptions([])
        setHighlightIndex(-1)
        setIsFocused(false)
      }
    },
    [filteredOptions, highlightIndex, onSelect],
  )

  return (
    <div className={`relative ${className}`}>
      <TextField
        variant="outlined"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          onChange(e.target.value)
        }}
        onFocus={() => {
          setIsFocused(true)
          // 입력값이 비었든 아니든 다시 전체 옵션을 보여줌
          if (!searchTerm.trim()) {
            setFilteredOptions(options)
          } else {
            const keyword = searchTerm.trim().toLowerCase()
            const filtered = options.filter((opt) => opt.name.toLowerCase().includes(keyword))
            setFilteredOptions(filtered)
          }
        }}
        onBlur={() => {
          if (!ignoreBlur) setIsFocused(false)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        fullWidth
        size="small"
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'black' },
            '&:hover fieldset': { borderColor: 'black' },
            '&.Mui-focused fieldset': { borderColor: 'black' },
            '&.Mui-disabled': {
              backgroundColor: '#dadada',
              color: '#999',
              cursor: 'not-allowed',
            },
          },
        }}
      />

      {isFocused && filteredOptions.length > 0 && (
        <Paper className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto" elevation={3}>
          <List disablePadding>
            {filteredOptions.map((opt, index) => (
              <ListItem
                key={opt.code}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                component="button"
                onMouseDown={() => {
                  setIgnoreBlur(true)
                  onSelect(opt)
                  setSearchTerm(opt.name)
                  setFilteredOptions([])
                  setHighlightIndex(-1)
                  setTimeout(() => setIgnoreBlur(false), 0)
                }}
                sx={{
                  backgroundColor: highlightIndex === index ? '#e2e8f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                  fontSize: '1rem',
                  py: 0.4,
                }}
              >
                {opt.name}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  )
}
