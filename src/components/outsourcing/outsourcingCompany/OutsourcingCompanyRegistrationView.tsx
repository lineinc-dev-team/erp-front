'use client'

import CommonInput from '../../common/Input'
import CommonSelect from '../../common/Select'
import CommonButton from '../../common/Button'
import DaumPostcodeEmbed from 'react-daum-postcode'
import {
  Box,
  Checkbox,
  Pagination,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { AreaCode, bankOptions, UseORnotOptions } from '@/config/erp.confing'
import { idTypeValueToName, useOutsourcingFormStore } from '@/stores/outsourcingCompanyStore'
import useOutSourcingCompany from '@/hooks/useOutSourcingCompany'
import { formatPersonNumber, formatPhoneNumber } from '@/utils/formatPhoneNumber'
import CommonFileInput from '@/components/common/FileInput'
import CommonInputnumber from '@/utils/formatBusinessNumber'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { OutsourcingDetailService } from '@/services/outsourcingCompany/outsourcingCompanyRegistrationService'
import { useCallback, useEffect, useRef } from 'react'
import {
  ContractHistoryItem,
  HistoryItem,
  OutsourcingAttachedFile,
  OutsourcingManager,
} from '@/types/outsourcingCompany'
import { getTodayDateString } from '@/utils/formatters'

export default function OutsourcingCompanyRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    updateMemo,
    setRepresentativeManager,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
  } = useOutsourcingFormStore()

  const {
    createOutSourcingMutation,
    typeMethodOptions,
    outsourcingCancel,
    deductionMethodOptions,
    OutsourcingModifyMutation,
    useOutsourcingCompanyHistoryDataQuery,

    useContractHistoryDataQuery,
  } = useOutSourcingCompany()

  const managers = form.headManagers
  const checkedIds = form.checkedManagerIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  const params = useParams()
  const outsourcingCompanyId = Number(params?.id)

  const selectedValues = (form.defaultDeductions?.split(',') || []).filter(Boolean)

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const current = (form.defaultDeductions?.split(',') || []).filter(Boolean)
    const updated = checked
      ? [...new Set([...current, value])]
      : current.filter((item) => item !== value)

    setField('defaultDeductions', updated.join(','))
  }

  const { data: outsourcingDetailData } = useQuery({
    queryKey: ['OutsourcingDetailInfo'],
    queryFn: () => OutsourcingDetailService(outsourcingCompanyId),
    enabled: isEditMode && !!outsourcingCompanyId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    departmentName: '부서(소속)',
    positionName: '직급',
    gradeName: '직책',
    phoneNumber: '개인 휴대폰',
    landlineNumber: '전화번호',
    email: '이메일',
    isActive: '계정 상태',
    memo: '메모',
    name: '업체명',
    businessNumber: '사업자등록번호',
    typeName: '구분명',
    typeDescription: '구분 설명',
    defaultDeductionsName: '기본공제 항목',
    defaultDeductionsDescription: '기본공제 항목 설명',
    ceoName: '대표자명',
    detailAddress: '상세주소',
    bankName: '은행명',
    accountNumber: '계좌번호',
    accountHolder: '예금주',
  }

  const {
    data: outsourcingHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useOutsourcingCompanyHistoryDataQuery(outsourcingCompanyId, isEditMode)

  const historyList = useOutsourcingFormStore((state) => state.form.changeHistories)

  const ContractHistoryList = useContractHistoryDataQuery.data?.data.content ?? []

  const totalList = useContractHistoryDataQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = Number(form.pageCount) || 10
  const totalPages = Math.ceil(totalList / pageCount)

  useEffect(() => {
    if (outsourcingDetailData && isEditMode === true) {
      const client = outsourcingDetailData.data

      console.log('은행 정보를 보자 ', client)

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
      const formattedContacts = (client.contacts ?? []).map((c: OutsourcingManager) => {
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
      const formattedFiles = (client.files ?? []).map((item: OutsourcingAttachedFile) => ({
        id: item.id,
        name: item.name,
        memo: item.memo,
        files: [
          {
            publicUrl: item.fileUrl,
            file: {
              name: item.originalFileName,
            },
          },
        ],
      }))

      if (client.landlineNumber) {
        const parts = client.landlineNumber.split('-')
        if (parts.length >= 2) {
          const area = parts[0] // 지역번호
          const number = parts.slice(1).join('-') // 나머지 번호
          setField('landlineNumber', area)
          setField('landlineLastNumber', number)
        } else {
          // fallback (예외 처리)
          setField('landlineLastNumber', client.landlineLastNumber)
        }
      } else {
        setField('landlineNumber', '')
        setField('landlineLastNumber', '')
      }

      // 각 필드에 set
      setField('name', client.name)
      setField('businessNumber', client.businessNumber)
      setField('type', client.type)

      if (client.type === '용역') {
        setField('type', 'SERVICE')
      } else if (client.type === '장비') {
        setField('type', 'EQUIPMENT')
      } else if (client.type === '식당') {
        setField('type', 'CATERING')
      } else if (client.type === '기타') {
        setField('type', 'ETC')
      }

      setField('typeDescription', client.typeDescription)
      setField('address', client.address)
      setField('phoneNumber', client.phoneNumber)
      setField('detailAddress', client.detailAddress)
      setField('ceoName', client.ceoName)
      setField('email', client.email)
      setField('isActive', client.isActive ? '1' : '2')

      if (client.defaultDeductions) {
        const deductionNames = client.defaultDeductions.split(',').map((s: string) => s.trim())

        const matchedCodes = deductionMethodOptions
          .filter((opt) => deductionNames.includes(opt.name))
          .map((opt) => opt.code)

        setField('defaultDeductions', matchedCodes.join(','))
      }
      setField('defaultDeductionsDescription', client.defaultDeductionsDescription)

      const mappedItemType = idTypeValueToName[client.bankName ?? '']

      if (mappedItemType) {
        setField('bankName', mappedItemType)
      } else {
        setField('bankName', '') // 혹은 기본값 처리
      }

      setField('accountNumber', client.accountNumber)

      setField('accountHolder', client.accountHolder)

      setField('memo', client.memo)
      setField('headManagers', formattedContacts)
      setField('attachedFiles', formattedFiles)
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outsourcingDetailData, isEditMode, reset, setField])

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
          } else if (after === 'null') {
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
    if (outsourcingHistoryList?.pages) {
      const allHistories = outsourcingHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type,
          content: formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: getTodayDateString(item.createdAt),
          updatedAt: getTodayDateString(item.updatedAt),
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outsourcingHistoryList, setField])

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

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              업체명
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.name ?? ''}
                onChange={(value) => setField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.businessNumber ?? ''}
                onChange={(value) => {
                  const formatBusinessNumber = CommonInputnumber(value)
                  setField('businessNumber', formatBusinessNumber)
                }}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              구분
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2 items-center">
                <CommonSelect
                  className="text-2xl"
                  value={form.type || 'BASE'}
                  onChange={(value) => setField('type', value)}
                  options={typeMethodOptions}
                />

                <CommonInput
                  value={form.typeDescription ?? ''}
                  onChange={(value) => setField('typeDescription', value)}
                  className=" flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              대표자명
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.ceoName ?? ''}
                onChange={(value) => setField('ceoName', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              위치(주소)
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
                value={form.detailAddress}
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              전화번호
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.landlineNumber}
                onChange={(value) => setField('landlineNumber', value)}
                options={AreaCode}
              />

              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.landlineLastNumber ?? ''}
                onChange={(value) => {
                  const formatAreaNumber = formatPersonNumber(value)
                  setField('landlineLastNumber', formatAreaNumber)
                }}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              이메일(대표)
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.email ?? ''}
                onChange={(value) => setField('email', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사용 여부
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.isActive}
                onChange={(value) => setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-[119] text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              공제 항목 기본값
            </label>
            <div className="flex border  border-gray-400 flex-wrap px-2 items-center gap-4 flex-1">
              {deductionMethodOptions.map((opt) => (
                <label key={opt.code} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt.code)}
                    onChange={(e) => handleCheckboxChange(opt.code, e.target.checked)}
                  />
                  {opt.name}
                </label>
              ))}

              <CommonInput
                placeholder="텍스트 입력, ','구분"
                value={form.defaultDeductionsDescription ?? ''}
                onChange={(value) => setField('defaultDeductionsDescription', value)}
                className="flex-1 text-sm"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              계좌정보
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.bankName}
                onChange={(value) => setField('bankName', value)}
                options={bankOptions}
              />

              <CommonInput
                value={form.accountNumber ?? ''}
                onChange={(value) => setField('accountNumber', value)}
                className=" flex-1"
              />

              <CommonInput
                value={form.accountHolder ?? ''}
                onChange={(value) => setField('accountHolder', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고 / 메모
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo ?? ''}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
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
                      placeholder="텍스트 입력"
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
                        files={m.files} // 각 항목별 files
                        onChange={
                          (newFiles) => updateItemField('attachedFile', m.id, 'files', newFiles) //  해당 항목만 업데이트
                        }
                        uploadTarget="CLIENT_COMPANY"
                      />
                      {/* <CommonFileInput
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
                        files={uploadedFiles}
                        onChange={setUploadedFiles}
                        uploadTarget={'CLIENT_COMPANY'}
                      /> */}
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
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
            <span className="font-bold border-b-2 mb-4">계약이력</span>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  {[
                    'No',
                    '현장명',
                    '공정명',
                    '금액',
                    '담당자',
                    '공제항목',
                    '첨부파일 제출 여부',
                    '계약기간',
                    '등록일/수정일',
                  ].map((label) => (
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
                {ContractHistoryList.map((item: ContractHistoryItem) => (
                  <TableRow key={item.contractId}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.contractId}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.siteName}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.processName}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.contractAmount}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.contactName}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.defaultDeductions}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {/* {item.files} */}
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {getTodayDateString(item.contractStartDate)} ~{' '}
                      {getTodayDateString(item.contractEndDate)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {getTodayDateString(item.createdAt)} / {getTodayDateString(item.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="flex justify-center mt-4 pb-6">
            <Pagination
              count={totalPages}
              page={form.currentPage}
              // onChange={(_, newPage) => form.setField('currentPage', newPage)}
              shape="rounded"
              color="primary"
            />
          </div>
        </div>
      )}

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
                  {['No', '수정일시', '항목', '수정항목', '수정자', '비고 / 메모'].map((label) => (
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
                {historyList.map((item: HistoryItem) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.id}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.createdAt} / {item.updatedAt}
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
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={outsourcingCancel} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              OutsourcingModifyMutation.mutate(outsourcingCompanyId)
            } else {
              createOutSourcingMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
