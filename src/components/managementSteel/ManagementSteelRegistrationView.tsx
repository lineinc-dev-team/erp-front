'use client'

import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import CommonFileInput from '../common/FileInput'
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
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import CommonDatePicker from '../common/DatePicker'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { useCallback, useEffect, useRef } from 'react'
import { SteelDetailService } from '@/services/managementSteel/managementSteelRegistrationService'
import { AttachedFile, DetailItem, HistoryItem } from '@/types/managementSteel'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { GetCompanyNameInfoService } from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import { CompanyInfo } from '@/types/outsourcingContract'
import { getTodayDateString } from '@/utils/formatters'

export default function ManagementSteelRegistrationView({ isEditMode = false }) {
  const { showSnackbar } = useSnackbarStore()
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
    updateMemo,
    getTotalContractAmount,
    getTotalOutsourceQty,
    getTotalOutsourceAmount,
  } = useManagementSteelFormStore()

  const {
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    // 업체명

    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useOutSourcingContract()

  const {
    createSteelMutation,
    useSteelHistoryDataQuery,
    SteelModifyMutation,
    SteelTypeMethodOptions,
  } = useManagementSteel()

  console.log('SteelTypeMethodOptionsSteelTypeMethodOptions', SteelTypeMethodOptions)

  // 체크 박스에 활용
  const contractAddAttachedFiles = form.details
  const contractCheckIds = form.checkedMaterialItemIds
  const isContractAllChecked =
    contractAddAttachedFiles.length > 0 &&
    contractCheckIds.length === contractAddAttachedFiles.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 상세페이지 로직

  const params = useParams()
  const steelDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['SteelDetailInfo'],
    queryFn: () => SteelDetailService(steelDetailId),
    enabled: isEditMode && !!steelDetailId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    siteName: '현장명',
    processName: '공정명',
    outsourcingCompanyName: '업체명',
    type: '구분',
    startDateFormat: '시작 기간',
    endDateFormat: '종료 기간',
    inputTypeName: '투입 구분',
    memo: '메모',
    name: '품명',
    unit: '단위',
    unitWeight: '단위중량',
    totalLength: '총 길이',
    count: '본',
    length: '길이',
    standard: '규격',
    unitPrice: '단가',
    quantity: '수량',
    supplyPrice: '공급가',
  }

  const {
    data: steelHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSteelHistoryDataQuery(steelDetailId, isEditMode)

  const historyList = useManagementSteelFormStore((state) => state.form.changeHistories)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log(
        '발주처 데이터발주처 데이터 확인발주처 데이터 확인발주처 데이터 확인44 확인',
        client,
      )

      // // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: DetailItem) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        unit: c.unit,
        unitPrice: c.unitPrice,
        supplyPrice: c.supplyPrice,
        count: c.count,
        length: c.length,
        totalLength: c.totalLength,
        unitWeight: c.unitWeight,
        standard: c.standard,
        memo: c.memo,
      }))
      setField('details', formattedDetails)

      // // 첨부 파일 가공
      const formattedFiles = (client.files ?? []).map((item: AttachedFile) => ({
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
      setField('attachedFiles', formattedFiles)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')
      setField('startDate', client.startDate ? new Date(client.startDate) : null)
      setField('endDate', client.endDate ? new Date(client.endDate) : null)
      setField('type', client.typeCode ?? '') // 예: '승인' 같은 필드
      setField('usage', client.usage ?? '')

      setField('memo', client.memo ?? '')

      setField('orderDate', client.orderDate ?? null)
      setField('approvalDate', client.approvalDate ?? null)
      setField('releaseDate', client.releaseDate ?? null)
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
    if (steelHistoryList?.pages) {
      const allHistories = steelHistoryList.pages.flatMap((page) =>
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
  }, [steelHistoryList, setField])

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
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.siteId || 0}
                onChange={async (value) => {
                  const selectedSite = sitesOptions.find((opt) => opt.id === value)
                  if (!selectedSite) return

                  setField('siteId', selectedSite.id)

                  const res = await SitesProcessNameScroll({
                    pageParam: 0,
                    siteId: selectedSite.id,
                    keyword: '',
                  })

                  const processes = res.data?.content || []
                  if (processes.length > 0) {
                    setField('siteProcessId', processes[0].id)
                  } else {
                    setField('siteProcessId', 0)
                  }
                }}
                options={sitesOptions}
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px]  border border-gray-400  flex items-center justify-center bg-gray-300  font-bold text-center">
              공정명
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.siteProcessId || 0}
                onChange={(value) => {
                  const selectedProcess = processOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    setField('siteProcessId', selectedProcess.id)
                  }
                }}
                options={processOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (processInfoHasNextPage && !processInfoIsFetching) processInfoFetchNextPage()
                }}
                onInputChange={(value) => setProcessSearch(value)}
                loading={processInfoLoading}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              구분
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                className="text-2xl"
                value={form.type || 'BASE'}
                displayLabel
                onChange={(value) => setField('type', value)}
                options={SteelTypeMethodOptions}
                disabled={isEditMode} // ← 수정 시 선택 불가
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              용도
            </label>
            <div className="border flex  items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.usage}
                onChange={(value) => setField('usage', value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              기간
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center ">
              <CommonDatePicker
                value={form.startDate}
                onChange={(value) => {
                  setField('startDate', value)

                  if (
                    value !== null &&
                    form.endDate !== null &&
                    new Date(form.endDate) < new Date(value)
                  ) {
                    setField('endDate', value)
                  }
                }}
              />
              ~
              <CommonDatePicker
                value={form.endDate}
                onChange={(value) => {
                  if (
                    value !== null &&
                    form.startDate !== null &&
                    new Date(value) < new Date(form.startDate)
                  ) {
                    showSnackbar('종료일은 시작일 이후여야 합니다.', 'error')
                    return
                  }
                  setField('endDate', value)
                }}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              비교 / 메모
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {['PURCHASE', 'LEASE'].includes(form.type) && (
        <div className="mt-6">
          <span className="font-bold border-b-2 mb-4">거래선</span>
          <div className="grid grid-cols-2 mt-1 ">
            <div className="flex">
              <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
                업체명
              </label>
              <div className="border border-gray-400 p-2 px-2 w-full">
                <CommonSelect
                  fullWidth
                  value={form.outsourcingCompanyId || 0}
                  onChange={async (value) => {
                    const selectedCompany = companyOptions.find((opt) => opt.id === value)
                    if (!selectedCompany) return

                    setField('outsourcingCompanyId', selectedCompany.id)

                    // 1. 회사 정보 요청
                    const res = await GetCompanyNameInfoService({
                      pageParam: 0,
                      keyword: '',
                    })

                    const companyList = res.data?.content || []

                    // 2. 선택한 업체 ID와 일치하는 항목 찾기
                    const matched = companyList.find(
                      (company: CompanyInfo) => company.id === selectedCompany.id,
                    )

                    if (matched) {
                      setField('businessNumber', matched.businessNumber)
                    } else {
                      setField('businessNumber', '')
                    }
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
            <div className="flex">
              <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
                사업자등록번호
              </label>
              <div className="border border-gray-400 px-2 w-full">
                <CommonInput
                  value={form.businessNumber ?? ''}
                  onChange={(value) => {
                    setField('businessNumber', value)
                  }}
                  disabled={true}
                  className=" flex-1"
                />
              </div>
            </div>

            <div className="flex">
              <label className="w-36  text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center"></label>
              <div className="border flex  items-center border-gray-400 px-2 w-full"></div>
            </div>
          </div>
        </div>
      )}

      {isEditMode && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">구분</span>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid #9CA3AF' }}>
                  {['발주', '승인', '반출'].map((label) => (
                    <TableCell
                      key={label}
                      align="center"
                      sx={{
                        backgroundColor: '#D1D5DB',
                        border: '1px solid #9CA3AF',
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
                <TableRow>
                  {['ORDER', 'APPROVAL', 'OUT'].map((code) => (
                    <TableCell
                      key={code}
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {code === 'ORDER'
                        ? getTodayDateString(form.orderDate)
                        : code === 'APPROVAL'
                        ? getTodayDateString(form.approvalDate)
                        : getTodayDateString(form.releaseDate)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">품목상세</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('MaterialItem')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('MaterialItem')}
            />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table size="small" sx={{ borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                <TableCell rowSpan={2} padding="checkbox" sx={{ border: '1px solid #9CA3AF' }}>
                  <Checkbox
                    checked={isContractAllChecked}
                    indeterminate={contractCheckIds.length > 0 && !isContractAllChecked}
                    onChange={(e) => toggleCheckAllItems('MaterialItem', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  규격
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  품명
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  단위
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  본
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  길이
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  총 길이
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  단위중량
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  수량
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                >
                  단가
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                >
                  공급가
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    color: 'black',
                  }}
                >
                  비고
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {contractAddAttachedFiles.map((m) => (
                <TableRow key={m.id} sx={{ border: '1px solid #9CA3AF' }}>
                  <TableCell padding="checkbox" align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <Checkbox
                      checked={contractCheckIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('MaterialItem', m.id, e.target.checked)}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.standard || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'standard', e.target.value)
                      }
                      inputProps={{ maxLength: 50 }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.name || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'name', e.target.value)
                      }
                      inputProps={{ maxLength: 50 }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.unit || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'unit', e.target.value)
                      }
                      inputProps={{ maxLength: 10 }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.count || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'count', e.target.value)
                      }
                      inputProps={{ maxLength: 10 }}
                      fullWidth
                    />
                  </TableCell>

                  {/* 도급금액 수량 */}
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.length || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'length', e.target.value)
                      }
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      fullWidth
                    />
                  </TableCell>

                  {/* 도급금액 금액 */}
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.totalLength || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'totalLength', e.target.value)
                      }
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      fullWidth
                    />
                  </TableCell>

                  {/* 외주계약금액 수량 */}
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={m.unitWeight || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'unitWeight', e.target.value)
                      }
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      fullWidth
                    />
                  </TableCell>

                  {/* 외주계약금액 금액 */}
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    {' '}
                    <TextField
                      size="small"
                      placeholder="숫자만"
                      value={m.quantity || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'quantity', e.target.value)
                      }
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      fullWidth
                    />{' '}
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="숫자만"
                      value={m.unitPrice ? m.unitPrice.toLocaleString() : ''}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/,/g, '')
                        const num = Number(onlyNums)

                        updateItemField('MaterialItem', m.id, 'unitPrice', isNaN(num) ? 0 : num)
                      }}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      fullWidth
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="숫자만"
                      value={m.supplyPrice ? m.supplyPrice.toLocaleString() : ''}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/,/g, '')
                        const num = Number(onlyNums)

                        updateItemField('MaterialItem', m.id, 'supplyPrice', isNaN(num) ? 0 : num)
                      }}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      fullWidth
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      multiline
                      value={m.memo || ''}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'memo', e.target.value)
                      }
                      inputProps={{ maxLength: 500 }}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                <TableCell
                  colSpan={8}
                  align="right"
                  sx={{
                    border: '1px solid #9CA3AF',
                    fontSize: '16px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  소계
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                >
                  {getTotalContractAmount().toLocaleString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                >
                  {getTotalOutsourceQty().toLocaleString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                >
                  {getTotalOutsourceAmount().toLocaleString()}
                </TableCell>
                <TableCell sx={{ border: '1px solid #9CA3AF' }} />
              </TableRow>
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
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={() => console.log('취소')}
        />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              SteelModifyMutation.mutate(steelDetailId)
            } else {
              createSteelMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
