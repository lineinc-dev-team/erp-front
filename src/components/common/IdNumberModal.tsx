import { Box, Button, Modal, Typography } from '@mui/material'

interface IdNumberProps {
  open: boolean
  onClose: () => void
  idInfo: {
    laborAccountHolder: string
    laborAccountNumber: string
    laborAddress: string
    laborBankName: string
    laborDetailAddress: string
  } | null
}

export default function IdNumberModal({ open, onClose, idInfo }: IdNumberProps) {
  if (!idInfo) return null // idInfo 없으면 모달 안 띄움

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="id-number-modal-title"
      aria-describedby="id-number-modal-description"
    >
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="id-number-modal-title" variant="h6" component="h2">
          개인 정보
        </Typography>
        <Typography sx={{ mt: 1 }}>
          주소: {idInfo.laborAddress} / {idInfo.laborDetailAddress}
        </Typography>
        <Typography sx={{ mt: 1 }}>예금주: {idInfo.laborAccountHolder}</Typography>
        <Typography sx={{ mt: 1 }}>
          계좌번호: {idInfo.laborBankName} / {idInfo.laborAccountNumber}
        </Typography>
        <Button onClick={onClose} sx={{ mt: 2 }} variant="contained">
          닫기
        </Button>
      </Box>
    </Modal>
  )
}
