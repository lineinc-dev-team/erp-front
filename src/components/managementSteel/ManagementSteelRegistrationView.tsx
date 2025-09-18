/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useParams, useRouter } from 'next/navigation'
import CommonDatePicker from '../common/DatePicker'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SteelDetailService } from '@/services/managementSteel/managementSteelRegistrationService'
import {
  AttachedFile,
  DetailItem,
  HistoryItem,
  ManagementSteelFormState,
} from '@/types/managementSteel'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { GetCompanyNameInfoService } from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import { CompanyInfo } from '@/types/outsourcingContract'
import { formatDateTime, unformatNumber } from '@/utils/formatters'
import { WithoutApprovalAndRemovalOptions } from '@/config/erp.confing'

export default function ManagementSteelRegistrationView({ isEditMode = false }) {
  const { showSnackbar } = useSnackbarStore()

  const router = useRouter()

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
    SteelApproveMutation,
    SteelReleaseMutation,
    steelCancel,
  } = useManagementSteel()

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
    memo: '비고',
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
    originalFileName: '파일 추가',
    usage: '용도',
  }

  const {
    data: steelHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSteelHistoryDataQuery(steelDetailId, isEditMode)

  const historyList = useManagementSteelFormStore((state) => state.form.changeHistories)

  // 현장명이 지워졌을떄 보이는 로직

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

      // 이전 상태 기반으로 새 배열 생성

      const newProcessOptions = [...processOptions, ...updatedProcessOptions]
        .filter((p, index, self) => index === self.findIndex((el) => el.id === p.id)) // id 중복 제거
        .filter((p) => p.id === 0 || p.deleted || (!p.deleted && p.id !== 0)) // 조건 필터링

      if (client.process) {
        const isDeleted = client.process.deleted || client.site?.deleted
        const processName = client.process.name + (isDeleted ? ' (삭제됨)' : '')

        if (!form.siteProcessId) {
          if (!newProcessOptions.some((p) => p.id === client.process.id)) {
            newProcessOptions.push({
              id: client.process.id,
              name: processName,
              deleted: isDeleted,
            })
          }

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
      // 등록 모드
      setUpdatedProcessOptions(processOptions)
    }
  }, [data, isEditMode, processOptions, setField])

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

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
            fileUrl: item.fileUrl && item.fileUrl.trim() !== '' ? item.fileUrl : null,
            originalFileName:
              item.originalFileName && item.originalFileName.trim() !== ''
                ? item.originalFileName
                : null,
          },
        ],
      }))
      setField('attachedFiles', formattedFiles)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')
      setField('startDate', client.startDate ? new Date(client.startDate) : null)
      setField('endDate', client.endDate ? new Date(client.endDate) : null)

      if (client.typeCode === 'PURCHASE') {
        setField('type', client.type ?? '')
      }

      if (client.previousType === '발주' || !client.previousType) {
        setField('type', client.type ?? '') // 예: '승인' 같은 필드
      } else {
        setField('type', `${client.type ?? ''}(${client.previousType ?? ''})`)
      }

      setField('usage', client.usage ?? '')

      setField('typeCode', client.typeCode)

      setField('memo', client.memo ?? '')

      setField('outsourcingCompanyId', client.outsourcingCompany?.id)

      setField('businessNumber', client.outsourcingCompany?.businessNumber ?? '')
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
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
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

  function validateSteelForm(form: ManagementSteelFormState) {
    // 기본 정보
    if (!form.siteId) return '현장명을 선택하세요.'
    if (!form.siteProcessId) return '공정명을 선택하세요.'
    if (form.type === 'BASE') return '구분을 선택하세요.'

    if (!form.usage?.trim()) return '용도를 입력하세요.'
    if (!form.startDate) return '시작일을 선택하세요.'
    if (!form.endDate) return '종료일을 선택하세요.'
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate))
      return '종료일은 시작일 이후여야 합니다.'

    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    // type이 PURCHASE 또는 LEASE일 경우 거래선 필수
    if (['PURCHASE', 'LEASE'].includes(form.type)) {
      if (!form.outsourcingCompanyId) return '업체명을 선택하세요.'
      if (!form.businessNumber?.trim()) return '사업자등록번호를 입력하세요.'
    }

    if (contractAddAttachedFiles.length > 0) {
      for (const item of contractAddAttachedFiles) {
        if (!item.standard?.trim()) return '규격을 입력해주세요.'
        if (!item.name?.trim()) return '품명을 입력해주세요.'
        if (!item.unit?.trim()) return '단위를 입력해주세요.'
        if (!item.count) return '본 수량을 입력해주세요.'
        if (!item.length) return '길이를 입력해주세요.'
        if (!item.totalLength) return '총 길이를 입력해주세요.'
        if (!item.unitWeight) return '단위중량을 입력해주세요.'
        if (!item.quantity) return '수량을 입력해주세요.'
        if (!item.unitPrice) return '단가를 입력해주세요.'
        if (!item.supplyPrice) return '공급가를 입력해주세요.'
        if (item.memo.length > 500) {
          return '품목상세의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    // 첨부파일 이름 체크
    if (attachedFiles.length > 0) {
      for (const file of attachedFiles) {
        if (!file.name?.trim()) return '첨부파일의 이름을 입력해주세요.'
        if (file.memo.length > 500) {
          return '첨부파일의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    return null
  }

  const handleSteelSubmit = () => {
    const errorMsg = validateSteelForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        SteelModifyMutation.mutate(steelDetailId)
      }
    } else {
      createSteelMutation.mutate()
    }
  }

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
              공정명
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
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              구분
            </label>
            <div className="border flex items-center p-2 gap-4 border-gray-400 px-2 w-full">
              {isEditMode === false && (
                <CommonSelect
                  fullWidth={true}
                  className="text-2xl"
                  value={form.type || 'BASE'}
                  displayLabel
                  onChange={(value) => setField('type', value)}
                  options={WithoutApprovalAndRemovalOptions}
                  disabled={isEditMode} // ← 수정 시 선택 불가
                />
              )}
              {isEditMode && (
                <CommonInput
                  placeholder="텍스트 입력"
                  value={form.type}
                  onChange={(value) => setField('usage', value)}
                  className="flex-1"
                  disabled
                />
              )}
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
              비고
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="500자 이하 텍스트 입력"
                value={form.memo}
                onChange={(value) => setField('memo', value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {['PURCHASE', 'LEASE'].includes(form.typeCode) && (
        <div className="mt-6">
          <span className="font-bold border-b-2 mb-4">거래선</span>
          <div className="grid grid-cols-2 mt-1 ">
            <div className="flex">
              <label className="w-36 text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
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
          </div>
        </div>
      )}

      {/* {isEditMode && (
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
      )} */}

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
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={m.quantity}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        updateItemField('MaterialItem', m.id, 'quantity', formatted)
                      }}
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
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
                      inputProps={{
                        sx: { textAlign: 'right' },

                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
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
                      inputProps={{
                        sx: { textAlign: 'right' },
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      fullWidth
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                    <TextField
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
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
                        multiple={false}
                        files={m.files} // 각 항목별 files
                        onChange={(newFiles) => {
                          updateItemField('attachedFile', m.id, 'files', newFiles.slice(0, 1))
                          // updateItemField('attachedFile', m.id, 'files', newFiles)
                        }}
                        uploadTarget="CLIENT_COMPANY"
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
                      {formatDateTime(item.createdAt)}({formatDateTime(item.updatedAt)})
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={steelCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleSteelSubmit}
        />

        {/* 승인 버튼 */}
        {isEditMode && ['ORDER', 'PURCHASE', 'LEASE'].includes(form.type) && (
          <CommonButton
            label="승인"
            className="px-10 font-bold"
            variant="primary"
            onClick={() => {
              if (window.confirm('정말 승인 하시겠습니까?')) {
                SteelApproveMutation.mutate(
                  { steelManagementIds: [steelDetailId] },
                  {
                    onSuccess: () => {
                      router.push('/managementSteel')
                    },
                  },
                )
              }
            }}
          />
        )}

        {isEditMode && form.type === 'APPROVAL' && (
          <CommonButton
            label="반출"
            className="px-10 font-bold"
            variant="danger"
            onClick={() => {
              if (window.confirm('정말 반출 하시겠습니까?')) {
                SteelReleaseMutation.mutate(
                  { steelManagementIds: [steelDetailId] },
                  {
                    onSuccess: () => {
                      router.push('/managementSteel')
                    },
                  },
                )
              }
            }}
          />
        )}
      </div>
    </>
  )
}
