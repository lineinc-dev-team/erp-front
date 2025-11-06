/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

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
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import CommonSelect from '../common/Select'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonButton from '../common/Button'
import { formatDateTime, formatNumber, unformatNumber } from '@/utils/formatters'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { HistoryItem } from '@/types/ordering'
import { useSiteManamentFormStore } from '@/stores/siteManamentStore'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import useSiteManament from '@/hooks/useSiteManament'
import { useQuery } from '@tanstack/react-query'
import {
  SiteManagementDetailService,
  SiteMSCancel,
} from '@/services/siteManament/siteManamentRegistrationService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { SiteManamentFormState } from '@/types/siteManagement'
import CommonMonthPicker from '../common/MonthPicker'

export default function SiteManagementRegistrationView({ isEditMode = true }) {
  const { setField, form, updateMemo, reset } = useSiteManamentFormStore()

  const {
    createSiteManamentMutation,
    useSiteManagementHistoryDataQuery,
    ModifySiteManamentMutation,
  } = useSiteManament()

  const {
    useSitePersonNameListInfiniteScroll,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const params = useParams()
  const laborSummaryId = Number(params?.id)

  const { showSnackbar } = useSnackbarStore()

  const { data } = useQuery({
    queryKey: ['siteManaInfo'],
    queryFn: () => SiteManagementDetailService(laborSummaryId),
    enabled: isEditMode && !!laborSummaryId, // 수정 모드일 때만 fetch
  })

  useEffect(() => {
    if (data && isEditMode) {
      const client = data.data

      setField('siteId', client.site.id)
      setField('siteName', client.site.name)
      setField('siteProcessId', client.siteProcess.id)
      setField('yearMonth', new Date(client.yearMonth))

      setField('employeeSalary', client.employeeSalary)
      setField('employeeSalaryMemo', client.employeeSalaryMemo)
      setField('regularRetirementPension', client.regularRetirementPension)
      setField('regularRetirementPensionMemo', client.regularRetirementPensionMemo)
      setField('retirementDeduction', client.retirementDeduction)
      setField('retirementDeductionMemo', client.retirementDeductionMemo)
      setField('majorInsuranceRegular', client.majorInsuranceRegular)
      setField('majorInsuranceRegularMemo', client.majorInsuranceRegularMemo)
      setField('majorInsuranceDaily', client.majorInsuranceDaily)
      setField('majorInsuranceDailyMemo', client.majorInsuranceDailyMemo)
      setField('contractGuaranteeFee', client.contractGuaranteeFee)
      setField('contractGuaranteeFeeMemo', client.contractGuaranteeFeeMemo)
      setField('equipmentGuaranteeFee', client.equipmentGuaranteeFee)
      setField('equipmentGuaranteeFeeMemo', client.equipmentGuaranteeFeeMemo)
      setField('nationalTaxPayment', client.nationalTaxPayment)
      setField('nationalTaxPaymentMemo', client.nationalTaxPaymentMemo)

      // ✅ 본사 관리비 항목
      setField('headquartersManagementCost', client.headquartersManagementCost)
      setField('headquartersManagementCostMemo', client.headquartersManagementCostMemo)
    } else {
      reset()
    }
  }, [data, isEditMode, setField])

  const { handleCancelData } = SiteMSCancel()

  const PROPERTY_NAME_MAP: Record<string, string> = {
    // ✅ 기본정보
    siteName: '현장명',
    siteProcessId: '공정명',
    yearMonth: '일자',

    // ✅ 현장 관리비
    employeeSalary: '직원급여',
    employeeSalaryMemo: '직원급여 비고',
    regularRetirementPension: '퇴직연금(정규직)',
    regularRetirementPensionMemo: '퇴직연금(정규직) 비고',
    retirementDeduction: '퇴직공제부금',
    retirementDeductionMemo: '퇴직공제부금 비고',
    majorInsuranceRegular: '4대보험(상용)',
    majorInsuranceRegularMemo: '4대보험(상용) 비고',
    majorInsuranceDaily: '4대보험(일용)',
    majorInsuranceDailyMemo: '4대보험(일용) 비고',
    contractGuaranteeFee: '보증수수료(계약보증)',
    contractGuaranteeFeeMemo: '보증수수료(계약보증) 비고',
    equipmentGuaranteeFee: '보증수수료(현장별건설기계)',
    equipmentGuaranteeFeeMemo: '보증수수료(현장별건설기계) 비고',
    nationalTaxPayment: '국세납부',
    nationalTaxPaymentMemo: '국세납부 비고',

    // ✅ 본사 관리비
    headquartersManagementCost: '본사 관리비',
    headquartersManagementCostMemo: '본사 관리비 비고',
  }

  const {
    data: laborContractHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useSiteManagementHistoryDataQuery(laborSummaryId, isEditMode)

  const historyList = useSiteManamentFormStore((state) => state.form.changeHistories)

  // const editedHistories = useLaborSummaryFormStore((state) => state.form.editedHistories)

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
    if (laborContractHistoryList?.pages) {
      const allHistories = laborContractHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type || '-',
          isEditable: item.isEditable,
          content:
            formatChangeDetail(item.getChanges) === '-'
              ? item?.description
              : formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          description: item.description,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
    }
  }, [laborContractHistoryList, setField])

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

  const [totalAmount, setTotalAmount] = useState(0)

  // 숫자 포맷 관련 유틸 있다고 가정
  const calculateTotal = (form: any) => {
    // 합계에 포함할 항목 키 정의
    const keys = [
      'employeeSalary',
      'regularRetirementPension',
      'retirementDeduction',
      'majorInsuranceRegular',
      'majorInsuranceDaily',
      'contractGuaranteeFee',
      'equipmentGuaranteeFee',
      'nationalTaxPayment',
    ]

    return keys.reduce((sum, key) => sum + (Number(form[key]) || 0), 0)
  }

  useEffect(() => {
    const total = calculateTotal(form)
    setTotalAmount(total)
  }, [form]) // form이 변경될 때마다 자동 계산

  function validateClientForm(form: SiteManamentFormState) {
    if (!form.siteName || form.siteName.trim() === '') {
      return '현장명을 입력하세요.'
    }

    if (!form.siteProcessId || form.siteProcessId === 0) {
      return '공정명을 선택하세요.'
    }

    if (!form.yearMonth) {
      return '일자를 선택하세요.'
    }

    if (form.employeeSalary === undefined || form.employeeSalary === null) {
      return '직원급여 금액을 입력하세요.'
    }
    if (form.regularRetirementPension === undefined || form.regularRetirementPension === null) {
      return '퇴직연금(정규직) 금액을 입력하세요.'
    }
    if (form.retirementDeduction === undefined || form.retirementDeduction === null) {
      return '퇴직공제부금 금액을 입력하세요.'
    }
    if (form.majorInsuranceRegular === undefined || form.majorInsuranceRegular === null) {
      return '4대보험(상용) 금액을 입력하세요.'
    }
    if (form.majorInsuranceDaily === undefined || form.majorInsuranceDaily === null) {
      return '4대보험(일용) 금액을 입력하세요.'
    }
    if (form.contractGuaranteeFee === undefined || form.contractGuaranteeFee === null) {
      return '보증수수료(계약보증) 금액을 입력하세요.'
    }
    if (form.equipmentGuaranteeFee === undefined || form.equipmentGuaranteeFee === null) {
      return '보증수수료(현장별건설기계) 금액을 입력하세요.'
    }
    if (form.nationalTaxPayment === undefined || form.nationalTaxPayment === null) {
      return '국세납부 금액을 입력하세요.'
    }
    if (form.headquartersManagementCost === undefined || form.headquartersManagementCost === null) {
      return '본사 관리비 금액을 입력하세요.'
    }

    return null
  }

  const handleClientSubmit = () => {
    const errorMsg = validateClientForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        ModifySiteManamentMutation.mutate(laborSummaryId)
      }
    } else {
      createSiteManamentMutation.mutate()
    }
  }

  return (
    <>
      <div className="mb-10">
        <span className="font-bold border-b-2 mb-4">현장/본사 관리비</span>
        <div className="grid grid-cols-2 mt-1">
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

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              일자 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
              <CommonMonthPicker
                value={form.yearMonth ? new Date(form.yearMonth + '-01') : null}
                onChange={(date) => {
                  if (!date) {
                    setField('yearMonth', '')
                    return
                  }
                  const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                    2,
                    '0',
                  )}`
                  setField('yearMonth', formatted)
                }}
                disabled={isEditMode}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <span className="font-bold border-b-2">현장 관리비</span>
        <div className="mt-2">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#4B5563' }}>
                  <TableCell
                    align="center"
                    colSpan={2}
                    sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #999', width: 50 }}
                  >
                    항목명
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      border: '1px solid #999',
                      width: 500,
                    }}
                  >
                    금액
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      border: '1px solid #999',
                      width: 500,
                    }}
                  >
                    비고
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    직원급여
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.employeeSalary) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('employeeSalary', formatted)
                      }}
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.employeeSalaryMemo || ''}
                      onChange={(e) => setField('employeeSalaryMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    퇴직연금(정규직)
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.regularRetirementPension) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('regularRetirementPension', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.regularRetirementPensionMemo || ''}
                      onChange={(e) => setField('regularRetirementPensionMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    퇴직공제부금
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.retirementDeduction) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('retirementDeduction', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.retirementDeductionMemo || ''}
                      onChange={(e) => setField('retirementDeductionMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell rowSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    4대보험
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #999' }}>
                    상용
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.majorInsuranceRegular) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('majorInsuranceRegular', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.majorInsuranceRegularMemo || ''}
                      onChange={(e) => setField('majorInsuranceRegularMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center" sx={{ border: '1px solid #999' }}>
                    일용
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.majorInsuranceDaily) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('majorInsuranceDaily', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.majorInsuranceDailyMemo || ''}
                      onChange={(e) => setField('majorInsuranceDailyMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    보증수수료(계약보증)
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.contractGuaranteeFee) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('contractGuaranteeFee', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.contractGuaranteeFeeMemo || ''}
                      onChange={(e) => setField('contractGuaranteeFeeMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    보증수수료(현장별건설기계)
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.equipmentGuaranteeFee) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('equipmentGuaranteeFee', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.equipmentGuaranteeFeeMemo || ''}
                      onChange={(e) => setField('equipmentGuaranteeFeeMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    국세납부
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.nationalTaxPayment) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('nationalTaxPayment', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.nationalTaxPaymentMemo || ''}
                      onChange={(e) => setField('nationalTaxPaymentMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>

                {/* 합계 */}
                <TableRow sx={{ backgroundColor: '#e0e0e0', fontWeight: 'bold' }}>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    합계
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      border: '1px solid #999',
                      fontWeight: 'bold',
                      fontSize: '1rem', // 예: 16px 정도
                    }}
                  >
                    {formatNumber(totalAmount)}
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    -
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <div className="mb-10">
        <span className="font-bold border-b-2">본사 관리비</span>
        <div className="mt-2">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#4B5563' }}>
                  <TableCell
                    align="center"
                    colSpan={2}
                    sx={{ fontWeight: 'bold', color: 'white', border: '1px solid #999', width: 50 }}
                  >
                    항목명
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      border: '1px solid #999',
                      width: 500,
                    }}
                  >
                    금액
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white',
                      border: '1px solid #999',
                      width: 500,
                    }}
                  >
                    비고
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ border: '1px solid #999' }}>
                    본사관리비 (기성의 7%)
                  </TableCell>

                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="입력"
                      value={formatNumber(form.headquartersManagementCost) || 0}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        setField('headquartersManagementCost', formatted)
                      }}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ border: '1px solid #999' }}>
                    <TextField
                      size="small"
                      placeholder="텍스트 입력(한글 기준 500자)"
                      value={form.headquartersManagementCostMemo || ''}
                      onChange={(e) => setField('headquartersManagementCostMemo', e.target.value)}
                      fullWidth
                      inputProps={{
                        style: { textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
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
                  {['수정일시', '항목', '수정항목', '수정자', '비고 / 메모'].map((label) => (
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
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#377be8' }}>{item.description}</span>
                      <span style={{ color: '#111827' }}>{item.content}</span>
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={handleCancelData} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleClientSubmit}
        />
      </div>
    </>
  )
}
