'use client'

import DaumPostcodeEmbed from 'react-daum-postcode'
import {
  Checkbox,
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
import { useCallback, useEffect, useRef } from 'react'
import { HistoryItem, OutsourcingAttachedFile } from '@/types/outsourcingCompany'
import { formatDateTime, formatNumber, unformatNumber } from '@/utils/formatters'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import { useLaborFormStore } from '@/stores/laborStore'
import CommonButton from '../common/Button'
import CommonDatePicker from '../common/DatePicker'
import { useLaborInfo } from '@/hooks/useLabor'
import CommonResidentNumberInput from '@/utils/commonResidentNumberInput'
import AmountInput from '../common/AmountInput'
import { LaborDetailService } from '@/services/labor/laborRegistrationService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { LaborFormState } from '@/types/labor'
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
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

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
    memo: '메모',
  }

  const {
    data: laborHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLaborHistoryDataQuery(laborDataId, isEditMode)

  const historyList = useLaborFormStore((state) => state.form.changeHistories)

  // const [updatedOutSourcingCompanyOptions, setUpdatedOutSourcingCompanyOptions] =
  //   useState(userOptions)

  // useEffect(() => {
  //   if (data && isEditMode) {
  //     const client = data.data
  //     const newUserOptions = [...userOptions]

  //     if (client.user) {
  //       const userName = client.user.username + (client.user.deleted ? ' (삭제됨)' : '')

  //       const exists = newUserOptions.some((u) => u.id === client.user.id)
  //       if (!exists) {
  //         newUserOptions.push({
  //           id: client.user.id,
  //           name: userName,
  //           deleted: client.user.deleted,
  //         })
  //       }
  //     }

  //     const deletedUsers = newUserOptions.filter((u) => u.deleted)
  //     const normalUsers = newUserOptions.filter((u) => !u.deleted && u.id !== '0')

  //     setUpdatedUserOptions([
  //       newUserOptions.find((u) => u.id === '0')!,
  //       ...deletedUsers,
  //       ...normalUsers,
  //     ])

  //     setField('userId', client.user?.id ?? '0')
  //   } else if (!isEditMode) {
  //     // 등록 모드일 경우
  //     setUpdatedUserOptions(userOptions)
  //     setField('userId', 0) // "선택" 기본값
  //   }
  // }, [data, isEditMode, userOptions])

  useEffect(() => {
    if (laborDetailData && isEditMode === true) {
      const client = laborDetailData.data

      console.log('clientclientclient', client)

      // 첨부파일 데이터 가공
      const formattedFiles = (client.files ?? [])
        .map((item: OutsourcingAttachedFile) => ({
          id: item.id,
          name: item.name,
          memo: item.memo,
          type: item.typeCode,
          files: [
            {
              fileUrl: item.fileUrl || '', // null 대신 안전하게 빈 문자열
              originalFileName: item.originalFileName || '',
            },
          ],
        }))
        .sort((a: OutsourcingAttachedFile, b: OutsourcingAttachedFile) => {
          const order = {
            ID_CARD: 1,
            BANKBOOK: 3,
            SIGNATURE_IMAGE: 4,
            DEFAULT: 2,
          }

          const aOrder = order[a.type as keyof typeof order] ?? order.DEFAULT
          const bOrder = order[b.type as keyof typeof order] ?? order.DEFAULT

          return aOrder - bOrder
        })

      // 각 필드에 set
      setField('name', client.name)
      setField('type', client.typeCode)

      setField('outsourcingCompanyId', client.outsourcingCompany.id)

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
        setField('bankName', '') // 혹은 기본값 처리
      }
      setField('accountNumber', client.accountNumber)
      setField('accountHolder', client.accountHolder)

      setField('hireDate', new Date(client.hireDate))
      setField('resignationDate', new Date(client.resignationDate))

      setField('memo', client.memo)
      setField('files', formattedFiles)
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laborDetailData, isEditMode, reset, setField])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!form.workType?.trim()) return '공종을 선택하세요.'
    if (!form.mainWork?.trim()) return '주 작업을 입력하세요.'

    if (!form.dailyWage || form.dailyWage <= 0) {
      return '기준일당을 입력하세요.'
    }

    if (!form.bankName?.trim()) return '은행을 선택하세요.'
    if (!form.accountNumber?.trim()) return '계좌번호를 입력하세요.'
    if (!form.accountHolder?.trim()) return '예금주를 입력하세요.'

    if (!form.hireDate) return '입사일을 선택하세요.'
    // 퇴사일은 선택 optional → 선택되면 입사일보다 이후인지 확인
    if (form.resignationDate && form.hireDate && form.resignationDate < form.hireDate) {
      return '퇴사일은 입사일 이후여야 합니다.'
    }

    if (attachedFiles.length > 0) {
      for (const item of attachedFiles) {
        if (!item.name?.trim()) return '첨부파일의 이름을 입력해주세요.'
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
                    const selectedCompany = companyOptions.find((opt) => opt.id === value)
                    if (!selectedCompany) return

                    setField('outsourcingCompanyId', selectedCompany.id)
                    setField('outsourcingCompanyName', selectedCompany.name)
                  }}
                  options={companyOptions}
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
                placeholder="텍스트 입력"
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
          <div className="flex">
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
              />
            </div>
          </div>
          {/* <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              근속일수
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.dailyWage ?? ''}
                onChange={(value) => setField('dailyWage', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              퇴직금 발생 여부
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.dailyWage ?? ''}
                onChange={(value) => setField('dailyWage', value)}
                className=" flex-1"
              />
            </div>
          </div> */}
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
                      value={m.name}
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
            <span className="font-bold border-b-2 mb-4">수정이력</span>
            <div className="flex gap-4"></div>
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
