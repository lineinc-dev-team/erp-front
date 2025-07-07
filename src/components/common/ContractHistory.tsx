import {
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Pagination,
} from '@mui/material'
import { useState } from 'react'

interface ContractHistoryProps {
  open: boolean
  onClose: () => void
}

// 더미 데이터
const managers = [
  {
    id: 9999,
    name: '000 계약',
    position: '999,999,999',
    tel: '홍길동',
    phone: '-',
    email: 'O',
    memo: 'YYYY.MM.DD~YYYY.MM.DD / YYYY.MM.DD',
    date: 'YYYY.MM.DD~YYYY.MM.DD / YYYY.MM.DD',
  },
]

export default function ContractHistory({ open, onClose }: ContractHistoryProps) {
  const [page, setPage] = useState(1) // 현재 페이지
  const [pageSize] = useState(10) // 페이지당 수
  const totalCount = managers.length
  const totalPages = Math.ceil(totalCount / pageSize)
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Paper sx={{ p: 3 }}>
        <h2 style={{ marginBottom: '1rem' }}>
          계약이력 <span style={{ float: 'right' }}>9999 개 / {totalCount}</span>
        </h2>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid #9CA3AF' }}>
              {[
                'No.',
                '계약명',
                '금액',
                '외주업체 담당자',
                '공제항목',
                '보증서 제출 여부',
                '계약기간',
                '등록일 / 수정일',
              ].map((label) => (
                <TableCell
                  key={label}
                  align="center"
                  sx={{
                    backgroundColor: '#D1D5DB',
                    border: '1px solid #9CA3AF',
                    color: 'black',
                    fontWeight: 'bold',
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {managers.map((m) => (
              <TableRow key={m.id}>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  {m.id}
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.name} />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.position} />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.tel} />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.phone} />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.email} />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.memo} />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                  <TextField size="small" value={m.date} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-center mt-4 pb-6">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            shape="rounded"
            color="primary"
          />
        </div>

        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="outlined" onClick={onClose}>
            닫기
          </Button>
        </Box>
      </Paper>
    </Dialog>
  )
}
