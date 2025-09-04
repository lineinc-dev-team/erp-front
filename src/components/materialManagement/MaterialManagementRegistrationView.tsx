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
import CommonDatePicker from '../common/DatePicker'
import { formatDateTime, formatNumber, unformatNumber } from '@/utils/formatters'
import { useManagementMaterial } from '@/hooks/useMaterialManagement'
import {
  MaterialTypeLabelToValue,
  useManagementMaterialFormStore,
} from '@/stores/materialManagementStore'
import { MaterialDetailService } from '@/services/materialManagement/materialManagementRegistrationService'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { AttachedFile, DetailItem, HistoryItem } from '@/types/materialManagement'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { SupplyPriceInput, TotalInput, VatInput } from '@/utils/supplyVatTotalInput'
import CommonSelectByName from '../common/CommonSelectByName'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
// import { useEffect } from 'react'
// import { AttachedFile, DetailItem } from '@/types/managementSteel'

export default function MaterialManagementRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    updateMemo,
    toggleCheckItem,
    toggleCheckAllItems,

    getTotalQuantityAmount,
    getTotalUnitPrice,
    getTotalSupplyAmount,
    getTotalSurtax,
    getTotalSum,
  } = useManagementMaterialFormStore()

  const { showSnackbar } = useSnackbarStore()

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
    createMaterialMutation,
    useMaterialHistoryDataQuery,
    materialCancel,
    MaterialModifyMutation,
    InputTypeMethodOptions,

    productOptions,
    setProductSearch,
    productNameFetchNextPage,
    productNamehasNextPage,
    productNameFetching,
    productNameLoading,
  } = useManagementMaterial()

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'black' },
      '&:hover fieldset': { borderColor: 'black' },
      '&.Mui-focused fieldset': { borderColor: 'black' },
    },
  }

  // 체크 박스에 활용
  const managers = form.details
  const checkedIds = form.checkedMaterialItemIds
  // const isAllChecked = managers.length > 0 && checkedIds.length === managers.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 상세페이지 로직

  const params = useParams()
  const materialDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['MaterialDetailInfo'],
    queryFn: () => MaterialDetailService(materialDetailId),
    enabled: isEditMode && !!materialDetailId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    siteName: '현장명',
    processName: '공정명',
    outsourcingCompanyName: '자재업체명',
    inputTypeName: '투입 구분',
    inputTypeDescription: '투입 구분 설명',
    deliveryDateFormat: '납품일자',
    memo: '메모',
    name: '품명',
    vat: '부가세',
    standard: '규격',
    unitPrice: '단가',
    total: '합계',
    quantity: '수량',
    supplyPrice: '공급가',
    usage: '사용용도',
  }

  const {
    data: materialHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMaterialHistoryDataQuery(materialDetailId, isEditMode)

  const historyList = useManagementMaterialFormStore((state) => state.form.changeHistories)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('상세 자재 !!', client)
      // // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: DetailItem) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        total: c.total,
        usage: c.usage,
        vat: c.vat,
        unitPrice: c.unitPrice,
        supplyPrice: c.supplyPrice,
        unitWeight: c.unitWeight,
        standard: c.standard,
        memo: c.memo,
      }))
      setField('details', formattedDetails)

      // // 첨부 파일 가공
      const formattedFiles = (client.files ?? []).map((item: AttachedFile) => ({
        id: item.id,
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

      const mappedItemType = MaterialTypeLabelToValue[client.inputType ?? '']

      setField('attachedFiles', formattedFiles)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')
      setField('outsourcingCompanyId', client.company?.id ?? '')

      setField('deliveryDate', client.deliveryDate ? new Date(client.deliveryDate) : null)
      setField('inputType', mappedItemType)
      setField('inputTypeDescription', client.inputTypeDescription)
      setField('memo', client.memo ?? '')
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
    if (materialHistoryList?.pages) {
      const allHistories = materialHistoryList.pages.flatMap((page) =>
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
  }, [materialHistoryList, setField])

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
                  setField('siteName', selectedSite.name)

                  const res = await SitesProcessNameScroll({
                    pageParam: 0,
                    siteId: selectedSite.id,
                    keyword: '',
                  })

                  const processes = res.data?.content || []
                  if (processes.length > 0) {
                    setField('siteProcessId', processes[0].id)
                    setField('siteProcessName', processes[0].name)
                  } else {
                    setField('siteProcessId', 0)
                    setField('siteProcessName', '')
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
                    setField('siteProcessName', selectedProcess.name)
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
              투입구분
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.inputType || 'BASE'} //  값
                displayLabel
                onChange={(value) => setField('inputType', value)}
                options={InputTypeMethodOptions}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.inputTypeDescription}
                onChange={(value) => setField('inputTypeDescription', value)}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              납품일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.deliveryDate}
                onChange={(value) => setField('deliveryDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              자재업체명
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full">
              <CommonSelect
                fullWidth
                value={form.outsourcingCompanyId || 0}
                onChange={async (value) => {
                  const selectedCompany = companyOptions.find((opt) => opt.id === value)
                  if (!selectedCompany) return

                  setField('outsourcingCompanyId', selectedCompany.id)
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
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              비고
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

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">자재</span>
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
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}></TableCell>
                {[
                  '품명',
                  '규격',
                  '사용용도',
                  '수량',
                  '단가',
                  '공급가',
                  '부가세',
                  '합계',
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
                  {/* 체크박스 */}
                  <TableCell
                    padding="checkbox"
                    align="center"
                    sx={{ border: '1px solid  #9CA3AF' }}
                  >
                    <Checkbox
                      checked={checkedIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('MaterialItem', m.id, e.target.checked)}
                    />
                  </TableCell>

                  <TableCell sx={{ display: 'flex', gap: '4px', width: '320px' }}>
                    <CommonSelectByName
                      value={m.inputType === 'manual' ? '직접입력' : m.name || '선택'}
                      onChange={async (value) => {
                        if (value === '직접입력') {
                          updateItemField('MaterialItem', m.id, 'inputType', 'manual')
                          updateItemField('MaterialItem', m.id, 'name', '') // 직접입력 모드 전환 시 빈 값
                          return
                        }

                        const selectedProduct = productOptions.find((opt) => opt.name === value)
                        if (!selectedProduct) return
                        updateItemField('MaterialItem', m.id, 'inputType', 'select')
                        updateItemField('MaterialItem', m.id, 'name', selectedProduct.name)
                      }}
                      options={[...productOptions, { id: -1, name: '직접입력' }]}
                      onScrollToBottom={() => {
                        if (productNamehasNextPage && !productNameFetching)
                          productNameFetchNextPage()
                      }}
                      onInputChange={(value) => setProductSearch(value)}
                      loading={productNameLoading}
                    />

                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.inputType === 'manual' ? m.name : ''} // manual 모드일 때만 값 표시
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'name', e.target.value)
                      }
                      variant="outlined"
                      sx={textFieldStyle}
                      disabled={m.inputType !== 'manual'} // manual 모드일 때만 활성화
                    />
                  </TableCell>

                  {/* 규격 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '140px' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.standard}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'standard', e.target.value)
                      }
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  </TableCell>

                  {/* 사용용도 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '140px' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.usage}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'usage', e.target.value)
                      }
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  </TableCell>
                  {/* 수량 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '90px' }}>
                    <TextField
                      size="small"
                      placeholder="수량"
                      value={m.quantity || ''}
                      onChange={(e) => {
                        const numericValue = e.target.value === '' ? '' : Number(e.target.value)
                        updateItemField('MaterialItem', m.id, 'quantity', numericValue)
                      }}
                      variant="outlined"
                      sx={textFieldStyle}
                      inputProps={{ style: { textAlign: 'right' } }} // 오른쪽 정렬
                    />
                  </TableCell>

                  {/* 단가 */}
                  <TableCell align="right" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      inputMode="numeric"
                      placeholder="숫자 입력"
                      value={formatNumber(m.unitPrice) || ''}
                      onChange={(e) => {
                        const numericValue =
                          e.target.value === '' ? '' : unformatNumber(e.target.value)
                        updateItemField('MaterialItem', m.id, 'unitPrice', numericValue)
                      }}
                      variant="outlined"
                      sx={textFieldStyle}
                      inputProps={{
                        style: {
                          textAlign: 'right',
                        },
                      }}
                    />
                  </TableCell>

                  {/* 공급가 */}
                  <TableCell align="right" sx={{ border: '1px solid #9CA3AF' }}>
                    <SupplyPriceInput
                      value={m.supplyPrice}
                      onChange={(supply) => {
                        const vat = Math.floor(supply * 0.1)
                        const total = supply + vat

                        // MaterialItem 객체 업데이트
                        updateItemField('MaterialItem', m.id, 'supplyPrice', supply)
                        updateItemField('MaterialItem', m.id, 'vat', vat)
                        updateItemField('MaterialItem', m.id, 'total', total)
                      }}
                    />
                  </TableCell>

                  {/* 부가세 */}
                  <TableCell align="right" sx={{ border: '1px solid #9CA3AF' }}>
                    <VatInput supplyPrice={m.supplyPrice} />
                  </TableCell>

                  {/* 합계 */}
                  <TableCell align="right" sx={{ border: '1px solid #9CA3AF' }}>
                    {/* <TotalInput supplyPrice={m.supplyPrice} /> */}
                    <TotalInput supplyPrice={m.supplyPrice} vat={Math.floor(m.supplyPrice * 0.1)} />
                  </TableCell>

                  {/* 비고 */}
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      value={m.memo}
                      onChange={(e) =>
                        updateItemField('MaterialItem', m.id, 'memo', e.target.value)
                      }
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f3f3f3' }}>
                <TableCell
                  colSpan={4}
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
                  sx={{
                    border: '1px solid #9CA3AF',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {getTotalQuantityAmount()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {getTotalUnitPrice().toLocaleString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {getTotalSupplyAmount().toLocaleString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {getTotalSurtax().toLocaleString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    border: '1px solid #9CA3AF',
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {getTotalSum().toLocaleString()}
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
          <span className="font-bold border-b-2 mb-4">증빙서류</span>
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
                {['첨부', '비고'].map((label) => (
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
                  {/* <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                    <TextField
                      size="small"
                      placeholder="텍스트 입력"
                      sx={{ width: '100%' }}
                      value={m.name}
                      onChange={(e) =>
                        updateItemField('attachedFile', m.id, 'name', e.target.value)
                      }
                    />
                  </TableCell> */}

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
                        files={(m.files ?? []).filter((f) => f.file?.name)}
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={materialCancel} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (!form.details || form.details.length === 0) {
              showSnackbar('자재 항목을 1개 이상 입력해주세요.', 'warning')
              return
            }
            if (isEditMode) {
              if (window.confirm('수정하시겠습니까?')) {
                MaterialModifyMutation.mutate(materialDetailId)
              }
            } else {
              createMaterialMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
