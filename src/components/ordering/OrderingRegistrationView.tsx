/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import DaumPostcodeEmbed from 'react-daum-postcode'
import CommonFileInput from '../common/FileInput'
import { useOrderingFormStore } from '@/stores/orderingStore'
import {
  Box,
  Checkbox,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { AreaCode, UseORnotOptions } from '@/config/erp.confing'
import { useClientCompany } from '@/hooks/useClientCompany'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { AttachedFile, FormState, HistoryItem, Manager } from '@/types/ordering'
import { ClientDetailService } from '@/services/ordering/orderingRegistrationService'
import CommonInputnumber from '@/utils/formatBusinessNumber'
import { formatPersonNumber, formatPhoneNumber } from '@/utils/formatPhoneNumber'
import { formatDateTime, getTodayDateString } from '@/utils/formatters'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export default function OrderingRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    setRepresentativeManager,
    addItem,
    updateMemo,
    toggleCheckItem,
    toggleCheckAllItems,
  } = useOrderingFormStore()

  const {
    createClientMutation,
    ClientModifyMutation,
    setUserSearch,
    userOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    orderingCancel,
    isLoading,
    payMethodOptions,
    useClientHistoryDataQuery,
  } = useClientCompany()

  // 체크 박스에 활용
  const managers = form.headManagers
  const checkedIds = form.checkedManagerIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds

  const filesToCheck = attachedFiles.filter((f) => f.type !== 'BUSINESS_LICENSE')
  const isFilesAllChecked = filesToCheck.length > 0 && fileCheckIds.length === filesToCheck.length

  const params = useParams()
  const clientCompanyId = Number(params?.id)

  const { showSnackbar } = useSnackbarStore()

  const PROPERTY_NAME_MAP: Record<string, string> = {
    username: '이름',
    address: '본사 주소',
    detailAddress: '상세 주소',
    userName: '본사 담당자명',
    phoneNumber: '개인 휴대폰',
    paymentMethodName: '결제 정보',
    paymentPeriod: '결제 기간',
    businessNumber: '사업자등록번호',
    ceoName: '대표자명',
    position: '직급',
    name: '발주처명',
    landlineNumber: '전화번호',
    email: '이메일',
    department: '부서/직급',
    isActive: '계정 상태',
    memo: '비고',
    isMain: '대표담당자',
    originalFileName: '파일 추가',
  }

  const {
    data: clientHistoryList,
    isFetchingNextPage,
    fetchNextPage: clientFetchNextPage,
    hasNextPage: clientHasNextPage,
    isLoading: clientIsLoading,
  } = useClientHistoryDataQuery(clientCompanyId, isEditMode)

  const historyList = useOrderingFormStore((state) => state.form.changeHistories)

  const { data } = useQuery({
    queryKey: ['ClientDetailInfo'],
    queryFn: () => ClientDetailService(clientCompanyId),
    enabled: isEditMode && !!clientCompanyId, // 수정 모드일 때만 fetch
  })

  const [updatedUserOptions, setUpdatedUserOptions] = useState(userOptions)

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data
      const newUserOptions = [...userOptions]

      if (client.user) {
        const userName = client.user.username + (client.user.deleted ? ' (삭제됨)' : '')

        const exists = newUserOptions.some((u) => u.id === client.user.id)
        if (!exists) {
          newUserOptions.push({
            id: client.user.id,
            name: userName,
            deleted: client.user.deleted,
          })
        }
      }

      const deletedUsers = newUserOptions.filter((u) => u.deleted)
      const normalUsers = newUserOptions.filter((u) => !u.deleted && u.id !== '0')

      setUpdatedUserOptions([
        newUserOptions.find((u) => u.id === '0')!,
        ...deletedUsers,
        ...normalUsers,
      ])

      setField('userId', client.user?.id ?? '0')
    } else if (!isEditMode) {
      // 등록 모드일 경우
      setUpdatedUserOptions(userOptions)
      setField('userId', 0) // "선택" 기본값
    }
  }, [data, isEditMode, userOptions])

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('23242', client)

      function parseLandlineNumber(landline: string) {
        if (!landline) return { managerAreaNumber: '', landlineNumber: '' }

        const parts = landline.split('-')

        if (parts.length === 3) {
          return {
            managerAreaNumber: parts[0], // "02"
            landlineNumber: `${parts[1]}-${parts[2]}`, // "123-5678"
          }
        } else if (parts.length === 2) {
          // "02-1234567" → ["02", "1234567"]
          return {
            managerAreaNumber: parts[0], // "02"
            landlineNumber: parts[1], // "1234567"
          }
        } else {
          // 하이픈 없거나 이상한 경우
          return {
            managerAreaNumber: '',
            landlineNumber: landline.replace(/-/g, ''),
          }
        }
      }

      // 담당자 데이터 가공
      const formattedContacts = (client.contacts ?? []).map((c: Manager) => {
        const { managerAreaNumber, landlineNumber } = parseLandlineNumber(c.landlineNumber ?? '')

        return {
          id: c.id,
          name: c.name,
          position: c.position,
          department: c.department,
          phoneNumber: c.phoneNumber,
          email: c.email,
          memo: c.memo,
          isMain: c.isMain,
          // 분리된 값 추가
          managerAreaNumber,
          landlineNumber,
        }
      })

      // 첨부파일 데이터 가공
      const formattedFiles = (client.files ?? [])
        .map((item: AttachedFile) => ({
          id: item.id,
          name: item.name,
          memo: item.memo,
          type: item.typeCode,
          files: [
            {
              fileUrl: item.fileUrl && item.fileUrl.trim() !== '' ? item.fileUrl : null,
              originalFileName:
                item.originalFileName && item.originalFileName.trim() !== ''
                  ? item.originalFileName
                  : null,
            },
          ],
        }))
        // BUSINESS_LICENSE를 맨 위로
        .sort((a: AttachedFile, b: AttachedFile) => {
          if (a.type === 'BUSINESS_LICENSE') return -1
          if (b.type === 'BUSINESS_LICENSE') return 1
          return 0
        })

      if (client.paymentMethod === '어음') {
        setField('paymentMethod', 'BILL')
      }
      if (client.paymentMethod === '현금') {
        setField('paymentMethod', 'CASH')
      }
      if (client.isActive === false) {
        setField('isActive', '미사용')
      }

      if (client.landlineNumber) {
        const parts = client.landlineNumber.split('-')
        if (parts.length >= 2) {
          const area = parts[0] // 지역번호
          const number = parts.slice(1).join('-') // 나머지 번호
          setField('areaNumber', area)
          setField('landlineNumber', number)
        } else {
          // fallback (예외 처리)
          setField('landlineNumber', client.landlineNumber)
        }
      } else {
        setField('landlineNumber', '')
        setField('areaNumber', '')
      }

      // 각 필드에 set
      setField('name', client.name)
      setField('businessNumber', client.businessNumber)
      setField('address', client.address)
      setField('phoneNumber', client.phoneNumber)
      setField('detailAddress', client.detailAddress)
      setField('ceoName', client.ceoName)
      setField('email', client.email)
      setField('paymentPeriod', client.paymentPeriod)
      setField('isActive', client.isActive ? '1' : '2')

      setField('userId', client.user?.id ?? '0')

      setField('createdAt', getTodayDateString(client.createdAt))
      setField('updatedAt', getTodayDateString(client.updatedAt))

      setField('memo', client.memo)
      setField('headManagers', formattedContacts)
      setField('attachedFiles', formattedFiles)
    } else {
      reset()
    }
  }, [data, isEditMode, reset, setField])

  const formatChangeDetail = (getChanges: string) => {
    try {
      const parsed = JSON.parse(getChanges)
      if (!Array.isArray(parsed)) return '-'

      return parsed.map(
        (item: { property: string; before: string | null; after: string | null }, idx: number) => {
          const propertyKo = PROPERTY_NAME_MAP[item.property] || item.property

          const convertValue = (value: string | null) => {
            if (value === 'true') return '사용'
            if (value === 'false') return '미사용'
            if (value === null || value === 'null') return 'null'
            return value
          }

          let before = convertValue(item.before)
          let after = convertValue(item.after)

          // 스타일 결정
          let style = {}
          if (before === 'null') {
            before = '추가'
            style = { color: '#1976d2' } // 파란색 - 추가
          } else if (after === 'null' || after === '') {
            after = '삭제'
            style = { color: '#d32f2f' } // 빨간색 - 삭제
          }

          return (
            <Typography key={idx} component="div" style={style}>
              {before === '추가'
                ? `추가됨 => ${after}`
                : after === '삭제'
                ? ` ${before} => 삭제됨`
                : `${propertyKo} : ${before} => ${after}`}
            </Typography>
          )
        },
      )
    } catch (e) {
      if (e instanceof Error) return '-'
    }
  }

  // 수정이력 데이터가 들어옴
  useEffect(() => {
    if (clientHistoryList?.pages) {
      const allHistories = clientHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type,
          content: formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
  }, [clientHistoryList, setField])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (clientIsLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && clientHasNextPage) {
          clientFetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [clientFetchNextPage, clientHasNextPage, isFetchingNextPage, clientIsLoading],
  )

  function validateClientForm(form: FormState) {
    if (!form.name?.trim()) return '발주처명을 입력하세요.'
    if (!form.businessNumber?.trim()) return '사업자등록번호를 입력하세요.'
    if (!form.address?.trim()) return '본사 주소를 입력하세요.'
    if (!form.detailAddress?.trim()) return '상세 주소를 입력하세요.'
    if (!form.ceoName?.trim()) return '대표자명을 입력하세요.'
    if (!form.landlineNumber?.trim()) return '전화번호를 입력하세요.'
    if (!form.phoneNumber?.trim()) return '개인 휴대폰을 입력하세요.'
    if (!form.email?.trim()) return '이메일을 입력하세요.'

    // 필요시 추가 검증
    if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(form.phoneNumber)) {
      return '휴대폰 번호를 010-1234-5678 형식으로 입력하세요.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return '유효한 이메일을 입력하세요.'
    }

    if (!form.paymentMethod) return '결제 방식을 선택하세요.'
    if (!form.paymentPeriod?.trim()) return '결제 정보를 입력하세요.'
    if (!form.userId) return '본사 담당자를 선택하세요.'
    if (form.isActive === '0') return '사용 여부를 선택하세요.'
    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    // 담당자 유효성 체크
    if (managers.length > 0) {
      for (const item of managers) {
        if (!item.name?.trim()) return '담당자의 이름을 입력해주세요.'
        if (!item.position?.trim()) return '담당자의 부서를 입력해주세요.'
        if (!item.department?.trim()) return '담당자의 직급(직책)을 입력해주세요.'
        if (!item.landlineNumber?.trim()) return '담당자의 전화번호를 입력해주세요.'
        if (!item.phoneNumber?.trim()) return '담당자의 개인 휴대폰을 입력해주세요.'
        if (!item.email?.trim()) return '담당자의 이메일을 입력해주세요.'
        if (item.memo.length > 500) {
          return '담당자의 비고는 500자 이하로 입력해주세요.'
        }

        // 필요시 형식 체크
        if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(item.phoneNumber)) {
          return '담당자의 휴대폰 번호를 xxx-xxxx-xxxx 형식으로 입력해주세요.'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
          return '담당자의 이메일 형식이 올바르지 않습니다.'
        }
      }
    }

    if (attachedFiles.length > 0) {
      for (const item of attachedFiles) {
        if (!item.name?.trim()) return '첨부파일의 이름을 입력해주세요.'
        if (item.memo.length > 500) {
          return '첨부파일의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    return null
  }

  const handleClientSubmit = () => {
    const errorMsg = validateClientForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        ClientModifyMutation.mutate(clientCompanyId)
      }
    } else {
      createClientMutation.mutate()
    }
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className=" w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300 font-bold text-center">
              발주처명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.name ?? ''}
                onChange={(value) => setField('name', value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.businessNumber ?? ''}
                onChange={(value) => {
                  const formatBusinessNumber = CommonInputnumber(value)
                  setField('businessNumber', formatBusinessNumber)
                }}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              본사 주소
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2">
                <input
                  value={form.address}
                  readOnly
                  placeholder="주소를 검색해 주세요."
                  className="flex-1 border px-3 py-2 rounded"
                />
                <CommonButton
                  label="주소찾기"
                  variant="secondary"
                  className="bg-gray-400 text-white px-3 rounded"
                  onClick={() => setField('isModalOpen', true)}
                />
              </div>
              <input
                value={form.detailAddress ?? ''}
                onChange={(e) => setField('detailAddress', e.target.value)}
                placeholder="상세주소"
                className="w-full border px-3 py-2 rounded"
              />
              {form.isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white w-full max-w-lg p-4 rounded-xl shadow-lg relative flex flex-col">
                    <div className="flex justify-end w-full">
                      <CommonButton
                        className="mb-2"
                        label="X"
                        variant="danger"
                        onClick={() => setField('isModalOpen', false)}
                      />
                    </div>
                    <DaumPostcodeEmbed
                      onComplete={(data) => {
                        setField('address', data.address)
                        setField('isModalOpen', false)
                      }}
                      autoClose={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              대표자명
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.ceoName ?? ''}
                onChange={(value) => setField('ceoName', value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              전화번호
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.areaNumber}
                onChange={(value) => setField('areaNumber', value)}
                options={AreaCode}
              />

              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.landlineNumber ?? ''}
                onChange={(value) => {
                  const formatAreaNumber = formatPersonNumber(value)
                  setField('landlineNumber', formatAreaNumber)
                }}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              개인 휴대폰
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.phoneNumber ?? ''}
                onChange={(value) => {
                  const clientPhone = formatPhoneNumber(value)
                  setField('phoneNumber', clientPhone)
                }}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              이메일(대표)
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.email ?? ''}
                onChange={(value) => setField('email', value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              결제정보
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.paymentMethod || 'BASE'}
                onChange={(value) => setField('paymentMethod', value)}
                options={payMethodOptions}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.paymentPeriod ?? ''}
                onChange={(value) => setField('paymentPeriod', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              본사 담당자명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.userId}
                onChange={(value) => setField('userId', value)}
                options={updatedUserOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                onInputChange={(value) => setUserSearch(value)}
                loading={isLoading}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              사용 여부
            </label>
            <div className="border border-gray-400 px-2 w-full flex items-center">
              <CommonSelect
                fullWidth={false}
                className="text-xl"
                value={form.isActive}
                onChange={(value) => setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              비고
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo ?? ''}
                placeholder="500자 이하 텍스트 입력"
                onChange={(value) => setField('memo', value)}
                className="flex-1"
              />
            </div>
          </div>
          {isEditMode && (
            <div className="flex">
              <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
                등록일 / 수정일
              </label>
              <div className="border border-gray-400 px-2 w-full">
                <CommonInput
                  value={`${form.createdAt ?? ''} / ${form.updatedAt ?? ''}`}
                  onChange={(value) => setField('memo', value)}
                  disabled={true}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 담당자 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">담당자</span>
          <div className="flex gap-4">
            <CommonButton
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
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isAllChecked}
                    indeterminate={checkedIds.length > 0 && !isAllChecked}
                    onChange={(e) => toggleCheckAllItems('manager', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {[
                  '대표담당자',
                  '이름',
                  '부서',
                  '직급(직책)',
                  '전화번호',
                  '개인 휴대폰',
                  '이메일',
                  '비고',
                ].map((label) => (
                  <TableCell
                    key={label}
                    align="center"
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
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
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <Radio
                      checked={m.isMain === true}
                      onChange={() => setRepresentativeManager(m.id)}
                      value={m.id}
                      name="representative"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.name}
                      onChange={(e) => updateItemField('manager', m.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.position}
                      onChange={(e) => updateItemField('manager', m.id, 'position', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.department}
                      onChange={(e) =>
                        updateItemField('manager', m.id, 'department', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      border: '1px solid #9CA3AF',
                      padding: '8px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CommonSelect
                        value={m.managerAreaNumber}
                        onChange={(value) => {
                          updateItemField('manager', m.id, 'managerAreaNumber', value)
                        }}
                        options={AreaCode}
                      />

                      <TextField
                        size="small"
                        placeholder="'-'없이 숫자만 입력"
                        value={m.landlineNumber}
                        onChange={(e) => {
                          const formatAreaNumber = formatPersonNumber(e.target.value)
                          updateItemField('manager', m.id, 'landlineNumber', formatAreaNumber)
                        }}
                        sx={{ width: 120 }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={m.phoneNumber}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value)
                        updateItemField('manager', m.id, 'phoneNumber', formatted)
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.email}
                      onChange={(e) => updateItemField('manager', m.id, 'email', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      value={m.memo}
                      onChange={(e) => updateItemField('manager', m.id, 'memo', e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* 첨부파일 */}
      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">첨부파일</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('attachedFile')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('attachedFile')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                  <Checkbox
                    checked={isFilesAllChecked}
                    indeterminate={fileCheckIds.length > 0 && !isFilesAllChecked}
                    onChange={(e) => toggleCheckAllItems('attachedFile', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['문서명', '첨부', '비고'].map((label) => (
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
              {attachedFiles.map((m) => (
                <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={fileCheckIds.includes(m.id)}
                      disabled={m.type === 'BUSINESS_LICENSE'}
                      onChange={(e) => toggleCheckItem('attachedFile', m.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.name}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'name', e.target.value)
                      }
                      disabled={m.type === 'BUSINESS_LICENSE'}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                      <CommonFileInput
                        acceptedExtensions={[
                          'pdf',
                          'jpg',
                          'png',
                          'hwp',
                          'xlsx',
                          'zip',
                          'jpeg',
                          'ppt',
                        ]}
                        multiple={false}
                        files={m.files} // 각 항목별 files
                        onChange={(newFiles) => {
                          updateItemField('attachedFile', m.id, 'files', newFiles.slice(0, 1))
                          // updateItemField('attachedFile', m.id, 'files', newFiles)
                        }}
                        uploadTarget="CLIENT_COMPANY"
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.memo}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'memo', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                  {[
                    { label: '수정일시', width: '12%' },
                    { label: '항목', width: '5%' },
                    { label: '수정항목', width: '30%' },
                    { label: '수정자', width: '2%' },
                    { label: '비고', width: '15%' },
                  ].map(({ label, width }) => (
                    <TableCell
                      key={label}
                      align="center"
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid #9CA3AF',
                        color: 'black',
                        fontWeight: 'bold',
                        width,
                        maxWidth: width,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {historyList.map((item: HistoryItem) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {formatDateTime(item.createdAt)} / {formatDateTime(item.updatedAt)}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        border: '1px solid  #9CA3AF',
                        textAlign: 'center',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.type}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        border: '1px solid  #9CA3AF',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.content}
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
                        placeholder="500자 이하 텍스트 입력"
                        onChange={(e) => updateMemo(item.id, e.target.value)}
                        multiline
                        inputProps={{ maxLength: 500 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {clientHasNextPage && (
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={orderingCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleClientSubmit}
        />
      </div>
    </>
  )
}
