/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  Button,
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
import * as XLSX from 'xlsx-js-style'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { HistoryItem } from '@/types/ordering'
import { myInfoProps } from '@/types/user'
import { useMenuPermission } from '../common/MenuPermissionView'

export default function LaborStateMentRegistrationView({ isEditMode = true }) {
  const { setField, form, updateItemField, updateMemo } = useLaborSummaryFormStore()

  const {
    LaborSummarytModifyBtn,
    laborExcelModifyBtn,
    laborStateMentCancel,
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
    queryKey: ['LaborStateInfo'],
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
    address: '주소',
    detailAddress: '상세주소',
    bankName: '은행명',
    accountNumber: '계좌번호',
    accountHolder: '예금주',
    memo: '메모',
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

  // const [openModal, setOpenModal] = useState(false)

  // const [selectedIdInfo, setSelectedIdInfo] = useState<IdNumberProps['idInfo']>(null)

  const editedHistories = useLaborSummaryFormStore((state) => state.form.editedHistories)

  type LaborStatementRow = {
    id: number
    no: number
    type: string
    name: string
    idNumber: string
    address: string
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
    phone: string
    bank: string
    account: string
    accountName: string
  }

  // 현장명이 지워졌을떄 보이는 로직

  const [updatedSiteOptions, setUpdatedSiteOptions] = useState(sitesOptions)
  const [updatedProcessOptions, setUpdatedProcessOptions] = useState(processOptions)

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
            startedAt: '',
            endedAt: '',
          })
        }
      }

      // 삭제된 현장 / 일반 현장 분리
      const deletedSites = newSiteOptions.filter((s) => s.deleted)
      const normalSites = newSiteOptions.filter((s) => !s.deleted && s.id !== 0)

      // 최종 옵션 배열 세팅
      setUpdatedSiteOptions([
        newSiteOptions.find((s) => s.id === 0) ?? {
          id: 0,
          name: '선택',
          startedAt: '',
          endedAt: '',
          deleted: false,
        },
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

  const TYPES = ['DIRECT_CONTRACT', 'OUTSOURCING'] as const

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
  const firstHalfDates = [...dates.slice(0, 15), '']
  const secondHalfDates = dates.slice(15, 31) // 16~31

  const results = useLaborStatementInfo()

  const allRows: LaborStatementRow[] = useMemo(() => {
    return results.flatMap((result, typeIdx) => {
      const data = result.data?.data ?? []
      return data.map((item: any, idx: number) => ({
        id: item.id,
        no: idx + 1,
        name: item.labor.name || '-',
        idNumber: item.labor.residentNumber || '-',
        position: item.labor.workType || '-',
        type: item.labor.type || TYPES[typeIdx],
        address: item.labor.address,
        task: item.labor.mainWork || '-',

        // 모달에서 사용하는 정보
        accountName: item.labor.accountHolder,
        account: item.labor.accountNumber,
        detailAddress: item.labor.detailAddress,
        bank: item.labor.bankName,

        phone: item.labor.phoneNumber,

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
      .filter((row) => row.type === '용역')
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
      .filter((row) => row.type === '직영')
      .forEach((row) => {
        row.dailyWork.forEach((val: any, idx: number) => {
          result[idx] += Number(val)
        })
      })
    return result
  }, [allSumeRows])

  // const dailySums = useMemo(() => {
  //   const result = Array(31).fill(0)
  //   allSumeRows
  //     .filter((row) => row.type === '기타')
  //     .forEach((row) => {
  //       row.dailyWork.forEach((val: any, idx: number) => {
  //         result[idx] += Number(val)
  //       })
  //     })
  //   return result
  // }, [allSumeRows])

  // 합계 계산

  // 1. 합계 계산
  const laborTotalsByType = useMemo(() => {
    if (!form.laborStateMentInfo) return {}

    const types = ['용역', '직영', '기타']

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
          acc.localTax += Number(item.localTax || 0)

          acc.employmentInsurance += Number(item.employmentInsurance || 0)
          acc.healthInsurance += Number(item.healthInsurance || 0)
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
    padding: '2px', // 위아래 2px, 좌우 4px
    lineHeight: 1, // 줄 간격 최소화
    height: '30px',
  }

  const dayCellStyle = {
    border: '1px solid #ced2d9',
    fontSize: '0.75rem', // 글자 작게
    padding: '1px', // 위아래 2px, 좌우 4px
    lineHeight: 2, // 줄 간격 최소화
    height: '30px',
  }

  const contentCellStyle = {
    border: '1px solid #a3a3a3',
    fontSize: '0.75rem', // 글자 작게
    padding: '2px', // 위아래 2px, 좌우 4px
    lineHeight: 2, // 줄 간격 최소화
    width: '40px',
    height: '40px',
  }

  const [originalMemo, setOriginalMemo] = useState<string>('')

  useEffect(() => {
    if (laborSummaryDetail) {
      setOriginalMemo(laborSummaryDetail.data.memo ?? '')
    }
  }, [laborSummaryDetail])

  useEffect(() => {
    if (!allRows.length) return // allRows가 없으면 아무 것도 하지 않음

    // form 데이터가 비어있거나 allRows와 내용이 다르면 업데이트
    const isDifferent = form.laborStateMentInfo.length !== allRows.length

    if (isDifferent) {
      setField('laborStateMentInfo', allRows)
    }
  }, [form.laborStateMentInfo, allRows])

  useEffect(() => {
    if (!allRows.length) return

    // form.laborStateMentInfo가 비어있을 때만 초기 세팅
    if (!form.laborStateMentInfo?.length) {
      setField('laborStateMentInfo', allRows)
    }
  }, [allRows, setField, form.laborStateMentInfo])

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

  const totalEmployment = laborTotalsByType['용역']
  const totalContract = laborTotalsByType['직영']
  // const totalEtc = laborTotalsByType['기타']

  const typeName = laborStateMentList.filter((item) => item.type === '직영').length

  const handleExcelDownload = () => {
    // 날짜 컬럼
    const dateColumns = Array.from({ length: 31 }, (_, i) => i + 1)

    // 헤더 2줄
    const headerRow1 = [
      'No',
      '성명',
      '주민번호',
      '직종',
      '팀명칭',
      '주소',
      '주작업',
      '일당',
      ...dateColumns.slice(0, 15),
      '', // 1~15일 + 16일 빈칸
      '총 공수',
      '총 일수',
      '노무비 총액',
      '소득세',
      '주민세',
      '고용보험',
      '건강보험',
      '장기요양',
      '국민연금',
      '공제합계',
      '차감지급액',
      '휴대전화',
      '은행명',
      '계좌번호',
      '예금주',
    ]
    const headerRow2 = [...Array(8).fill(''), ...dateColumns.slice(15, 31), ...Array(15).fill('')]

    const formatNumberWithComma = (num: number | string) => {
      const n = Number(num) || 0
      return n.toLocaleString() // , 구분
    }

    // 데이터 행
    const dataRows: any[][] = []
    allRows.forEach((r) => {
      const row1 = [
        r.no,
        r.name,
        r.idNumber,
        r.position,
        r.type,
        r.address,

        r.task,
        formatNumberWithComma(r.dailyWage),
        ...r.dailyWork.slice(0, 15),
        '', // 1~15일 + 16일 빈칸
        formatNumberWithComma(r.totalWorkHours),
        formatNumberWithComma(r.totalWorkDays),
        formatNumberWithComma(r.totalLaborCost),
        formatNumberWithComma(r.incomeTax),
        formatNumberWithComma(r.localTax),
        formatNumberWithComma(r.employmentInsurance),
        formatNumberWithComma(r.healthInsurance),
        formatNumberWithComma(r.longTermCareInsurance),
        formatNumberWithComma(r.nationalPension),
        formatNumberWithComma(r.totalDeductions),
        formatNumberWithComma(r.netPayment),

        r.phone,
        r.bank,
        r.account,
        r.accountName,
      ]
      const row2 = [...Array(8).fill(''), ...r.dailyWork.slice(15, 31), ...Array(15).fill('')]
      dataRows.push(row1, row2)
    })

    // 합계 행
    const sum = {
      totalWorkHours: allRows.reduce((acc, r) => acc + (Number(r.totalWorkHours) || 0), 0),
      totalWorkDays: allRows.reduce((acc, r) => acc + (Number(r.totalWorkDays) || 0), 0),
      totalLaborCost: allRows.reduce((acc, r) => acc + (Number(r.totalLaborCost) || 0), 0),
      incomeTax: allRows.reduce((acc, r) => acc + (Number(r.incomeTax) || 0), 0),
      localTax: allRows.reduce((acc, r) => acc + (Number(r.localTax) || 0), 0),
      employmentInsurance: allRows.reduce(
        (acc, r) => acc + (Number(r.employmentInsurance) || 0),
        0,
      ),
      healthInsurance: allRows.reduce((acc, r) => acc + (Number(r.healthInsurance) || 0), 0),
      longTermCareInsurance: allRows.reduce(
        (acc, r) => acc + (Number(r.longTermCareInsurance) || 0),
        0,
      ),
      nationalPension: allRows.reduce((acc, r) => acc + (Number(r.nationalPension) || 0), 0),
      totalDeductions: allRows.reduce((acc, r) => acc + (Number(r.totalDeductions) || 0), 0),
      netPayment: allRows.reduce((acc, r) => acc + (Number(r.netPayment) || 0), 0),
    }

    const sumRow1 = [
      '소계',
      ...Array(7).fill(''),
      ...Array.from({ length: 15 }, (_, i) =>
        allRows.reduce((acc, r) => acc + (Number(r.dailyWork[i]) || 0), 0),
      ),
      '',

      formatNumberWithComma(sum.totalWorkHours),
      formatNumberWithComma(sum.totalWorkDays),
      formatNumberWithComma(sum.totalLaborCost),
      formatNumberWithComma(sum.incomeTax),
      formatNumberWithComma(sum.localTax),
      formatNumberWithComma(sum.employmentInsurance),
      formatNumberWithComma(sum.healthInsurance),
      formatNumberWithComma(sum.longTermCareInsurance),
      formatNumberWithComma(sum.nationalPension),
      formatNumberWithComma(sum.totalDeductions),
      formatNumberWithComma(sum.netPayment),

      '',
      '',
      '',
      '', // 휴대전화, 은행명, 계좌번호, 예금주
    ]
    const sumRow2 = [
      ...Array(8).fill(''),
      ...Array.from({ length: 16 }, (_, i) =>
        allRows.reduce((acc, r) => acc + (Number(r.dailyWork[i + 15]) || 0), 0),
      ),
      ...Array(14).fill(''),
    ]

    // 시트 데이터
    const sheetAoA = [headerRow1, headerRow2, ...dataRows, sumRow1, sumRow2]
    const worksheet = XLSX.utils.aoa_to_sheet(sheetAoA)

    // 병합 설정
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
      { s: { r: sheetAoA.length - 2, c: 0 }, e: { r: sheetAoA.length - 1, c: 7 } },
      { s: { r: 0, c: 24 }, e: { r: 1, c: 24 } },
      { s: { r: 0, c: 25 }, e: { r: 1, c: 25 } },
      { s: { r: 0, c: 26 }, e: { r: 1, c: 26 } },
      { s: { r: 0, c: 27 }, e: { r: 1, c: 27 } },
      { s: { r: 0, c: 28 }, e: { r: 1, c: 28 } },
      { s: { r: 0, c: 29 }, e: { r: 1, c: 29 } },
      { s: { r: 0, c: 30 }, e: { r: 1, c: 30 } },
      { s: { r: 0, c: 31 }, e: { r: 1, c: 31 } },
      { s: { r: 0, c: 32 }, e: { r: 1, c: 32 } },
      { s: { r: 0, c: 33 }, e: { r: 1, c: 33 } },
      { s: { r: 0, c: 34 }, e: { r: 1, c: 34 } },
      { s: { r: 0, c: 35 }, e: { r: 1, c: 35 } },
      { s: { r: 0, c: 36 }, e: { r: 1, c: 36 } },
      { s: { r: 0, c: 37 }, e: { r: 1, c: 37 } },
      { s: { r: 0, c: 38 }, e: { r: 1, c: 38 } },
      { s: { r: sheetAoA.length - 2, c: 24 }, e: { r: sheetAoA.length - 1, c: 24 } },
      { s: { r: sheetAoA.length - 2, c: 25 }, e: { r: sheetAoA.length - 1, c: 25 } },
      { s: { r: sheetAoA.length - 2, c: 26 }, e: { r: sheetAoA.length - 1, c: 26 } },
      { s: { r: sheetAoA.length - 2, c: 27 }, e: { r: sheetAoA.length - 1, c: 27 } },
      { s: { r: sheetAoA.length - 2, c: 28 }, e: { r: sheetAoA.length - 1, c: 28 } },
      { s: { r: sheetAoA.length - 2, c: 29 }, e: { r: sheetAoA.length - 1, c: 29 } },
      { s: { r: sheetAoA.length - 2, c: 30 }, e: { r: sheetAoA.length - 1, c: 30 } },
      { s: { r: sheetAoA.length - 2, c: 31 }, e: { r: sheetAoA.length - 1, c: 31 } },
      { s: { r: sheetAoA.length - 2, c: 32 }, e: { r: sheetAoA.length - 1, c: 32 } },
      { s: { r: sheetAoA.length - 2, c: 33 }, e: { r: sheetAoA.length - 1, c: 33 } },
      { s: { r: sheetAoA.length - 2, c: 34 }, e: { r: sheetAoA.length - 1, c: 34 } },
      { s: { r: sheetAoA.length - 2, c: 35 }, e: { r: sheetAoA.length - 1, c: 38 } },
    ]

    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? '')
    const totalRowStart = sheetAoA.length - 2
    const totalRowEnd = sheetAoA.length - 1

    const amountCols = [7, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (!worksheet[cellRef]) worksheet[cellRef] = { v: '' }

        const isHeader = R < 2
        const isTotalRow = R === totalRowStart || R === totalRowEnd
        const isRightAlign = amountCols.includes(C)

        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          fill:
            isHeader || isTotalRow
              ? { patternType: 'solid', fgColor: { rgb: 'C0C0C0' } }
              : undefined,
          alignment: {
            vertical: 'center',
            horizontal: isRightAlign ? 'right' : 'center',
          },
        }
      }
    }

    // 워크북 생성 및 다운로드
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '노무비명세서')
    XLSX.writeFile(workbook, '노무비명세서.xlsx')
  }

  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const roleId = Number(myInfo?.roles?.[0]?.id)

  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted

  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasExcelDownload } = useMenuPermission(roleId, '노무명세서 관리', enabled)

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

      <div className="flex justify-end mb-2">
        <Button
          variant="contained"
          disabled={!hasExcelDownload}
          color="success"
          onClick={handleExcelDownload}
        >
          엑셀 다운로드
        </Button>
      </div>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '60vh', // 높이를 약간 줄임
          marginTop: '20px', // 위쪽 간격 줄임
          overflowX: 'auto',
        }}
      >
        <Table stickyHeader sx={{ minWidth: '1200px' }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle }}>
                No
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                성명
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>
                주민번호
              </TableCell>

              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                직종
              </TableCell>

              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 60 }}>
                팀명칭
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 140 }}>
                주소
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 70 }}>
                주작업
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                일당
              </TableCell>

              {firstHalfDates.map((date) => (
                <TableCell
                  key={date}
                  align="center"
                  sx={{ ...headerCellStyle, minWidth: 20 }} // 날짜 열 너비 확보
                >
                  {date}
                </TableCell>
              ))}

              {/* 합계 컬럼 */}
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 70 }}>
                총 공수
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 70 }}>
                총 일수
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                노무비 총액
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                소득세
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                주민세
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                고용보험
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                건강보험
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                장기요양
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                국민연금
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                공제합계
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                차감지급액
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                휴대전화
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                은행명
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                계좌번호
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>
                예금주
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
          {laborStateMentList.filter((item) => item.type === '직영').length > 0 && (
            <TableBody>
              {laborStateMentList
                .filter((item) => item.type === '직영')
                .map((row) => {
                  const firstHalf = [
                    ...row.dailyWork.slice(0, 15), // 1~15일
                    '', // 16일 빈칸
                  ]

                  const secondHalf = row.dailyWork.slice(15)

                  return (
                    <Fragment key={row.no}>
                      {/* 첫 번째 행 */}
                      <TableRow>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.no}
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.name}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.idNumber}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.position}
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.type}
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.address}
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
                                textAlign: 'right', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>
                        {firstHalf.map((val: any, idx: number) => (
                          <TableCell key={idx} align="center" sx={dayCellStyle}>
                            {idx === 15 ? (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  background: '#E5E7EB', // 회색
                                  borderRadius: 4,
                                }}
                              ></div>
                            ) : (
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

                                    MozAppearance: 'textfield',
                                    '&::-webkit-outer-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                    '&::-webkit-inner-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                  },
                                }}
                              />
                            )}
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.phone}
                        </TableCell>
                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.bank}
                        </TableCell>
                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.account}
                        </TableCell>
                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.accountName}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        {secondHalf.map((val: any, idx: number) => (
                          <TableCell key={idx + 16} align="center" sx={dayCellStyle}>
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
                                  `dailyWork.${idx + 15}`,
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
            </TableBody>
          )}
          {laborStateMentList.filter((item) => item.type === '용역').length > 0 && (
            <TableBody>
              {laborStateMentList
                .filter((item) => item.type === '용역')
                .map((row, index) => {
                  const firstHalf = [
                    ...row.dailyWork.slice(0, 15), // 1~15일
                    '', // 16일 빈칸
                  ]
                  const secondHalf = row.dailyWork.slice(15)

                  return (
                    <Fragment key={row.no}>
                      {/* 첫 번째 행 */}
                      <TableRow>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {typeName + index + 1}
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.name}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.idNumber}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.position}
                        </TableCell>
                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.type}
                        </TableCell>

                        <TableCell rowSpan={2} align="center" sx={contentCellStyle}>
                          {row.address}
                        </TableCell>

                        {/* <IdNumberModal
                          open={openModal}
                          onClose={() => setOpenModal(false)}
                          idInfo={selectedIdInfo}
                        /> */}

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
                                textAlign: 'right', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        {firstHalf.map((val: any, idx: number) => (
                          <TableCell key={idx} align="center" sx={dayCellStyle}>
                            {idx === 15 ? (
                              // 🔹 마지막 칸: 회색 배경 + 입력 불가
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  background: '#E5E7EB', // 연한 회색
                                  borderRadius: 4,
                                }}
                              ></div>
                            ) : (
                              <TextField
                                size="small"
                                type="number"
                                inputProps={{ step: 0.1, min: 0 }}
                                value={val ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  const numericValue = value === '' ? null : parseFloat(value)

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
                                    MozAppearance: 'textfield',
                                    '&::-webkit-outer-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                    '&::-webkit-inner-spin-button': {
                                      WebkitAppearance: 'none',
                                      margin: 0,
                                    },
                                  },
                                }}
                              />
                            )}
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
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
                                textAlign: 'right', // 가운데 정렬
                                padding: '4px', // padding 줄이기
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.phone}
                        </TableCell>
                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.bank}
                        </TableCell>
                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.account}
                        </TableCell>
                        <TableCell align="center" rowSpan={2} sx={contentCellStyle}>
                          {row.accountName}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        {secondHalf.map((val: any, idx: number) => (
                          <TableCell key={idx + 16} align="center" sx={dayCellStyle}>
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
                                  `dailyWork.${idx + 15}`,
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
                <TableCell
                  rowSpan={2}
                  colSpan={8}
                  align="center"
                  sx={{ border: '1px solid #9CA3AF', fontWeight: 'bold' }}
                >
                  소계
                </TableCell>

                {/* 1~16일 합계 */}
                {dailyEmployee
                  .map((v, idx) => v + (dailyContract[idx] ?? 0))
                  .slice(0, 16)
                  .map((sum, idx) => (
                    <TableCell key={idx} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      {idx === 15 ? '' : sum}
                    </TableCell>
                  ))}

                {[
                  totalEmployment.totalWorkHours + totalContract.totalWorkHours,
                  totalEmployment.totalWorkDays + totalContract.totalWorkDays,
                  totalEmployment.totalLaborCost + totalContract.totalLaborCost,
                  totalEmployment.incomeTax + totalContract.incomeTax,
                  totalEmployment.localTax + totalContract.localTax,
                  totalEmployment.employmentInsurance + totalContract.employmentInsurance,
                  totalEmployment.healthInsurance + totalContract.healthInsurance,
                  totalEmployment.longTermCareInsurance + totalContract.longTermCareInsurance,
                  totalEmployment.nationalPension + totalContract.nationalPension,
                  totalEmployment.totalDeductions + totalContract.totalDeductions,
                  totalEmployment.netPayment + totalContract.netPayment,
                ].map((value, idx) => (
                  <TableCell
                    key={idx}
                    rowSpan={2}
                    align="right"
                    sx={{
                      border: '1px solid #9CA3AF',
                      backgroundColor: '#F3F4F6',
                      textAlign: 'right',
                    }}
                  >
                    <div style={{ width: '100%', textAlign: 'right', padding: '4px' }}>
                      {formatNumber(value) || 0}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              {/* 16일 부터 31일 까지*/}
              <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                {dailyEmployee
                  .map((v, idx) => v + (dailyContract[idx] ?? 0))
                  .slice(15)
                  .map((sum, idx) => (
                    <TableCell key={idx + 15} align="center" sx={{ border: '1px solid #9CA3AF' }}>
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
        <CommonButton
          label="취소"
          variant="reset"
          className="px-10"
          onClick={laborStateMentCancel}
        />
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
