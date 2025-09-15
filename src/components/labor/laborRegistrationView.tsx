/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import DaumPostcodeEmbed from 'react-daum-postcode'
import {
  Checkbox,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { bankOptions } from '@/config/erp.confing'
import { formatPhoneNumber } from '@/utils/formatPhoneNumber'
import CommonFileInput from '@/components/common/FileInput'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { HistoryItem } from '@/types/outsourcingCompany'
import {
  formatDateTime,
  formatNumber,
  getTodayDateString,
  unformatNumber,
} from '@/utils/formatters'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import { useLaborFormStore } from '@/stores/laborStore'
import CommonButton from '../common/Button'
import { useLaborInfo } from '@/hooks/useLabor'
import CommonResidentNumberInput from '@/utils/commonResidentNumberInput'
import AmountInput from '../common/AmountInput'
import { LaborDetailService, LaborHistoreyService } from '@/services/labor/laborRegistrationService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { AttachedFile, LaborFormState } from '@/types/labor'
import { idTypeValueToName } from '@/stores/outsourcingCompanyStore'

export default function LaborRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    updateMemo,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
  } = useLaborFormStore()

  const { showSnackbar } = useSnackbarStore()

  const {
    createLaborInfo,
    LaborModifyMutation,
    WorkTypeMethodOptions,
    LaborTypeMethodOptions,
    laborCancel,
    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,

    useLaborHistoryDataQuery,
  } = useLaborInfo()

  const attachedFiles = form.files
  const fileCheckIds = form.checkedAttachedFileIds

  const filesToCheck = attachedFiles.filter(
    (f) => f.type !== 'ID_CARD' && f.type !== 'BANKBOOK' && f.type !== 'SIGNATURE_IMAGE',
  )
  const isFilesAllChecked = filesToCheck.length > 0 && fileCheckIds.length === filesToCheck.length

  const params = useParams()
  const laborDataId = Number(params?.id)

  const { data: laborDetailData } = useQuery({
    queryKey: ['LaborDetailInfo'],
    queryFn: () => LaborDetailService(laborDataId),
    enabled: isEditMode && !!laborDataId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    phoneNumber: '개인 휴대폰',
    name: '업체명',
    mainWork: '주 작업',
    dailyWage: '기준일당',
    hireDateFormat: '입사일',
    resignationDateFormat: '퇴사일',
    workTypeName: '공종',
    workTypeDescription: '공종 설명',
    typeName: '구분명',
    typeDescription: '구분 설명',
    detailAddress: '상세주소',
    bankName: '은행명',
    accountNumber: '계좌번호',
    accountHolder: '예금주',
    memo: '비고',
    originalFileName: '파일 추가',
  }

  // const [isChecked, setIsChecked] = useState(false)

  // const handleTaxCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const checked = e.target.checked
  //   setIsChecked(checked)

  //   if (checked) {
  //     // 체크하면 퇴사일 초기화
  //     setField('resignationDate', null)
  //   }
  // }

  const {
    data: laborHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLaborHistoryDataQuery(laborDataId, isEditMode)

  const historyList = useLaborFormStore((state) => state.form.changeHistories)

  useEffect(() => {
    if (laborDetailData && isEditMode === true) {
      const client = laborDetailData.data

      console.log('clientclientclient', client)

      // 첨부파일 데이터 가공
      const formattedFiles = (client.files ?? [])
        .map((item: AttachedFile) => ({
          id: item.id,
          name: item.name,
          memo: item.memo,
          type: item.typeCode,
          createdAt: getTodayDateString(item.createdAt),
          updatedAt: getTodayDateString(item.updatedAt),
          files: [
            {
              id: item.id,
              fileUrl: item.fileUrl || '', // null 대신 안전하게 빈 문자열
              originalFileName: item.originalFileName || '',
            },
          ],
        }))
        .sort((a: AttachedFile, b: AttachedFile) => {
          const order = {
            ID_CARD: 1,
            BANKBOOK: 2,
            SIGNATURE_IMAGE: 3,
            DEFAULT: 4,
          }

          const aOrder = order[a.type as keyof typeof order] ?? order.DEFAULT
          const bOrder = order[b.type as keyof typeof order] ?? order.DEFAULT

          return aOrder - bOrder
        })

      // 각 필드에 set
      setField('name', client.name)
      setField('type', client.typeCode)

      setField('outsourcingCompanyId', client.outsourcingCompany?.id ?? '-1')

      setField('residentNumber', client.residentNumber)

      setField('typeDescription', client.typeDescription)
      setField('address', client.address)
      setField('phoneNumber', client.phoneNumber)
      setField('detailAddress', client.detailAddress)

      setField('workType', client.workTypeCode)
      setField('workTypeDescription', client.workTypeDescription)
      setField('mainWork', client.mainWork)
      setField('dailyWage', client.dailyWage)

      const mappedItemType = idTypeValueToName[client.bankName ?? '']

      if (mappedItemType) {
        setField('bankName', mappedItemType)
      } else {
        setField('bankName', '0') // 혹은 기본값 처리
      }
      setField('accountNumber', client.accountNumber)
      setField('accountHolder', client.accountHolder)

      setField('hireDate', new Date(client.hireDate))
      setField('resignationDate', new Date(client.resignationDate))

      setField('memo', client.memo)
      setField('files', formattedFiles)

      setField('tenureMonths', client.tenureMonths === null ? '-' : client.tenureMonths + '개월')

      // isSeverancePayEligible 설정
      setField('isSeverancePayEligible', client.isSeverancePayEligible ? 'Y' : 'N')

      // // resignationDate 연동
      // if (client.resignationDate === null) {
      //   // 퇴직금 발생하면 퇴사일 초기화
      //   setIsChecked(true)
      //   setField('resignationDate', null)
      // } else {
      //   // 퇴직금 미발생이면 퇴사일 값이 있어야 함
      //   setIsChecked(false)
      //   setField('resignationDate', new Date(client.resignationDate))
      // }
    } else {
      reset()
    }
  }, [laborDetailData, isEditMode, reset, setField])

  const [updatedOutSourcingCompanyOptions, setUpdatedOutSourcingCompanyOptions] =
    useState(companyOptions)

  useEffect(() => {
    if (laborDetailData && isEditMode) {
      const client = laborDetailData.data
      const newLaborOptions = [...companyOptions]

      if (client.outsourcingCompany) {
        const laborName =
          client.outsourcingCompany.name + (client.outsourcingCompany.deleted ? ' (삭제됨)' : '')

        const exists = newLaborOptions.some((u) => u.id === client.outsourcingCompany.id)
        if (!exists) {
          newLaborOptions.push({
            id: client.outsourcingCompany.id,
            name: laborName,
            deleted: client.outsourcingCompany.deleted,
          })
        }
      }

      const deletedUsers = newLaborOptions.filter((u) => u.deleted)
      const normalUsers = newLaborOptions.filter((u) => !u.deleted && u.id !== -1)

      setUpdatedOutSourcingCompanyOptions([
        newLaborOptions.find((u) => u.id === -1)!,
        ...deletedUsers,
        ...normalUsers,
      ])

      setField('outsourcingCompanyId', client.outsourcingCompany?.id ?? -1)
    } else if (!isEditMode) {
      // 등록 모드일 경우
      setUpdatedOutSourcingCompanyOptions(companyOptions)
      setField('outsourcingCompanyId', -1) // "선택" 기본값
    }
  }, [laborDetailData, isEditMode, companyOptions])

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
    if (laborHistoryList?.pages) {
      const allHistories = laborHistoryList.pages.flatMap((page) =>
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
  }, [laborHistoryList, setField])

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

  function validateClientForm(form: LaborFormState) {
    if (!form.type?.trim()) return '구분을 선택하세요.'
    if (
      (form.type === 'ETC' || form.type === 'DIRECT_REGISTRATION') &&
      !form.typeDescription?.trim()
    ) {
      return '구분 내용을 입력하세요.'
    }

    if (!form.outsourcingCompanyId || form.outsourcingCompanyId <= 0) {
      return '소속업체를 선택하세요.'
    }

    if (!form.name?.trim()) return '이름을 입력하세요.'

    if (!form.residentNumber?.trim()) return '주민등록번호를 입력하세요.'

    if (!form.address?.trim()) return '주소를 입력하세요.'
    if (!form.detailAddress?.trim()) return '상세 주소를 입력하세요.'

    if (!form.phoneNumber?.trim()) return '개인 휴대폰 번호를 입력하세요.'

    if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(form.phoneNumber)) {
      return '휴대폰 번호를 010-1234-5678 형식으로 입력하세요.'
    }

    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    if (!form.workType?.trim()) return '공종을 선택하세요.'
    if (!form.mainWork?.trim()) return '주 작업을 입력하세요.'

    if (!form.dailyWage || form.dailyWage <= 0) {
      return '기준일당을 입력하세요.'
    }

    if (!form.bankName?.trim()) return '은행을 선택하세요.'
    if (!form.accountNumber?.trim()) return '계좌번호를 입력하세요.'
    if (!form.accountHolder?.trim()) return '예금주를 입력하세요.'

    // if (!form.hireDate) return '입사일을 선택하세요.'
    // // 퇴사일은 선택 optional → 선택되면 입사일보다 이후인지 확인
    // if (form.resignationDate && form.hireDate && form.resignationDate < form.hireDate) {
    //   return '퇴사일은 입사일 이후여야 합니다.'
    // }

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

  const handleLaborSubmit = () => {
    const errorMsg = validateClientForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        LaborModifyMutation.mutate(laborDataId)
      }
    } else {
      createLaborInfo.mutate()
    }
  }

  // 데이터 조회
  const { data: StatementHistoryList } = useQuery({
    queryKey: ['steelTypeInfo', laborDataId],
    queryFn: () => LaborHistoreyService(laborDataId),
  })

  // const laborList = StatementHistoryList?.data.content ?? []

  const laborList = StatementHistoryList?.data.content.map((item: any) => {
    return {
      id: item.id,
      yearMonth: item.yearMonth,
      site: item.site.name,
      siteProcess: item.siteProcess.name,

      dailyWage: item.dailyWage ?? 0,
      totalWorkHours: item.totalWorkHours ?? 0,
      totalWorkDays: item.totalWorkDays ?? 0,
      totalLaborCost: item.totalLaborCost ?? 0,
      incomeTax: item.incomeTax ?? 0,
      employmentInsurance: item.employmentInsurance ?? 0,
      healthInsurance: item.healthInsurance ?? 0,
      localTax: item.localTax ?? 0,
      nationalPension: item.nationalPension ?? 0,
      longTermCareInsurance: item.longTermCareInsurance ?? 0,
      netPayment: item.netPayment ?? 0,
      memo: item.memo ?? '-',
      dailyWork: Array.from(
        { length: 31 },
        (_, i) => item[`day${String(i + 1).padStart(2, '0')}Hours`] ?? null,
      ),
    }
  })

  // 페이지 정보
  const totalList = StatementHistoryList?.data.pageInfo.totalElements ?? 0
  const pageCount = 20
  const totalPages = Math.ceil(totalList / pageCount)

  const dates = Array.from({ length: 31 }, (_, i) => i + 1)

  // 숫자를 그려주는 변수 0 부터 16
  const firstHalfDates = dates.slice(0, 16) // 1~16
  const secondHalfDates = dates.slice(16, 31) // 16~31

  // 스타일 변수

  const headerCellStyle = {
    backgroundColor: '#c8c7c7',
    border: '1px solid #ced2d9',
    fontSize: '0.75rem', // 글자 작게
    fontWeight: 'bold', // 글자 두껍게
    padding: '2px 4px', // 위아래 2px, 좌우 4px
    lineHeight: 1, // 줄 간격 최소화
    height: '30px',
  }

  const dayCellStyle = {
    border: '1px solid #ced2d9',
    fontSize: '0.75rem', // 글자 작게
    fontWeight: 'bold', // 글자 두껍게
    padding: '2px 4px', // 위아래 2px, 좌우 4px
    lineHeight: 2, // 줄 간격 최소화
    width: '30px',
    height: '40px',
  }

  const contentCellStyle = {
    border: '1px solid #a3a3a3',
    fontSize: '0.75rem', // 글자 작게
    fontWeight: 'bold', // 글자 두껍게
    padding: '2px 4px', // 위아래 2px, 좌우 4px
    lineHeight: 2, // 줄 간격 최소화
    width: '40px',
    height: '40px',
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
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
                  options={LaborTypeMethodOptions}
                />

                <CommonInput
                  value={form.typeDescription ?? ''}
                  onChange={(value) => setField('typeDescription', value)}
                  className=" flex-1"
                  disabled={
                    form.type === 'ETC' || form.type === 'DIRECT_REGISTRATION' ? false : true
                  }
                  placeholder={
                    form.type === 'ETC' || form.type === 'DIRECT_REGISTRATION'
                      ? ' 내용을 입력하세요'
                      : ''
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              소속업체
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2 items-center py-2">
                <CommonSelect
                  fullWidth
                  value={form.outsourcingCompanyId ?? -1}
                  onChange={async (value) => {
                    const selectedCompany = updatedOutSourcingCompanyOptions.find(
                      (opt) => opt.id === value,
                    )
                    if (!selectedCompany) return

                    setField('outsourcingCompanyId', selectedCompany.id)
                    setField('outsourcingCompanyName', selectedCompany.name)
                  }}
                  options={updatedOutSourcingCompanyOptions}
                  onScrollToBottom={() => {
                    if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                  }}
                  onInputChange={(value) => setCompanySearch(value)}
                  loading={comPanyNameLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              이름
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.name ?? ''}
                onChange={(value) => setField('name', value)}
                className=" flex-1"
                placeholder="텍스트 입력"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
              주민등록번호
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonResidentNumberInput
                value={form.residentNumber ?? ''}
                onChange={(val) => setField('residentNumber', val)}
                className="flex-1"
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
              개인 휴대폰
            </label>
            <div className="border border-gray-400 py-6 px-2 w-full">
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

      <div className="mt-6">
        <span className="font-bold border-b-2 mb-4">추가 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300  font-bold text-center">
              공종
            </label>
            <div className="border border-gray-400 w-full flex flex-col gap-2 p-2">
              <div className="flex gap-2 items-center">
                <CommonSelect
                  className="text-2xl"
                  value={form.workType || 'BASE'}
                  onChange={(value) => setField('workType', value)}
                  options={WorkTypeMethodOptions}
                />

                <CommonInput
                  value={form.workTypeDescription ?? ''}
                  onChange={(value) => setField('workTypeDescription', value)}
                  className=" flex-1"
                  placeholder="텍스트 입력"
                />
              </div>
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              주 작업
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.mainWork ?? ''}
                onChange={(value) => setField('mainWork', value)}
                className=" flex-1"
                placeholder="텍스트 입력"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              기준일당
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <AmountInput
                className="w-full"
                value={formatNumber(form.dailyWage)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  setField('dailyWage', numericValue)
                }}
                placeholder="금액을 입력하세요"
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
                placeholder="'-' 을 포함한 숫자 입력"
              />

              <CommonInput
                value={form.accountHolder ?? ''}
                onChange={(value) => setField('accountHolder', value)}
                className=" flex-1"
                placeholder="예금주"
              />
            </div>
          </div>
          {/* <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              입사일
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonDatePicker
                value={form.hireDate}
                onChange={(value) => {
                  setField('hireDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              퇴사일
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonDatePicker
                value={form.resignationDate}
                onChange={(value) => {
                  setField('resignationDate', value)
                }}
                disabled={isChecked}
              />
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={isChecked} onChange={handleTaxCheckboxChange} />
                미지정
              </label>
            </div>
          </div> */}
          {isEditMode && (
            <>
              <div className="flex">
                <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
                  근속기간
                </label>
                <div className="border border-gray-400 flex items-center px-2 w-full">
                  <CommonInput
                    value={form.tenureMonths ?? ''}
                    onChange={(value) => setField('tenureMonths', value)}
                    className=" flex-1"
                    disabled
                  />
                </div>
              </div>

              <div className="flex">
                <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
                  퇴직금 발생 여부
                </label>
                <div className="border border-gray-400 flex items-center px-2 w-full">
                  <CommonInput
                    value={form.isSeverancePayEligible ? 'Y' : 'N'}
                    onChange={(value) => setField('isSeverancePayEligible', value)}
                    className="flex-1"
                    disabled
                  />
                </div>
              </div>
            </>
          )}
        </div>
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
                {['문서명', '첨부', '비고', '등록/수정일'].map((label) => (
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
                      disabled={
                        m.type === 'ID_CARD' ||
                        m.type === 'BANKBOOK' ||
                        m.type === 'SIGNATURE_IMAGE'
                      }
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
                      disabled={
                        m.type === 'ID_CARD' ||
                        m.type === 'BANKBOOK' ||
                        m.type === 'SIGNATURE_IMAGE'
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
                        multiple={false}
                        files={m.files} // 각 항목별 files
                        onChange={(newFiles) => {
                          updateItemField('attachedFile', m.id, 'files', newFiles.slice(0, 1))
                        }}
                        uploadTarget="LABOR_MANAGEMENT"
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
                  {isEditMode && (
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      {m.createdAt} / {m.updatedAt}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {isEditMode && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">노무명세서이력</span>
            <div className="flex gap-4"></div>
          </div>

          <TableContainer
            component={Paper}
            sx={{
              maxHeight: '70vh',
              marginTop: '30px',
              overflowX: 'auto', // 가로 스크롤 활성화
            }}
          >
            <Table stickyHeader sx={{ minWidth: '1500px' }}>
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                    연월
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 140 }}>
                    현장
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    공정
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    일당
                  </TableCell>

                  {firstHalfDates.map((date) => (
                    <TableCell key={date} align="center" sx={{ ...headerCellStyle, minWidth: 60 }}>
                      {date}
                    </TableCell>
                  ))}

                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    총공수
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    총일수
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                    노무부 총액
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                    소득세
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    고용보험
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    건강보험
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                    주민세
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    국민연금
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                    장기요양
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                    차감지급액
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                    비고
                  </TableCell>
                </TableRow>

                <TableRow>
                  {secondHalfDates.map((date) => (
                    <TableCell
                      key={date}
                      align="center"
                      sx={{
                        ...headerCellStyle,
                        minWidth: 60,
                        position: 'sticky',
                        top: 30,
                      }}
                    >
                      {date}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {laborList?.map((row: any) => {
                  const firstHalf = row.dailyWork.slice(0, 16)
                  const secondHalf = row.dailyWork.slice(16)

                  return (
                    <Fragment key={`${row.no}-${Math.random()}`}>
                      {/* 첫 번째 행 */}

                      <TableRow>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.yearMonth}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.site}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.siteProcess}
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.dailyWage}
                        </TableCell>

                        {firstHalf.map((val: any, idx: number) => (
                          <TableCell key={idx} align="center" sx={dayCellStyle}>
                            {val}
                          </TableCell>
                        ))}

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.totalWorkHours}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.totalWorkDays}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.totalLaborCost}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.incomeTax}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.employmentInsurance}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.healthInsurance}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.localTax}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.nationalPension}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.longTermCareInsurance}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.netPayment}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.memo}
                        </TableCell>
                      </TableRow>

                      {/* 두 번째 행 */}
                      <TableRow>
                        {secondHalf.map((val: any, idx: number) => (
                          <TableCell key={idx + 17} align="center" sx={dayCellStyle}>
                            {val}
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  )
                })}
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={laborCancel} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleLaborSubmit}
        />
      </div>
    </>
  )
}
