/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Pagination,
  CircularProgress,
  Link,
} from '@mui/material'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ContractHistoryService } from '@/services/outsourcingCompany/outsourcingCompanyRegistrationService'

interface ContractHistoryProps {
  open: boolean
  onClose: () => void
  outsourcingCompanyId: number
}

export default function ContractHistory({
  open,
  onClose,
  outsourcingCompanyId,
}: ContractHistoryProps) {
  const [page, setPage] = useState(1) // 현재 페이지 (1-based)
  const [pageSize] = useState(10) // 페이지당 수

  // React Query로 데이터 패칭
  const { data, isLoading, isError } = useQuery({
    queryKey: ['contractHistory', outsourcingCompanyId, page, pageSize],
    queryFn: () =>
      ContractHistoryService(outsourcingCompanyId, {
        page: page - 1, // 백엔드는 0-based index
        size: pageSize,
        sort: 'id,desc',
      }),
    enabled: open, // Dialog가 열렸을 때만 호출
  })

  const contracts = data?.data.content ?? []
  const totalCount = data?.data.pageInfo?.totalElements ?? 0
  const totalPages = data?.data.pageInfo?.totalPages ?? 1

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Paper sx={{ p: 3 }}>
        <h2 style={{ marginBottom: '1rem' }}>
          계약이력 <span style={{ float: 'right' }}>전체 : {totalCount} 개</span>
        </h2>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box display="flex" justifyContent="center" py={6} color="red">
            데이터를 불러오는 중 오류가 발생했습니다.
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid #9CA3AF' }}>
                  {[
                    'No.',
                    '현장명',
                    '공정명',
                    '외주금액',
                    '담당자',
                    '공제항목',
                    '첨부파일',
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
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      현재 계약이력이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((c: any, idx: number) => (
                    <TableRow key={c.contractId ?? idx}>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.siteName}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.processName}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.contractAmount?.toLocaleString()} 원
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.contactName}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.defaultDeductions}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.files?.length > 0 ? (
                          <Box display="flex" flexDirection="column" gap={1}>
                            {c.files.map((file: any) => (
                              <Link
                                key={file.id}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                              >
                                {file.originalFileName}
                              </Link>
                            ))}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.contractStartDate?.slice(0, 10)} ~ {c.contractEndDate?.slice(0, 10)}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        {c.createdAt?.slice(0, 10)} / {c.updatedAt?.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
          </>
        )}

        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="outlined" onClick={onClose}>
            닫기
          </Button>
        </Box>
      </Paper>
    </Dialog>
  )
}
