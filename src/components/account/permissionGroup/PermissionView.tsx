'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  TextField,
  Dialog,
  Pagination,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { usePermission } from '@/hooks/usePermission'
import { usePagination } from '@/hooks/usePagination'

export default function PermissionView() {
  const {
    allRoles,
    isLoading,
    isError,

    setSelectedId,
    setCheckGroupId,

    setOpen,

    handlePermissonGroupDelete,
    handlePermissionGroupCheckAll,
    handlePermissionGroupCheck,
    allPermissionGroupChecked,
    permissionGroupCheck,
    handleClose,
    groupName,
    setGroupName,
    handleAdd,
    permissionGroupOpen,
    handleOpen,
  } = usePermission()

  const { page, setPage, totalPages, displayedRows } = usePagination(allRoles, 10)

  // 유저 권한 추가 훅

  return (
    <>
      <div className="flex gap-6 p-6">
        <div className="w-full">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span>계정찾기</span>
                <Dialog open={permissionGroupOpen} onClose={handleClose}>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="그룹 이름"
                      fullWidth
                      variant="outlined"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>취소</Button>
                    <Button variant="contained" onClick={handleAdd}>
                      추가
                    </Button>
                  </DialogActions>
                </Dialog>
                <TextField placeholder="이름, 아이디" size="small" sx={{ minWidth: '200px' }} />
                <Button variant="outlined">검색</Button>
                <Button variant="outlined">초기화</Button>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-gray-600">정렬</span>
                  {/* <CommonSelect
                    value={search.arraySort}
                    className="text-2xl w-full"
                    onChange={(value) => {
                      search.setField('arraySort', value)
                      search.setField('currentPage', 1)
                    }}
                    options={ArrayStatusOptions}
                  /> */}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-gray-600">페이지당 목록 수</span>
                  {/* <CommonSelect
                    value={search.pageCount}
                    className="text-2xl w-full"
                    onChange={(value) => {
                      search.setField('pageCount', value)
                      search.setField('currentPage', 1) // 페이지 초기화 반드시 필요!
                    }}
                    options={PageCount}
                  /> */}
                </div>
                <Button variant="outlined" color="error" onClick={handlePermissonGroupDelete}>
                  삭제
                </Button>
                <Button variant="outlined" onClick={handleOpen}>
                  그룹등록
                </Button>
              </div>
            </div>
          </div>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allPermissionGroupChecked}
                      indeterminate={
                        permissionGroupCheck.length > 0 &&
                        permissionGroupCheck.length < allRoles.length
                      }
                      onChange={handlePermissionGroupCheckAll}
                    />
                  </TableCell>
                  <TableCell align="center">No</TableCell>
                  <TableCell align="center">그룹명</TableCell>
                  <TableCell align="center">현장/공정</TableCell>
                  <TableCell align="center">등록일/수정일</TableCell>
                  <TableCell align="center">계정</TableCell>
                  <TableCell align="center">비고</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedRows.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={permissionGroupCheck.includes(item.id)}
                        onChange={() => handlePermissionGroupCheck(item.id)}
                      />
                    </TableCell>
                    <TableCell align="center">{item.id}</TableCell>
                    <TableCell
                      align="center"
                      onClick={() => setCheckGroupId(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="font-bold underline">{item.name}</span>
                    </TableCell>
                    <TableCell
                      align="center"
                      onClick={() => setCheckGroupId(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="font-bold underline">{item.name}</span>
                    </TableCell>
                    <TableCell align="center">
                      {item.createdAt.slice(0, 10)} / {item.updatedAt.slice(0, 10)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedId(item.id)
                          setOpen(true)
                        }}
                      >
                        관리
                      </Button>
                    </TableCell>
                    <TableCell align="center" onClick={() => setCheckGroupId(item.id)}>
                      <span className="font-bold underline">{item.name}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>로딩 중...</TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={5}>에러 발생</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="flex justify-center mt-4 pb-6">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              shape="rounded"
              color="primary"
            />
          </div>
        </div>
      </div>
    </>
  )
}
