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
import { formatNumber, getTodayDateString, unformatNumber } from '@/utils/formatters'
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

  const { showSnackbar } = useSnackbarStore()

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

  useEffect(() => {
    if (laborDetailData && isEditMode === true) {
      const client = laborDetailData.data

      console.log('clientclientclient', client)

      // 첨부파일 데이터 가공
      const formattedFiles = (client.files ?? []).map((item: OutsourcingAttachedFile) => ({
        id: item.id,
        name: item.name,
        memo: item.memo,
        files: [
          {
            fileUrl: item.fileUrl,
            file: {
              name: item.originalFileName,
            },
          },
        ],
      }))

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

      setField('bankName', client.bankName)
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
          createdAt: getTodayDateString(item.createdAt),
          updatedAt: getTodayDateString(item.updatedAt),
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
                  placeholder="텍스트 입력"
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

                    console.log('라인 고영ㅇ 찾기', selectedCompany)

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
                      {/* <CommonFileInput
                            className=" break-words whitespace-normal"
                            label="계약서"
                            acceptedExtensions={['pdf', 'hwp']}
                            files={form.attachedFiles.find((f) => f.id === m.id)?.files || []}
                            onChange={(newFiles) =>
                              form.updateItemField('attachedFile', m.id, 'files', newFiles)
                            }
                          />
                           */}
                      <CommonFileInput
                        multiple={false}
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
                        onChange={(newFiles) => {
                          if (newFiles.length > 1) {
                            showSnackbar('파일은 1개만 업로드할 수 있습니다.', 'warning')
                            updateItemField('attachedFile', m.id, 'files', newFiles.slice(0, 1))
                          } else {
                            updateItemField('attachedFile', m.id, 'files', newFiles)
                          }
                        }}
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
                {historyList.map((item: HistoryItem, index) => (
                  <TableRow key={item.id}>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {index + 1}
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={laborCancel} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              if (window.confirm('수정하시겠습니까?')) {
                LaborModifyMutation.mutate(laborDataId)
              }
            } else {
              createLaborInfo.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
