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
  Box,
} from '@mui/material'
import { useState } from 'react'

export default function PermissionManagementUI({ isEditMode = false }) {
  // 메뉴 및 권한 타입
  const menuList = [
    '휴직정보',
    '외부정산',
    '노무관리',
    '외부정산',
    '노무관리',
    '외부정산',
    '노무관리',
    '외부정산',
    '노무관리',
    '외부정산',
    '노무관리',
  ]
  const permissionTypes = ['승인', '조회', '등록', '수정', '삭제']

  const aa = isEditMode
  console.log(aa)
  // 테스트용 관리자 목록
  const [managers, setManagers] = useState([
    {
      id: 1,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
    {
      id: 2,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
    {
      id: 3,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
    {
      id: 4,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
    {
      id: 8,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
    {
      id: 6,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
    {
      id: 5,
      name: '홍길동',
      position: '노무/과장',
      landlineNumber: '0212345678',
      phoneNumber: '01012345678',
      email: 'hong@test.com',
      memo: '테스트 메모',
    },
  ])
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const updateItemField = (type: string, id: string, field: string, value: string) => {
    setManagers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const addItem = (type: string) => {
    setManagers((prev) => [
      ...prev,
      {
        id: 1,
        name: '',
        position: '',
        landlineNumber: '',
        phoneNumber: '',
        email: '',
        memo: '',
      },
    ])
  }

  const removeCheckedItems = (type: string) => {
    setManagers((prev) => prev.filter((m) => !checkedIds.includes(m.id)))
    setCheckedIds([])
  }

  const toggleCheckItem = (type: string, id: string, checked: boolean) => {
    setCheckedIds((prev) => (checked ? [...prev, id] : prev.filter((cid) => cid !== id)))
  }

  const toggleCheckAllItems = (type: string, checked: boolean) => {
    setCheckedIds(checked ? managers.map((m) => m.id) : [])
  }

  const formatPhoneNumber = (value: string) => {
    // '-' 없이 숫자만 허용
    return value.replace(/\D/g, '')
  }

  return (
    <div>
      <div style={{ flex: 1 }}>
        <div className="flex justify-between items-baseline ">
          <span className="font-bold border-b-2 mb-4">담당자</span>
          <div className="flex gap-4">
            {/* <div style={{ width: '480px', height: '400px' }}> */}

            <Button variant="outlined" color="error" onClick={() => removeCheckedItems('manager')}>
              삭제
            </Button>
            <Button variant="outlined" onClick={() => addItem('manager')}>
              추가
            </Button>
          </div>
        </div>
        <TableContainer component={Paper} style={{ maxHeight: '360px', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell
                  padding="checkbox"
                  sx={{
                    backgroundColor: '#D1D5DB',
                    border: '1px solid  #9CA3AF',
                    color: 'black',
                    fontWeight: 'bold',
                  }}
                >
                  <Checkbox
                    checked={isAllChecked}
                    indeterminate={checkedIds.length > 0 && !isAllChecked}
                    onChange={(e) => toggleCheckAllItems('manager', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['그룹명', '현장/공정', '계정수', '등록일/수정일', '비고'].map((label) => (
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
            <TableBody></TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="flex justify-between gap-10 mt-14">
        <div style={{ flex: 1 }}>
          <div className="flex justify-between items-baseline ">
            <span className="font-bold border-b-2 mb-4">담당자</span>
            <div className="flex gap-4">
              {/* <div style={{ width: '480px', height: '400px' }}> */}

              <Button
                variant="outlined"
                color="error"
                onClick={() => removeCheckedItems('manager')}
              >
                삭제
              </Button>
              <Button variant="outlined" onClick={() => addItem('manager')}>
                추가
              </Button>
            </div>
          </div>
          <TableContainer component={Paper} style={{ maxHeight: '360px', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell
                    padding="checkbox"
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    <Checkbox
                      checked={isAllChecked}
                      indeterminate={checkedIds.length > 0 && !isAllChecked}
                      onChange={(e) => toggleCheckAllItems('manager', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['계정', '이름', '부서', '등록일', '비고'].map((label) => (
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
                  <TableRow key={m.id}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={checkedIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('manager', m.id, e.target.checked)}
                      />
                    </TableCell>
                    {['name', 'position', 'landlineNumber', 'phoneNumber', 'memo'].map((field) => (
                      <TableCell key={field} align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          size="small"
                          placeholder={
                            field.includes('Number') ? "'-'없이 숫자만 입력" : '텍스트 입력'
                          }
                          value={m[field]}
                          onChange={(e) =>
                            updateItemField(
                              'manager',
                              m.id,
                              field,
                              formatPhoneNumberIfNeeded(field, e.target.value),
                            )
                          }
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* 메뉴 권한 */}
        <div style={{ width: '480px', height: '400px' }}>
          <span className="font-bold border-b-2 mb-4 inline-block">메뉴권한</span>
          <TableContainer component={Paper} style={{ maxHeight: '360px', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    메뉴명
                  </TableCell>
                  {permissionTypes.map((type) => (
                    <TableCell
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid  #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                      key={type}
                      align="center"
                    >
                      {type}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {menuList.map((menu, idx) => (
                  <TableRow key={idx}>
                    <TableCell
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid  #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      {menu}
                    </TableCell>
                    {permissionTypes.map((_, i) => (
                      <TableCell key={i} align="center">
                        <Checkbox />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Button variant="outlined" sx={{ marginRight: 2 }}>
          취소
        </Button>
        <Button variant="contained" color="primary">
          저장
        </Button>
      </Box>
    </div>
  )

  function formatPhoneNumberIfNeeded(field: string, value: string) {
    return field.includes('Number') ? formatPhoneNumber(value) : value
  }
}
