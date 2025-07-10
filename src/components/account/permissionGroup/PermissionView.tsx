'use client'

import React, { useState } from 'react'
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
  DialogContent,
  MenuItem,
} from '@mui/material'
export default function PermissionView() {
  // 그룹명 테이블 상태
  const [groupChecked, setGroupChecked] = useState([])

  const [open, setOpen] = useState(false)

  const groups = [
    { id: 9999, name: '전체권한', date: 'YYYY-MM-DD' },
    { id: 9998, name: '승인권한+전체권한', date: 'YYYY-MM-DD' },
  ]
  const allGroupChecked = groupChecked.length === groups.length && groups.length !== 0

  const handleGroupCheckAll = (e) => {
    if (e.target.checked) setGroupChecked(groups.map((g) => g.id))
    else setGroupChecked([])
  }

  const handleGroupCheck = (id) => {
    if (groupChecked.includes(id)) setGroupChecked(groupChecked.filter((i) => i !== id))
    else setGroupChecked([...groupChecked, id])
  }

  // 선택 그룹 권한 테이블 상태
  const perms = [{ menu: '총괄정보' }, { menu: '외주정보' }, { menu: '정리관리' }]

  // 팝업용 더미 데이터
  const [accounts, setAccounts] = useState([
    {
      id: 9999,
      dept: 'YYYY-MM-DD',
      name: '홍길동',
      account: 'hong12345',
      date: 'YYYY-MM-DD',
      memo: '',
    },
    { id: 9998, dept: '', name: '', account: '', date: '', memo: '' },
  ])

  const managers = [
    {
      name: '000 계약',
      group: '홍길동',
      department: '-',
    },
  ]
  return (
    <>
      <div className="flex gap-6 p-6">
        <div className="w-1/2">
          <div className="flex flex-col gap-2 mb-4">
            <div className="mb-2">
              <span className="font-bold border-b-2 border-black pb-1">그룹명</span>
            </div>
            <div className="flex justify-between ">
              <div className="flex gap-4">
                <Button variant="outlined" color="error">
                  삭제
                </Button>
                <Button variant="outlined" size="medium">
                  그룹추가
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <TextField
                  placeholder="이름, 아이디"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '0.375rem', // tailwind rounded-md
                      paddingRight: 0,
                    },
                    '& input': {
                      padding: '6px 8px',
                      fontSize: '0.875rem',
                    },
                    minWidth: '200px',
                  }}
                />
                <Button size="medium" variant="outlined">
                  검색
                </Button>
              </div>
            </div>
          </div>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allGroupChecked}
                      indeterminate={groupChecked.length > 0 && groupChecked.length < groups.length}
                      onChange={handleGroupCheckAll}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>No</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>그룹명</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>등록일/수정일</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>계정</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((g) => (
                  <TableRow key={g.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={groupChecked.includes(g.id)}
                        onChange={() => handleGroupCheck(g.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{g.id}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{g.name}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{g.date}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
                        관리
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="mt-4 text-center text-sm">&lt; 1 2 3 4 5 6 7 8 9 10 &gt;</div>
        </div>

        <div className="w-1/2">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold border-b-2 border-black pb-1">선택 그룹 권한</span>
          </div>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>메뉴명</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>승인</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>조회</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>등록</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>수정</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>삭제</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {perms.map((p) => (
                  <TableRow key={p.menu} hover>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{p.menu}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Checkbox />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Checkbox />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Checkbox />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Checkbox />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Checkbox />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="mt-4 text-right">
            <Button variant="outlined" className="mr-2">
              취소
            </Button>
            <Button variant="contained" color="primary">
              저장
            </Button>
          </div>
        </div>
      </div>
      {/* 그룹 계정 관리 팝업 */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '80vw',
            height: '80vh',
          },
        }}
      >
        <DialogContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mt-10 mb-2">
              <div className="mt-4">
                <span className="font-bold border-b-2 mb-4">그룹</span>
              </div>
              <div className="flex gap-4"></div>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    {['그룹명', '등록 계정수', '등록일/수정일'].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
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
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField size="small" value={m.group} />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField size="small" value={m.name} />
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField size="small" value={m.department} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className="flex justify-between">
            <div className="mb-2">
              <span className="font-bold border-b-2 border-black pb-1">그룹 계정 관리</span>
            </div>
            <div className="flex  items-center mb-4 gap-2">
              <TextField
                placeholder="이름, 아이디"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0.375rem', // tailwind rounded-md
                    paddingRight: 0,
                  },
                  '& input': {
                    fontSize: '0.875rem',
                  },
                  minWidth: '200px',
                }}
              />
              <Button variant="outlined" size="medium">
                검색
              </Button>
            </div>
          </div>

          <TableContainer component={Paper}>
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell sx={{ textAlign: 'center' }}>No.</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>부서</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>이름</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>계정</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>등록일</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>비고 / 메모</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>추가 / 삭제</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((a, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>
                      <TextField select size="small" value={a.dept} fullWidth>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        <MenuItem value="선택">선택</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={a.name} fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={a.account} sx={{ width: '100px' }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={a.date} sx={{ width: '150px' }} />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={a.memo}
                        sx={{ width: '250px' }}
                        placeholder="텍스트 (권한 입력)"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" color="error">
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7}>
                    <Button fullWidth variant="outlined">
                      추가
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <div className="flex justify-center mt-6 gap-2">
            <Button variant="outlined" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="contained" color="primary">
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
