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
  OutsourcingAttachedFile,
  OutsourcingFormState,
  OutsourcingManager,
} from '@/types/outsourcingCompany'
import { formatDateTime, getTodayDateString } from '@/utils/formatters'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { HistoryItem } from '@/types/ordering'

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

  console.log('typeMethodOptionstypeMethodOptions', typeMethodOptions)

  const { showSnackbar } = useSnackbarStore()

  const managers = form.headManagers
  const checkedIds = form.checkedManagerIds
  const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds

  const filesToCheck = attachedFiles.filter((f) => f.type !== 'BUSINESS_LICENSE')
  const isFilesAllChecked = filesToCheck.length > 0 && fileCheckIds.length === filesToCheck.length

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
    queryKey: ['OutsourcingInfo'],
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
    memo: '비고',
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
    originalFileName: '파일 추가',
    address: '주소',
    department: '부서',
    position: '직급(직책)',
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

  console.log('ContractHistoryList2', ContractHistoryList)

  const totalList = useContractHistoryDataQuery.data?.data.pageInfo.totalElements ?? 0
  const pageCount = 10
  const totalPages = Math.ceil(totalList / pageCount)

  useEffect(() => {
    if (outsourcingDetailData && isEditMode === true) {
      const client = outsourcingDetailData.data

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
      const formattedFiles = (client.files ?? [])
        .map((item: OutsourcingAttachedFile) => ({
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
        .sort((a: OutsourcingAttachedFile, b: OutsourcingAttachedFile) => {
          if (a.type === 'BUSINESS_LICENSE') return -1
          if (b.type === 'BUSINESS_LICENSE') return 1
          return 0
        })

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
        setField('areaNumber', '지역번호')
      }

      // 각 필드에 set
      setField('name', client.name)
      setField('businessNumber', client.businessNumber)
      setField('type', client.type)

      if (client.type === '노무') {
        setField('type', 'SERVICE')
      } else if (client.type === '장비') {
        setField('type', 'EQUIPMENT')
      } else if (client.type === '외주') {
        setField('type', 'CONSTRUCTION')
      } else if (client.type === '재료') {
        setField('type', 'MATERIAL')
      } else if (client.type === '유류') {
        setField('type', 'FUEL')
      } else if (client.type === '관리') {
        setField('type', 'MANAGEMENT')
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

      setField('memo', client.memo || '')
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
    if (outsourcingHistoryList?.pages) {
      const allHistories = outsourcingHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type || '-',
          isEditable: item.isEditable,
          content:
            formatChangeDetail(item.getChanges) === '-'
              ? item?.description
              : formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
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

  function validateClientForm(form: OutsourcingFormState) {
    if (!form.name?.trim()) return '업체명을 입력하세요.'
    if (!form.businessNumber?.trim()) return '사업자등록번호를 입력하세요.'
    if (!form.type?.trim()) return '구분을 입력하세요.'
    if (!form.ceoName?.trim()) return '대표자명을 입력하세요.'
    if (!form.address?.trim()) return '본사 주소를 입력하세요.'
    // if (!form.detailAddress?.trim()) return '상세 주소를 입력하세요.'
    if (!form.landlineNumber?.trim()) return '전화번호를 입력하세요.'
    if (!form.email?.trim()) return '이메일을 입력하세요.'
    if (form.isActive === '0') return '사용 여부를 선택하세요.'

    // 기본공제 항목 체크 (선택된 값이 없으면 안내)
    // if (!(form.defaultDeductions?.split(',').filter(Boolean)?.length > 0)) {
    //   return '기본공제 항목을 선택해주세요.'
    // }

    // 계좌정보 체크
    if (!form.bankName?.trim() || form.bankName === '0') return '은행명을 선택하세요.'
    if (!form.accountNumber?.trim()) return '계좌번호를 입력하세요.'
    if (!form.accountHolder?.trim()) return '예금주를 입력하세요.'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return '유효한 이메일을 입력하세요.'
    }
    if (form.isActive === '0') return '사용 여부를 선택하세요.'

    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    // 담당자 유효성 체크
    if (managers.length > 0) {
      for (const item of managers) {
        if (!item.name?.trim()) return '담당자의 이름을 입력해주세요.'
        if (!item.department?.trim()) return '담당자의 부서를 입력해주세요.'
        if (!item.position?.trim()) return '담당자의 직급(직책)을 입력해주세요.'
        if (!item.landlineNumber?.trim()) return '담당자의 전화번호를 입력해주세요.'
        if (!item.phoneNumber?.trim()) return '담당자의 개인 휴대폰을 입력해주세요.'
        if (!item.email?.trim()) return '담당자의 이메일을 입력해주세요.'

        // 필요시 형식 체크
        if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(item.phoneNumber)) {
          return '담당자의 휴대폰 번호를 xxx-xxxx-xxxx 형식으로 입력해주세요.'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
          return '담당자의 이메일 형식이 올바르지 않습니다.'
        }

        if (item.memo.length > 500) {
          return '담당자의 비고는 500자 이하로 입력해주세요.'
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

  const handleOutSourcingCompanySubmit = () => {
    const errorMsg = validateClientForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        OutsourcingModifyMutation.mutate(outsourcingCompanyId)
      }
    } else {
      createOutSourcingMutation.mutate()
    }
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              업체명 <span className="text-red-500 ml-1">*</span>
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
              사업자등록번호 <span className="text-red-500 ml-1">*</span>
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
              구분 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2 items-center">
                <CommonSelect
                  className="text-2xl"
                  value={form.type || 'BASE'}
                  onChange={(value) => {
                    setField('type', value)

                    if (value !== 'ETC') {
                      setField('typeDescription', '')
                    }
                  }}
                  options={typeMethodOptions}
                  disabled={isEditMode}
                />

                <CommonInput
                  value={form.typeDescription ?? ''}
                  onChange={(value) => setField('typeDescription', value)}
                  className="flex-1"
                  disabled={isEditMode || form.type !== 'ETC'}
                  placeholder={form.type === 'ETC' ? '기타 내용을 입력하세요' : ''}
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              대표자명 <span className="text-red-500 ml-1">*</span>
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
              위치(주소) <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2">
                <input
                  value={form.address ?? ''}
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
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              전화번호 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.areaNumber ?? '지역번호'}
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
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              이메일(대표) <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.email ?? ''}
                onChange={(value) => setField('email', value)}
                className=" flex-1"
                placeholder="텍스트 입력"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              사용 여부 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.isActive ?? '0'}
                onChange={(value) => setField('isActive', value)}
                options={UseORnotOptions}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-[119px] 2xl:w-[124px] text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
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
              계좌정보 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.bankName ?? ''}
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
              비고
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo ?? ''}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
                placeholder="500자 이하 텍스트 입력"
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
                    {label === '비고' ? (
                      label
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>{label}</span>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                    )}
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
                      value={m.name ?? ''}
                      onChange={(e) => updateItemField('manager', m.id, 'name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.department ?? ''}
                      onChange={(e) =>
                        updateItemField('manager', m.id, 'department', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      placeholder="텍스트 입력"
                      size="small"
                      value={m.position ?? ''}
                      onChange={(e) => updateItemField('manager', m.id, 'position', e.target.value)}
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
                        value={m.managerAreaNumber || '지역번호'}
                        onChange={(value) => {
                          updateItemField('manager', m.id, 'managerAreaNumber', value)
                        }}
                        options={AreaCode}
                      />

                      <TextField
                        size="small"
                        placeholder="'-'없이 숫자만 입력"
                        value={m.landlineNumber ?? ''}
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
                      value={m.phoneNumber ?? ''}
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
                      value={m.email ?? ''}
                      onChange={(e) => updateItemField('manager', m.id, 'email', e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      value={m.memo ?? ''}
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
                    {label === '비고' || label === '첨부' ? (
                      label
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>{label}</span>
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                    )}
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
                      value={m.name ?? ''}
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
                          'txt',
                          'rtf',
                          'docx',
                          'hwp',
                          'xlsx',
                          'csv',
                          'ods',
                          'pptx',
                          'ppt',
                          'odp',
                          'jpg',
                          'jpeg',
                          'png',
                          'gif',
                          'tif',
                          'tiff',
                          'bmp',
                          'zip',
                          '7z',
                          'mp3',
                          'wav',
                          'mp4',
                          'mov',
                          'avi',
                          'wmv',
                          'dwg',
                        ]}
                        multiple={false}
                        files={m.files} // 각 항목별 files
                        onChange={(newFiles) => {
                          updateItemField('attachedFile', m.id, 'files', newFiles.slice(0, 1))
                          // updateItemField('attachedFile', m.id, 'files', newFiles)
                        }}
                        uploadTarget="OUTSOURCING_COMPANY"
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.memo ?? ''}
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
                {ContractHistoryList.map((item: ContractHistoryItem, index: number) => (
                  <TableRow key={item.contractId ?? index}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {(form.currentPage - 1) * pageCount + index + 1}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.siteName}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.processName}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.contractAmount ? item.contractAmount.toLocaleString() + ' 원' : '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.contactName}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.defaultDeductions}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.files?.some((item) => item.fileUrl && item.fileUrl.trim() !== '')
                        ? 'O'
                        : 'X'}
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {item.contractStartDate && item.contractEndDate
                        ? `${getTodayDateString(item.contractStartDate)} ~ ${getTodayDateString(
                            item.contractEndDate,
                          )}`
                        : '-'}
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
              onChange={(_, newPage) => setField('currentPage', newPage)}
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
            <div className="flex gap-4"></div>
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
                      {formatDateTime(item.updatedAt)}
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
                        placeholder="500자 이하 텍스트 입력"
                        onChange={(e) => updateMemo(item.id, e.target.value)}
                        multiline
                        inputProps={{ maxLength: 500 }}
                        disabled={!item.isEditable}
                        sx={{
                          '& .MuiInputBase-root': {
                            backgroundColor: item.isEditable ? 'white' : '#e4e4e4', // 비활성화 시 연한 배경
                            color: item.isEditable ? 'inherit' : 'gray', // 비활성화 시 글자색
                          },
                        }}
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
          onClick={handleOutSourcingCompanySubmit}
        />
      </div>
    </>
  )
}
