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
  MenuItem,
  Pagination,
  DialogTitle,
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
    allGroupChecked,
    groupChecked,
    handleGroupCheck,
    handleGroupCheckAll,
    handleGroupDelete,
    setSelectedId,
    checkGroupId,
    setCheckGroupId,
    open,
    setOpen,
    singleData,
    singleLoading,
    singleError,
    PermissionData,
    PermissionLoading,
    PermissionError,
    selectedPermissions,
    handlePermissionToggle,
    alluserData,
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
    userGroupAdd,
    useModalOpen,
    handleChange,
    formData,
    userGroupOpen,
    userGroupClose,
  } = usePermission()

  const { page, setPage, totalPages, displayedRows } = usePagination(allRoles, 10)

  // 유저 권한 추가 훅

  return (
    <>
      <div className="flex gap-6 p-6">
        <div className="w-1/2">
          <div className="flex flex-col gap-2 mb-4">
            <div className="mb-2">
              <span className="font-bold border-b-2 border-black pb-1">그룹명</span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <Button variant="outlined" color="error" onClick={handlePermissonGroupDelete}>
                  삭제
                </Button>
                <Button variant="outlined" onClick={handleOpen}>
                  그룹추가
                </Button>

                <Dialog open={permissionGroupOpen} onClose={handleClose}>
                  <DialogTitle>그룹 이름 추가</DialogTitle>
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
              </div>
              <div className="flex items-center gap-2">
                <TextField placeholder="이름, 아이디" size="small" sx={{ minWidth: '200px' }} />
                <Button variant="outlined">검색</Button>
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
                  <TableCell align="center">등록일/수정일</TableCell>
                  <TableCell align="center">계정</TableCell>
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

        {/* 선택 그룹 권한 테이블 */}

        {checkGroupId > 0 && PermissionData?.data && (
          <div className="w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold border-b-2 border-black pb-1">선택 그룹 권한</span>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                    <TableCell></TableCell>
                    <TableCell align="center">메뉴명</TableCell>
                    <TableCell align="center">승인</TableCell>
                    <TableCell align="center">조회</TableCell>
                    <TableCell align="center">등록</TableCell>
                    <TableCell align="center">수정</TableCell>
                    <TableCell align="center">삭제</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PermissionData.data.map((menu) => (
                    <TableRow key={menu.id} hover>
                      <TableCell></TableCell>
                      <TableCell align="center">{menu.name}</TableCell>
                      {['승인', '조회', '등록', '수정', '삭제'].map((actionName) => {
                        const permission = menu.permissions.find((p) => p.action === actionName)
                        const permissionId = permission?.id ?? 0

                        const isChecked = selectedPermissions.some(
                          (p) =>
                            p.menuId === menu.id &&
                            p.id === permissionId &&
                            p.action === actionName,
                        )

                        return (
                          <TableCell key={actionName} align="center">
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) =>
                                handlePermissionToggle(
                                  menu.id,
                                  permissionId,
                                  actionName,
                                  e.target.checked,
                                )
                              }
                            />
                          </TableCell>
                        )
                      })}

                      {PermissionLoading && (
                        <TableRow>
                          <TableCell colSpan={5}>로딩 중...</TableCell>
                        </TableRow>
                      )}
                      {PermissionError && (
                        <TableRow>
                          <TableCell colSpan={5}>에러 발생</TableCell>
                        </TableRow>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className="mt-4 text-right flex gap-3 justify-end">
              <Button variant="outlined" onClick={() => setCheckGroupId(0)}>
                취소
              </Button>
              <Button variant="contained">저장</Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={false}
        PaperProps={{ sx: { width: '90vw', height: '90vh' } }}
      >
        <div className="p-10">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold border-b-2">그룹</span>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell align="center">그룹명</TableCell>
                  <TableCell align="center">등록 계정 수</TableCell>
                  <TableCell align="center">등록일/수정일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {singleData && (
                  <>
                    <TableRow key={singleData.data.id}>
                      <TableCell>
                        <TextField size="small" value={singleData.data.name ?? ''} fullWidth />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={singleData.data.userCount}
                          fullWidth
                          inputProps={{
                            style: {
                              textAlign: 'center',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          inputProps={{
                            style: {
                              textAlign: 'center',
                            },
                          }}
                          size="small"
                          value={`${singleData.data.createdAt.slice(
                            0,
                            10,
                          )}  / ${singleData.data.updatedAt.slice(0, 10)}`}
                          fullWidth
                        />
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {singleLoading && (
                  <TableRow>
                    <TableCell colSpan={3}>로딩 중...</TableCell>
                  </TableRow>
                )}
                {singleError && (
                  <TableRow>
                    <TableCell colSpan={2}>에러 발생</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <div className="p-10">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold border-b-2">그룹 계정</span>
          </div>

          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
              <Button variant="outlined" color="error" onClick={handleGroupDelete}>
                삭제
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <TextField placeholder="이름, 아이디" size="small" sx={{ minWidth: '200px' }} />
              <Button variant="outlined">검색</Button>
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allGroupChecked}
                      indeterminate={
                        groupChecked.length > 0 && groupChecked.length < alluserData.length
                      }
                      onChange={handleGroupCheckAll}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>No.</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>부서</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>이름</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>계정</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>등록일</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>비고 / 메모</TableCell>
                  {/* <TableCell sx={{ textAlign: 'center' }}>삭제</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {alluserData &&
                  alluserData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={groupChecked.includes(item.id)}
                          onChange={() => handleGroupCheck(item.id)}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{item.id}</TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>
                        <TextField
                          select
                          size="small"
                          value={item.username ?? ''}
                          fullWidth
                          InputProps={{
                            sx: { '& input': { textAlign: 'center' } },
                          }}
                        >
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                          <MenuItem value="선택">선택</MenuItem>
                        </TextField>
                      </TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>
                        <TextField
                          size="small"
                          value={item.username}
                          InputProps={{
                            sx: { '& input': { textAlign: 'center' } },
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>
                        <TextField
                          size="small"
                          value={item.loginId ?? ''}
                          InputProps={{
                            sx: { '& input': { textAlign: 'center' } },
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>
                        <TextField
                          size="small"
                          value={item.createdAt.slice(0, 10) ?? ''}
                          sx={{ width: '120px' }}
                          InputProps={{
                            sx: { '& input': { textAlign: 'center' } },
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: 'center' }}>
                        <TextField
                          size="small"
                          value={item.memo ?? ''}
                          sx={{ width: '300px' }}
                          placeholder="텍스트 (권한 입력)"
                          InputProps={{
                            sx: { '& input': { textAlign: 'center' } },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                <TableRow>
                  <TableCell colSpan={7}>
                    <Button fullWidth variant="outlined" onClick={userGroupOpen}>
                      추가
                    </Button>
                  </TableCell>
                </TableRow>

                <Dialog open={useModalOpen} onClose={userGroupClose}>
                  <DialogTitle>사용자 정보 추가</DialogTitle>
                  <DialogContent>
                    <TextField
                      name="id"
                      label="ID"
                      value={formData.id}
                      onChange={handleChange}
                      margin="dense"
                      fullWidth
                    />
                    <TextField
                      name="userIds"
                      label="userIds ID"
                      value={formData.userIds}
                      onChange={handleChange}
                      margin="dense"
                      fullWidth
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={userGroupClose}>취소</Button>
                    <Button variant="contained" onClick={userGroupAdd}>
                      추가
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableBody>
            </Table>
          </TableContainer>

          <div className="flex justify-center mt-6 gap-2">
            <Button variant="outlined" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="contained">저장</Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
