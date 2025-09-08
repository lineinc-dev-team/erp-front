// // components/common/CommonSelect.tsx
// import { FormControl, MenuItem, Select } from '@mui/material'

// type OptionType = {
//   label?: string
//   id?: string | number
//   code?: string | number
//   name?: string
//   specification?: string
//   vehicleNumber?: string
//   deleted?: boolean
// }

// type CommonSelectProps<T extends string | number> = {
//   value: T
//   onChange: (value: T) => void
//   options: OptionType[]
//   fullWidth?: boolean
//   required?: boolean
//   disabled?: boolean
//   className?: string
//   displayLabel?: boolean
//   onScrollToBottom?: () => void
//   onInputChange?: (value: string) => void
//   loading?: boolean
// }

// export default function CommonSelect<T extends string | number>({
//   value,
//   onChange,
//   options,
//   fullWidth,
//   className,
//   required = false,
//   disabled = false,
// }: CommonSelectProps<T>) {
//   return (
//     <FormControl fullWidth={fullWidth} required={required} disabled={disabled} size="small">
//       <Select
//         value={value}
//         className={className}
//         onChange={(e) => onChange(e.target.value as T)}
//         // MenuProps={{
//         //   PaperProps: {
//         //     sx: {
//         //       maxHeight: 200,
//         //     },
//         //   },
//         // }}

//         MenuProps={{
//           PaperProps: {
//             sx: { maxHeight: 200, overflow: 'auto' },
//             onScroll: (e: React.UIEvent<HTMLDivElement>) => {
//               const target = e.currentTarget
//               if (
//                 target.scrollHeight - target.scrollTop <= target.clientHeight + 5 &&
//                 onScrollToBottom
//               ) {
//                 onScrollToBottom()
//               }
//             },
//           },
//         }}
//         sx={{
//           '& .MuiOutlinedInput-notchedOutline': {
//             borderColor: 'black',
//           },
//           '&:hover .MuiOutlinedInput-notchedOutline': {
//             borderColor: 'black',
//           },
//           '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//             borderColor: 'black',
//           },
//         }}
//       >
//         {options.map((opt) => (
//           <MenuItem
//             key={opt.code || opt.id} // key는 유니크하게
//             value={opt.code || opt.id} // value는 항상 옵션 code로
//           >
//             {opt.deleted ? (
//               <>
//                 {opt.name?.replace(' (삭제됨)', '')}
//                 <span style={{ color: 'red' }}> (삭제됨)</span>
//               </>
//             ) : (
//               opt.name || opt.label || opt.vehicleNumber || opt.specification || '선택'
//             )}
//           </MenuItem>
//         ))}
//       </Select>
//     </FormControl>
//   )
// }

import { FormControl, MenuItem, Select, CircularProgress } from '@mui/material'
import React from 'react'

type OptionType = {
  label?: string
  id?: string | number
  code?: string | number
  name?: string
  specification?: string
  vehicleNumber?: string
  deleted?: boolean
}

type CommonSelectProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  options: OptionType[]
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
  required = false,
  disabled = false,
  onScrollToBottom,
  loading = false,
}: CommonSelectProps<T>) {
  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled} size="small">
      <Select
        value={value}
        className={className}
        onChange={(e) => onChange(e.target.value as T)}
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 200, overflow: 'auto' },
            onScroll: (e: React.UIEvent<HTMLDivElement>) => {
              const target = e.currentTarget
              if (
                target.scrollHeight - target.scrollTop <= target.clientHeight + 5 &&
                onScrollToBottom
              ) {
                onScrollToBottom()
              }
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.code || opt.id} value={opt.code || opt.id}>
            {opt.deleted ? (
              <>
                {opt.name?.replace(' (삭제됨)', '')}
                <span style={{ color: 'red' }}> (삭제됨)</span>
              </>
            ) : (
              opt.name || opt.label || opt.vehicleNumber || opt.specification || '선택'
            )}
          </MenuItem>
        ))}
        {loading && (
          <MenuItem disabled>
            <CircularProgress size={20} />
            &nbsp;불러오는 중...
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}
