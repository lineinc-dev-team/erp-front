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
import { useQueries, useQuery } from '@tanstack/react-query'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CommonInput from '../common/Input'
import CommonSelect from '../common/Select'
import {
  GetLaborStementInfoService,
  LaborSummaryDetailService,
} from '@/services/laborStateMent/laborStateMentService'
import { useLaborSummaryFormStore } from '@/stores/laborStateMentStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import CommonButton from '../common/Button'
import { useLaborStateMentInfo } from '@/hooks/useLaborStateMent'
import { formatDateTime, formatNumber, unformatNumber } from '@/utils/formatters'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import ExcelModal from '../common/ExcelModal'
import { HistoryItem } from '@/types/outsourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import IdNumberModal from '../common/IdNumberModal'

export default function LaborStateMentRegistrationView({ isEditMode = true }) {
  const { setField, form, updateItemField, updateMemo } = useLaborSummaryFormStore()

  const {
    LaborSummarytModifyBtn,
    laborExcelModifyBtn,
    LaborSummaryMemotModifyBtn,
    useLaborStaMentHistoryDataQuery,
  } = useLaborStateMentInfo()

  const {
    sitesOptions,
    setSitesSearch,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명
    setProcessSearch,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
    // 공정명
    processOptions,
  } = useOutSourcingContract()

  const params = useParams()
  const laborSummaryId = Number(params?.id)

  const { data: laborSummaryDetail } = useQuery({
    queryKey: ['LaborSummaryInfo'],
    queryFn: () => LaborSummaryDetailService(laborSummaryId),
    enabled: isEditMode && !!laborSummaryId, // 수정 모드일 때만 fetch
  })

  const laborStateMentList = form.laborStateMentInfo

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
    비고: '메모',
    originalFileName: '파일 추가',
    day01Hours: '제1일 공수',
    day02Hours: '제2일 공수',
    day03Hours: '제3일 공수',
    day04Hours: '제4일 공수',
    day05Hours: '제5일 공수',
    day06Hours: '제6일 공수',
    day07Hours: '제7일 공수',
    day08Hours: '제8일 공수',
    day09Hours: '제9일 공수',
    day10Hours: '제10일 공수',
    day11Hours: '제11일 공수',
    day12Hours: '제12일 공수',
    day13Hours: '제13일 공수',
    day14Hours: '제14일 공수',
    day15Hours: '제15일 공수',
    day16Hours: '제16일 공수',
    day17Hours: '제17일 공수',
    day18Hours: '제18일 공수',
    day19Hours: '제19일 공수',
    day20Hours: '제20일 공수',
    day21Hours: '제21일 공수',
    day22Hours: '제22일 공수',
    day23Hours: '제23일 공수',
    day24Hours: '제24일 공수',
    day25Hours: '제25일 공수',
    day26Hours: '제26일 공수',
    day27Hours: '제27일 공수',
    day28Hours: '제28일 공수',
    day29Hours: '제29일 공수',
    day30Hours: '제30일 공수',
    day31Hours: '제31일 공수',
    totalWorkHours: '총 근무시간',
    totalWorkDays: '총 근무일수',
    totalLaborCost: '총 노무비',
    nationalPension: '국민연금',
    healthInsurance: '건강보험료',
    longTermCareInsurance: '장기요양보험료',
    employmentInsurance: '고용보험료',
    incomeTax: '소득세',
    localTax: '주민세',
    totalDeductions: '총 공제액',
    netPayment: '차감지급 합계',
  }

  const {
    data: laborContractHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLaborStaMentHistoryDataQuery(laborSummaryId, isEditMode)

  const historyList = useLaborSummaryFormStore((state) => state.form.changeHistories)

  interface IdNumberProps {
    open: boolean
    onClose: () => void
    idInfo: {
      laborAccountHolder: string
      laborAccountNumber: string
      laborAddress: string
      laborDetailAddress: string
      laborBankName: string
    } | null
  }

  const [openModal, setOpenModal] = useState(false)

  const [selectedIdInfo, setSelectedIdInfo] = useState<IdNumberProps['idInfo']>(null)

  const editedHistories = useLaborSummaryFormStore((state) => state.form.editedHistories)

  type LaborStatementRow = {
    id: number
    no: number
    type: string
    name: string
    idNumber: string
    company: string
    position: string
    task: string
    dailyWage: number
    totalWorkHours: number
    totalWorkDays: number
    totalDeductions: number
    totalLaborCost: number
    incomeTax: number
    employmentInsurance: number
    healthInsurance: number
    localTax: number
    nationalPension: number
    longTermCareInsurance: number
    netPayment: number
    memo: string
    dailyWork: (number | null)[]
  }

  // 현장명이 지워졌을떄 보이는 로직

  const [updatedSiteOptions, setUpdatedSiteOptions] = useState(sitesOptions)
  const [updatedProcessOptions, setUpdatedProcessOptions] = useState(processOptions)

  console.log('laborSummaryDetail', laborSummaryDetail)

  const laborStateMentExcelFieldMap = {
    이름: 'name',
    주민번호: 'idNumber',
    소속: 'company',
    공종: 'position',
    주작업: 'task',
    일당: 'dailyWage',
    '총 근무시간': 'totalWork',
    '총 근무일수': 'totalDay',
    '노무비 총액': 'totalLaborCost',
    소득세: 'incomeTax',
    고용보험: 'employmentInsurance',
    건강보험: 'healthInsurance',
    주민세: 'localTax',
    국민연금: 'nationalPension',
    장기요양: 'longTermCareInsurance',
    차감지급액: 'netPayment',
    비고: 'memo',
  }

  const [modalOpen, setModalOpen] = useState(false)
  // // userExcelFieldMap 객체를 { label: string, value: string }[] 배열로 바꿔줍니다.
  const fieldMapArray = Object.entries(laborStateMentExcelFieldMap).map(([label, value]) => ({
    label,
    value,
  }))

  const handleDownloadExcel = (fields: string[]) => {
    const exportData = allRows.map((row) => {
      const obj: Record<string, any> = {}

      // 1. 날짜 컬럼 1~31일 항상 포함
      row.dailyWork.forEach((val, idx) => {
        obj[`${idx + 1}일`] = val ?? ''
      })

      // 2. 사용자가 선택한 기본 필드
      fields.forEach((field) => {
        obj[field] = ''
      })

      return obj
    })

    // 3. 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 4. 워크북 생성
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '사용자 관리')

    // 5. 파일 저장
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, '사용자관리.xlsx')
  }

  useEffect(() => {
    if (laborSummaryDetail && isEditMode) {
      const client = laborSummaryDetail.data
      setField('yearMonth', client.yearMonth)
      setField('memo', client.memo)

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
  }, [laborSummaryDetail, isEditMode, sitesOptions, setField])

  useEffect(() => {
    if (isEditMode && laborSummaryDetail) {
      const client = laborSummaryDetail.data

      // 이전 상태 기반으로 새 배열 생성

      const newProcessOptions = [...updatedProcessOptions, ...processOptions]
        .filter((p, index, self) => index === self.findIndex((el) => el.id === p.id)) // id 중복 제거
        .filter((p) => p.id === 0 || p.deleted || (!p.deleted && p.id !== 0)) // 조건 필터링

      if (client.siteProcess) {
        const isDeleted = client.siteProcess.deleted || client.site?.deleted
        const processName = client.siteProcess.name + (isDeleted ? ' (삭제됨)' : '')

        if (!newProcessOptions.some((p) => p.id === client.siteProcess.id)) {
          newProcessOptions.push({
            id: client.siteProcess.id,
            name: processName,
            deleted: isDeleted,
          })
        }

        setField('processId', client.siteProcess.id)
        setField('processName', processName)
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
  }, [laborSummaryDetail, isEditMode, processOptions, setField])

  const TYPES = ['REGULAR_EMPLOYEE', 'DIRECT_CONTRACT', 'ETC'] as const

  function useLaborStatementInfo() {
    return useQueries({
      queries: TYPES.map((type) => ({
        queryKey: ['laborStatementInfo', type, form.yearMonth, form.siteId, form.processId],
        queryFn: () =>
          GetLaborStementInfoService(form.yearMonth, type, form.siteId, form.processId),
        enabled: !!form.yearMonth && form.siteId > 0 && form.processId > 0,
        staleTime: 0,
        cacheTime: 0,
      })),
    })
  }

  const dates = Array.from({ length: 31 }, (_, i) => i + 1)

  // 숫자를 그려주는 변수 0 부터 16
  const firstHalfDates = dates.slice(0, 16) // 1~16
  const secondHalfDates = dates.slice(16, 31) // 16~31

  const results = useLaborStatementInfo()

  const allRows: LaborStatementRow[] = useMemo(() => {
    return results.flatMap((result, typeIdx) => {
      const data = result.data?.data ?? []
      return data.map((item: any, idx: number) => ({
        id: item.id,
        no: idx + 1,
        type: item.labor.type || TYPES[typeIdx],
        name: item.labor.name || '-',
        idNumber: item.labor.residentNumber || '-',
        // 모달에서 사용하는 정보
        accountHolder: item.labor.accountHolder,
        accountNumber: item.labor.accountNumber,
        address: item.labor.address,
        detailAddress: item.labor.detailAddress,
        bankName: item.labor.bankName,

        company: item.labor.outsourcingCompany?.name || '-',
        position: item.labor.workType || '-',
        task: item.labor.mainWork || '-',
        dailyWage: item.dailyWage ?? 0,
        totalWorkHours: item.totalWorkHours ?? 0,
        totalWorkDays: item.totalWorkDays ?? 0,
        totalDeductions: item.totalDeductions ?? 0,
        totalLaborCost: item.totalLaborCost ?? 0,
        incomeTax: item.incomeTax ?? 0,
        employmentInsurance: item.employmentInsurance ?? 0,
        healthInsurance: item.healthInsurance ?? 0,
        localTax: item.localTax ?? 0,
        nationalPension: item.nationalPension ?? 0,
        longTermCareInsurance: item.longTermCareInsurance ?? 0,
        netPayment: item.netPayment ?? 0,
        memo: item.memo ?? '',
        dailyWork: Array.from(
          { length: 31 },
          (_, i) => item[`day${String(i + 1).padStart(2, '0')}Hours`] ?? null,
        ),
      }))
    })
  }, [results])

  console.log('allRowsallRows', form.laborStateMentInfo)

  useEffect(() => {
    if (allRows.length) {
      const isDifferent = JSON.stringify(form.laborStateMentInfo) !== JSON.stringify(allRows)
      if (isDifferent) {
        setField('laborStateMentInfo', allRows)
      }
    }
  }, [setField, isEditMode])

  useEffect(() => {
    if (!form.laborStateMentInfo?.length && allRows.length) {
      setField('laborStateMentInfo', allRows)
      return
    }

    if (isEditMode && !form.laborStateMentInfo?.length && allRows.length) {
      setField('laborStateMentInfo', allRows)
    }
  }, [allRows, form.laborStateMentInfo])

  // 항상 최신 allRows를 반영하도록 수정
  // allRows는 form 데이터를 기준으로 계산
  const allSumeRows = useMemo(() => {
    if (!form.laborStateMentInfo) return []
    return form.laborStateMentInfo.map((item) => ({
      ...item,
      dailyWork: item.dailyWork.map((v: any) => v ?? 0),
    }))
  }, [form.laborStateMentInfo])

  // 실시간 합계 계산
  const dailyEmployee = useMemo(() => {
    const result = Array(31).fill(0)
    allSumeRows
      .filter((row) => row.type === '정직원')
      .forEach((row) => {
        row.dailyWork.forEach((val: any, idx: number) => {
          result[idx] += Number(val)
        })
      })
    return result
  }, [allSumeRows])

  const dailyContract = useMemo(() => {
    const result = Array(31).fill(0)
    allSumeRows
      .filter((row) => row.type === '직영/계약직')
      .forEach((row) => {
        row.dailyWork.forEach((val: any, idx: number) => {
          result[idx] += Number(val)
        })
      })
    return result
  }, [allSumeRows])

  const dailySums = useMemo(() => {
    const result = Array(31).fill(0)
    allSumeRows
      .filter((row) => row.type === '기타')
      .forEach((row) => {
        row.dailyWork.forEach((val: any, idx: number) => {
          result[idx] += Number(val)
        })
      })
    return result
  }, [allSumeRows])

  // 합계 계산

  // 1. 합계 계산
  const laborTotalsByType = useMemo(() => {
    if (!form.laborStateMentInfo) return {}

    const types = ['정직원', '직영/계약직', '기타']

    const result: Record<string, any> = {}

    types.forEach((type) => {
      const filtered = form.laborStateMentInfo.filter((item) => item.type === type)

      result[type] = filtered.reduce(
        (acc, item) => {
          acc.totalWorkHours += Number(item.totalWorkHours || 0)
          acc.totalWorkDays += Number(item.totalWorkDays || 0)
          acc.totalDeductions += Number(item.totalDeductions || 0)
          acc.totalLaborCost += Number(item.totalLaborCost || 0)
          acc.incomeTax += Number(item.incomeTax || 0)
          acc.employmentInsurance += Number(item.employmentInsurance || 0)
          acc.healthInsurance += Number(item.healthInsurance || 0)
          acc.localTax += Number(item.localTax || 0)
          acc.nationalPension += Number(item.nationalPension || 0)
          acc.longTermCareInsurance += Number(item.longTermCareInsurance || 0)
          acc.netPayment += Number(item.netPayment || 0)
          return acc
        },
        {
          totalWorkHours: 0,
          totalWorkDays: 0,
          totalDeductions: 0,
          totalLaborCost: 0,
          incomeTax: 0,
          employmentInsurance: 0,
          healthInsurance: 0,
          localTax: 0,
          nationalPension: 0,
          longTermCareInsurance: 0,
          netPayment: 0,
        },
      )
    })

    return result
  }, [form.laborStateMentInfo])

  const headerCellStyle = {
    backgroundColor: '#c8c7c7',
    border: '1px solid #ced2d9',
    fontSize: '0.75rem', // 글자 작게
    fontWeight: 'bold', // 글자 두껍게
    padding: '2px 4px', // 위아래 2px, 좌우 4px
    lineHeight: 1, // 줄 간격 최소화
    height: '30px',
  }

  const dayCellStyle = {
    border: '1px solid #ced2d9',
    fontSize: '0.75rem', // 글자 작게
    fontWeight: 'bold', // 글자 두껍게
    padding: '2px 4px', // 위아래 2px, 좌우 4px
    lineHeight: 2, // 줄 간격 최소화
    width: '30px',
    height: '40px',
  }

  const contentCellStyle = {
    border: '1px solid #a3a3a3',
    fontSize: '0.75rem', // 글자 작게
    fontWeight: 'bold', // 글자 두껍게
    padding: '2px 4px', // 위아래 2px, 좌우 4px
    lineHeight: 2, // 줄 간격 최소화
    width: '40px',
    height: '40px',
  }

  console.log('allwor', laborStateMentList)

  const [originalMemo, setOriginalMemo] = useState<string>('')

  useEffect(() => {
    if (laborSummaryDetail) {
      setOriginalMemo(laborSummaryDetail.data.memo ?? '')
    }
  }, [laborSummaryDetail])

  const handleLaborSummarySubmit = () => {
    if (!isEditMode) return

    if (window.confirm('수정하시겠습니까?')) {
      const isMemoChanged = form.memo !== originalMemo

      if (isMemoChanged) {
        LaborSummarytModifyBtn.mutate(laborSummaryId)
      }

      laborExcelModifyBtn.mutate()

      editedHistories?.forEach((item) => {
        LaborSummaryMemotModifyBtn.mutate({
          id: item.id,
          memo: item.memo,
        })
      })
    }
  }

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
                : `${propertyKo}${before} => ${after}`}
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
      console.log(
        'outsourcingContractHistoryListoutsourcingContractHistoryList',
        laborContractHistoryList,
      )
      const allHistories = laborContractHistoryList.pages.flatMap((page) =>
        page.data.content.map((item: HistoryItem) => ({
          id: item.id,
          type: item.type,
          content: formatChangeDetail(item.getChanges), // 여기 변경
          createdAt: item.createdAt,
          description: item.description,
          updatedAt: item.updatedAt,
          updatedBy: item.updatedBy,
          memo: item.memo ?? '',
        })),
      )
      setField('changeHistories', allHistories)
      console.log('allHistoriesallHistoriesallHistories', allHistories)
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

  const totalEmployment = laborTotalsByType['정직원']
  const totalContract = laborTotalsByType['직영/계약직']
  const totalEtc = laborTotalsByType['기타']

  return (
    <>
      <div className="mb-10">
        <span className="font-bold border-b-2 mb-4">기본 정보</span>
        <div className="grid grid-cols-2 mt-1">
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

                  // 현장 선택값 세팅
                  setField('siteId', selectedSite.id)
                  setField(
                    'siteName',
                    selectedSite.name + (selectedSite.deleted ? ' (삭제됨)' : ''),
                  )

                  if (selectedSite.deleted === false) {
                    // 일반 현장은 API로 공정 목록 가져오기
                    const res = await SitesProcessNameScroll({
                      pageParam: 0,
                      siteId: selectedSite.id,
                      keyword: '',
                    })
                    const processes = res.data?.content || []

                    console.log('현재 processesprocesses!', processes)

                    if (processes.length > 0) {
                      setField('processId', processes[0].id)
                      setField('processName', processes[0].name)
                    } else {
                      setField('processId', 0)
                      setField('processName', '')
                    }
                  }
                }}
                options={updatedSiteOptions}
                onScrollToBottom={() => {
                  if (siteNamehasNextPage && !siteNameFetching) siteNameFetchNextPage()
                }}
                onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
                disabled
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
                value={form.processId || 0}
                onChange={(value) => {
                  const selectedProcess = updatedProcessOptions.find((opt) => opt.name === value)
                  if (selectedProcess) {
                    setField('processId', selectedProcess.id)
                    setField('processName', selectedProcess.name)
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
            <label className="w-36 text-[14px]  border border-gray-400 flex items-center justify-center bg-gray-300  font-bold text-center">
              조회 월
            </label>
            <div className="border border-gray-400 flex items-center px-2 w-full">
              <CommonInput
                value={form.yearMonth ?? ''}
                onChange={(value) => setField('yearMonth', value)}
                className=" flex-1"
                placeholder="텍스트 입력"
                disabled
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

      <div className="flex flex-row-reverse">
        <ExcelModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="사용자 관리 - 엑셀 항목 선택"
          fieldMap={fieldMapArray}
          onDownload={handleDownloadExcel}
        />
      </div>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '70vh',
          marginTop: '30px',
          overflowX: 'auto', // 가로 스크롤 활성화
        }}
      >
        <Table stickyHeader sx={{ minWidth: '1500px' }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                No
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                구분
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                이름
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 140 }}>
                주민번호
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                소속
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                공종
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                주작업
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                일당
              </TableCell>

              {firstHalfDates.map((date) => (
                <TableCell
                  key={date}
                  align="center"
                  sx={{ ...headerCellStyle, minWidth: 60 }} // 날짜 열 너비 확보
                >
                  {date}
                </TableCell>
              ))}

              {/* 합계 컬럼 */}
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                총 공수
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                총 일수
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                총 공제액
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                노무비 총액
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                소득세
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                고용보험
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                건강보험
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                주민세
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                국민연금
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                장기요양
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                차감지급액
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 120 }}>
                비고
              </TableCell>
            </TableRow>

            {/* 두 번째 행: 16~31일 */}
            <TableRow>
              {secondHalfDates.map((date) => (
                <TableCell
                  key={date}
                  align="center"
                  sx={{
                    ...headerCellStyle,
                    minWidth: 60,
                    position: 'sticky',
                    top: 30,
                  }}
                >
                  {date}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {laborStateMentList.filter((item) => item.type === '정직원').length > 0 && (
            <TableBody>
              {laborStateMentList
                .filter((item) => item.type === '정직원')
                .map((row) => {
                  const firstHalf = row.dailyWork.slice(0, 16)
                  const secondHalf = row.dailyWork.slice(16)

                  return (
                    <Fragment key={row.no}>
                      {/* 첫 번째 행 */}
                      <TableRow>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.no}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.type}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.name}
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{
                            cursor: 'pointer',
                            textDecoration: 'underline',

                            border: '1px solid #a3a3a3',
                            fontSize: '0.75rem', // 글자 작게
                            fontWeight: 'bold', // 글자 두껍게
                            padding: '2px 4px', // 위아래 2px, 좌우 4px
                            lineHeight: 2, // 줄 간격 최소화
                            width: '40px',
                            height: '40px',
                          }}
                          onClick={() => {
                            setSelectedIdInfo({
                              laborAccountHolder: row.accountHolder,
                              laborAccountNumber: row.accountNumber,
                              laborAddress: row.address,
                              laborDetailAddress: row.detailAddress,
                              laborBankName: row.bankName,
                            })
                            setOpenModal(true)
                          }}
                        >
                          {row.idNumber}
                        </TableCell>

                        <IdNumberModal
                          open={openModal}
                          onClose={() => setOpenModal(false)}
                          idInfo={selectedIdInfo}
                        />

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.company}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.position}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.task}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.dailyWage) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('REGULAR_EMPLOYEE', row.id, 'dailyWage', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        {firstHalf.map((val: any, idx: number) => (
                          <TableCell key={idx} align="center" sx={dayCellStyle}>
                            <TextField
                              size="small"
                              type="number" // type을 number로 변경
                              inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                              value={val ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const numericValue = value === '' ? null : parseFloat(value)

                                // dailyWork 배열 idx 위치 업데이트
                                updateItemField(
                                  'REGULAR_EMPLOYEE',
                                  row.id,
                                  `dailyWork.${idx}`,
                                  numericValue,
                                )
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                '& .MuiInputBase-root': {
                                  height: '100%',
                                  fontSize: '0.75rem',
                                },
                                '& input': {
                                  textAlign: 'center',
                                  padding: '4px',
                                  MozAppearance: 'textfield', // Firefox
                                  '&::-webkit-outer-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                            />
                          </TableCell>
                        ))}

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalWorkHours) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'totalWorkHours',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalWorkDays) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'totalWorkDays',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalDeductions) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'totalDeductions',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalLaborCost) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'totalLaborCost',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.incomeTax) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('REGULAR_EMPLOYEE', row.id, 'incomeTax', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.employmentInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'employmentInsurance',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.healthInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'healthInsurance',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.localTax) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('REGULAR_EMPLOYEE', row.id, 'localTax', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.nationalPension) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'nationalPension',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.longTermCareInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'longTermCareInsurance',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.netPayment) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'REGULAR_EMPLOYEE',
                                row.id,
                                'netPayment',
                                numericValue,
                              )
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={row.memo ?? ''}
                            onChange={(e) =>
                              updateItemField('REGULAR_EMPLOYEE', row.id, 'memo', e.target.value)
                            }
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        {secondHalf.map((val: any, idx: number) => (
                          <TableCell key={idx + 17} align="center" sx={dayCellStyle}>
                            <TextField
                              size="small"
                              type="number" // number로 변경
                              inputProps={{ step: 0.1, min: 0 }} // 소수점 입력 허용, 음수 방지
                              value={val ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const numericValue = value === '' ? null : parseFloat(value)

                                // dailyWork 배열 전체에서 idx+16 위치 업데이트
                                updateItemField(
                                  'REGULAR_EMPLOYEE',
                                  row.id,
                                  `dailyWork.${idx + 16}`,
                                  numericValue,
                                )
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                '& .MuiInputBase-root': {
                                  height: '100%',
                                  fontSize: '0.75rem',
                                },
                                '& input': {
                                  textAlign: 'center',
                                  padding: '4px',

                                  // 숫자형 스핀 버튼 제거
                                  MozAppearance: 'textfield', // Firefox
                                  '&::-webkit-outer-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  )
                })}
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {/* 소계: rowSpan=2로 합치기 */}
                <TableCell
                  rowSpan={2}
                  colSpan={8}
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                >
                  소계
                </TableCell>

                {/* 1~16일 합계 */}
                {dailyEmployee.slice(0, 16).map((sum, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                  >
                    {sum}
                  </TableCell>
                ))}
                {[
                  totalEmployment.totalWorkHours,
                  totalEmployment.totalWorkDays,
                  totalEmployment.totalDeductions,
                  totalEmployment.totalLaborCost,
                  totalEmployment.incomeTax,
                  totalEmployment.employmentInsurance,
                  totalEmployment.healthInsurance,
                  totalEmployment.localTax,
                  totalEmployment.nationalPension,
                  totalEmployment.longTermCareInsurance,
                  totalEmployment.netPayment,
                ].map((value, idx) => (
                  <TableCell
                    key={idx}
                    rowSpan={2}
                    align="center"
                    sx={{
                      border: '1px solid #9CA3AF',
                      backgroundColor: '#F3F4F6',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatNumber(value) || 0}
                  </TableCell>
                ))}
              </TableRow>

              {/* 16일 부터 31일 까지*/}
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {dailyEmployee.slice(16).map((sum, idx) => (
                  <TableCell
                    key={idx + 16}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                  >
                    {sum}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          )}
          {laborStateMentList.filter((item) => item.type === '직영/계약직').length > 0 && (
            <TableBody>
              {laborStateMentList
                .filter((item) => item.type === '직영/계약직')
                .map((row) => {
                  const firstHalf = row.dailyWork.slice(0, 16)
                  const secondHalf = row.dailyWork.slice(16)

                  return (
                    <Fragment key={row.no}>
                      {/* 첫 번째 행 */}
                      <TableRow>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.no}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.type}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.name}
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{
                            cursor: 'pointer',
                            textDecoration: 'underline',

                            border: '1px solid #a3a3a3',
                            fontSize: '0.75rem', // 글자 작게
                            fontWeight: 'bold', // 글자 두껍게
                            padding: '2px 4px', // 위아래 2px, 좌우 4px
                            lineHeight: 2, // 줄 간격 최소화
                            width: '40px',
                            height: '40px',
                          }}
                          onClick={() => {
                            setSelectedIdInfo({
                              laborAccountHolder: row.accountHolder,
                              laborAccountNumber: row.accountNumber,
                              laborAddress: row.address,
                              laborDetailAddress: row.detailAddress,
                              laborBankName: row.bankName,
                            })
                            setOpenModal(true)
                          }}
                        >
                          {row.idNumber}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.company}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.position}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.task}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.dailyWage) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('DIRECT_CONTRACT', row.id, 'dailyWage', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        {firstHalf.map((val: any, idx: number) => (
                          <TableCell key={idx} align="center" sx={dayCellStyle}>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ step: 0.1, min: 0 }}
                              value={val ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const numericValue = value === '' ? null : parseFloat(value)
                                updateItemField(
                                  'DIRECT_CONTRACT',
                                  row.id,
                                  `dailyWork.${idx}`,
                                  numericValue,
                                )
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                '& .MuiInputBase-root': {
                                  height: '100%',
                                  fontSize: '0.75rem',
                                },
                                '& input': {
                                  textAlign: 'center',
                                  padding: '4px',

                                  // 숫자 스핀 버튼 제거
                                  MozAppearance: 'textfield', // Firefox
                                  '&::-webkit-outer-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                            />
                          </TableCell>
                        ))}

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.totalWorkHours) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'totalWorkHours',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        {/* 합계 컬럼 */}
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.totalWorkDays) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'totalWorkDays',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.totalDeductions) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'totalDeductions',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.totalLaborCost) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'totalLaborCost',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.incomeTax) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('DIRECT_CONTRACT', row.id, 'incomeTax', numericValue)
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.employmentInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'employmentInsurance',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.healthInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'healthInsurance',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.localTax) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('DIRECT_CONTRACT', row.id, 'localTax', numericValue)
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.nationalPension) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'nationalPension',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.longTermCareInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField(
                                'DIRECT_CONTRACT',
                                row.id,
                                'longTermCareInsurance',
                                numericValue,
                              )
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={formatNumber(row.netPayment) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('DIRECT_CONTRACT', row.id, 'netPayment', numericValue)
                            }}
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            value={row.memo ?? ''}
                            onChange={(e) =>
                              updateItemField('DIRECT_CONTRACT', row.id, 'memo', e.target.value)
                            }
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        {secondHalf.map((val: any, idx: number) => (
                          <TableCell key={idx + 17} align="center" sx={dayCellStyle}>
                            <TextField
                              size="small"
                              type="number" // number로 변경
                              inputProps={{ step: 0.1, min: 0 }} // 소수점 입력 허용, 음수 방지
                              value={val ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const numericValue = value === '' ? null : parseFloat(value)

                                // dailyWork 배열 전체에서 idx+16 위치 업데이트
                                updateItemField(
                                  'DIRECT_CONTRACT',
                                  row.id,
                                  `dailyWork.${idx + 16}`,
                                  numericValue,
                                )
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                '& .MuiInputBase-root': {
                                  height: '100%',
                                  fontSize: '0.75rem',
                                },
                                '& input': {
                                  textAlign: 'center',
                                  padding: '4px',

                                  // 숫자형 스핀 버튼 제거
                                  MozAppearance: 'textfield', // Firefox
                                  '&::-webkit-outer-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  )
                })}
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {/* 소계: rowSpan=2로 합치기 */}
                <TableCell
                  rowSpan={2}
                  colSpan={8}
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                >
                  소계
                </TableCell>

                {/* 1~15일 합계 */}
                {dailyContract.slice(0, 16).map((sum, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                  >
                    {sum}
                  </TableCell>
                ))}

                {[
                  totalContract.totalWorkHours,
                  totalContract.totalWorkDays,
                  totalContract.totalDeductions,
                  totalContract.totalLaborCost,
                  totalContract.incomeTax,
                  totalContract.employmentInsurance,
                  totalContract.healthInsurance,
                  totalContract.localTax,
                  totalContract.nationalPension,
                  totalContract.longTermCareInsurance,
                  totalContract.netPayment,
                ].map((value, idx) => (
                  <TableCell
                    key={idx}
                    rowSpan={2}
                    align="center"
                    sx={{
                      border: '1px solid #9CA3AF',
                      backgroundColor: '#F3F4F6',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatNumber(value) || 0}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {dailyContract.slice(16).map((sum, idx) => (
                  <TableCell
                    key={idx + 16}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                  >
                    {sum}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          )}
          {laborStateMentList.filter((item) => item.type === '기타').length > 0 && (
            <TableBody>
              {laborStateMentList
                .filter((item) => item.type === '기타')
                .map((row) => {
                  const firstHalf = row.dailyWork.slice(0, 16)
                  const secondHalf = row.dailyWork.slice(16)

                  return (
                    <Fragment key={row.no}>
                      {/* 첫 번째 행 */}
                      <TableRow>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.no}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.type}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.name}
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => {
                            setSelectedIdInfo({
                              laborAccountHolder: row.accountHolder,
                              laborAccountNumber: row.accountNumber,
                              laborAddress: row.address,
                              laborDetailAddress: row.detailAddress,
                              laborBankName: row.bankName,
                            })
                            setOpenModal(true)
                          }}
                        >
                          {row.idNumber}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.company}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.position}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.task}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.dailyWage) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'dailyWage', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        {firstHalf.map((val: any, idx: number) => (
                          <TableCell key={idx} align="center" sx={dayCellStyle}>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{ step: 0.1, min: 0 }}
                              value={val ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const numericValue = value === '' ? null : parseFloat(value)
                                updateItemField('ETC', row.id, `dailyWork.${idx}`, numericValue)
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                '& .MuiInputBase-root': {
                                  height: '100%',
                                  fontSize: '0.75rem',
                                },
                                '& input': {
                                  textAlign: 'center',
                                  padding: '4px',

                                  // 숫자 스핀 버튼 제거
                                  MozAppearance: 'textfield', // Firefox
                                  '&::-webkit-outer-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                            />
                          </TableCell>
                        ))}
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalWorkHours) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'totalWorkHours', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        {/* 합계 컬럼 */}
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalWorkDays) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'totalWorkDays', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalDeductions) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'totalDeductions', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.totalLaborCost) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'totalLaborCost', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.incomeTax) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'incomeTax', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.employmentInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'employmentInsurance', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.healthInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'healthInsurance', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.localTax) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'localTax', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.nationalPension) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'nationalPension', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.longTermCareInsurance) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'longTermCareInsurance', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={formatNumber(row.netPayment) ?? ''}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('ETC', row.id, 'netPayment', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          <TextField
                            size="small"
                            type="text"
                            value={row.memo ?? ''}
                            onChange={(e) => {
                              const numericValue = e.target.value
                              updateItemField('ETC', row.id, 'memo', numericValue)
                            }}
                            // 부모 셀에 꽉 차도록
                            sx={{
                              width: '100%',
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '0.75rem', // 글자 크기 줄이기
                              },
                              '& input': {
                                textAlign: 'center', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        {secondHalf.map((val: any, idx: number) => (
                          <TableCell key={idx + 17} align="center" sx={dayCellStyle}>
                            <TextField
                              size="small"
                              type="number" // number로 변경
                              inputProps={{ step: 0.1, min: 0 }} // 소수점 입력 허용, 음수 방지
                              value={val ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                const numericValue = value === '' ? null : parseFloat(value)

                                // dailyWork 배열 전체에서 idx+16 위치 업데이트
                                updateItemField(
                                  'ETC',
                                  row.id,
                                  `dailyWork.${idx + 16}`,
                                  numericValue,
                                )
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                '& .MuiInputBase-root': {
                                  height: '100%',
                                  fontSize: '0.75rem',
                                },
                                '& input': {
                                  textAlign: 'center',
                                  padding: '4px',

                                  // 숫자형 스핀 버튼 제거
                                  MozAppearance: 'textfield', // Firefox
                                  '&::-webkit-outer-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    // Chrome, Safari
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  )
                })}
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {/* 소계: rowSpan=2로 합치기 */}
                <TableCell
                  rowSpan={2}
                  colSpan={8}
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                >
                  소계
                </TableCell>

                {/* 1~15일 합계 */}
                {dailySums.slice(0, 16).map((sum, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                  >
                    {sum}
                  </TableCell>
                ))}
                {[
                  totalEtc.totalWorkHours,
                  totalEtc.totalWorkDays,
                  totalEtc.totalDeductions,
                  totalEtc.totalLaborCost,
                  totalEtc.incomeTax,
                  totalEtc.employmentInsurance,
                  totalEtc.healthInsurance,
                  totalEtc.localTax,
                  totalEtc.nationalPension,
                  totalEtc.longTermCareInsurance,
                  totalEtc.netPayment,
                ].map((value, idx) => (
                  <TableCell
                    key={idx}
                    rowSpan={2}
                    align="center"
                    sx={{
                      border: '1px solid #9CA3AF',
                      backgroundColor: '#F3F4F6',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatNumber(value) || 0}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {/* 16~31일 합계 */}
                {/* 15로 바꿔야함!! */}
                {dailySums.slice(16).map((sum, idx) => (
                  <TableCell
                    key={idx + 16}
                    align="center"
                    sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                  >
                    {sum}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
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
                      sx={{
                        border: '1px solid #9CA3AF',
                        whiteSpace: 'pre-line',
                        verticalAlign: 'top',
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
        {/* <CommonButton label="취소" variant="reset" className="px-10" onClick={outsourcingCancel} /> */}
        <CommonButton
          label={'+ 수정'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleLaborSummarySubmit}
        />
      </div>
    </>
  )
}
