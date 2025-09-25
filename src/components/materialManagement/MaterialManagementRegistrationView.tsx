/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { useManagementMaterialFormStore } from '@/stores/materialManagementStore'
import { MaterialDetailService } from '@/services/materialManagement/materialManagementRegistrationService'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AttachedFile,
  DetailItem,
  HistoryItem,
  ManagementMaterialFormState,
} from '@/types/materialManagement'
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

    MaterialDeleteMutation,
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
    memo: '비고',
    name: '품명',
    vat: '부가세',
    standard: '규격',
    unitPrice: '단가',
    total: '합계',
    quantity: '수량',
    supplyPrice: '공급가',
    usage: '사용용도',
    originalFileName: '파일 추가',
  }

  const {
    data: materialHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMaterialHistoryDataQuery(materialDetailId, isEditMode)

  const historyList = useManagementMaterialFormStore((state) => state.form.changeHistories)

  // 현장명이 없는 경우 삭제됨

  const [updatedSiteOptions, setUpdatedSiteOptions] = useState(sitesOptions)

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      // 기존 siteOptions 복사
      const newSiteOptions = [...sitesOptions]

      if (client.site) {
        const siteName = client.site.name + (client.site.deleted ? ' (삭제됨)' : '')

        // 이미 options에 있는지 체크
        const exists = newSiteOptions.some((s) => s.id === client.site.id)
        if (!exists) {
          newSiteOptions.push({
            id: client.site.id,
            name: siteName,
            deleted: client.site.deleted,
          })
        }
      }

      // 삭제된 현장 / 일반 현장 분리
      const deletedSites = newSiteOptions.filter((s) => s.deleted)
      const normalSites = newSiteOptions.filter((s) => !s.deleted && s.id !== 0)

      // 최종 옵션 배열 세팅
      setUpdatedSiteOptions([
        newSiteOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
        ...deletedSites,
        ...normalSites,
      ])

      // 선택된 현장 id 세팅
      setField('siteId', client.site?.id ?? 0)
    } else if (!isEditMode) {
      // 등록 모드
      setUpdatedSiteOptions(sitesOptions)
      setField('siteId', 0)
    }
  }, [data, isEditMode, sitesOptions])

  const [updatedProcessOptions, setUpdatedProcessOptions] = useState(processOptions)

  useEffect(() => {
    if (isEditMode && data) {
      const client = data.data

      const newProcessOptions = [...processOptions]

      if (client.process) {
        const isDeleted = client.process.deleted
        const processName = client.process.name + (isDeleted ? ' (삭제됨)' : '')

        if (!newProcessOptions.some((p) => p.id === client.process.id)) {
          newProcessOptions.push({
            id: client.process.id,
            name: processName,
            deleted: isDeleted,
          })
        }

        if (!form.siteProcessId) {
          setField('siteProcessId', client.process.id)
          setField('siteProcessName', processName)
        }
      }

      // 삭제된 공정 / 일반 공정 분리
      const deletedProcesses = newProcessOptions.filter((p) => p.deleted)
      const normalProcesses = newProcessOptions.filter((p) => !p.deleted && p.id !== 0)

      setUpdatedProcessOptions([
        newProcessOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
        ...deletedProcesses,
        ...normalProcesses,
      ])
    } else if (!isEditMode) {
      // 등록 모드에서는 항상 processOptions로 초기화
      setUpdatedProcessOptions(processOptions)
    }
  }, [data, isEditMode, processOptions, setField])

  const [updatedCompanyOptions, setUpdatedCompanyOptions] = useState(companyOptions)

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      const newCompanyOptions = [...companyOptions]

      if (client.company) {
        const companyName = client.company.name + (client.company.deleted ? ' (삭제됨)' : '')

        // 이미 options에 있는지 체크
        const exists = newCompanyOptions.some((c) => c.id === client.company.id)
        if (!exists) {
          newCompanyOptions.push({
            id: client.company.id,
            name: companyName,
            businessNumber: client.company.businessNumber ?? '',
            ceoName: client.company.ceoName ?? '',
            bankName: client.company.bankName ?? '',
            accountNumber: client.company.accountNumber ?? '',
            accountHolder: client.company.accountHolder ?? '',
            deleted: client.company.deleted,
          })
        }
      }

      const deletedCompanies = newCompanyOptions.filter((c) => c.deleted)
      const normalCompanies = newCompanyOptions.filter((c) => !c.deleted && c.id !== 0)

      setUpdatedCompanyOptions([
        newCompanyOptions.find((c) => c.id === 0) ?? {
          id: 0,
          name: '선택',
          businessNumber: '',
          ceoName: '',
          bankName: '',
          accountNumber: '',
          accountHolder: '',
          deleted: false,
        },
        ...deletedCompanies,
        ...normalCompanies,
      ])

      setField('outsourcingCompanyId', client.company?.id ?? 0)
    } else if (!isEditMode) {
      setUpdatedCompanyOptions(companyOptions)
      setField('outsourcingCompanyId', 0) // "선택" 기본값
    }
  }, [data, isEditMode, companyOptions])

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

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
        name: item.name,
        memo: item.memo,
        files: [
          {
            fileUrl: item.fileUrl || '', // null 대신 안전하게 빈 문자열
            originalFileName: item.originalFileName || '',
          },
        ],
      }))

      // const mappedItemType = MaterialTypeLabelToValue[client.inputType ?? '']

      setField('attachedFiles', formattedFiles)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')
      setField('outsourcingCompanyId', client.company?.id ?? '')

      setField('deliveryDate', client.deliveryDate ? new Date(client.deliveryDate) : null)
      setField('inputType', client.inputTypeCode)
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
    if (materialHistoryList?.pages) {
      const allHistories = materialHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type || '-',
          typeCode: item.typeCode,
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

  function validateMaterialForm(form: ManagementMaterialFormState) {
    if (!form.siteId) return '현장을 선택해주세요.'
    if (!form.siteProcessId) return '공정을 선택해주세요.'
    if (!form.inputType?.trim()) return '투입구분을 선택해주세요.'
    if (form.inputType === 'DIRECT_INPUT' && !form.inputTypeDescription?.trim()) {
      return '투입구분 설명을 입력해주세요.'
    }
    if (!form.deliveryDate) return '납품일자를 선택해주세요.'
    if (!form.outsourcingCompanyId) return '자재업체를 선택해주세요.'

    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    // 자재 유효성 체크
    if (managers.length > 0) {
      for (const item of managers) {
        if (!item.name?.trim()) return '자재의 품명을 입력해주세요.'
        if (!item.standard?.trim()) return '자재의 규격을 입력해주세요.'
        if (!item.usage?.trim()) return '자재의 사용용도를 입력해주세요.'
        if (!item.quantity) return '자재의 수량을 입력해주세요.'
        if (!item.unitPrice) return '자재의 단가를 입력해주세요.'
        if (item.memo.length > 500) {
          return '자재의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    return null
  }

  const handleMaterialSubmit = () => {
    const errorMsg = validateMaterialForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

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
  }

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                value={form.siteId || 0}
                onChange={async (value) => {
                  const selectedSite = updatedSiteOptions.find((opt) => opt.id === value)
                  if (!selectedSite) return

                  setField('siteId', selectedSite.id)
                  setField(
                    'siteName',
                    selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                  )

                  if (selectedSite.deleted) {
                    // 삭제된 경우
                    const deletedProcess = updatedProcessOptions.find(
                      (p) => p.id === data?.data.process?.id,
                    )
                    if (deletedProcess) {
                      setField('siteProcessId', deletedProcess.id)
                      setField(
                        'siteProcessName',
                        deletedProcess.name + (deletedProcess.deleted ? ' (삭제됨)' : ''),
                      )
                    } else {
                      setField('siteProcessId', 0)
                      setField('siteProcessName', '')
                    }
                  } else {
                    const res = await SitesProcessNameScroll({
                      pageParam: 0,
                      siteId: selectedSite.id,
                      keyword: '',
                    })

                    const processes = res.data?.content || []
                    if (processes.length > 0) {
                      const firstProcess = processes[0]

                      setUpdatedProcessOptions((prev) => [
                        { id: 0, name: '선택', deleted: false },
                        ...prev.filter((p) => p.deleted), // 삭제된 것 유지
                        ...processes.map((p: any) => ({ ...p, deleted: false })),
                      ])

                      setField('siteProcessId', firstProcess.id)
                      setField('siteProcessName', firstProcess.name)
                    } else {
                      setField('siteProcessId', 0)
                      setField('siteProcessName', '')
                    }
                  }
                }}
                options={updatedSiteOptions}
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
              공정명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonSelect
                fullWidth
                className="text-xl"
                value={form.siteProcessId || 0}
                onChange={(value) => {
                  const selectedProcess = updatedProcessOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    setField('siteProcessId', selectedProcess.id)
                    setField('siteProcessName', selectedProcess.name)
                  }
                }}
                options={updatedProcessOptions}
                displayLabel
                onScrollToBottom={() => {
                  if (processInfoHasNextPage && !processInfoIsFetching) processInfoFetchNextPage()
                }}
                onInputChange={(value) => setProcessSearch(value)}
                loading={processInfoLoading}
                disabled
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              투입구분 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.inputType || 'BASE'} //  값
                displayLabel
                onChange={(value) => {
                  setField('inputType', value)

                  // 직접입력이 아닌 다른 타입으로 바꾸면 설명 초기화
                  if (value !== 'DIRECT_INPUT') {
                    setField('inputTypeDescription', '')
                  }
                }}
                options={InputTypeMethodOptions}
              />

              <CommonInput
                value={form.inputTypeDescription}
                onChange={(value) => setField('inputTypeDescription', value)}
                className=" flex-1"
                disabled={form.inputType !== 'DIRECT_INPUT'}
                placeholder={form.inputType === 'DIRECT_INPUT' ? '기타 내용을 입력하세요' : ''}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              납품일자 <span className="text-red-500 ml-1">*</span>
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
              자재업체명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 p-2 px-2 w-full">
              <CommonSelect
                fullWidth
                value={form.outsourcingCompanyId || 0}
                onChange={async (value) => {
                  const selectedCompany = updatedCompanyOptions.find((opt) => opt.id === value)
                  if (!selectedCompany) return

                  setField('outsourcingCompanyId', selectedCompany.id)
                }}
                options={updatedCompanyOptions}
                onScrollToBottom={() => {
                  if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                }}
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
                placeholder="500자 이하 텍스트 입력"
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
                    {label === '비고' || label === '부가세' || label === '합계' ? (
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
                  {/* 수량 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '90px' }}>
                    <TextField
                      size="small"
                      placeholder="수량"
                      value={m.quantity || ''}
                      onChange={(e) => {
                        const quantity = e.target.value === '' ? '' : Number(e.target.value)

                        // 공급가 계산 (수량 * 단가)
                        const supplyPrice = quantity && m.unitPrice ? quantity * m.unitPrice : 0
                        const vat = Math.floor(supplyPrice * 0.1)
                        const total = supplyPrice + vat

                        updateItemField('MaterialItem', m.id, 'quantity', quantity)
                        updateItemField('MaterialItem', m.id, 'supplyPrice', supplyPrice)
                        updateItemField('MaterialItem', m.id, 'vat', vat)
                        updateItemField('MaterialItem', m.id, 'total', total)
                      }}
                      variant="outlined"
                      sx={textFieldStyle}
                      inputProps={{ style: { textAlign: 'right' } }}
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
                        const unitPrice =
                          e.target.value === '' ? '' : unformatNumber(e.target.value)

                        // 공급가 계산 (수량 * 단가)
                        const supplyPrice = m.quantity && unitPrice ? m.quantity * unitPrice : 0
                        const vat = Math.floor(supplyPrice * 0.1)
                        const total = supplyPrice + vat

                        updateItemField('MaterialItem', m.id, 'unitPrice', unitPrice)
                        updateItemField('MaterialItem', m.id, 'supplyPrice', supplyPrice)
                        updateItemField('MaterialItem', m.id, 'vat', vat)
                        updateItemField('MaterialItem', m.id, 'total', total)
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
                      placeholder="500자 이하 텍스트 입력"
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
                        uploadTarget="MATERIAL_MANAGEMENT"
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
        {isEditMode && (
          <CommonButton
            label="삭제"
            variant="danger"
            onClick={() => {
              MaterialDeleteMutation.mutate({
                materialManagementIds: [materialDetailId],
              })
            }}
            className="px-4 font-bold"
          />
        )}

        <CommonButton label="취소" variant="reset" className="px-10" onClick={materialCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleMaterialSubmit}
        />
      </div>
    </>
  )
}
