'use client'
import React from 'react'
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
import { bankCostOptions } from '@/config/erp.confing'
import { useCallback, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useManagementCostFormStore } from '@/stores/managementCostsStore'
import CommonDatePicker from '../common/DatePicker'
import { useManagementCost } from '@/hooks/useManagementCost'
import CommonInputnumber from '@/utils/formatBusinessNumber'
import { formatDateTime, formatNumber, unformatNumber } from '@/utils/formatters'
import {
  CostDetailService,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'
import {
  AttachedFile,
  DetailItem,
  HistoryItem,
  KeyMoneyDetail,
  ManagementCostFormState,
  MealFeeDetail,
} from '@/types/managementCost'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SupplyPriceInput, TotalInput, VatInput } from '@/utils/supplyVatTotalInput'
import CommonSelectByName from '../common/CommonSelectByName'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export default function ManagementCostRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    updateMemo,
    addItem,
    getPersonTotal,
    getAmountTotal,
    getPriceTotal,
    getSupplyTotal,
    getVatTotal,
    getTotalCount,

    getMealTotal,
    getMealPriceTotal,
    getMealTotalCount,

    toggleCheckItem,
    toggleCheckAllItems,
  } = useManagementCostFormStore()

  const { showSnackbar } = useSnackbarStore()

  const {
    createCostMutation,
    CostModifyMutation,

    CostNameTypeMethodOptions,

    // 업체명
    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,

    // 인력

    setPersonSearch,
    personDataOptions,
    PersonSearchFetchNextPage,
    PersonSearchhasNextPage,
    PersonSearchFetching,
    PersonSearchLoading,

    useCostHistoryDataQuery,
  } = useManagementCost()

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
  } = useOutSourcingContract()

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'black' },
      '&:hover fieldset': { borderColor: 'black' },
      '&.Mui-focused fieldset': { borderColor: 'black' },
    },
  }
  // 체크 박스에 활용
  const itemDetails = form.details
  const checkedIds = form.checkedCostIds
  const isAllChecked = itemDetails.length > 0 && checkedIds.length === itemDetails.length

  // 전도금
  const keyMoneyDetails = form.keyMoneyDetails
  const checkedKeyMoneyIds = form.checkedKeyMoneyIds
  const isAllKeyMoneyChecked =
    keyMoneyDetails.length > 0 && checkedKeyMoneyIds.length === keyMoneyDetails.length

  // 식대
  const mealFeelDetails = form.mealFeeDetails
  const checkedMealIds = form.checkedMealFeeIds
  const isAllMealChecked =
    mealFeelDetails.length > 0 && checkedMealIds.length === mealFeelDetails.length

  const attachedFiles = form.attachedFiles
  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 상세페이지 로직

  const params = useParams()
  const costDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['CostDetailInfo'],
    queryFn: () => CostDetailService(costDetailId),
    enabled: isEditMode && !!costDetailId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    phoneNumber: '개인 휴대폰',
    name: '직접입력한 성명',
    laborName: '성명',
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
    memo: '비고',
    originalFileName: '파일 추가',
    paymentDateFormat: '일자',
    lunchCount: '중식 갯수',
    breakfastCount: '조식 갯수',
    unitPrice: '단가',
    amount: '금액',
    workType: '직종',
    siteName: '현장명',
    processName: '공정명',
    itemTypeDescription: '항목 내용',
    outsourcingCompanyName: '업체명',
    vat: '단가',
    supplyPrice: '공급가',
    total: '합계',
    account: '계정',
    personnelCount: '인원수',
    purpose: '사용목적',
  }

  const {
    data: costHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useCostHistoryDataQuery(costDetailId, isEditMode)

  const historyList = useManagementCostFormStore((state) => state.form.changeHistories)

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      console.log('발주처 데이터 확인', client)

      // 상세 항목 가공
      const formattedDetails = (client.details ?? []).map((c: DetailItem) => ({
        id: c.id,
        name: c.name,
        unitPrice: c.unitPrice,
        supplyPrice: c.supplyPrice,
        vat: c.vat,
        total: c.total,
        memo: c.memo,
      }))

      const keyMoneyDetails = (client.keyMoneyDetails ?? []).map((item: KeyMoneyDetail) => ({
        id: item.id,
        account: item.account,
        purpose: item.purpose,
        personnelCount: item.personnelCount,
        amount: item.amount,
        memo: item.memo,
      }))

      const mealDetails = (client.mealFeeDetails ?? []).map((item: MealFeeDetail) => ({
        id: item.id,
        laborId: item?.labor?.id ?? null,
        workType: item.workType,
        breakfastCount: item.breakfastCount,
        lunchCount: item.lunchCount,
        unitPrice: item.unitPrice,
        amount: item.amount,
        memo: item.memo,
        name: item.name || item.labor?.name,
        inputType: item.labor === null ? 'manual' : 'select',
      }))

      // 첨부 파일 가공
      const formattedFiles = (client.files ?? []).map((item: AttachedFile) => ({
        id: item.id,
        memo: item.memo,
        files: [
          {
            fileUrl: item.fileUrl || '', // null 대신 안전하게 빈 문자열
            originalFileName: item.originalFileName || '',
          },
        ],
      }))

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '') // 현장명
      setField('siteProcessId', client.process?.id ?? '') // 공정명

      setField('itemType', client.itemTypeCode ?? '') // 공정명

      setField('itemTypeDescription', client.itemDescription || '') // 공정명
      setField('paymentDate', client.paymentDate ? new Date(client.paymentDate) : null)

      setField('outsourcingCompanyId', client.outsourcingCompany.id)

      setField('outsourcingCompanyInfo', {
        name: client.outsourcingCompany?.name ?? '',
        businessNumber: client.outsourcingCompany?.businessNumber ?? '',
        ceoName: client.outsourcingCompany?.ceoName ?? '',
        bankName: client.outsourcingCompany?.bankName ?? '',
        accountNumber: client.outsourcingCompany?.accountNumber ?? '',
        accountHolder: client.outsourcingCompany?.accountHolder ?? '',
      })

      setField('memo', client.memo ?? '')

      setField('details', formattedDetails)
      setField('attachedFiles', formattedFiles)

      setField('keyMoneyDetails', keyMoneyDetails)

      setField('mealFeeDetails', mealDetails)
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
    if (costHistoryList?.pages) {
      const allHistories = costHistoryList.pages.flatMap((page) =>
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
  }, [costHistoryList, setField])

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

  function validateCostForm(form: ManagementCostFormState) {
    if (!form.siteId) return '현장명을 입력하세요.'
    if (!form.siteProcessId) return '공정명을 선택하세요.'
    if (!form.outsourcingCompanyId) return '업체명을 선택하세요.'
    if (!form.itemType) return '항목을 선택하세요.'
    if (form.itemType === 'ETC' && !form.itemTypeDescription) {
      return '상세 항목을 입력하세요.'
    }
    if (!form.paymentDate) return '일자를 선택하세요.'
    if (!form.outsourcingCompanyInfo) return '업체 정보를 입력하세요.'

    if (
      form.outsourcingCompanyInfo?.businessNumber.replace(/\D/g, '').length !== 10 ||
      form.outsourcingCompanyInfo?.businessNumber.replace(/\D/g, '').length > 10
    ) {
      return '사업자등록번호를 정확히 입력해주세요.'
    }

    if (!form.outsourcingCompanyInfo?.ceoName) return '대표자명을 입력해주세요.'
    if (form.outsourcingCompanyInfo?.bankName == '선택') return '은행을 선택해주세요.'
    if (!form.outsourcingCompanyInfo?.accountNumber) return '계좌번호를 입력해주세요.'
    if (!form.outsourcingCompanyInfo?.accountHolder) return '예금주명을 입력해주세요.'

    if (form.memo.length > 500) {
      return '비고는 500자 이하로 입력해주세요.'
    }

    if (itemDetails.length > 0) {
      for (const item of itemDetails) {
        if (!item.name?.trim()) return '품목명을 입력해주세요.'
        if (!item.unitPrice && item.unitPrice !== 0) return '단가를 입력해주세요.'
        if (!item.supplyPrice && item.supplyPrice !== 0) return '공급가를 입력해주세요.'
        if (item.memo.length > 500) return '비고는 500자 이하로 입력해주세요.'
      }
    }

    if (keyMoneyDetails.length > 0) {
      for (const item of keyMoneyDetails) {
        if (!item.account?.trim()) return '계정을 입력해주세요.'
        if (!item.purpose?.trim()) return '사용목적을 입력해주세요.'
        if (!item.personnelCount && item.personnelCount !== 0) return '인원수를 입력해주세요.'
        if (!item.amount && item.amount !== 0) return '금액을 입력해주세요.'
      }
    }

    if (mealFeelDetails.length > 0) {
      for (const item of mealFeelDetails) {
        if (!item.workType?.trim()) return '직종을 입력해주세요.'
        if (item.inputType !== 'manual' && !item.laborId) return '담당자를 선택해주세요.'
        if (!item.inputType?.trim()) return '구분을 선택해주세요.'
        if (!item.name?.trim()) return '성명을 입력해주세요.'
        const mealTotal = (item.breakfastCount ?? 0) + (item.lunchCount ?? 0)
        if (mealTotal === 0) return '조식 또는 중식을 입력해주세요.'
        if (!item.amount && item.amount !== 0) return '금액을 입력해주세요.'
      }
    }

    return null
  }

  const handleCostSubmit = () => {
    const errorMsg = validateCostForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        CostModifyMutation.mutate(costDetailId)
      }
    } else {
      createCostMutation.mutate()
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
              항목
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.itemType || 'BASE'}
                displayLabel
                onChange={(value) => {
                  setField('itemType', value)
                  setField('itemTypeDescription', '')
                }}
                options={CostNameTypeMethodOptions}
                disabled={isEditMode}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.itemTypeDescription}
                onChange={(value) => setField('itemTypeDescription', value)}
                className=" flex-1"
                disabled={form.itemType !== 'ETC'}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.paymentDate}
                onChange={(value) => setField('paymentDate', value)}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              업체명
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                value={form.outsourcingCompanyId ?? -1}
                onChange={async (value) => {
                  setField('outsourcingCompanyId', value)
                  if (value === -2) {
                    // 직접입력 선택 시, OutsourcingCompanyInfo 초기화
                    setField('outsourcingCompanyInfo', {
                      name: '',
                      businessNumber: '',
                      ceoName: '',
                      bankName: '선택',
                      accountNumber: '',
                      accountHolder: '',
                    })
                  } else {
                    const companyDetail = companyOptions.find((c) => c.id === value)
                    if (
                      companyDetail &&
                      'businessNumber' in companyDetail &&
                      'ceoName' in companyDetail &&
                      'bankName' in companyDetail &&
                      'accountNumber' in companyDetail &&
                      'accountHolder' in companyDetail
                    ) {
                      setField('outsourcingCompanyInfo', {
                        name: companyDetail.name ?? '',
                        businessNumber: companyDetail.businessNumber ?? '',
                        ceoName: companyDetail.ceoName ?? '',
                        bankName: companyDetail.bankName ?? '',
                        accountNumber: companyDetail.accountNumber ?? '',
                        accountHolder: companyDetail.accountHolder ?? '',
                      })
                    }
                  }
                }}
                options={[...companyOptions, { id: -2, name: '직접입력' }]}
                onScrollToBottom={() => {
                  if (comPanyNamehasNextPage && !comPanyNameFetching) comPanyNameFetchNextPage()
                }}
                onInputChange={(value) => setCompanySearch(value)}
                loading={comPanyNameLoading}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.outsourcingCompanyInfo?.name ?? ''}
                onChange={(value) =>
                  setField('outsourcingCompanyInfo', {
                    ...form.outsourcingCompanyInfo,
                    name: value,
                  })
                }
                className="flex-1"
                disabled={form.outsourcingCompanyId !== -2}
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              사업자등록번호
            </label>
            <div className="border border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="'-'없이 숫자만 입력"
                value={CommonInputnumber(form.outsourcingCompanyInfo?.businessNumber ?? '')}
                onChange={(value) =>
                  setField('outsourcingCompanyInfo', {
                    ...form.outsourcingCompanyInfo,
                    businessNumber: value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              대표자명
            </label>
            <div className="border flex items-center border-gray-400 px-2 w-full">
              <CommonInput
                placeholder="텍스트 입력"
                value={form.outsourcingCompanyInfo?.ceoName ?? ''}
                onChange={(value) =>
                  setField('outsourcingCompanyInfo', {
                    ...form.outsourcingCompanyInfo,
                    ceoName: value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              청구계좌 / 예금주명
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                className="text-2xl"
                value={form.outsourcingCompanyInfo?.bankName ?? '선택'}
                onChange={(value) =>
                  setField('outsourcingCompanyInfo', {
                    ...form.outsourcingCompanyInfo,
                    bankName: value,
                  })
                }
                options={bankCostOptions}
              />

              <CommonInput
                placeholder="텍스트 입력"
                value={form.outsourcingCompanyInfo?.accountNumber ?? ''}
                onChange={(value) =>
                  setField('outsourcingCompanyInfo', {
                    ...form.outsourcingCompanyInfo,
                    accountNumber: value,
                  })
                }
                className="flex-1"
              />

              <CommonInput
                placeholder="예금주"
                value={form.outsourcingCompanyInfo?.accountHolder ?? ''}
                onChange={(value) =>
                  setField('outsourcingCompanyInfo', {
                    ...form.outsourcingCompanyInfo,
                    accountHolder: value,
                  })
                }
                className="flex-1"
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
                placeholder="500자 이하 텍스트 입력"
              />
            </div>
          </div>
        </div>
      </div>

      {form.itemType !== 'MEAL_FEE' && form.itemType !== 'KEY_MONEY' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">품목상세</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('costItem')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('costItem')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isAllChecked}
                      indeterminate={checkedIds.length > 0 && !isAllChecked}
                      onChange={(e) => toggleCheckAllItems('costItem', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['품명', '단가', '공급가', '부가세 (체크 시 자동 계산)', '합계', '비고'].map(
                    (label) => (
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
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {itemDetails.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={checkedIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('costItem', m.id, e.target.checked)}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.name}
                        onChange={(e) => updateItemField('costItem', m.id, 'name', e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        inputMode="numeric"
                        placeholder="숫자 입력"
                        value={formatNumber(m.unitPrice) || 0}
                        onChange={(e) => {
                          const numericValue =
                            e.target.value === '' ? '' : unformatNumber(e.target.value)
                          updateItemField('costItem', m.id, 'unitPrice', numericValue)
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

                    <TableCell align="right" sx={{ border: '1px solid #9CA3AF' }}>
                      <SupplyPriceInput
                        value={m.supplyPrice}
                        onChange={(supply) => {
                          const vat = Math.floor(supply * 0.1)
                          const total = supply + vat

                          // MaterialItem 객체 업데이트
                          updateItemField('costItem', m.id, 'supplyPrice', supply)
                          updateItemField('costItem', m.id, 'vat', vat)
                          updateItemField('costItem', m.id, 'total', total)
                        }}
                      />
                    </TableCell>

                    {/* 부가세 */}
                    {/* 부가세 */}
                    <TableCell align="right" sx={{ border: '1px solid #9CA3AF' }}>
                      <VatInput
                        supplyPrice={m.supplyPrice}
                        value={m.vat}
                        onChange={(vat) => {
                          // 최신 supplyPrice + 입력된 vat 로 total 계산
                          const total = (Number(m.supplyPrice) || 0) + (Number(vat) || 0)

                          updateItemField('costItem', m.id, 'vat', vat)
                          updateItemField('costItem', m.id, 'total', total)
                        }}
                        enableManual={true}
                      />
                    </TableCell>

                    {/* 합계 */}
                    <TableCell align="right" sx={{ border: '1px solid #9CA3AF' }}>
                      <TotalInput supplyPrice={m.supplyPrice} vat={m.vat} />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) => updateItemField('costItem', m.id, 'memo', e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                  <TableCell
                    colSpan={2}
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
                    {getPriceTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getSupplyTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getVatTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getTotalCount().toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #9CA3AF' }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {form.itemType === 'MEAL_FEE' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">식대상세</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('mealListData')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('mealListData')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isAllMealChecked}
                      indeterminate={checkedMealIds.length > 0 && !isAllMealChecked}
                      onChange={(e) => toggleCheckAllItems('mealListData', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['직종', '성명', '구분', '계', '단가', '금액', '비고'].map((label) => (
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
                {mealFeelDetails.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={checkedMealIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('mealListData', m.id, e.target.checked)}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.workType}
                        onChange={(e) =>
                          updateItemField('mealListData', m.id, 'workType', e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ border: '1px solid  #9CA3AF' }}>
                      <div className="flex gap-4">
                        <CommonSelectByName
                          value={m.inputType === 'manual' ? '직접입력' : m.name || '선택'}
                          onChange={async (value) => {
                            if (value === '직접입력') {
                              updateItemField('mealListData', m.id, 'inputType', 'manual')
                              updateItemField('mealListData', m.id, 'name', '') // 직접입력 모드 전환 시 빈 값
                              if (isEditMode === true) {
                                updateItemField('mealListData', m.id, 'laborId', null)
                              } else {
                                updateItemField('mealListData', m.id, 'laborId', null)
                              }
                              return
                            }

                            const selectedProduct = personDataOptions.find(
                              (opt) => opt.name === value,
                            )
                            if (!selectedProduct) return
                            updateItemField('mealListData', m.id, 'inputType', 'select')
                            updateItemField('mealListData', m.id, 'name', selectedProduct.name)
                            updateItemField('mealListData', m.id, 'laborId', selectedProduct.id)
                          }}
                          options={[...personDataOptions, { id: -1, name: '직접입력' }]}
                          onScrollToBottom={() => {
                            if (PersonSearchhasNextPage && !PersonSearchFetching)
                              PersonSearchFetchNextPage()
                          }}
                          onInputChange={(value) => setPersonSearch(value)}
                          loading={PersonSearchLoading}
                        />

                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          value={m.inputType === 'manual' ? m.name : ''} // manual 모드일 때만 값 표시
                          onChange={(e) =>
                            updateItemField('mealListData', m.id, 'name', e.target.value)
                          }
                          variant="outlined"
                          sx={textFieldStyle}
                          disabled={m.inputType !== 'manual'} // manual 모드일 때만 활성화
                        />
                      </div>
                    </TableCell>

                    <TableCell sx={{ border: '1px solid #9CA3AF' }}>
                      {/* 조식 */}
                      <TableRow>
                        <TableCell sx={{ fontSize: '16px', whiteSpace: 'nowrap' }}>조식</TableCell>
                        <TableCell sx={{ borderLeft: '1px solid #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="텍스트 입력"
                            value={Number(m.breakfastCount)}
                            onChange={(e) =>
                              updateItemField(
                                'mealListData',
                                m.id,
                                'breakfastCount',
                                e.target.value,
                              )
                            }
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'black' },
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>

                      {/* 중식 */}
                      <TableRow>
                        <TableCell sx={{ fontSize: '16px', whiteSpace: 'nowrap' }}>중식</TableCell>
                        <TableCell sx={{ borderLeft: '1px solid #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="텍스트 입력"
                            value={Number(m.lunchCount)}
                            onChange={(e) =>
                              updateItemField('mealListData', m.id, 'lunchCount', e.target.value)
                            }
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'black' },
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={Number(m.breakfastCount) + Number(m.lunchCount)}
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                          sx: {
                            textAlign: 'center', // 가운데 정렬
                            input: {
                              textAlign: 'center', // 실제 입력 텍스트도 가운데 정렬
                            },
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black',
                            },
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={formatNumber(m.unitPrice || 0)}
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                          sx: {
                            textAlign: 'center',
                            input: { textAlign: 'center' },
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'black' },
                            '&:hover fieldset': { borderColor: 'black' },
                            '&.Mui-focused fieldset': { borderColor: 'black' },
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={formatNumber(m.amount || 0)}
                        onChange={(e) => {
                          const numericValue =
                            e.target.value === '' ? 0 : Number(unformatNumber(e.target.value))
                          updateItemField('mealListData', m.id, 'amount', numericValue)

                          const peopleCount = Number(m.breakfastCount) + Number(m.lunchCount)

                          let calculatedUnitPrice = peopleCount > 0 ? numericValue / peopleCount : 0
                          calculatedUnitPrice = Math.floor(calculatedUnitPrice) // 소수점 버림

                          updateItemField('mealListData', m.id, 'unitPrice', calculatedUnitPrice)
                        }}
                        variant="outlined"
                        InputProps={{
                          sx: {
                            textAlign: 'center',
                            input: { textAlign: 'center' },
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'black' },
                            '&:hover fieldset': { borderColor: 'black' },
                            '&.Mui-focused fieldset': { borderColor: 'black' },
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) =>
                          updateItemField('mealListData', m.id, 'memo', e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
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
                  ></TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getMealTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getMealPriceTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getMealTotalCount().toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #9CA3AF' }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {form.itemType === 'KEY_MONEY' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold border-b-2 mb-4">전도금 상세</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('keyMoneyList')}
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('keyMoneyList')}
              />
            </div>
          </div>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={isAllKeyMoneyChecked}
                      indeterminate={checkedKeyMoneyIds.length > 0 && !isAllKeyMoneyChecked}
                      onChange={(e) => toggleCheckAllItems('keyMoneyList', e.target.checked)}
                      sx={{ color: 'black' }}
                    />
                  </TableCell>
                  {['계정', '사용목적', '인원수', '금액', '비고'].map((label) => (
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
                {keyMoneyDetails.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={checkedKeyMoneyIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('keyMoneyList', m.id, e.target.checked)}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.account}
                        onChange={(e) =>
                          updateItemField('keyMoneyList', m.id, 'account', e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.purpose}
                        onChange={(e) =>
                          updateItemField('keyMoneyList', m.id, 'purpose', e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        inputMode="numeric"
                        placeholder="숫자 입력"
                        value={m.personnelCount || 0}
                        onChange={(e) => {
                          const numericValue =
                            e.target.value === '' ? '' : unformatNumber(e.target.value)
                          updateItemField('keyMoneyList', m.id, 'personnelCount', numericValue)
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
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        inputMode="numeric"
                        placeholder="숫자 입력"
                        value={formatNumber(m.amount) || 0}
                        onChange={(e) => {
                          const numericValue =
                            e.target.value === '' ? '' : unformatNumber(e.target.value)
                          updateItemField('keyMoneyList', m.id, 'amount', numericValue)
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

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="500자 이하 텍스트 입력"
                        value={m.memo}
                        onChange={(e) =>
                          updateItemField('keyMoneyList', m.id, 'memo', e.target.value)
                        }
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'black', // 기본 테두리 색 검은색
                            },
                            '&:hover fieldset': {
                              borderColor: 'black', // 호버 시에도 검은색 유지
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'black', // 포커스 시에도 검은색 유지
                            },
                          },
                        }}
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
                    {getPersonTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    {getAmountTotal().toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                  ></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

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
                        uploadTarget="MANAGEMENT_COST"
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
            <div className="flex gap-4"></div>
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
          onClick={handleCostSubmit}
        />
      </div>
    </>
  )
}
