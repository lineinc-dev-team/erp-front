/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import {
  SiteDetailService,
  SiteRegistrationService,
} from '@/services/sites/siteRegistrationService'
import CommonDatePicker from '../common/DatePicker'
import CommonButton from '../common/Button'
import DaumPostcodeEmbed from 'react-daum-postcode'
import { useSiteFormStore } from '@/stores/siteStore'
import { AreaCode, SiteProgressing } from '@/config/erp.confing'
import useSite from '@/hooks/useSite'
import {
  formatDateTime,
  formatNumber,
  getTodayDateString,
  unformatNumber,
} from '@/utils/formatters'
import { useClientCompany } from '@/hooks/useClientCompany'
import { Contract, ContractFile, ContractFileType, HistoryItem, SiteForm } from '@/types/site'
import { formatPersonNumber } from '@/utils/formatPhoneNumber'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import AmountInput from '../common/AmountInput'
import {
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
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import CommonMultiFileInput from '../common/CommonMultiFileInput'

export default function SitesRegistrationView({ isEditMode = false }) {
  const FILE_TYPE_LABELS: Record<ContractFileType, string> = {
    CONTRACT: '계약서',
    DRAWING: '현장도면',
    WARRANTY: '보증서류(보증보험)',
    PERMIT: '인허가 서류',
    ETC: '기타파일',
  }

  const {
    setField,
    setProcessField,
    form,
    updateMemo,
    resetForm,
    addContract,
    removeContract,
    updateContractField,
    addContractFile,
    removeContractFile,
    setContracts,
  } = useSiteFormStore()

  const { userOptions, fetchNextPage, hasNextPage, isFetching, isLoading } = useClientCompany()

  const {
    createSiteMutation,
    ModifySiteMutation,
    //본사 담당자
    orderOptions,
    orderPersonFetchNextPage,
    orderPersonHasNextPage,
    orderPersonIsFetching,
    orderPersonIsLoading,
    siteTypeOptions,

    useSiteHistoryDataQuery,
  } = useSite()

  // 상세페이지 로직

  const params = useParams()
  const siteId = Number(params?.id)

  const { showSnackbar } = useSnackbarStore()

  // 수정이력 조회

  const PROPERTY_NAME_MAP: Record<string, string> = {
    address: '본사 주소',
    detailAddress: '상세 주소',
    typeName: '현장 유형',
    clientCompanyName: '발주처명',
    startedAtFormat: '사업시작',
    endedAtFormat: '사업종료',
    userName: '본사 담당자명',
    managerName: '공정 소장',
    statusName: '진행상태',
    contractAmount: '도급금액',
    officePhone: '사무실 연락처',
    amount: '계약금액',
    memo: '비고',
    originalFileName: '파일 추가',
  }

  const {
    data: siteHistoryList,
    isFetchingNextPage: siteHistoryIsFetchingNextPage,
    fetchNextPage: siteHistoryFetchNextPage,
    hasNextPage: siteHistoryHasNextPage,
    isLoading: siteHistoryIsLoading,
  } = useSiteHistoryDataQuery(siteId, isEditMode)

  const historyList = useSiteFormStore((state) => state.form.changeHistories)

  const { data } = useQuery({
    queryKey: ['SiteDetailInfo'],
    queryFn: () => SiteDetailService(siteId),
    enabled: isEditMode && !!siteId, // 수정 모드일 때만 fetch
  })

  const [updatedUserOptions, setUpdatedUserOptions] = useState(userOptions)

  const [updatedOrderOptions, setUpdatedOrderOptions] = useState(orderOptions)

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      // 기존 userOptions 복사
      const newUserOptions = [...userOptions]

      if (client.user) {
        const userName = client.user.username + (client.user.deleted ? ' (삭제됨)' : '')

        // 이미 options에 있는지 체크
        const exists = newUserOptions.some((u) => u.id === client.user.id)
        if (!exists) {
          newUserOptions.push({
            id: client.user.id,
            name: userName,
            deleted: client.user.deleted,
          })
        }
      }

      // 삭제된 유저 분리
      const deletedUsers = newUserOptions.filter((u) => u.deleted)
      const normalUsers = newUserOptions.filter((u) => !u.deleted && u.id !== '0')

      setUpdatedUserOptions([
        newUserOptions.find((u) => u.id === '0')!, // 선택 옵션
        ...deletedUsers,
        ...normalUsers,
      ])

      // 선택된 유저 id 세팅
      setField('userId', client.user?.id ?? '0')
    } else if (!isEditMode) {
      // 등록 모드일 경우
      setUpdatedUserOptions(userOptions)
      setField('userId', 0) // "선택" 기본값
    }
  }, [data, isEditMode, userOptions])

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      const newOrderOptions = [...orderOptions]

      if (client.clientCompany) {
        const clientName =
          client.clientCompany.name + (client.clientCompany.deleted ? ' (삭제됨)' : '')

        // 이미 options에 있는지 체크
        const exists = orderOptions.some((u) => u.id === client.clientCompany.id)
        if (!exists) {
          newOrderOptions.push({
            id: client.clientCompany.id,
            name: clientName,
            deleted: client.clientCompany.deleted,
          })
        }

        // 삭제된 유저 분리
        const deletedOrders = newOrderOptions.filter((u) => u.deleted)
        const normalOrders = newOrderOptions.filter((u) => !u.deleted && u.id !== '0')

        setUpdatedOrderOptions([
          newOrderOptions.find((u) => u.id === '0')!, // 선택 옵션
          ...deletedOrders,
          ...normalOrders,
        ])

        // 선택된 유저 id 세팅
        setField('clientCompanyId', client.clientCompany?.id ?? '0')
      }
    } else if (!isEditMode) {
      // 등록 모드일 경우
      setUpdatedOrderOptions(orderOptions)
      setField('clientCompanyId', 0) // "선택" 기본값
    }
  }, [data, isEditMode, orderOptions])

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      // 기본 필드 설정
      setField('name', client.name)
      setField('address', client.address)
      setField('detailAddress', client.detailAddress)
      setField('type', client.typeCode)
      setField('city', client.city)
      setField('district', client.district)

      setField('clientCompanyId', client.clientCompany?.id ?? '0')
      setField('startedAt', client.startedAt ? new Date(client.startedAt) : null)
      setField('endedAt', client.endedAt ? new Date(client.endedAt) : null)
      setField('userId', client.user?.id ?? '0')
      setField('contractAmount', client.contractAmount)
      setField('memo', client.memo)

      // 공정 정보 설정

      const processPhone = client.process.officePhone // "031-124-2444"

      if (processPhone) {
        const parts = processPhone.split('-')
        const areaNumber = parts[0] || ''
        const officePhone = parts.slice(1).join('-') || ''

        setProcessField('areaNumber', areaNumber)
        setProcessField('officePhone', officePhone)
      } else {
        setProcessField('areaNumber', '')
        setProcessField('officePhone', '')
      }

      setProcessField('name', client.process?.name || '')
      setProcessField('managerId', client.manager?.id || '0')

      setProcessField('status', client.process.statusCode)

      setProcessField('memo', client.process?.memo || '')

      // 계약 정보 초기화

      const convertFileType = (typeKor: string): ContractFileType => {
        switch (typeKor) {
          case '계약서':
            return 'CONTRACT'
          case '현장도면':
            return 'DRAWING'
          case '보증서류(보증보험)':
            return 'WARRANTY'
          case '인허가 서류':
            return 'PERMIT'
          case '기타파일':
            return 'ETC'
          default:
            return 'ETC'
        }
      }

      // 계약 정보 세팅
      if (client.contracts) {
        const formattedContracts = client.contracts.map((contract: Contract) => ({
          id: contract.id,
          name: contract.name || '',
          amount: contract.amount || 0,
          memo: contract.memo || '',
          createdBy: contract.createdBy,
          createdAt: getTodayDateString(contract.createdAt),
          files: (contract.files || []).map((file: ContractFile) => ({
            id: file.id,
            fileUrl: file.fileUrl,
            originalFileName: file.originalFileName,
            type: convertFileType(file.type), // 여기에서 한글 -> 영문 enum 매핑
          })),
        }))

        setContracts(formattedContracts)
      }
    } else {
      resetForm()
    }
  }, [data, isEditMode, resetForm, setField, setContracts, setProcessField])

  const { handleCancelData } = SiteRegistrationService()

  const renderInputRow = (label: string, children: React.ReactNode) => (
    <div className="flex">
      <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
        {label} <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="flex-1 border border-gray-400 px-2 py-2 flex items-center">{children}</div>
    </div>
  )

  const renderContractSection = () => (
    <>
      <div className="mt-4 flex justify-between items-center">
        <span className="font-bold border-b-2">계약서 관리</span>
        <CommonButton
          label="계약서 추가"
          onClick={addContract}
          variant="primary"
          className="bg-blue-400 text-white px-3 rounded"
        />
      </div>

      {form.contracts.map((contract, idx) => (
        <div key={idx} className="border rounded p-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">계약서 {idx + 1}</h3>

            <CommonButton
              label="계약서 삭제"
              variant="danger"
              onClick={() => removeContract(idx)}
            />
          </div>

          <div className="grid grid-cols-2 ">
            {renderInputRow(
              '계약명',
              <CommonInput
                value={contract.name}
                onChange={(v) => updateContractField(idx, 'name', v)}
                placeholder="텍스트 입력"
                className="flex-1"
              />,
            )}

            {renderInputRow(
              '계약금액',

              <AmountInput
                className="w-full"
                value={formatNumber(contract.amount)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  updateContractField(idx, 'amount', numericValue)
                }}
                placeholder="금액을 입력하세요"
              />,
            )}

            {(['CONTRACT', 'DRAWING', 'WARRANTY', 'PERMIT', 'ETC'] as ContractFileType[]).map(
              (type) => (
                <div key={type} className="flex">
                  <label className="w-36 text-[14px] border border-gray-400 bg-gray-300 flex items-center justify-center font-bold">
                    {FILE_TYPE_LABELS[type]}
                  </label>
                  <div className="flex-1 border border-gray-400 px-2 py-2 flex flex-col gap-2">
                    <CommonMultiFileInput
                      // label={FILE_TYPE_LABELS[type]}
                      uploadTarget="SITE"
                      acceptedExtensions={
                        type === 'ETC'
                          ? ['zip', 'xlsx', 'doc', 'pdf', 'hwp', 'png', 'jpg', 'ppt']
                          : ['pdf', 'hwp', 'png', 'jpg', 'ppt']
                      }
                      files={contract.files
                        .filter((f) => f.type === type)
                        .map((f) => ({
                          id: f.id || 0,
                          file: new File([], f.originalFileName), // 화면 표시용 File 객체 (빈 파일)
                          fileUrl: f.fileUrl,
                          originalFileName: f.originalFileName,
                        }))}
                      onChange={(uploaded) => {
                        // 기존 type에 해당하는 파일 제거
                        contract.files
                          .map((f, i) => ({ f, i }))
                          .filter(({ f }) => f.type === type)
                          .reverse() // 뒤에서부터 제거
                          .forEach(({ i }) => removeContractFile(idx, i))

                        // 새로운 파일 추가
                        uploaded.forEach(({ fileUrl, file }) => {
                          if (!file) return // file이 없으면 스킵

                          addContractFile(idx, {
                            originalFileName: file.name,
                            fileUrl: fileUrl ?? '',
                            type,
                          })
                        })
                      }}
                    />
                  </div>
                </div>
              ),
            )}
            <div className="flex col-span-2">
              <label className="w-36 text-[14px] border border-gray-400 bg-gray-300 flex items-center justify-center font-bold">
                비고
              </label>
              <div className="flex-1 border border-gray-400 px-2 py-1">
                <CommonInput
                  placeholder="500자 이하 텍스트 입력"
                  className="flex-1"
                  value={contract.memo}
                  onChange={(v) => updateContractField(idx, 'memo', v)}
                />
              </div>
            </div>
            {isEditMode &&
              renderInputRow(
                '첨부일자 / 등록자',
                <CommonInput
                  placeholder="텍스트 입력"
                  className="flex-1"
                  disabled={true}
                  value={`${contract.createdAt ?? ''} / ${contract.createdBy ?? ''}`}
                  onChange={(v) => updateContractField(idx, 'memo', v)}
                />,
              )}
          </div>
        </div>
      ))}
    </>
  )

  const formatChangeDetail = (getChanges: string, typeCode: string) => {
    try {
      const parsed = JSON.parse(getChanges)
      if (!Array.isArray(parsed)) return '-'

      return parsed.map(
        (item: { property: string; before: string | null; after: string | null }, idx: number) => {
          const propertyKo =
            item.property === 'name'
              ? typeCode === 'BASIC'
                ? '현장명'
                : typeCode === 'PROCESS'
                ? '공정명'
                : '이름'
              : PROPERTY_NAME_MAP[item.property] || item.property

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
    if (siteHistoryList?.pages) {
      const allHistories = siteHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type || '-',
          typeCode: item.typeCode,
          content:
            formatChangeDetail(item.getChanges, item.typeCode) === '-'
              ? item?.description
              : formatChangeDetail(item.getChanges, item.typeCode), // 여기 변경
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
  }, [siteHistoryList, setField])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (siteHistoryIsLoading || siteHistoryIsFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && siteHistoryHasNextPage) {
          siteHistoryFetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [
      siteHistoryFetchNextPage,
      siteHistoryHasNextPage,
      siteHistoryIsFetchingNextPage,
      siteHistoryIsLoading,
    ],
  )

  function validateSiteForm(form: SiteForm) {
    if (!form.name?.trim()) return '현장명을 입력하세요.'
    if (!form.address?.trim()) return '주소를 입력하세요.'
    if (!form.detailAddress?.trim()) return '상세 주소를 입력하세요.'
    if (!form.clientCompanyId || String(form.clientCompanyId) === '0') return '발주처를 선택하세요.'
    if (!form.startedAt) return '사업 시작일을 선택하세요.'
    if (!form.endedAt) return '사업 종료일을 선택하세요.'
    if (!form.userId || String(form.userId) === '0') return '본사 담당자를 선택하세요.'
    if (!form.contractAmount || form.contractAmount <= 0) return '도급금액을 입력하세요.'
    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }
    if (!form.process?.name?.trim()) return '공정명을 입력하세요.'
    if (!form.process?.managerId || String(form.process.managerId) === '0')
      return '공정소장을 입력하세요.'
    // if (!form.process?.officePhone?.trim()) return '사무실 연락처를 입력하세요.'
    if (!form.process.status || String(form.process.status) === '선택')
      return '진행상태를 입력하세요.'

    if (form.process.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    // if (!/^\d{3,4}-\d{4}$/.test(form.process?.officePhone)) {
    //   return '공정정보의 사무실 연락처를 02-123-4567 형식으로 입력하세요.'
    // }

    // 날짜 유효성 검사
    if (form.startedAt && form.endedAt) {
      const start = new Date(form.startedAt)
      const end = new Date(form.endedAt)
      if (start > end) return '종료일은 시작일 이후여야 합니다.'
    }

    if (form.contracts.length > 0) {
      for (const item of form.contracts) {
        if (!item.name?.trim()) return '계약서의 이름을 입력해주세요.'
        if (!item.amount) return '계약서의 계약금액을 입력해주세요.'
        if (item.memo.length > 500) return '계약서의 비고는 500자 이하로 입력해주세요.'
      }
    }

    return null
  }

  const handleSiteSubmit = () => {
    const errorMsg = validateSiteForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        ModifySiteMutation.mutate(siteId)
      }
    } else {
      createSiteMutation.mutate()
    }
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.name}
                onChange={(value) => setField('name', value)}
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
                        setField('city', data.sido)
                        setField('district', data.sigungu)
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
            <label className="w-36  text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              현장 유형 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center items-center">
              <CommonSelect
                fullWidth={true}
                className="text-xl"
                value={form.type || 'BASE'}
                displayLabel
                onChange={(value) => setField('type', value)}
                options={siteTypeOptions}
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              발주처 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.clientCompanyId}
                onChange={(value) => setField('clientCompanyId', value)}
                options={updatedOrderOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (orderPersonHasNextPage && !orderPersonIsFetching) orderPersonFetchNextPage()
                }}
                loading={orderPersonIsLoading}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 whitespace-nowrap  flex items-center justify-center bg-gray-300  font-bold text-center">
              착공일 / 준공일 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={form.startedAt}
                onChange={(value) => {
                  setField('startedAt', value)

                  if (
                    value !== null &&
                    form.endedAt !== null &&
                    new Date(form.endedAt) < new Date(value)
                  ) {
                    setField('endedAt', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={form.endedAt}
                onChange={(value) => {
                  if (
                    value !== null &&
                    form.startedAt !== null &&
                    new Date(value) < new Date(form.startedAt)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  setField('endedAt', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              본사 담당자명 <span className="text-red-500 ml-1">*</span>
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
                loading={isLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              도급금액 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <AmountInput
                className="w-full"
                value={formatNumber(form.contractAmount)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  setField('contractAmount', numericValue)
                }}
                placeholder="금액을 입력하세요"
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="500자 이하 텍스트 입력"
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="font-bold border-b-2 mb-4">공정정보</span>
        <div className="grid grid-cols-2 mt-1">
          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              공정명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.process.name}
                onChange={(value) => setProcessField('name', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              공정소장 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.process.managerId}
                onChange={(value) => setProcessField('managerId', value)}
                options={updatedUserOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (hasNextPage && !isFetching) fetchNextPage()
                }}
                loading={isLoading}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              사무실 연락처
            </label>
            <div className="border flex  items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.process.areaNumber}
                onChange={(value) => setProcessField('areaNumber', value)}
                options={AreaCode}
              />

              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={form.process.officePhone}
                onChange={(value) => {
                  const formatted = formatPersonNumber(value)
                  setProcessField('officePhone', formatted)
                }}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              진행상태 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex justify-center gap-2.5 items-center">
              <CommonSelect
                fullWidth={true}
                displayLabel
                value={form.process.status}
                onChange={(value) =>
                  setProcessField('status', value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')
                }
                options={SiteProgressing}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36  text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              비고
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                value={form.process.memo}
                placeholder="500자 이하 텍스트 입력"
                onChange={(value) => setProcessField('memo', value)}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {renderContractSection()}

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
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid #9CA3AF' }}>
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
                {siteHistoryHasNextPage && (
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={handleCancelData} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleSiteSubmit}
        />
      </div>
    </>
  )
}
