/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import {
  Button,
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
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'
import { useManagementSteel } from '@/hooks/useManagementSteel'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SteelDetailService } from '@/services/managementSteel/managementSteelRegistrationService'
import { ManagementSteelFormState } from '@/types/managementSteel'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import {
  formatDateTime,
  formatNumber,
  getTodayDateString,
  unformatNumber,
} from '@/utils/formatters'
import { HistoryItem } from '@/types/ordering'
import { useDebouncedArrayValue, useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import CommonSelectByName from '../common/CommonSelectByName'
import { steelTypeOptions } from '@/config/erp.confing'
import CommonFileInput from '../common/FileInput'

export default function ManagementSteelRegistrationView({ isEditMode = false }) {
  const { showSnackbar } = useSnackbarStore()

  const {
    setField,
    form,
    isSaved,
    resetDetailData,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
    updateMemo,
    getWeightAmount,
    getCountAmount,
    getTotalWeightAmount,
    getUnitPriceAmount,
    getAmountAmount,
    //관리비 등록하기
  } = useManagementSteelFormStore()

  const {
    useSitePersonNameListInfiniteScroll,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
    useOutsourcingNameListInfiniteScroll,
  } = useOutSourcingContract()

  const { createSteelMutation, useSteelHistoryDataQuery, SteelModifyMutation, steelCancel } =
    useManagementSteel()

  // 체크 박스에 활용
  const contractAddAttachedFiles = form.details
  const contractCheckIds = form.checkedMaterialItemIds
  const isContractAllChecked =
    contractAddAttachedFiles.length > 0 &&
    contractCheckIds.length === contractAddAttachedFiles.length

  const params = useParams()
  const steelDetailId = Number(params?.id)

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

  const TAB_CONFIG = [
    { label: '집계', value: undefined },
    { label: '입고', value: 'INCOMING' },
    { label: '출고', value: 'OUTGOING' },
    { label: '사장', value: 'ON_SITE_STOCK' },
    { label: '고철', value: 'SCRAP' },
  ]

  const [activeTab, setActiveTab] = useState<string | undefined>('INCOMING')

  const getTabLabel = (value: string | undefined) => {
    return TAB_CONFIG.find((tab) => tab.value === value)?.label ?? ''
  }

  const handleTabClick = (value: string | undefined) => {
    if (activeTab === value) return

    let message = ''

    if (activeTab === value) return // 같은 탭 클릭 시 무시

    if (!isSaved) {
      // 저장되지 않은 변경사항이 있는 상태
      if (isEditMode) {
        message = '수정한 내용이 저장되지 않았습니다. 이동하시겠습니까?'
      } else {
        message = `현재 "${getTabLabel(
          activeTab,
        )}" 탭의 데이터가 등록되지 않았습니다. 이동하시면 입력한 내용이 사라집니다. 계속하시겠습니까?`
      }
    } else if (isSaved) {
      // 저장 완료된 상태
      message = `현재 "${getTabLabel(
        activeTab,
      )}" 탭의 데이터는 저장되었습니다. 이동하시면 화면에 입력된 내용은 초기화됩니다. 계속하시겠습니까?`
    }

    if (message && !window.confirm(message)) return

    resetDetailData()
    setActiveTab(value)
    setField('type', value || '')
  }

  // 등록/상세 초기 설정
  useEffect(() => {
    setActiveTab('INCOMING')
    setField('type', 'INCOMING')
  }, [])

  const {
    data: steelHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSteelHistoryDataQuery(steelDetailId, isEditMode)

  const historyList = useManagementSteelFormStore((state) => state.form.changeHistories)

  const { data } = useQuery({
    queryKey: ['SteelInfo', steelDetailId, form.type ?? ''],
    queryFn: () => SteelDetailService(steelDetailId, form.type),
    enabled: isEditMode && !!steelDetailId,
  })

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      // // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: any) => ({
        checkId: c.id,
        id: c.id,
        name: c.name, // 품명
        specification: c.specification, // 규격
        weight: c.weight, // 무게(톤)
        count: c.count, // 본
        totalWeight: c.totalWeight, // 총 무게(톤)
        unitPrice: c.unitPrice, // 단가
        amount: c.amount, // 금액
        category: c.category ?? '', // 구분 (자사자재/구매 등)
        outsourcingCompanyId: c.outsourcingCompany?.id ?? '', // 거래선
        outsourcingCompanyName: c.outsourcingCompany?.name ?? '', // 거래선
        isModifyType: false,
        files:
          c.fileUrl && c.originalFileName
            ? [
                {
                  fileUrl: c.fileUrl,
                  originalFileName: c.originalFileName,
                },
              ]
            : [],

        memo: c.memo, // 비고
        createdAt: getTodayDateString(client.createdAt),
      }))
      setField('details', formattedDetails)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.siteProcess?.id ?? '')

      setField('siteName', client.site?.name ?? '')
      setField('siteProcessName', client.siteProcess?.name ?? '')
    } else {
      reset()
    }
  }, [data, isEditMode, reset, setField])

  const [isSiteFocused, setIsSiteFocused] = useState(false)

  const debouncedSiteKeyword = useDebouncedValue(form.siteName, 300)

  const {
    data: SiteNameData,
    fetchNextPage: SiteNameFetchNextPage,
    hasNextPage: SiteNameHasNextPage,
    isFetching: SiteNameIsFetching,
    isLoading: SiteNameIsLoading,
  } = useSitePersonNameListInfiniteScroll(debouncedSiteKeyword)

  const SiteRawList = SiteNameData?.pages.flatMap((page) => page.data.content) ?? []
  const siteList = Array.from(new Map(SiteRawList.map((user) => [user.name, user])).values())

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
    if (steelHistoryList?.pages) {
      const allHistories = steelHistoryList.pages.flatMap((page) =>
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

  // function validateSteelForm(form: ManagementSteelFormState) {
  //   // 기본 정보
  //   if (!form.siteId) return '현장명을 선택하세요.'
  //   if (!form.siteProcessId) return '공정명을 선택하세요.'

  //   if (contractAddAttachedFiles.length > 0) {
  //     for (const item of contractAddAttachedFiles) {
  //       if (!item.name?.trim()) return '품명을 입력해주세요.'
  //       if (!item.specification?.trim()) return '규격을 입력해주세요.'
  //       if (!item.weight) return '무게(톤)을 입력해주세요.'
  //       if (!item.count) return '본 수량을 입력해주세요.'
  //       if (!item.totalWeight) return '총 무게(톤)을 입력해주세요.'
  //       if (!item.unitPrice) return '단가를 입력해주세요.'
  //       if (!item.amount) return '금액을 입력해주세요.'
  //       if (item.category === '선택') return '구분을 선택해주세요.'
  //       if (!item.outsourcingCompanyName?.trim()) return '거래선을 입력해주세요.'
  //     }
  //   }

  //   return null
  // }

  function validateSteelForm(form: ManagementSteelFormState) {
    // 기본 정보
    if (!form.siteId) return '현장명을 선택하세요.'
    if (!form.siteProcessId) return '공정명을 선택하세요.'

    if (contractAddAttachedFiles.length > 0) {
      for (const item of contractAddAttachedFiles) {
        // 사장 탭에서 단가/금액/거래선은 체크 제외
        const isOnSiteStock = form.type === 'ON_SITE_STOCK'
        const isScrap = form.type === 'SCRAP'

        // 품명
        if (!item.name?.trim()) return '품명을 입력해주세요.'

        // 규격
        if (!isScrap && !item.specification?.trim()) return '규격을 입력해주세요.'

        // 무게
        if (!isScrap && !item.weight) return '무게(톤)을 입력해주세요.'

        // 본
        if (!isScrap && !item.count) return '본 수량을 입력해주세요.'

        // 총 무게
        if (!item.totalWeight) return '총 무게(톤)을 입력해주세요.'

        // 단가
        if (!isOnSiteStock && !item.unitPrice) return '단가를 입력해주세요.'

        // 금액
        if (!isOnSiteStock && !item.amount) return '금액을 입력해주세요.'

        // 구분
        if (!isScrap && !isOnSiteStock && item.category === '선택') return '구분을 선택해주세요.'

        // 거래선
        if (!isOnSiteStock && !item.outsourcingCompanyName?.trim()) return '거래선을 입력해주세요.'
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

    if (!form.details || form.details.length === 0) {
      showSnackbar('품목 상세를 1개 이상 입력해주세요.', 'warning')
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

  const [isOutsourcingFocused, setIsOutsourcingFocused] = useState(false)

  // 유저 선택 시 처리
  const handleSelectOutsourcing = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('MaterialItem', id, 'outsourcingCompanyId', 0)
      updateItemField('MaterialItem', id, 'outsourcingCompanyName', '')
      return
    }

    updateItemField('MaterialItem', id, 'outsourcingCompanyId', selectedCompany.id)
    updateItemField('MaterialItem', id, 'outsourcingCompanyName', selectedCompany.name)
  }

  const outsoucingLine = form.details.map((item) => item.outsourcingCompanyName ?? '')

  const debouncedOutsourcingKeyword = useDebouncedArrayValue(outsoucingLine, 300)

  const {
    data: OutsourcingNameData,
    fetchNextPage: OutsourcingeNameFetchNextPage,
    hasNextPage: OutsourcingNameHasNextPage,
    isFetching: OutsourcingNameIsFetching,
    isLoading: OutsourcingNameIsLoading,
  } = useOutsourcingNameListInfiniteScroll(debouncedOutsourcingKeyword)

  const OutsourcingRawList = OutsourcingNameData?.pages.flatMap((page) => page.data.content) ?? []
  const outsourcingList = Array.from(
    new Map(OutsourcingRawList.map((user) => [user.name, user])).values(),
  )

  const incomingSubtotalWeight =
    (data?.data?.incomingOwnMaterialTotalWeight || 0) +
    (data?.data?.incomingPurchaseTotalWeight || 0) +
    (data?.data?.incomingRentalTotalWeight || 0)

  const incomingSubtotalAmount =
    (data?.data?.incomingOwnMaterialAmount || 0) +
    (data?.data?.incomingPurchaseAmount || 0) +
    (data?.data?.incomingRentalAmount || 0)

  const outgoingSubtotalWeight =
    (data?.data?.outgoingOwnMaterialTotalWeight || 0) +
    (data?.data?.outgoingPurchaseTotalWeight || 0) +
    (data?.data?.outgoingRentalTotalWeight || 0)

  const outgoingSubtotalAmount =
    (data?.data?.outgoingOwnMaterialAmount || 0) +
    (data?.data?.outgoingPurchaseAmount || 0) +
    (data?.data?.outgoingRentalAmount || 0)

  return (
    <>
      <div>
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1 ">
          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 w-full flex items-center">
              <InfiniteScrollSelect
                disabled={false}
                placeholder="현장명을 입력하세요"
                keyword={form.siteName}
                onChangeKeyword={(newKeyword) => {
                  setField('siteName', newKeyword)

                  // 현장명 지웠을 경우 공정명도 같이 초기화
                  if (newKeyword === '') {
                    setField('siteProcessName', '')
                    setField('siteProcessId', 0)
                  }
                }}
                items={siteList}
                hasNextPage={SiteNameHasNextPage ?? false}
                fetchNextPage={SiteNameFetchNextPage}
                renderItem={(item, isHighlighted) => (
                  <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                    {item.name}
                  </div>
                )}
                // onSelect={handleSelectSiting}
                onSelect={async (selectedSite) => {
                  if (!selectedSite) return

                  // 선택된 현장 세팅
                  setField('siteId', selectedSite.id)
                  setField(
                    'siteName',
                    selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                  )

                  if (selectedSite.deleted) {
                    setField('siteProcessName', '')
                    return
                  }

                  try {
                    // 공정 목록 조회
                    const res = await SitesProcessNameScroll({
                      pageParam: 0,
                      siteId: selectedSite.id,
                      keyword: '',
                    })

                    const processes = res.data?.content || []

                    if (processes.length > 0) {
                      // 첫 번째 공정 자동 세팅
                      setField('siteProcessName', processes[0].name)
                      setField('siteProcessId', processes[0].id)
                    } else {
                      setField('siteProcessName', '')
                      setField('siteProcessId', 0)
                    }
                  } catch (err) {
                    console.error('공정 조회 실패:', err)
                  }
                }}
                isLoading={SiteNameIsLoading || SiteNameIsFetching}
                debouncedKeyword={debouncedSiteKeyword}
                shouldShowList={isSiteFocused}
                onFocus={() => setIsSiteFocused(true)}
                onBlur={() => setIsSiteFocused(false)}
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
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-400 mt-10 mb-4">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <Button
              key={tab.label}
              onClick={() => handleTabClick(tab.value)}
              sx={{
                borderRadius: '10px 10px 0 0',
                borderBottom: '1px solid #161616',
                backgroundColor: isActive ? '#ffffff' : '#e0e0e0',
                color: isActive ? '#000000' : '#9e9e9e',
                border: '1px solid #7a7a7a',
                fontWeight: isActive ? 'bold' : 'normal',
                padding: '6px 16px',
                minWidth: '120px',
                textTransform: 'none',
              }}
            >
              {tab.label}
            </Button>
          )
        })}
      </div>

      {form.type === '' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#4B5563' }}>
                <TableCell
                  align="center"
                  colSpan={2}
                  sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #999', width: 50 }}
                >
                  구분
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #999', width: 500 }}
                >
                  총 무게(톤)
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #999', width: 500 }}
                >
                  금액
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell rowSpan={3} align="center" sx={{ border: '1px solid #999' }}>
                  입고
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #999' }}>
                  자사자재
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.incomingOwnMaterialTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.incomingOwnMaterialAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ border: '1px solid #999' }}>
                  구매
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.incomingPurchaseTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.incomingPurchaseAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ border: '1px solid #999' }}>
                  임대
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.incomingRentalTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.incomingRentalAmount)}
                </TableCell>
              </TableRow>
              {/* 입고 소계 */}
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                  소계
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(incomingSubtotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(incomingSubtotalAmount)}
                </TableCell>
              </TableRow>

              {/* 출고 */}
              <TableRow>
                <TableCell rowSpan={3} align="center" sx={{ border: '1px solid #999' }}>
                  출고
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #999' }}>
                  자사자재
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.outgoingOwnMaterialTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.outgoingOwnMaterialAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ border: '1px solid #999' }}>
                  구매
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.outgoingPurchaseTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.outgoingPurchaseAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center" sx={{ border: '1px solid #999' }}>
                  임대
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.outgoingRentalTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.outgoingRentalAmount)}
                </TableCell>
              </TableRow>
              {/* 출고 소계 */}
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                  소계
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(outgoingSubtotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(outgoingSubtotalAmount)}
                </TableCell>
              </TableRow>

              {/* 사장 */}
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                  사장
                </TableCell>

                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.onSiteStockTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  -
                </TableCell>
              </TableRow>

              {/* 고철 */}
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                  고철
                </TableCell>

                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.scrapTotalWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? '-' : formatNumber(data?.data?.scrapAmount)}
                </TableCell>
              </TableRow>

              {/* 합계 */}
              <TableRow sx={{ backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
                <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                  현장보유수량 | 총 금액(투입비)
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? 0 : formatNumber(data?.data?.onSiteRemainingWeight)}
                </TableCell>
                <TableCell align="right" sx={{ border: '1px solid #999' }}>
                  {!isEditMode ? 0 : formatNumber(data?.data?.totalInvestmentAmount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {form.type !== '' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold border-b-2 mb-4"></span>
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
          <TableContainer component={Paper} sx={{ height: '400px' }}>
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
                    품명 <span className="text-red-500 ml-1">*</span>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    규격 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    무게(톤) <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    본 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    총 무게(톤)<span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    단가 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    금액 <span className="text-red-500 ml-1">*</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    구분 <span className="text-red-500 ml-1">*</span>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    거래선 <span className="text-red-500 ml-1">*</span>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold', color: 'black' }}
                  >
                    등록
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
                    증빙
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
                  <TableRow key={m.checkId} sx={{ border: '1px solid #9CA3AF' }}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid #9CA3AF' }}
                    >
                      <Checkbox
                        checked={contractCheckIds.includes(m.checkId)}
                        onChange={(e) =>
                          toggleCheckItem('MaterialItem', m.checkId, e.target.checked)
                        }
                        disabled={m.isModifyType === false}
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 80, // 모바일 (smaller)
                          sm: 120, // 태블릿
                          md: 160, // 데스크탑
                        },
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="입력"
                        value={m.name || ''}
                        onChange={(e) =>
                          updateItemField('MaterialItem', m.checkId, 'name', e.target.value)
                        }
                        inputProps={{
                          style: { textAlign: 'center' },
                        }}
                        disabled={m.isModifyType === false}
                      />
                    </TableCell>
                    {/* 규격 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF', width: '200px' }}>
                      {activeTab === 'SCRAP' ? (
                        '-'
                      ) : (
                        <TextField
                          size="small"
                          placeholder="입력"
                          value={m.specification || ''}
                          onChange={(e) =>
                            updateItemField(
                              'MaterialItem',
                              m.checkId,
                              'specification',
                              e.target.value,
                            )
                          }
                          inputProps={{
                            style: { textAlign: 'center' },
                          }}
                          disabled={m.isModifyType === false}
                        />
                      )}
                    </TableCell>

                    {/* 무게(톤) */}

                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 80, // 모바일 (smaller)
                          sm: 100, // 태블릿
                          md: 140, // 데스크탑
                        },
                      }}
                    >
                      {activeTab === 'SCRAP' ? (
                        '-'
                      ) : (
                        <TextField
                          size="small"
                          placeholder="입력"
                          value={m.weight || ''}
                          onChange={(e) => {
                            const regex = /^-?\d*\.?\d{0,4}$/
                            if (regex.test(e.target.value)) {
                              updateItemField('MaterialItem', m.checkId, 'weight', e.target.value)
                            }
                          }}
                          inputProps={{
                            style: { textAlign: 'center' },
                          }}
                          disabled={m.isModifyType === false}
                        />
                      )}
                    </TableCell>

                    {/* 본 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', width: '90px', padding: '6px' }}
                    >
                      {activeTab === 'SCRAP' ? (
                        '-'
                      ) : (
                        <TextField
                          size="small"
                          placeholder="입력"
                          value={m.count || ''}
                          onChange={(e) =>
                            updateItemField('MaterialItem', m.checkId, 'count', e.target.value)
                          }
                          inputProps={{
                            style: { textAlign: 'center' },
                          }}
                          disabled={m.isModifyType === false}
                        />
                      )}
                    </TableCell>

                    {/* 총 무게(톤) 수량 */}
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 80, // 모바일 (smaller)
                          sm: 100, // 태블릿
                          md: 140, // 데스크탑
                        },
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="입력"
                        value={m.totalWeight || ''}
                        onChange={(e) => {
                          const formatted = unformatNumber(e.target.value)
                          updateItemField('MaterialItem', m.checkId, 'totalWeight', formatted)
                        }}
                        inputProps={{
                          style: { textAlign: 'right' },
                        }}
                        fullWidth
                        disabled={
                          m.isModifyType === false ||
                          form.type === 'INCOMING' ||
                          form.type === 'OUTGOING' ||
                          form.type === 'ON_SITE_STOCK'
                        }
                      />
                    </TableCell>

                    {/* 단가 */}
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', width: '150px', padding: '6px' }}
                    >
                      {activeTab === 'ON_SITE_STOCK' ? (
                        '-'
                      ) : (
                        <TextField
                          size="small"
                          placeholder="숫자만"
                          value={m.unitPrice || ''}
                          onChange={(e) => {
                            updateItemField('MaterialItem', m.checkId, 'unitPrice', e.target.value)
                          }}
                          inputProps={{
                            style: { textAlign: 'right' },
                          }}
                          fullWidth
                          disabled={m.isModifyType === false}
                        />
                      )}
                    </TableCell>

                    {/* 금액 */}
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 80, // 모바일 (smaller)
                          sm: 120, // 태블릿
                          md: 160, // 데스크탑
                        },
                      }}
                    >
                      {activeTab === 'ON_SITE_STOCK' ? (
                        '-'
                      ) : (
                        <TextField
                          size="small"
                          placeholder="숫자만"
                          value={m.amount || ''}
                          onChange={(e) => {
                            const formatted = unformatNumber(e.target.value)
                            updateItemField('MaterialItem', m.checkId, 'amount', formatted)
                          }}
                          inputProps={{
                            style: { textAlign: 'right' },
                          }}
                          fullWidth
                          disabled={
                            m.isModifyType === false ||
                            form.type === 'INCOMING' ||
                            form.type === 'OUTGOING' ||
                            form.type === 'ON_SITE_STOCK'
                          }
                        />
                      )}
                    </TableCell>

                    {/* 구분 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      {activeTab === 'ON_SITE_STOCK' || activeTab === 'SCRAP' ? (
                        '-'
                      ) : (
                        <CommonSelectByName
                          value={m.category || '선택'}
                          onChange={async (value) => {
                            const selectedProduct = steelTypeOptions.find(
                              (opt) => opt.name === value,
                            )
                            if (!selectedProduct) return
                            updateItemField('MaterialItem', m.checkId, 'category', value)
                          }}
                          options={steelTypeOptions}
                          disabled={m.isModifyType === false}
                        />
                      )}
                    </TableCell>

                    {/* 거래선 */}
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 100, // 모바일 (smaller)
                          sm: 160, // 태블릿
                          md: 200, // 데스크탑
                        },
                      }}
                    >
                      {activeTab === 'ON_SITE_STOCK' ? (
                        '-' // 사장 탭일 때는 단순히 "-" 표시
                      ) : (
                        <InfiniteScrollSelect
                          placeholder="업체명을 입력하세요"
                          keyword={m.outsourcingCompanyName || ''} // 각 row의 값 사용
                          onChangeKeyword={(newKeyword) =>
                            updateItemField(
                              'MaterialItem',
                              m.checkId,
                              'outsourcingCompanyName',
                              newKeyword,
                            )
                          }
                          items={outsourcingList}
                          hasNextPage={OutsourcingNameHasNextPage ?? false}
                          fetchNextPage={OutsourcingeNameFetchNextPage}
                          renderItem={(item, isHighlighted) => (
                            <div
                              className={
                                isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''
                              }
                            >
                              {item.name}
                            </div>
                          )}
                          onSelect={(selectedCompany) =>
                            handleSelectOutsourcing(m.checkId ?? 0, selectedCompany)
                          }
                          isLoading={OutsourcingNameIsLoading || OutsourcingNameIsFetching}
                          debouncedKeyword={debouncedOutsourcingKeyword}
                          shouldShowList={isOutsourcingFocused}
                          onFocus={() => setIsOutsourcingFocused(true)}
                          onBlur={() => setIsOutsourcingFocused(false)}
                          disabled={m.isModifyType === false}
                        />
                      )}
                    </TableCell>

                    {/* 등록 수정에서 보여주는 용도임 */}
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 80, // 모바일 (smaller)
                          sm: 120, // 태블릿
                          md: 160, // 데스크탑
                        },
                      }}
                    >
                      <TextField
                        size="small"
                        value={m.createdAt || ''}
                        disabled
                        sx={{ width: '100%' }}
                      />
                    </TableCell>

                    {/* 증빙 */}
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
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
                          onChange={(newFiles) =>
                            updateItemField('MaterialItem', m.checkId, 'files', newFiles)
                          }
                          uploadTarget="WORK_DAILY_REPORT"
                        />
                      </div>
                    </TableCell>

                    {/* 비고 */}
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'nowrap',
                        width: {
                          xs: 80, // 모바일 (smaller)
                          sm: 120, // 태블릿
                          md: 160, // 데스크탑
                        },
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="텍스트"
                        multiline
                        value={m.memo || ''}
                        onChange={(e) =>
                          updateItemField('MaterialItem', m.checkId, 'memo', e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell
                    colSpan={3}
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
                    {getWeightAmount().toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getCountAmount().toLocaleString()}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalWeightAmount().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getUnitPriceAmount().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getAmountAmount().toLocaleString()}
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    align="right"
                    sx={{
                      border: '1px solid #9CA3AF',
                      fontSize: '16px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  ></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={steelCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleSteelSubmit}
        />

        {/* {isEditMode && form.typeCode === 'APPROVAL' && (
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
        )} */}
      </div>
    </>
  )
}
