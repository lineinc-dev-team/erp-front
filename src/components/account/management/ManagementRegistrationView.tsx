'use client'

import CommonSelect from '@/components/common/Select'
import CommonButton from '@/components/common/Button'

import CommonInput from '@/components/common/Input'
import { useAccountFormStore } from '@/stores/accountManagementStore'
import { useUserMg } from '@/hooks/useUserMg'
import { formatAreaNumber, formatPhoneNumber } from '@/utils/formatPhoneNumber'

import { isHeadOfficeOptions, UseORnotOptions } from '@/config/erp.confing'
import { useParams } from 'next/navigation'
import { UserDetailService } from '@/services/account/accountManagementService'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { FormState, HistoryItem } from '@/types/accountManagement'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { formatDateTime } from '@/utils/formatters'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export default function ManagementRegistrationView({ isEditMode = false }) {
  const {
    createUserMutation,
    updateUserMutation,
    handleAccountCancel,
    departmentOptions,
    positionOptions,
    gradeOptions,
    resetPasswordMutation,
    useHistoryDataQuery,
  } = useUserMg()

  const { form, reset, updateMemo, setField } = useAccountFormStore()

  // 상세페이지 로직

  const { showSnackbar } = useSnackbarStore()

  const params = useParams()
  const userDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['UserDetailInfo'],
    queryFn: () => UserDetailService(userDetailId),
    enabled: isEditMode && !!userDetailId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    username: '이름',
    departmentName: '부서(소속)',
    positionName: '직급',
    gradeName: '직책',
    phoneNumber: '개인 휴대폰',
    landlineNumber: '전화번호',
    email: '이메일',
    isActive: '계정 상태',
    memo: '메모',
  }

  const {
    data: userHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useHistoryDataQuery(userDetailId, isEditMode)

  const historyList = useAccountFormStore((state) => state.form.changeHistories)

  console.log('historyList', historyList)

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      console.log('clientclient', client)

      // 기존 값과 다르면 업데이트 (방어 코드)
      if (client.loginId !== form.loginId) setField('loginId', client.loginId ?? '')
      if (client.username !== form.username) setField('username', client.username ?? '')
      if (client.memo !== form.memo) setField('memo', client.memo ?? '')
      if (client.email !== form.email) setField('email', client.email ?? '')
      if (client.phoneNumber !== form.phoneNumber) setField('phoneNumber', client.phoneNumber ?? '')
      if (client.landlineNumber !== form.landlineNumber)
        setField('landlineNumber', client.landlineNumber ?? '')

      const departmentId = departmentOptions.find((opt) => opt.name === client.department)?.id ?? 0
      if (departmentId !== form.departmentId) setField('departmentId', departmentId)

      const positionId = positionOptions.find((opt) => opt.name === client.position)?.id ?? 0
      if (positionId !== form.positionId) setField('positionId', positionId)

      const gradeId = gradeOptions.find((opt) => opt.name === client.grade)?.id ?? 0
      if (gradeId !== form.gradeId) setField('gradeId', gradeId)

      const isActiveId = client.isActive === true ? '1' : '2'

      if (isActiveId !== form.isActive) setField('isActive', isActiveId)

      const isHeadOfficeId = client.isHeadOffice === true ? '1' : '2'

      if (isHeadOfficeId !== form.isHeadOffice) setField('isHeadOffice', isHeadOfficeId)
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEditMode]) // 의존성은 핵심 데이터만 넣음

  const formatChangeDetail = (getChanges: string) => {
    try {
      const parsed = JSON.parse(getChanges)
      if (!Array.isArray(parsed)) return '-'

      return parsed
        .map((item: { property: string; before: string; after: string }) => {
          const propertyKo = PROPERTY_NAME_MAP[item.property] || item.property

          // true/false를 한글로 매핑
          const convertValue = (value: string) => {
            if (value === 'true') return '사용'
            if (value === 'false') return '미사용'
            return value
          }

          const before = convertValue(item.before)
          const after = convertValue(item.after)

          return `${propertyKo} : ${before} ==> ${after}`
        })
        .join('\n')
    } catch (e) {
      if (e instanceof Error) return '-'
    }
  }

  // 수정이력 데이터가 들어옴
  useEffect(() => {
    if (userHistoryList?.pages) {
      const allHistories = userHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          description: item.description,
          content: formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHistoryList, setField])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading],
  )

  function validateForm(form: FormState) {
    if (!form.loginId.trim()) return 'ID를 입력하세요.'
    if (!form.username.trim()) return '이름을 입력하세요.'
    if (form.departmentId === 0) return '부서를 선택하세요.'
    if (form.positionId === 0) return '직급을 선택하세요.'
    if (form.gradeId === 0) return '직책을 선택하세요.'

    if (!/^\d{3}-\d{4}-\d{4}$/.test(form.phoneNumber)) {
      return '개인 휴대폰 번호를 xxx-xxxx-xxxx 형식으로 입력하세요.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return '유효한 이메일을 입력하세요.'
    }

    // if (!form.password.trim()) return '비밀번호를 입력하세요.'
    // if (form.password !== form.checkPassword) return '비밀번호가 일치하지 않습니다.'
    if (form.isActive === '선택' || !form.isActive) return '계정 상태를 선택하세요.'
    return null
  }

  const handleSubmit = () => {
    const errorMsg = validateForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        updateUserMutation.mutate(userDetailId)
      }
    } else {
      createUserMutation.mutate()
    }
  }

  const handleResetPassword = (userDetailId: number) => {
    resetPasswordMutation.mutate(userDetailId)
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              ID
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.loginId}
                onChange={(value) => setField('loginId', value)}
                className=" flex-1"
                disabled={isEditMode}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              이름
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="홍길동"
                value={form.username}
                onChange={(value) => setField('username', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              부서(소속)
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.departmentId}
                onChange={(value) => setField('departmentId', value)}
                options={departmentOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              직급
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.positionId}
                onChange={(value) => setField('positionId', value)}
                options={positionOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              직책
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                value={form.gradeId}
                onChange={(value) => setField('gradeId', value)}
                options={gradeOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              개인 휴대폰
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.phoneNumber}
                onChange={(value) => {
                  const clientPhone = formatPhoneNumber(value)
                  setField('phoneNumber', clientPhone)
                }}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              전화번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.landlineNumber}
                onChange={(value) => {
                  const resultAreaNumber = formatAreaNumber(value)
                  setField('landlineNumber', resultAreaNumber)
                }}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              이메일
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.email}
                onChange={(value) => setField('email', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계정 상태
            </label>
            <div className="border flex items-center gap-4 p-2 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          {isEditMode && (
            <>
              <div className="flex">
                <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
                  계정생성일 / 수정일
                </label>
                <div className="border border-gray-400 px-2 w-full flex items-center text-sm text-gray-600">
                  {data?.data.createdAt?.slice(0, 10)} / {data?.data.updatedAt?.slice(0, 10)}
                </div>
              </div>

              <div className="flex">
                <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
                  최종 로그인
                </label>
                <div className="border border-gray-400 p-4 px-2 w-full flex items-center text-sm text-gray-600">
                  {data?.data.lastLoginAt ? data.data.lastLoginAt.slice(0, 10) : '기록 없음'}
                </div>
              </div>
              <div className="flex">
                <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
                  비밀번호 초기화
                </label>
                <div className="border border-gray-400 p-4 px-2 w-full flex items-center text-sm text-gray-600">
                  <CommonButton label="초기화" onClick={() => handleResetPassword(userDetailId)} />
                </div>
              </div>
            </>
          )}
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              본사 직원 여부
            </label>
            <div className="border flex items-center gap-4 p-2 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.isHeadOffice}
                onChange={(value) => setField('isHeadOffice', value)}
                options={isHeadOfficeOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border flex items-center gap-4 p-2 border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {isEditMode && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">수정이력</span>
            <div className="flex gap-4">
              {/* <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('manager')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('manager')}
            /> */}
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  {['수정일시', '수정항목', '수정자', '비고 / 메모'].map((label) => (
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
                {historyList &&
                  historyList.map((item: HistoryItem) => (
                    <TableRow key={item.id}>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        {formatDateTime(item.createdAt)} / {formatDateTime(item.updatedAt)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                      >
                        {item.description ? item.description : item.content}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                      >
                        {item.updatedBy}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.memo ?? ''}
                          placeholder="메모 입력"
                          onChange={(e) => updateMemo(item.id, e.target.value)}
                          multiline
                          inputProps={{ maxLength: 500 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {hasNextPage && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ border: 'none' }}>
                      <div ref={loadMoreRef} className="p-4 text-gray-500 text-sm">
                        불러오는 중...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      <div className="flex justify-center gap-10 mt-10">
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={handleAccountCancel}
        />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleSubmit}
        />
      </div>
    </>
  )
}
