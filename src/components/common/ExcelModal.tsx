// components/common/ExcelDownloadModal.tsx

import { useState } from 'react'
import CommonModal from './Modal'
import { Button, Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

type ExcelModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  fieldMap: { label: string; value: string }[] // 선택 필드 라벨-값 매핑
  onDownload: (selectedFields: string[]) => void // 다운로드 트리거
}

export default function ExcelModal({
  open,
  onClose,
  title = '엑셀 다운로드',
  fieldMap,
  onDownload,
}: ExcelModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([])

  const { showSnackbar } = useSnackbarStore()

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  const handleSelectAll = () => {
    setSelectedFields(fieldMap.map((f) => f.value))
  }

  const handleReset = () => {
    setSelectedFields([])
  }

  const handleDownload = () => {
    if (selectedFields.length === 0) {
      showSnackbar('선택한 필드가 없습니다, 선택해주세요.', 'warning')
      return
    }
    onDownload(selectedFields)
    setSelectedFields([])
    onClose()
  }

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="contained" onClick={handleDownload}>
            엑셀 다운로드
          </Button>
          <Button onClick={onClose}>닫기</Button>
        </>
      }
    >
      <Grid container spacing={1}>
        {fieldMap.map((field) => (
          <Grid key={field.value}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedFields.includes(field.value)}
                  onChange={() => toggleField(field.value)}
                />
              }
              label={field.label}
            />
          </Grid>
        ))}
      </Grid>

      <div className="flex gap-2 mt-4">
        <Button variant="outlined" onClick={handleReset}>
          초기화
        </Button>
        <Button variant="outlined" onClick={handleSelectAll}>
          전체 선택
        </Button>
      </div>
    </CommonModal>
  )
}
