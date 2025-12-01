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
import { Contract, ContractFile, ContractFileType, OrderInfoProps, SiteForm } from '@/types/site'
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
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { UserInfoProps } from '@/types/accountManagement'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { HistoryItem } from '@/types/ordering'

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

  const {
    createSiteMutation,
    ModifySiteMutation,

    useSiteHistoryDataQuery,
    useOrderingNameListInfiniteScroll,
  } = useSite()

  // 상세페이지 로직

  const [isOrderFocused, setIsOrderFocused] = useState(false)
  const [isUserFocused, setIsUserFocused] = useState(false)
  const [isManagerFocused, setIsManagerFocused] = useState(false)

  const params = useParams()
  const siteId = Number(params?.id)

  const { showSnackbar } = useSnackbarStore()

  // 수정이력 조회

  const PROPERTY_NAME_MAP: Record<string, string> = {
    address: '본사 주소',
    detailAddress: '상세 주소',
    clientCompanyName: '발주처명',
    startedAtFormat: '사업시작',
    endedAtFormat: '사업종료',
    userName: '본사 담당자명',
    managerName: '공정 소장',
    statusName: '진행상태',
    contractAmount: '계약금액',
    officePhone: '사무실 연락처',
    amount: '계약금액',
    memo: '비고',
    originalFileName: '파일 추가',
    supplyPrice: '공급가',
    vat: '부가세',
    purchaseTax: '매입세',
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
    queryKey: ['siteInfo'],
    queryFn: () => SiteDetailService(siteId),
    enabled: isEditMode && !!siteId, // 수정 모드일 때만 fetch
  })

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      // 기본 필드 설정
      setField('name', client.name)
      setField('address', client.address)
      setField('detailAddress', client.detailAddress)
      // setField('type', client.typeCode)
      setField('city', client.city)
      setField('district', client.district)

      setField('clientCompanyId', client.clientCompany?.id ?? '0')
      setField('clientCompanyName', client.clientCompany?.name ?? '')
      setField('startedAt', client.startedAt ? new Date(client.startedAt) : null)
      setField('endedAt', client.endedAt ? new Date(client.endedAt) : null)
      setField('userId', client.user?.id ?? '0')
      setField('userName', client.user?.username || '')

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
      setProcessField('managerName', client.manager?.username || '')

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
          supplyPrice: contract.supplyPrice || 0,
          vat: contract.vat || 0,
          purchaseTax: contract.purchaseTax || 0,
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

  const renderInputRow = (label: string, state: boolean, children: React.ReactNode) => (
    <div className="flex">
      <label className="w-36 text-[14px] border border-gray-400 flex items-center justify-center bg-gray-300 font-bold text-center">
        {state === true ? (
          <span>
            {label} <span className="text-red-500 ml-1">*</span>
          </span>
        ) : (
          <span>{label}</span>
        )}
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
              true,
              <CommonInput
                value={contract.name}
                onChange={(v) => updateContractField(idx, 'name', v)}
                placeholder="텍스트 입력"
                className="flex-1"
              />,
            )}

            {renderInputRow(
              '계약금액',
              false,
              <AmountInput
                className="w-full"
                value={formatNumber(contract.amount)}
                onChange={() => {}}
                placeholder="0"
                disabled
              />,
            )}
            {renderInputRow(
              '공급가',
              false,
              <AmountInput
                className="w-full"
                value={formatNumber(contract.supplyPrice)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  updateContractField(idx, 'supplyPrice', numericValue)
                }}
                placeholder="0"
              />,
            )}
            {renderInputRow(
              '부가세',
              false,
              <AmountInput
                className="w-full"
                value={formatNumber(contract.vat)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  updateContractField(idx, 'vat', numericValue)
                }}
                placeholder="0"
              />,
            )}
            {renderInputRow(
              '매입세',
              false,
              <AmountInput
                className="w-full"
                value={formatNumber(contract.purchaseTax)}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  updateContractField(idx, 'purchaseTax', numericValue)
                }}
                placeholder="0"
              />,
            )}

            {(['CONTRACT', 'DRAWING', 'WARRANTY', 'PERMIT', 'ETC'] as ContractFileType[]).map(
              (type) => (
                <div key={type} className="flex">
                  <label className="w-36 text-[14px] border border-gray-400 bg-gray-300 flex items-center justify-center font-bold">
                    {FILE_TYPE_LABELS[type]}
                    {type === 'CONTRACT' && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="flex-1 border border-gray-400 px-2 py-2 flex flex-col gap-2">
                    <CommonMultiFileInput
                      // label={FILE_TYPE_LABELS[type]}
                      uploadTarget="SITE"
                      acceptedExtensions={
                        type === 'ETC'
                          ? [
                              'zip',
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]
                          : [
                              'zip',
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]
                      }
                      files={contract.files
                        .filter((f) => f.type === type)
                        .map((f) => ({
                          id: f.id || 0,
                          file: new File([], f.originalFileName), // 화면 표시용 File 객체 (빈 파일)
                          fileUrl: f.fileUrl,
                          originalFileName: f.originalFileName,
                        }))}
                      // onChange={(uploaded) => {
                      //   // 기존 type에 해당하는 파일 제거
                      //   contract.files
                      //     .map((f, i) => ({ f, i }))
                      //     .filter(({ f }) => f.type === type)
                      //     .reverse() // 뒤에서부터 제거
                      //     .forEach(({ i }) => removeContractFile(idx, i))

                      //   // 새로운 파일 추가
                      //   uploaded.forEach(({ fileUrl, file }) => {
                      //     if (!file) return // file이 없으면 스킵

                      //     addContractFile(idx, {
                      //       id: undefined,
                      //       originalFileName: file.name,
                      //       fileUrl: fileUrl ?? '',
                      //       type,
                      //     })
                      //   })
                      // }}

                      onChange={(uploaded) => {
                        // ✅ 1. 기존 파일 목록 유지
                        const existingFiles = [...contract.files]

                        // ✅ 2. 현재 type에 해당하는 기존 파일들 (유지할 목록)
                        const existingTypeFiles = existingFiles.filter((f) => f.type === type)

                        // ✅ 3. 새로 업로드된 파일 중, 기존에 없는 것만 필터링
                        const newFiles = uploaded.filter(
                          ({ fileUrl }) => !existingTypeFiles.some((f) => f.fileUrl === fileUrl),
                        )

                        // ✅ 4. 새 파일만 추가 (id: undefined)
                        newFiles.forEach(({ fileUrl, file }) => {
                          if (!file) return // file이 없으면 스킵
                          addContractFile(idx, {
                            id: undefined, // 새 파일만 undefined
                            originalFileName: file.name,
                            fileUrl: fileUrl ?? '',
                            type,
                          })
                        })
                      }}
                      // onRemove={(fileId) => {
                      //   if (fileId) {
                      //     contract.files
                      //       .map((f, i) => ({ f, i }))
                      //       .filter(({ f }) => f.type === type)
                      //       .reverse() // 뒤에서부터 제거
                      //       .forEach(({ i }) => removeContractFile(idx, i))
                      //   }
                      // }}

                      onRemove={(fileId, fileIndex) => {
                        // fileId가 있는 경우 (이미 서버에 등록된 파일)
                        if (fileId) {
                          console.log('해당 파일 검색', fileId, fileIndex)
                          // 해당 index만 제거
                          removeContractFile(idx, fileIndex ?? 0)
                          // 필요하다면 서버에도 삭제 요청
                          // await deleteFileApi(fileId)
                        } else {
                          // 새로 업로드된(아직 id 없는) 파일도 그냥 제거
                          removeContractFile(idx, fileIndex ?? 0)
                        }
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
                false,
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

  // 발주처 무한 스크롤 기능

  const { useUserNameListInfiniteScroll } = useClientCompany()

  // 유저 선택 시 처리
  const handleSelectUser = (selectedUser: UserInfoProps) => {
    // 예: username 필드에 선택한 유저 이름 넣기
    setField('userName', selectedUser.username)
    setField('userId', selectedUser.id)
  }

  const debouncedKeyword = useDebouncedValue(form.userName, 300)

  const {
    data: userNameListData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useUserNameListInfiniteScroll(debouncedKeyword)

  const rawList = userNameListData?.pages.flatMap((page) => page.data.content) ?? []
  const userList = Array.from(new Map(rawList.map((user) => [user.username, user])).values())

  const handleSelectManager = (selectedUser: UserInfoProps) => {
    // 예: username 필드에 선택한 유저 이름 넣기

    setProcessField('managerId', selectedUser.id)
    setProcessField('managerName', selectedUser.username)
  }

  const debouncedManagerKeyword = useDebouncedValue(form.process.managerName, 300)

  const {
    data: ManagerNameListData,
    fetchNextPage: managerFetchNextPage,
    hasNextPage: managerHasNextPage,
    isFetching: managerIsFetching,
    isLoading: managerIsLoading,
  } = useUserNameListInfiniteScroll(debouncedManagerKeyword)

  const rawManagerList = ManagerNameListData?.pages.flatMap((page) => page.data.content) ?? []
  const ManagerList = Array.from(
    new Map(rawManagerList.map((user) => [user.username, user])).values(),
  )

  // 발주처명 무한 스크롤 인풋박스

  // 유저 선택 시 처리
  const handleSelectOrdering = (selectedUser: OrderInfoProps) => {
    // 예: username 필드에 선택한 유저 이름 넣기
    setField('clientCompanyName', selectedUser.name)
    setField('clientCompanyId', selectedUser.id)
  }

  const debouncedOrderingKeyword = useDebouncedValue(form.clientCompanyName, 300)

  const {
    data: OrderNameData,
    fetchNextPage: OrderNameFetchNextPage,
    hasNextPage: OrderNameHasNextPage,
    isFetching: OrderNameIsFetching,
    isLoading: OrderNameIsLoading,
  } = useOrderingNameListInfiniteScroll(debouncedOrderingKeyword)

  const OrderRawList = OrderNameData?.pages.flatMap((page) => page.data.content) ?? []
  const orderList = Array.from(new Map(OrderRawList.map((user) => [user.name, user])).values())

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
          isEditable: item.isEditable,
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
    // if (!form.detailAddress?.trim()) return '상세 주소를 입력하세요.'
    if (!form.clientCompanyId || String(form.clientCompanyId) === '0') return '발주처를 선택하세요.'
    if (!form.startedAt) return '착공일을 선택하세요.'
    if (!form.endedAt) return '준공일을 선택하세요.'
    if (!form.userId || String(form.userId) === '0') return '본사 담당자를 선택하세요.'
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
        if (!item.name.trim()) return '계약명을 입력해주세요.'
        if (item.memo.length > 500) return '계약서의 비고는 500자 이하로 입력해주세요.'

        const hasContractFile = item.files?.some((f) => f.type === 'CONTRACT')
        if (!hasContractFile) {
          return '모든 계약에 계약서 파일을 업로드해주세요.'
        }
      }
    }

    return null
  }

  console.log('form.contracts', form.contracts)

  const handleSiteSubmit = () => {
    const errorMsg = validateSiteForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (!form.contracts || form.contracts.length === 0) {
      showSnackbar('계약서를 1개 이상 입력해주세요.', 'warning')
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
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              발주처 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border w-full  border-gray-400">
              <InfiniteScrollSelect
                placeholder="발주처명을 입력하세요"
                keyword={form.clientCompanyName}
                onChangeKeyword={(newKeyword) => setField('clientCompanyName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                items={orderList}
                hasNextPage={OrderNameHasNextPage ?? false}
                fetchNextPage={OrderNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                onSelect={handleSelectOrdering}
                // shouldShowList={true}
                isLoading={OrderNameIsLoading || OrderNameIsFetching}
                debouncedKeyword={debouncedOrderingKeyword}
                shouldShowList={isOrderFocused}
                onFocus={() => setIsOrderFocused(true)}
                onBlur={() => setIsOrderFocused(false)}
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
            <div className="border w-full  border-gray-400">
              <InfiniteScrollSelect
                placeholder="이름을 입력하세요"
                keyword={form.userName}
                onChangeKeyword={(newKeyword) => setField('userName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                items={userList}
                hasNextPage={hasNextPage ?? false}
                fetchNextPage={fetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.username}
                  </div>
                )}
                onSelect={handleSelectUser}
                // shouldShowList={true}
                isLoading={isLoading || isFetching}
                debouncedKeyword={debouncedKeyword}
                shouldShowList={isUserFocused}
                onFocus={() => setIsUserFocused(true)}
                onBlur={() => setIsUserFocused(false)}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              계약금액
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <AmountInput
                className="w-full"
                value={formatNumber(form.contractAmount)}
                onChange={() => {}}
                placeholder="0"
                disabled
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
            <div className="border w-full  border-gray-400">
              <InfiniteScrollSelect
                placeholder="공정소장을 입력하세요"
                keyword={form.process.managerName}
                onChangeKeyword={(newKeyword) => setProcessField('managerName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
                items={ManagerList}
                hasNextPage={managerHasNextPage ?? false}
                fetchNextPage={managerFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.username}
                  </div>
                )}
                onSelect={handleSelectManager}
                shouldShowList={isManagerFocused}
                onFocus={() => setIsManagerFocused(true)}
                onBlur={() => setIsManagerFocused(false)}
                isLoading={managerIsLoading || managerIsFetching}
                debouncedKeyword={debouncedManagerKeyword}
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
