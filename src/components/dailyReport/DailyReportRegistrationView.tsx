/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import {
  Checkbox,
  Paper,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import CommonDatePicker from '../common/DatePicker'
import { useDailyReport } from '@/hooks/useDailyReport'
import { useDailyFormStore } from '@/stores/dailyReportStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import {
  DetaileReport,
  GetAttachedFileByFilterService,
  GetContractByFilterService,
  GetContractGroup,
  GetContractNameInfoByOutsourcing,
  GetContractNameInfoService,
  GetDirectContractByFilterService,
  GetDirectContractNameInfoService,
  GetEmployeeInfoService,
  GetEmployeesByFilterService,
  GetEquipmentByFilterService,
  GetFuelByFilterService,
  GetFuelCompany,
  GetFuelPrice,
  GetInputStatusService,
  GetMainProcessService,
  GetMaterialStatusService,
  GetOutsoucingByFilterService,
  GetOutSourcingNameInfoByLabor,
  GetReportByEvidenceFilterService,
  GetViewDirectContractList,
  GetWorkerStatusService,
  ModifyWeatherReport,
  // OutsourcingWorkerNameScroll,
} from '@/services/dailyReport/dailyReportRegistrationService'
import CommonFileInput from '../common/FileInput'
import CommonInput from '../common/Input'
import {
  formatDateSecondTime,
  formatNumber,
  getTodayDateString,
  unformatNumber,
} from '@/utils/formatters'
import { useMenuPermission } from '../common/MenuPermissionView'
import { myInfoProps } from '@/types/user'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import {
  FuelDriverNameScroll,
  FuelEquipmentNameScroll,
} from '@/services/fuelAggregation/fuelAggregationRegistrationService'
// import { useManagementCost } from '@/hooks/useManagementCost'
import AmountInput from '../common/AmountInput'
import { useSiteId } from '@/hooks/useSiteIdNumber'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { useFocusStore } from '@/stores/focusStore'
import { GetCompanyNameInfoService } from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import { useSearchParams } from 'next/navigation'

export default function DailyReportRegistrationView() {
  const {
    form,
    reset,
    isSaved,
    setSaved,
    setField,
    updateItemField,

    removeCheckedItems,
    addTemporaryCheckedItems,
    resetEmployees,
    resetMainProcess,
    resetWorker,
    resetInputStatus,
    resetMaterialStatus,
    resetDirectContracts,
    resetOutByDirectContracts,
    calculateFuelAmount,
    resetDirectContractOut,
    resetOutsourcing,
    resetEquipment,
    resetFuel,
    resetFile,
    resetEmployeesEvidenceFile,
    resetContractEvidenceFile,
    resetOutsourcingEvidenceFile,
    resetEquipmentEvidenceFile,
    resetFuelEvidenceFile,
    addWorkDetail,
    updateSubWorkField,
    removeSubWork,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,
    setFuelRadioBtn,

    // 외주공사 추가 함수

    updateContractDetailField,

    getGasUseTotal,
    getAmountTotal,

    // 직원 정보
  } = useDailyFormStore()

  const { WeatherTypeMethodOptions, useFuelOuysourcingName } = useFuelAggregation()

  const [isEditMode, setIsEditMode] = useState(false)
  const {
    useSitePersonNameListInfiniteScroll,

    // 공정명
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  // const {
  //   companyOptions,
  //   comPanyNameFetchNextPage,
  //   comPanyNamehasNextPage,
  //   comPanyNameFetching,
  //   comPanyNameLoading,
  // } = useManagementCost()

  const {
    createDailyMutation,
    EmployeesModifyMutation,
    OutsourcingModifyMutation,
    EquipmentModifyMutation,
    ContractModifyMutation,
    FuelModifyMutation,
    FileModifyMutation,

    MainInputStatusMutation,

    createAlreadyFuelMutation,
    WorkerStatusMutation,
    CompleteInfoMutation,

    reportCancel,

    // 인력의 정보 조회

    MainProcessModifyMutation,

    MaterialStatusMutation,
  } = useDailyReport()

  // 전역에서 포커싱 해제
  const setClearFocusedRowId = useFocusStore((s) => s.setFocusedRowId)

  const setClearServiceCompanyFocusedId = useFocusStore((s) => s.setServiceCompanyFocusedId)

  const setClearPersonNameFocusedId = useFocusStore((s) => s.setPersonNameFocusedId)

  // 직영/용역에서의 외주의 업체명 포커싱
  const setClearServiceOutsourcingCompanyFocusedId = useFocusStore(
    (s) => s.setServiceOutsourcingCompanyFocusedId,
  )

  // 직영/용역에 계약명  포커싱

  const setClearServiceOutsourcingContractFocusedId = useFocusStore(
    (s) => s.setServiceOutsourcingContractFocusedId,
  )

  // 직영/용역에 외주 이름  포커싱

  const setClearServiceOutsourcingContractPersonNameFocusedId = useFocusStore(
    (s) => s.setServiceOutsourcingContractPersonNameFocusedId,
  )

  // 장비 업체명 장비명 차량번호 포커싱 제거
  const setClearEquipmentOutsourcingNameFocusedId = useFocusStore(
    (s) => s.setEquipmentOutsourcingNameFocusedId,
  )
  const setClearEquipmentDriverNameFocusedId = useFocusStore(
    (s) => s.setEquipmentDriverNameFocusedId,
  )
  const setClearEquipmentCarNumberFocusedId = useFocusStore((s) => s.setEquipmentCarNumberFocusedId)

  // 외주(공사) 업체명과 항목명 포커싱 제거 변수
  const setClearWorkOutsourcingNameFocusedId = useFocusStore(
    (s) => s.setWorkOutsourcingNameFocusedId,
  )
  const setClearWorkerItemNameFocusedId = useFocusStore((s) => s.setWorkerItemNameFocusedId)

  // 유류 데이터 조회에서 업체명이랑 차량번호 포커싱 제거

  const setClearFuelOutsourcingNameFocusedId = useFocusStore(
    (s) => s.setFuelOutsourcingNameFocusedId,
  )
  const setClearFuelCarNumberFocusedId = useFocusStore((s) => s.setFuelCarNumberFocusedId)

  // 업체명 다 가져오기

  const { showSnackbar } = useSnackbarStore()

  const siteIdList = useSiteId() // 훅 실행해서 값 받기

  const { OilTypeMethodOptions } = useFuelAggregation()

  // const [selectedCompanyIds, setSelectedCompanyIds] = useState<Record<number, number>>({})

  // 직영/용역에서 사용하는 외주 계약명 이름 id

  // const [selectedOutSourcingContractIds, setSelectedOutSourcingContractIds] = useState<
  //   Record<number, number>
  // >({})

  // const [selectId, setSelectId] = useState(0)

  // 직영 계약직에서 사용하는 해당 변수
  // const [selectContractIds, setSelectContractIds] = useState<{ [rowId: number]: number }>({})

  // 옵션에 따른 상태값

  // const [workerOptionsByCompany] = useState<Record<number, any[]>>({})

  const [ContarctNameOptionsByCompany, setContarctNameOptionsByCompany] = useState<
    Record<any, any[]>
  >({})

  // 직영/용역에서  용역의 이름을 가져올 변수명

  // const [outSourcingByDirectContract, setOutSourcingByDirectContract] = useState<
  //   Record<number, any[]>
  // >({})

  // // 직영/용역에서 외주의 계약명 가져오는 변수

  // const [directContarctNameOptionsByCompany, setDirectContarctNameOptionsByCompany] = useState<
  //   Record<number, any[]>
  // >({})

  // // 직영/용역에서 외주의 이름 가져오는 변수

  // const [directContarctPersonNameByCompany, setDirectContarctPersonNameByCompany] = useState<
  //   Record<any, any[]>
  // >({})

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

  const [modifyFuelNumber, setModifyFuelNumber] = useState(0)

  // 체크 박스에 활용
  //   const employees = form.employees
  //'외주(공사)',
  const tabs = ['직원', '직영/용역', '장비', '유류', '외주(공사)', '공사일보', '현장 사진 등록']
  const [activeTab, setActiveTab] = useState('직원')

  const handleTabClick = (tab: string) => {
    let message = ''

    if (!isSaved) {
      // 저장되지 않은 변경사항이 있는 상태여
      if (isEditMode) {
        message = '수정한 내용이 저장되지 않았습니다. 이동하시겠습니까?'
      } else {
        message = `현재 "${activeTab}" 탭의 데이터가 등록되지 않았습니다. 이동하시면 입력한 내용이 사라집니다. 계속하시겠습니까?`
      }
    } else if (isSaved) {
      // 저장 완료된 상태
      message = `현재 "${activeTab}" 탭의 데이터는 저장되었습니다. 이동하시면 화면에 입력된 내용은 초기화됩니다. 계속하시겠습니까?`
    }

    if (message && !window.confirm(message)) return

    // 이전 탭에 맞는 reset 함수만 실행
    switch (activeTab) {
      case '직원':
        resetEmployees()
        break
      case '직영/용역':
        resetDirectContracts()
        resetOutByDirectContracts()
        resetDirectContractOut()
        break
      case '외주(공사)':
        resetOutsourcing()
        break
      case '장비':
        resetEquipment()
        break
      case '유류':
        resetFuel()
        break
      case '현장 사진 등록':
        resetFile()
        break
      default:
        break
    }

    setActiveTab(tab)
    setIsEditMode(false)
  }

  // subTab

  const subTabs = ['작업내용', '주요공정', '투입현황', '자재현황']
  const [activeSubTab, setActiveSubTab] = useState('작업내용')

  const handleSubTabClick = (tab: string) => {
    let message = ''

    if (!isSaved) {
      // 저장되지 않은 변경사항이 있는 상태
      if (isEditMode) {
        message = '수정한 내용이 저장되지 않았습니다. 이동하시겠습니까?'
      } else {
        message = `현재 "${activeSubTab}" 탭의 데이터가 등록되지 않았습니다. 이동하시면 입력한 내용이 사라집니다. 계속하시겠습니까?`
      }
    } else if (isSaved) {
      // 저장 완료된 상태
      message = `현재 "${activeSubTab}" 탭의 데이터는 저장되었습니다. 이동하시면 화면에 입력된 내용은 초기화됩니다. 계속하시겠습니까?`
    }

    if (message && !window.confirm(message)) return

    // 이전 탭에 맞는 reset 함수만 실행
    switch (activeSubTab) {
      case '작업내용':
        resetWorker()
        break
      case '주요공정':
        resetMainProcess()
        break
      case '투입현황':
        resetInputStatus()
        break
      case '자재현황':
        resetMaterialStatus()
        break
      default:
        break
    }

    setActiveSubTab(tab)
    setIsEditMode(false)
  }

  //   직원 조회
  const {
    // data: employeesData,
    fetchNextPage: employeesFetchNextPage,
    hasNextPage: employeesHasNextPage,
    isFetching: employeesFetching,
    refetch: employeesRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['employees', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetEmployeesByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleEmployeesRefetch = async () => {
    const res = await employeesRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allContents = res.data.pages.flatMap((page) => page.data.content)

    if (allContents.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetEmployees()
      return
    }

    // 데이터가 있는 경우
    const fetched = allContents.map((item: any) => ({
      id: item.id,
      grade: item.labor.grade,
      laborId: item.labor?.id ?? 0,
      laborName: item.labor?.name ?? 0,
      name: item.labor?.name ?? '',
      type: item.labor?.type ?? '',
      workContent: item.workContent,
      workQuantity: item.workQuantity,
      memo: item.memo,
      files:
        item.fileUrl && item.originalFileName
          ? [
              {
                fileUrl: item.fileUrl,
                originalFileName: item.originalFileName,
              },
            ]
          : [],
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('employees', fetched)
  }

  const employees = useMemo(() => form.employees, [form.employees])

  const checkedIds = form.checkedManagerIds
  const isAllChecked = employees.length > 0 && checkedIds.length === employees.length

  //직원의 이름 키워드 검색

  // 유저 선택 시 처리
  const handleSelectEmployeeName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('Employees', id, 'laborId', 0)
      updateItemField('Employees', id, 'laborName', '')
      updateItemField('Employees', id, 'grade', '')
      return
    }

    updateItemField('Employees', id, 'laborId', selectedCompany.id)
    updateItemField('Employees', id, 'laborName', selectedCompany.name)
    updateItemField('Employees', id, 'grade', selectedCompany.grade)
  }

  function DailyEmployeeNameRow({ row }: { row: any }) {
    const focusedRowId = useFocusStore((s) => s.focusedRowId)
    const setFocusedRowId = useFocusStore((s) => s.setFocusedRowId)

    const [localKeyword, setLocalKeyword] = React.useState(row.laborName ?? '')

    const isFocused = focusedRowId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.laborName ?? '')
    }, [row.laborName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: EmployeesNameData,
      fetchNextPage: EmployeesNameFetchNextPage,
      hasNextPage: EmployeesNameHasNextPage,
      isFetching: EmployeesNameIsFetching,
      isLoading: EmployeesNameIsLoading,
    } = useInfiniteQuery({
      queryKey: ['employeeInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetEmployeeInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const employeesNameList = Array.from(
      new Map(
        EmployeesNameData?.pages.flatMap((page: any) => page.data.content).map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="이름을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={employeesNameList}
        hasNextPage={EmployeesNameHasNextPage ?? false}
        fetchNextPage={EmployeesNameFetchNextPage}
        isLoading={EmployeesNameIsLoading || EmployeesNameIsFetching}
        // onChangeKeyword={(newKeyword) =>
        //   updateItemField('Employees', row.id, 'laborName', newKeyword)
        // }
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectEmployeeName(row.id ?? 0, selectedCompany)}
        shouldShowList={isFocused} // 포커스 기반 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setFocusedRowId(row.id)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setFocusedRowId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 직영 계약직

  const {
    // data: employeesData,
    fetchNextPage: contractFetchNextPage,
    hasNextPage: contractHasNextPage,
    isFetching: contractFetching,
    refetch: contractRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['contract', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetContractByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleContractRefetch = async () => {
    const res = await contractRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allContract = res.data.pages.flatMap((page) => page.data.content)

    if (allContract.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetDirectContracts()
      return
    }

    // 데이터가 있는 경우
    const fetched = allContract.map((item: any) => ({
      id: item.id,
      checkId: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? null,
      laborId: item.labor?.id ?? 0,
      laborName: item.labor?.name ?? 0,
      position: item.position || item.labor.workType,
      workContent: item.workContent,
      previousPrice: item.labor.previousDailyWage,
      unitPrice: item.unitPrice,
      workQuantity: item.workQuantity,
      memo: item.memo,
      isTemporary: item.labor.isTemporary,
      temporaryLaborName: item.labor.name,

      files:
        item.fileUrl && item.originalFileName
          ? [
              {
                fileUrl: item.fileUrl,
                originalFileName: item.originalFileName,
              },
            ]
          : [],

      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('directContracts', fetched)
  }

  const contractData = useMemo(() => form.directContracts, [form.directContracts])

  const ContractCheckedIds = form.checkeddirectContractsIds
  const isContractAllChecked =
    contractData.length > 0 && ContractCheckedIds.length === contractData.length

  // 직영에서 이름 선택 시 해당 직종과 이전단가 보내주기
  const handleSelectDirectContractName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('directContracts', id, 'laborId', 0)
      updateItemField('directContracts', id, 'laborName', '')
      updateItemField('directContracts', id, 'position', '')
      updateItemField('directContracts', id, 'previousPrice', 0)
      updateItemField('directContracts', id, 'unitPrice', 0)
      return
    }

    // 필드 업데이트
    updateItemField('directContracts', id, 'laborId', selectedCompany.id)
    updateItemField('directContracts', id, 'laborName', selectedCompany.name)
    updateItemField('directContracts', id, 'position', selectedCompany.workType ?? '')
    updateItemField('directContracts', id, 'previousPrice', selectedCompany.previousDailyWage ?? 0)
    updateItemField('directContracts', id, 'unitPrice', selectedCompany.previousDailyWage ?? 0)

    // 퇴직금 안내
    if (selectedCompany.isSeverancePayEligible) {
      showSnackbar('해당 직원 근속일이 6개월에 도달했습니다. 퇴직금 발생에 주의하세요.', 'error')
    }
  }

  function DailyDirectContractNameRow({ row }: { row: any }) {
    const focusedRowId = useFocusStore((s) => s.focusedRowId)
    const setFocusedRowId = useFocusStore((s) => s.setFocusedRowId)

    const [localKeyword, setLocalKeyword] = React.useState(row.laborName ?? '')

    const isFocused = focusedRowId === row.checkId

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.laborName ?? '')
    }, [row.laborName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: directControlNameInfo,
      fetchNextPage: directControlNameFetchNextPage,
      hasNextPage: directControlNamehasNextPage,
      isFetching: directControlNameFetching,
      isLoading: directControlNameLoading,
    } = useInfiniteQuery({
      queryKey: ['directControlNameInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetContractNameInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const directControlNameList = Array.from(
      new Map(
        directControlNameInfo?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="이름을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={directControlNameList}
        hasNextPage={directControlNamehasNextPage ?? false}
        fetchNextPage={directControlNameFetchNextPage}
        isLoading={directControlNameLoading || directControlNameFetching}
        // onChangeKeyword={(newKeyword) =>
        //   updateItemField('Employees', row.id, 'laborName', newKeyword)
        // }
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectDirectContractName(row.checkId ?? 0, selectedCompany)
        }
        shouldShowList={isFocused} // 포커스 기반 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setFocusedRowId(row.checkId)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setFocusedRowId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 직영/용역에서 용역 데이터 가져오기

  const {
    // data: employeesData,
    fetchNextPage: outsourcingByContractFetchNextPage,
    hasNextPage: outsourcingByContractHasNextPage,
    isFetching: outsourcingByContractFetching,
    refetch: outsourcingByContractRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['outsourcingByContract', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetViewDirectContractList({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleOutByContractRefetch = async () => {
    const res = await outsourcingByContractRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allContract = res.data.pages.flatMap((page) => page.data.content)

    if (allContract.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetOutByDirectContracts()
      return
    }

    // 데이터가 있는 경우
    const fetched = allContract.map((item: any) => ({
      id: item.id,
      checkId: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? null,
      outsourcingCompanyName: item.outsourcingCompany?.name ?? null,
      laborId: item.labor?.id ?? 0,
      laborName: item.labor?.name ?? 0,
      workContent: item.workContent,
      previousPrice: item.labor.previousDailyWage,
      unitPrice: item.unitPrice,
      workQuantity: item.workQuantity,
      memo: item.memo,
      actualTemporaryData: false,
      position: item.labor.workType,
      isTemporary: item.labor.isTemporary,
      temporaryLaborName: item.labor.name,

      files:
        item.fileUrl && item.originalFileName
          ? [
              {
                fileUrl: item.fileUrl,
                originalFileName: item.originalFileName,
              },
            ]
          : [],

      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('directContractOutsourcings', fetched)
  }

  const directContractByData = useMemo(
    () => form.directContractOutsourcings,
    [form.directContractOutsourcings],
  )

  const directContractCheckedIds = form.outSourcingByDirectContractIds
  const directContractAllCheckedIds =
    directContractByData.length > 0 &&
    directContractCheckedIds.length === directContractByData.length

  // 직영/용역에서 용역의 외주명 업체명 키워드 검색

  const handleSelectServiceName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('outsourcingByDirectContract', id, 'outsourcingCompanyId', 0)
      updateItemField('outsourcingByDirectContract', id, 'outsourcingCompanyName', '')

      updateItemField('outsourcingByDirectContract', id, 'laborId', 0)
      updateItemField('outsourcingByDirectContract', id, 'laborName', '')
      updateItemField('outsourcingByDirectContract', id, 'position', '')
      updateItemField('outsourcingByDirectContract', id, 'previousPrice', 0)
      return
    }

    updateItemField('outsourcingByDirectContract', id, 'outsourcingCompanyId', selectedCompany.id)
    updateItemField(
      'outsourcingByDirectContract',
      id,
      'outsourcingCompanyName',
      selectedCompany.name,
    )
    updateItemField('outsourcingByDirectContract', id, 'laborId', 0)
    updateItemField('outsourcingByDirectContract', id, 'laborName', '')
    updateItemField('outsourcingByDirectContract', id, 'position', '')
    updateItemField('outsourcingByDirectContract', id, 'previousPrice', 0)
  }

  function DailyServiceNameRow({ row }: { row: any }) {
    const serviceCompanyFocusedId = useFocusStore((s) => s.serviceCompanyFocusedId)
    const setServiceCompanyFocusedId = useFocusStore((s) => s.setServiceCompanyFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(row.outsourcingCompanyName ?? '')

    const isFocused = serviceCompanyFocusedId === row.checkId

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyName ?? '')
    }, [row.outsourcingCompanyName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: ServiceOutSourcingNameData,
      fetchNextPage: ServiceOutSourcingNameFetchNextPage,
      hasNextPage: ServiceOutSourcingNameHasNextPage,
      isFetching: ServiceOutSourcingNameIsFetching,
      isLoading: ServiceOutSourcingNameIsLoading,
    } = useInfiniteQuery({
      queryKey: ['outsourcingInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetCompanyNameInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const serviceOutSourcingNameList = Array.from(
      new Map(
        ServiceOutSourcingNameData?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="업체명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={serviceOutSourcingNameList}
        hasNextPage={ServiceOutSourcingNameHasNextPage ?? false}
        fetchNextPage={ServiceOutSourcingNameFetchNextPage}
        isLoading={ServiceOutSourcingNameIsLoading || ServiceOutSourcingNameIsFetching}
        // onChangeKeyword={(newKeyword) =>
        //   updateItemField('Employees', row.id, 'laborName', newKeyword)
        // }
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectServiceName(row.checkId ?? 0, selectedCompany)}
        shouldShowList={isFocused} // ← 업체명만 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setServiceCompanyFocusedId(row.checkId)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setServiceCompanyFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  const handleSelectServicePerson = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('outsourcingByDirectContract', id, 'laborId', 0)
      updateItemField('outsourcingByDirectContract', id, 'laborName', '')
      updateItemField('outsourcingByDirectContract', id, 'position', '')
      updateItemField('outsourcingByDirectContract', id, 'previousPrice', 0)
      updateItemField('outsourcingByDirectContract', id, 'unitPrice', 0)
      return
    }

    // 필드 업데이트
    updateItemField('outsourcingByDirectContract', id, 'laborId', selectedCompany.id)
    updateItemField('outsourcingByDirectContract', id, 'laborName', selectedCompany.name)
    updateItemField('outsourcingByDirectContract', id, 'position', selectedCompany.workType ?? '')
    updateItemField(
      'outsourcingByDirectContract',
      id,
      'previousPrice',
      selectedCompany.previousDailyWage ?? 0,
    )
    updateItemField(
      'outsourcingByDirectContract',
      id,
      'unitPrice',
      selectedCompany.previousDailyWage ?? 0,
    )

    // 퇴직금 안내
    if (selectedCompany.isSeverancePayEligible) {
      showSnackbar('해당 직원 근속일이 6개월에 도달했습니다. 퇴직금 발생에 주의하세요.', 'error')
    }
  }

  function DailyServicePersonNameRow({ row }: { row: any }) {
    const personNameFocusedId = useFocusStore((s) => s.personNameFocusedId)
    const setPersonNameFocusedId = useFocusStore((s) => s.setPersonNameFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(row.laborName ?? '')

    const isFocused = personNameFocusedId === row.checkId

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.laborName ?? '')
    }, [row.laborName])

    const debouncedKeyword = useDebouncedValue(localKeyword, 300)
    const outsourcingCompanyId = row.outsourcingCompanyId ?? 0 // row에서 업체 ID 가져오기

    const {
      data: servicePersonNameInfo,
      fetchNextPage: servicePersonNameFetchNextPage,
      hasNextPage: servicePersonNamehasNextPage,
      isFetching: servicePersonNameFetching,
      isLoading: servicePersonNameLoading,
    } = useInfiniteQuery({
      queryKey: ['servicePersonNameInfo', , debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetContractNameInfoByOutsourcing({
          pageParam,
          keyword: debouncedKeyword,
          outsourcingCompanyId,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const servicePersonNameList = Array.from(
      new Map(
        servicePersonNameInfo?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )
    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="이름을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={servicePersonNameList}
        hasNextPage={servicePersonNamehasNextPage ?? false}
        fetchNextPage={servicePersonNameFetchNextPage}
        isLoading={servicePersonNameLoading || servicePersonNameFetching}
        // onChangeKeyword={(newKeyword) =>
        //   updateItemField('Employees', row.id, 'laborName', newKeyword)
        // }
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400 ' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectServicePerson(row.checkId ?? 0, selectedCompany)}
        shouldShowList={isFocused} // 포커스 기반 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setPersonNameFocusedId(row.checkId)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setPersonNameFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 직영/용역 계약직에서 외주 데이터 불러오는 탭 추가

  const {
    // data: employeesData,
    fetchNextPage: directContractFetchNextPage,
    hasNextPage: directContractHasNextPage,
    isFetching: directContractFetching,
    refetch: directContractRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['directContract', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetDirectContractByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleDirectContractRefetch = async () => {
    const res = await directContractRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allContract = res.data.pages.flatMap((page) => page.data.content)

    if (allContract.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetDirectContractOut()
      return
    }

    // 데이터가 있는 경우
    const fetched = allContract.map((item: any) => ({
      id: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? null,
      outsourcingCompanyContractId: item.outsourcingCompanyContract.id ?? null,
      laborId: item.labor?.id ?? 0,

      outsourcingCompanyName: item.outsourcingCompany?.name ?? null,
      outsourcingCompanyContractName: item.outsourcingCompanyContract.contractName ?? null,
      laborName: item.labor?.name ?? 0,
      workQuantity: item.workQuantity,
      memo: item.memo,

      files:
        item.fileUrl && item.originalFileName
          ? [
              {
                fileUrl: item.fileUrl,
                originalFileName: item.originalFileName,
              },
            ]
          : [],

      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('directContractOutsourcingContracts', fetched)
  }

  const directContractOutsourcings = useMemo(
    () => form.directContractOutsourcingContracts,
    [form.directContractOutsourcingContracts],
  )

  const directContractOutsourcingCheckedIds = form.checkedDirectContractOutsourcingIds
  const isDirectContractOutsourcingsAllChecked =
    directContractOutsourcings.length > 0 &&
    directContractOutsourcingCheckedIds.length === directContractOutsourcings.length

  // 직영/용역에서 외주 쪽 업체명 키워드 검색

  const handleSelectOutsourcingName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('directContractOutsourcings', id, 'outsourcingCompanyId', 0)
      updateItemField('directContractOutsourcings', id, 'outsourcingCompanyName', '')

      updateItemField('directContractOutsourcings', id, 'laborId', 0)
      updateItemField('directContractOutsourcings', id, 'laborName', '')
      return
    }

    updateItemField('directContractOutsourcings', id, 'outsourcingCompanyId', selectedCompany.id)
    updateItemField(
      'directContractOutsourcings',
      id,
      'outsourcingCompanyName',
      selectedCompany.name,
    )
    updateItemField('directContractOutsourcings', id, 'outsourcingCompanyContractId', 0)
    updateItemField('directContractOutsourcings', id, 'outsourcingCompanyContractName', '')

    updateItemField('directContractOutsourcings', id, 'laborId', 0)
    updateItemField('directContractOutsourcings', id, 'laborName', '')
  }

  function DailyOutsourcingNameRow({ row }: { row: any }) {
    const serviceCompanyFocusedId = useFocusStore((s) => s.serviceOutsourcingCompanyFocusedId)
    const setServiceCompanyFocusedId = useFocusStore((s) => s.setServiceOutsourcingCompanyFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(row.outsourcingCompanyName ?? '')

    const isFocused = serviceCompanyFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyName ?? '')
    }, [row.outsourcingCompanyName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: DirectOutSourcingNameData,
      fetchNextPage: DirectOutSourcingNameFetchNextPage,
      hasNextPage: DirectOutSourcingNameHasNextPage,
      isFetching: DirectOutSourcingNameIsFetching,
      isLoading: DirectOutSourcingNameIsLoading,
    } = useInfiniteQuery({
      queryKey: ['outsourcingInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetCompanyNameInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const serviceOutSourcingNameList = Array.from(
      new Map(
        DirectOutSourcingNameData?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="업체명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={serviceOutSourcingNameList}
        hasNextPage={DirectOutSourcingNameHasNextPage ?? false}
        fetchNextPage={DirectOutSourcingNameFetchNextPage}
        isLoading={DirectOutSourcingNameIsLoading || DirectOutSourcingNameIsFetching}
        // onChangeKeyword={(newKeyword) =>
        //   updateItemField('Employees', row.id, 'laborName', newKeyword)
        // }
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectOutsourcingName(row.id ?? 0, selectedCompany)}
        shouldShowList={isFocused} // ← 업체명만 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setServiceCompanyFocusedId(row.id)

          setClearServiceCompanyFocusedId(null)
          setClearPersonNameFocusedId(null)
          setClearServiceOutsourcingContractFocusedId(null)
          setClearServiceOutsourcingContractPersonNameFocusedId(null)
          setClearFocusedRowId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setServiceCompanyFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 직영/용역에서 외주 쪽 계약명 키워드 검색

  const handleSelectOutsourcingContractName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('directContractOutsourcings', id, 'laborId', 0)
      updateItemField('directContractOutsourcings', id, 'laborName', '')
      return
    }

    updateItemField(
      'directContractOutsourcings',
      id,
      'outsourcingCompanyContractId',
      selectedCompany.id,
    )
    updateItemField(
      'directContractOutsourcings',
      id,
      'outsourcingCompanyContractName',
      selectedCompany.contractName,
    )

    updateItemField('directContractOutsourcings', id, 'laborId', 0)
    updateItemField('directContractOutsourcings', id, 'laborName', '')
  }

  function DailyOutsourcingContractNameRow({ row }: { row: any }) {
    const serviceContractFocusedId = useFocusStore((s) => s.serviceOutsourcingContractFocusedId)
    const setServiceContractFocusedId = useFocusStore(
      (s) => s.setServiceOutsourcingContractFocusedId,
    )

    const [localKeyword, setLocalKeyword] = React.useState(row.outsourcingCompanyContractName ?? '')

    const isFocused = serviceContractFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyContractName ?? '')
    }, [row.outsourcingCompanyContractName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const outsourcingCompanyId = row.outsourcingCompanyId ?? 0 // row에서 업체 ID 가져오기

    const {
      data: directContractNameInfo,
      fetchNextPage: directContractNameFetchNextPage,
      hasNextPage: directContractNamehasNextPage,
      isFetching: directContractNameFetching,
      isLoading: directContractNameLoading,
    } = useInfiniteQuery({
      queryKey: ['directContractNameInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetDirectContractNameInfoService({
          pageParam,
          outsourcingCompanyId,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const serviceOutSourcingNameList = Array.from(
      new Map(
        directContractNameInfo?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="계약명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={serviceOutSourcingNameList}
        hasNextPage={directContractNamehasNextPage ?? false}
        fetchNextPage={directContractNameFetchNextPage}
        isLoading={directContractNameLoading || directContractNameFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.contractName}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectOutsourcingContractName(row.id ?? 0, selectedCompany)
        }
        shouldShowList={isFocused} // ← 업체명만 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setServiceContractFocusedId(row.id)

          setClearServiceCompanyFocusedId(null)
          setClearPersonNameFocusedId(null)
          setClearServiceOutsourcingCompanyFocusedId(null)
          setClearServiceOutsourcingContractPersonNameFocusedId(null)
          setClearFocusedRowId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setServiceContractFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 직영/용역에서 외주쪽 이름명 키워드 검색

  const handleSelectOutsourcingContractPersonName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('directContractOutsourcings', id, 'laborId', 0)
      updateItemField('directContractOutsourcings', id, 'laborName', '')
      return
    }

    updateItemField('directContractOutsourcings', id, 'laborId', selectedCompany.id)
    updateItemField('directContractOutsourcings', id, 'laborName', selectedCompany.name)
  }

  function DailyOutsourcingContractPersonNameRow({ row }: { row: any }) {
    console.log('rowrow', row)
    const focusedContractNameRowId = useFocusStore(
      (s) => s.serviceOutsourcingContractPersonNameFocusedId,
    )
    const setFocusedContractNameRowId = useFocusStore(
      (s) => s.setServiceOutsourcingContractPersonNameFocusedId,
    )

    const [localKeyword, setLocalKeyword] = React.useState(row.laborName ?? '')

    const isFocused = focusedContractNameRowId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.laborName ?? '')
    }, [row.laborName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const outsourcingCompanyId = row.outsourcingCompanyId
    const outsourcingCompanyContractId = row.outsourcingCompanyContractId

    console.log('계약명에 딸린 이름 ', outsourcingCompanyId, outsourcingCompanyContractId)

    const {
      data: ContractPersonNamesData,
      fetchNextPage: ContractPersonNamesFetchNextPage,
      hasNextPage: ContractPersonNamesHasNextPage,
      isFetching: ContractPersonNamesIsFetching,
      isLoading: ContractPersonNamesIsLoading,
    } = useInfiniteQuery({
      queryKey: ['OutsourcingContractInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetOutSourcingNameInfoByLabor({
          pageParam,
          outsourcingCompanyId,
          outsourcingCompanyContractId,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const employeesNameList = Array.from(
      new Map(
        ContractPersonNamesData?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="이름을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={employeesNameList}
        hasNextPage={ContractPersonNamesHasNextPage ?? false}
        fetchNextPage={ContractPersonNamesFetchNextPage}
        isLoading={ContractPersonNamesIsLoading || ContractPersonNamesIsFetching}
        // onChangeKeyword={(newKeyword) =>
        //   updateItemField('Employees', row.id, 'laborName', newKeyword)
        // }
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectOutsourcingContractPersonName(row.id ?? 0, selectedCompany)
        }
        shouldShowList={isFocused} // 포커스 기반 리스트 표시
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setFocusedContractNameRowId(row.id)
          setClearServiceCompanyFocusedId(null)
          setClearPersonNameFocusedId(null)
          setClearServiceOutsourcingCompanyFocusedId(null)
          setClearServiceOutsourcingContractFocusedId(null)
          setClearFocusedRowId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setFocusedContractNameRowId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 외주(공사) 조회

  const {
    // data: outsourcingData,
    fetchNextPage: outsourcingFetchNextPage,
    hasNextPage: outsourcingHasNextPage,
    isFetching: outsourcingFetching,
    refetch: outsourcingRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['outsourcingView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetOutsoucingByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleOutsourcingRefetch = async () => {
    const res = await outsourcingRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allOutsourcingContents = res.data.pages.flatMap((page) => page.data.content)

    if (allOutsourcingContents.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetOutsourcing()
      return
    }

    const fetched = allOutsourcingContents.map((item: any) => ({
      id: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
      outsourcingCompanyContractConstructionGroupId:
        item.outsourcingCompanyContractConstructionGroup.id ?? 0,

      outsourcingCompanyName: item.outsourcingCompany?.name ?? 0,
      outsourcingCompanyContractConstructionGroupName:
        item.outsourcingCompanyContractConstructionGroup.itemName ?? 0,

      items: item.items.map((it: any) => ({
        id: it.id,
        specification: it.outsourcingCompanyContractConstruction.specification ?? '',
        quantity: it.quantity ?? 0,
        unit: it.outsourcingCompanyContractConstruction.unit ?? '',
        memo: it.memo ?? '',
        files:
          it.fileUrl && it.originalFileName
            ? [
                {
                  fileUrl: it.fileUrl,
                  originalFileName: it.originalFileName,
                },
              ]
            : [],

        outsourcingCompanyContractConstructionId:
          it.outsourcingCompanyContractConstruction?.id ?? 0,
        outsourcingCompanyContractConstructionName:
          it.outsourcingCompanyContractConstruction?.item ?? 0,
      })),
    }))

    console.log('외주 공사용 fetch', fetched)

    setIsEditMode(true)
    setField('outsourcingConstructions', fetched)
  }

  // 외주(공사)
  const resultOutsourcing = useMemo(
    () => form.outsourcingConstructions,
    [form.outsourcingConstructions],
  )
  const checkedOutsourcingIds = form.checkedOutsourcingIds
  const isOutsourcingAllChecked =
    resultOutsourcing.length > 0 && checkedOutsourcingIds.length === resultOutsourcing.length

  // 외주(공사)에서 업체명 키워드 검색
  const handleSelectWorkOutsourcingName = (id: number, selectedCompany: any) => {
    console.log('selectedCompany 외주의 업체명', selectedCompany)
    if (!selectedCompany) {
      updateItemField('outsourcings', id, 'outsourcingCompanyId', 0)
      updateItemField('outsourcings', id, 'outsourcingCompanyName', '')

      return
    }

    updateItemField('outsourcings', id, 'outsourcingCompanyId', selectedCompany.id)
    updateItemField('outsourcings', id, 'outsourcingCompanyName', selectedCompany.name)
  }

  function DailyWorkOutsourcingNameRow({ row }: { row: any }) {
    const workOutsourcingNameFocusedId = useFocusStore((s) => s.workOutsourcingNameFocusedId)
    const setWorkOutsourcingNameFocusedId = useFocusStore((s) => s.setWorkOutsourcingNameFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(row.outsourcingCompanyName ?? '')

    const isFocused = workOutsourcingNameFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyName ?? '')
    }, [row.outsourcingCompanyName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: WorkerOutSourcingNameData,
      fetchNextPage: WorkerOutSourcingNameFetchNextPage,
      hasNextPage: WorkerOutSourcingNameHasNextPage,
      isFetching: WorkerOutSourcingNameIsFetching,
      isLoading: WorkerOutSourcingNameIsLoading,
    } = useInfiniteQuery({
      queryKey: ['workerInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetCompanyNameInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const workerOutSourcingNameList = Array.from(
      new Map(
        WorkerOutSourcingNameData?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="업체명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={workerOutSourcingNameList}
        hasNextPage={WorkerOutSourcingNameHasNextPage ?? false}
        fetchNextPage={WorkerOutSourcingNameFetchNextPage}
        isLoading={WorkerOutSourcingNameIsLoading || WorkerOutSourcingNameIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectWorkOutsourcingName(row.id ?? 0, selectedCompany)
        }
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setWorkOutsourcingNameFocusedId(row.id)
          setClearWorkerItemNameFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setWorkOutsourcingNameFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 외주(공사)에서 항목명 검색
  // selectedCompany = {
  //   id: 36,
  //   itemName: "CIP공사",
  //   items: [
  //     { id: 98, item: "...", specification: "...", unit: "...", deleted: false },
  //     ...
  //   ]
  // }

  const handleSelectWorkerItemName = (id: number, selectedCompany: any) => {
    console.log('해당 그룹 데이터 확인', selectedCompany)
    if (!selectedCompany) {
      updateItemField('outsourcings', id, 'outsourcingCompanyContractConstructionGroupId', 0)
      updateItemField('outsourcings', id, 'outsourcingCompanyContractConstructionGroupName', '')
      updateItemField('outsourcings', id, 'items', []) // 서브 아이템 초기화
      return
    }

    // 그룹 정보 설정
    updateItemField(
      'outsourcings',
      id,
      'outsourcingCompanyContractConstructionGroupId',
      selectedCompany.outsourcingCompanyContractConstructionGroupId,
    )
    updateItemField(
      'outsourcings',
      id,
      'outsourcingCompanyContractConstructionGroupName',
      selectedCompany.itemName,
    )

    // 🔥 백엔드에서 받은 items → 우리 폼 구조에 맞게 변환하여 세팅
    const mappedItems = (selectedCompany.items ?? []).map((item: any) => ({
      id: item.id, // 내부 관리용
      outsourcingCompanyContractConstructionName: item.item,
      outsourcingCompanyContractConstructionId: item.id,
      specification: item.specification,
      unit: item.unit,
      quantity: item.quantity ?? 0,
      memo: '',
      fileUrl: '',
    }))

    updateItemField('outsourcings', id, 'items', mappedItems)
  }

  function DailyWorkerItemNameRow({ row }: { row: any }) {
    const workerItemNameFocusedId = useFocusStore((s) => s.workerItemNameFocusedId)
    const setWorkerItemNameFocusedId = useFocusStore((s) => s.setWorkerItemNameFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(
      row.outsourcingCompanyContractConstructionGroupName ?? '',
    )

    const isFocused = workerItemNameFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyContractConstructionGroupName ?? '')
    }, [row.outsourcingCompanyContractConstructionGroupName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)
    const outsourcingCompanyId = row.outsourcingCompanyId ?? 0 // row에서 업체 ID 가져오기

    const {
      data: workerGroupNameList,
      fetchNextPage: workerGroupNameFetchNextPage,
      hasNextPage: workerGroupNameHasNextPage,
      isFetching: workerGroupNameIsFetching,
      isLoading: workerGroupNameLoading,
    } = useInfiniteQuery({
      queryKey: ['ContractGroupInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetContractGroup({
          pageParam,
          id: outsourcingCompanyId,
          siteId: Number(siteIdList),
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const workerNameList = Array.from(
      new Map(
        workerGroupNameList?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="항목명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={workerNameList}
        hasNextPage={workerGroupNameHasNextPage ?? false}
        fetchNextPage={workerGroupNameFetchNextPage}
        isLoading={workerGroupNameLoading || workerGroupNameIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.itemName}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectWorkerItemName(row.id ?? 0, selectedCompany)}
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setWorkerItemNameFocusedId(row.id)
          setClearWorkOutsourcingNameFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setWorkerItemNameFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  //   장비
  const {
    // data: outsourcingData,
    fetchNextPage: equipmentFetchNextPage,
    hasNextPage: equipmentHasNextPage,
    isFetching: equipmentFetching,
    refetch: equipmentRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['equView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetEquipmentByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleEquipmentRefetch = async () => {
    const res = await equipmentRefetch()
    if (!res.data) return

    const allEquipmentContents = res.data.pages.flatMap((page) => page.data.content)

    if (allEquipmentContents.length === 0) {
      setIsEditMode(false)
      resetEquipment()
      return
    }

    const fetched = allEquipmentContents.map((item: any) => ({
      id: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
      outsourcingCompanyName: item.outsourcingCompany?.name ?? 0,
      outsourcingCompanyContractDriverId: item.outsourcingCompanyContractDriver?.id ?? 0,
      outsourcingCompanyContractDriverName: item.outsourcingCompanyContractDriver?.name ?? 0,
      outsourcingCompanyContractEquipmentId: item.outsourcingCompanyContractEquipment?.id ?? 0,
      outsourcingCompanyContractEquipmentName:
        item.outsourcingCompanyContractEquipment?.vehicleNumber ?? 0,
      taskDescription: item.outsourcingCompanyContractEquipment?.taskDescription ?? '',
      specificationName: item.outsourcingCompanyContractEquipment?.specification ?? '',
      type: item.outsourcingCompanyContractEquipment?.category ?? '',
      workContent: item.workContent,
      unitPrice: item?.unitPrice ?? 0,
      workHours: item.workHours,
      memo: item.memo,

      // 하위 장비
      subEquipments: (item.outsourcingCompanyContractSubEquipments ?? []).map(
        (contractSubEquipment: any) => ({
          id: contractSubEquipment.id ?? 0,
          outsourcingCompanyContractSubEquipmentId: contractSubEquipment.subEquipment.id ?? 0,
          outsourcingCompanyContractSubEquipmentName: contractSubEquipment.subEquipment.type ?? 0,
          type: contractSubEquipment.subEquipment.type ?? '',
          typeCode: contractSubEquipment.subEquipment.typeCode ?? '',
          description: contractSubEquipment.subEquipment.description ?? '',
          taskDescription: contractSubEquipment.subEquipment.taskDescription ?? '',
          memo: contractSubEquipment.subEquipment.memo ?? '',
          workContent: contractSubEquipment.workContent ?? '',
          unitPrice: contractSubEquipment.unitPrice ?? 0,
          workHours: contractSubEquipment.workHours ?? 0,
        }),
      ),

      files:
        item.fileUrl && item.originalFileName
          ? [
              {
                fileUrl: item.fileUrl,
                originalFileName: item.originalFileName,
              },
            ]
          : [],

      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    // 여기서 testArrayByRow 세팅
    const subEquipmentsByRow: Record<number, EquipmentTypeOption[]> = {}
    fetched.forEach((item) => {
      const subEquipments: EquipmentTypeOption[] = (item.subEquipments ?? []).map((sub: any) => ({
        id: sub.outsourcingCompanyContractSubEquipmentId ?? sub.id,
        name: sub.type || sub.typeCode || '-',
        taskDescription: sub.workContent || sub.taskDescription || '',
        unitPrice: sub.unitPrice ?? 0,
      }))
      subEquipmentsByRow[item.outsourcingCompanyContractEquipmentId] = subEquipments
    })

    // setTestArrayByRow(subEquipmentsByRow)

    setIsEditMode(true)
    setField('outsourcingEquipments', fetched)
  }

  // 장비
  const equipmentData = useMemo(() => form.outsourcingEquipments, [form.outsourcingEquipments])
  const checkedEquipmentIds = form.checkedEquipmentIds
  const isEquipmentAllChecked =
    equipmentData.length > 0 && checkedEquipmentIds.length === equipmentData.length

  // 장비에서 업체명 키워드 검색
  // 장비 - 업체명 선택
  const handleSelectEquipMentOutsourcingName = (id: number, selectedCompany: any) => {
    console.log('selectedCompany 장비의 업체명', selectedCompany)
    if (!selectedCompany) {
      updateItemField('equipment', id, 'outsourcingCompanyId', 0)
      updateItemField('equipment', id, 'outsourcingCompanyName', '')

      updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentId', 0)
      updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentName', '')
      updateItemField('equipment', id, 'specificationName', '')
      updateItemField('equipment', id, 'workContent', '')
      updateItemField('equipment', id, 'unitPrice', 0)
      updateItemField('equipment', id, 'subEquipments', [])

      updateItemField('equipment', id, 'outsourcingCompanyContractDriverId', 0)
      updateItemField('equipment', id, 'outsourcingCompanyContractDriverName', '')

      return
    }

    updateItemField('equipment', id, 'outsourcingCompanyId', selectedCompany.id)
    updateItemField('equipment', id, 'outsourcingCompanyName', selectedCompany.name)

    updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentId', 0)
    updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentName', '')
    updateItemField('equipment', id, 'specificationName', '')
    updateItemField('equipment', id, 'workContent', '')
    updateItemField('equipment', id, 'unitPrice', 0)
    updateItemField('equipment', id, 'subEquipments', [])

    updateItemField('equipment', id, 'outsourcingCompanyContractDriverId', 0)
    updateItemField('equipment', id, 'outsourcingCompanyContractDriverName', '')
  }

  function DailyEquipMentOutsourcingNameRow({ row }: { row: any }) {
    const equipmentOutsourcingNameFocusedId = useFocusStore(
      (s) => s.equipmentOutsourcingNameFocusedId,
    )
    const setEquipmentOutsourcingNameFocusedId = useFocusStore(
      (s) => s.setEquipmentOutsourcingNameFocusedId,
    )

    const [localKeyword, setLocalKeyword] = React.useState(row.outsourcingCompanyName ?? '')

    const isFocused = equipmentOutsourcingNameFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyName ?? '')
    }, [row.outsourcingCompanyName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: EquipmentOutSourcingNameData,
      fetchNextPage: EquipmentOutSourcingNameFetchNextPage,
      hasNextPage: EquipmentOutSourcingNameHasNextPage,
      isFetching: EquipmentOutSourcingNameIsFetching,
      isLoading: EquipmentOutSourcingNameIsLoading,
    } = useInfiniteQuery({
      queryKey: ['equipmentInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetCompanyNameInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const equipmentOutSourcingNameList = Array.from(
      new Map(
        EquipmentOutSourcingNameData?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="업체명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={equipmentOutSourcingNameList}
        hasNextPage={EquipmentOutSourcingNameHasNextPage ?? false}
        fetchNextPage={EquipmentOutSourcingNameFetchNextPage}
        isLoading={EquipmentOutSourcingNameIsLoading || EquipmentOutSourcingNameIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectEquipMentOutsourcingName(row.id ?? 0, selectedCompany)
        }
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setEquipmentOutsourcingNameFocusedId(row.id)

          setClearEquipmentDriverNameFocusedId(null)
          setClearEquipmentCarNumberFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setEquipmentOutsourcingNameFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 장비에서  기사명

  const handleSelectEquipMentDriverName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('equipment', id, 'outsourcingCompanyContractDriverId', 0)
      updateItemField('equipment', id, 'outsourcingCompanyContractDriverName', '')

      return
    }

    updateItemField('equipment', id, 'outsourcingCompanyContractDriverId', selectedCompany.id)
    updateItemField('equipment', id, 'outsourcingCompanyContractDriverName', selectedCompany.name)
  }

  function DailyEquipMentDriverNameRow({ row }: { row: any }) {
    const equipmentDriverNameFocusedId = useFocusStore((s) => s.equipmentDriverNameFocusedId)
    const setEquipmentDriverNameFocusedId = useFocusStore((s) => s.setEquipmentDriverNameFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(
      row.outsourcingCompanyContractDriverName ?? '',
    )

    const isFocused = equipmentDriverNameFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyContractDriverName ?? '')
    }, [row.outsourcingCompanyContractDriverName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)
    const outsourcingCompanyId = row.outsourcingCompanyId ?? 0 // row에서 업체 ID 가져오기

    const {
      data: equipmentDriverName,
      fetchNextPage: equipmentDriverNameFetchNextPage,
      hasNextPage: equipmentDriverNameHasNextPage,
      isFetching: equipmentDriverNameIsFetching,
      isLoading: equipmentDriverNameLoading,
    } = useInfiniteQuery({
      queryKey: ['equipmentDriverInfo', debouncedKeyword],

      queryFn: ({ pageParam }) =>
        FuelDriverNameScroll({
          pageParam,
          keyword: debouncedKeyword,
          // 업체명
          id: outsourcingCompanyId,
          siteIdList: Number(siteIdList),
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const equipmentDriverNameList = Array.from(
      new Map(
        equipmentDriverName?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="기사명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={equipmentDriverNameList}
        hasNextPage={equipmentDriverNameHasNextPage ?? false}
        fetchNextPage={equipmentDriverNameFetchNextPage}
        isLoading={equipmentDriverNameLoading || equipmentDriverNameIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectEquipMentDriverName(row.id ?? 0, selectedCompany)
        }
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setEquipmentDriverNameFocusedId(row.id)

          setClearEquipmentOutsourcingNameFocusedId(null)
          setClearEquipmentCarNumberFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setEquipmentDriverNameFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 장비에서 차량번호  키워드 검색

  const handleSelectEquipMentCarNumber = (id: number, selectedCompany: any) => {
    console.log('현재 해당 데이터 서브장비 있나여?', selectedCompany)
    if (!selectedCompany) {
      // 차량번호 전체 초기화
      updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentId', 0)
      updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentName', '')
      updateItemField('equipment', id, 'specificationName', '')
      updateItemField('equipment', id, 'workContent', '')
      updateItemField('equipment', id, 'unitPrice', 0)
      updateItemField('equipment', id, 'subEquipments', [])
      return
    }

    // 기본 장비 세팅
    updateItemField('equipment', id, 'outsourcingCompanyContractEquipmentId', selectedCompany.id)
    updateItemField(
      'equipment',
      id,
      'outsourcingCompanyContractEquipmentName',
      selectedCompany.vehicleNumber,
    )

    updateItemField('equipment', id, 'specificationName', selectedCompany.specification || '')
    updateItemField('equipment', id, 'unitPrice', selectedCompany.unitPrice || 0)
    updateItemField('equipment', id, 'workContent', selectedCompany.taskDescription || '')

    const subEquipments = selectedCompany.subEquipments ?? []

    console.log('서브장비 데이터 보기 ', subEquipments)

    if (subEquipments.length > 0) {
      const formattedSubEquipments = subEquipments.map((sub: any) => ({
        id: sub.id,
        outsourcingCompanyContractSubEquipmentId: sub.id,
        outsourcingCompanyContractSubEquipmentName: sub.type,
        type: sub.type || sub.typeCode || '-',
        workContent: sub.workContent || sub.taskDescription || '',
        description: sub.description || '',
        unitPrice: sub.unitPrice || 0,
        workHours: sub.workHours || 0,
        memo: sub.memo || '',
      }))

      updateItemField('equipment', id, 'subEquipments', formattedSubEquipments)
    } else {
      updateItemField('equipment', id, 'subEquipments', [])
    }
  }

  function DailyEquipMentCarNumberRow({ row }: { row: any }) {
    const equipmentCarNumberFocusedId = useFocusStore((s) => s.equipmentCarNumberFocusedId)
    const setEquipmentCarNumberFocusedId = useFocusStore((s) => s.setEquipmentCarNumberFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(
      row.outsourcingCompanyContractEquipmentName ?? '',
    )

    const isFocused = equipmentCarNumberFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyContractEquipmentName ?? '')
    }, [row.outsourcingCompanyContractEquipmentName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)
    const outsourcingCompanyId = row.outsourcingCompanyId ?? 0 // row에서 업체 ID 가져오기

    const {
      data: equipmentCarNumber,
      fetchNextPage: equipmentCarNumberFetchNextPage,
      hasNextPage: equipmentCarNumberHasNextPage,
      isFetching: equipmentCarNumberIsFetching,
      isLoading: equipmentCarNumberLoading,
    } = useInfiniteQuery({
      queryKey: ['equipmentCarNumberInfo', debouncedKeyword],
      queryFn: ({ pageParam }) =>
        FuelEquipmentNameScroll({
          pageParam,
          keyword: debouncedKeyword,
          // 업체명
          id: outsourcingCompanyId,
          siteIdList: Number(siteIdList),
        }),

      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const equipmentCarNumberList = Array.from(
      new Map(
        equipmentCarNumber?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.vehicleNumber, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="차량번호를 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={equipmentCarNumberList}
        hasNextPage={equipmentCarNumberHasNextPage ?? false}
        fetchNextPage={equipmentCarNumberFetchNextPage}
        isLoading={equipmentCarNumberLoading || equipmentCarNumberIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.vehicleNumber}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectEquipMentCarNumber(row.id ?? 0, selectedCompany)}
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setEquipmentCarNumberFocusedId(row.id)

          setClearEquipmentOutsourcingNameFocusedId(null)
          setClearEquipmentDriverNameFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setEquipmentCarNumberFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 유류 데이터

  const {
    // data: outsourcingData,
    fetchNextPage: fuelFetchNextPage,
    hasNextPage: fuelHasNextPage,
    isFetching: fuelFetching,
    refetch: fuelRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['fuelView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetFuelByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleFuelRefetch = async () => {
    const res = await fuelRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allFuels = res.data.pages.flatMap((page) => page.data.content)

    if (allFuels.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetFuel()
      return
    }

    const fetched = allFuels.map((item: any) => ({
      id: item.fuelInfoId,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
      outsourcingCompanyName: item.outsourcingCompany?.name ?? '',

      deleted: item.outsourcingCompany.deleted,
      driverId: item.outsourcingCompanyDriver?.id ?? 0,
      equipmentId: item.outsourcingCompanyEquipment?.id ?? '',

      equipmentName: item.outsourcingCompanyEquipment?.vehicleNumber ?? '',

      specificationName: item.outsourcingCompanyEquipment.specification ?? '',
      fuelType: item.fuelTypeCode ?? '',
      categoryType: item.categoryTypeCode,
      fuelAmount: item.fuelAmount,
      amount: item.amount,
      memo: item.memo,
      files:
        item.fileUrl && item.originalFileName
          ? [
              {
                fileUrl: item.fileUrl,
                originalFileName: item.originalFileName,
              },
            ]
          : [],
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
      subEquipments: (item.subEquipments ?? []).map((sub: any) => ({
        id: sub.id,
        checkId: sub.id,
        outsourcingCompanyContractSubEquipmentId: sub.subEquipment?.id || '-',
        fuelType: sub.fuelTypeCode || '',
        fuelAmount: sub.fuelAmount ?? 0,
        amount: sub.amount || 0,
        memo: sub.memo ?? 0,
      })),
    }))

    const subEquipmentsByRow: Record<number, subEquipmentTypeOption[]> = {}
    fetched.forEach((item: any) => {
      subEquipmentsByRow[item.equipmentId] = item.subEquipments ?? []
    })
    setSubEquipmentByRow(subEquipmentsByRow)

    setIsEditMode(true)
    setField('fuelInfos', fetched)
    setModifyFuelNumber(allFuels[0]?.fuelAggregationId)
  }

  // 유류 데이터에서 업체명 키워드 검색

  // 외주(공사)에서 업체명 키워드 검색
  const handleSelectFuelOutsourcingName = (id: number, selectedCompany: any) => {
    if (!selectedCompany) {
      updateItemField('fuel', id, 'outsourcingCompanyId', 0)
      updateItemField('fuel', id, 'outsourcingCompanyName', '')

      return
    }

    updateItemField('fuel', id, 'outsourcingCompanyId', selectedCompany.id)
    updateItemField('fuel', id, 'outsourcingCompanyName', selectedCompany.name)
  }

  function DailyFuelOutsourcingNameRow({ row }: { row: any }) {
    const fuelOutsourcingNameFocusedId = useFocusStore((s) => s.fuelOutsourcingNameFocusedId)
    const setFuelOutsourcingNameFocusedId = useFocusStore((s) => s.setFuelOutsourcingNameFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(row.outsourcingCompanyName ?? '')

    const isFocused = fuelOutsourcingNameFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.outsourcingCompanyName ?? '')
    }, [row.outsourcingCompanyName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)

    const {
      data: FuelOutSourcingNameData,
      fetchNextPage: FuelOutSourcingNameFetchNextPage,
      hasNextPage: FuelOutSourcingNameHasNextPage,
      isFetching: FuelOutSourcingNameIsFetching,
      isLoading: FuelOutSourcingNameIsLoading,
    } = useInfiniteQuery({
      queryKey: ['fuelInfo', debouncedKeyword],
      queryFn: ({ pageParam = 0 }) =>
        GetCompanyNameInfoService({
          pageParam,
          keyword: debouncedKeyword,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const fuelOutSourcingNameList = Array.from(
      new Map(
        FuelOutSourcingNameData?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.name, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="업체명을 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={fuelOutSourcingNameList}
        hasNextPage={FuelOutSourcingNameHasNextPage ?? false}
        fetchNextPage={FuelOutSourcingNameFetchNextPage}
        isLoading={FuelOutSourcingNameIsLoading || FuelOutSourcingNameIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.name}
          </div>
        )}
        onSelect={(selectedCompany) =>
          handleSelectFuelOutsourcingName(row.id ?? 0, selectedCompany)
        }
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setFuelOutsourcingNameFocusedId(row.id)
          setClearFuelCarNumberFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setFuelOutsourcingNameFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 유류에서 차량번호  키워드 검색

  const handleSelectFuelCarNumber = (id: number, selectedCompany: any) => {
    console.log('현재 해당 데이터 서브장비 있나여?', selectedCompany)
    if (!selectedCompany) {
      // 차량번호 전체 초기화
      updateItemField('fuel', id, 'equipmentId', 0)
      updateItemField('fuel', id, 'equipmentName', '')
      updateItemField('fuel', id, 'specificationName', '')

      return
    }

    // 기본 장비 세팅
    updateItemField('fuel', id, 'equipmentId', selectedCompany.id)
    updateItemField('fuel', id, 'equipmentName', selectedCompany.vehicleNumber)

    updateItemField('fuel', id, 'specificationName', selectedCompany.specification || '')
  }

  function DailyFuelCarNumberRow({ row }: { row: any }) {
    const fuelCarNumberFocusedId = useFocusStore((s) => s.fuelCarNumberFocusedId)
    const setFuelCarNumberFocusedId = useFocusStore((s) => s.setFuelCarNumberFocusedId)

    const [localKeyword, setLocalKeyword] = React.useState(row.equipmentName ?? '')

    const isFocused = fuelCarNumberFocusedId === row.id

    // 입력값이 외부에서 바뀌면 로컬 상태도 업데이트
    React.useEffect(() => {
      setLocalKeyword(row.equipmentName ?? '')
    }, [row.equipmentName])

    // debounce 적용 (백엔드 호출용)
    const debouncedKeyword = useDebouncedValue(localKeyword, 300)
    const outsourcingCompanyId = row.outsourcingCompanyId ?? 0 // row에서 업체 ID 가져오기
    const categoryType = row.categoryType
    console.log('row 확인 구분 값 ', row)

    const {
      data: fuelCarNumber,
      fetchNextPage: fuelCarNumberFetchNextPage,
      hasNextPage: fuelCarNumberHasNextPage,
      isFetching: fuelCarNumberIsFetching,
      isLoading: fuelCarNumberLoading,
    } = useInfiniteQuery({
      queryKey: ['fuelCarNumberInfo', debouncedKeyword],
      queryFn: ({ pageParam }) =>
        FuelEquipmentNameScroll({
          pageParam,
          keyword: debouncedKeyword,
          types: categoryType,
          // 업체명
          id: outsourcingCompanyId,
          siteIdList: Number(siteIdList),
        }),

      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
      },
      enabled: isFocused,
    })

    const fuelCarNumberList = Array.from(
      new Map(
        fuelCarNumber?.pages
          .flatMap((page: any) => page.data.content)
          .map((u) => [u.vehicleNumber, u]),
      )?.values() ?? [],
    )

    // onBlur 딜레이용 ref
    const blurTimeout = React.useRef<NodeJS.Timeout | null>(null)

    return (
      <InfiniteScrollSelect
        keyword={localKeyword}
        placeholder="차량번호를 입력해주세요."
        debouncedKeyword={debouncedKeyword}
        items={fuelCarNumberList}
        hasNextPage={fuelCarNumberHasNextPage ?? false}
        fetchNextPage={fuelCarNumberFetchNextPage}
        isLoading={fuelCarNumberLoading || fuelCarNumberIsFetching}
        onChangeKeyword={(newKeyword) => setLocalKeyword(newKeyword)} // 로컬 상태 변경
        renderItem={(item, isHighlighted) => (
          <div className={isHighlighted ? 'font-bold text-white p-1 bg-gray-400' : ''}>
            {item.vehicleNumber}
          </div>
        )}
        onSelect={(selectedCompany) => handleSelectFuelCarNumber(row.id ?? 0, selectedCompany)}
        shouldShowList={isFocused}
        onFocus={() => {
          if (blurTimeout.current) clearTimeout(blurTimeout.current)
          setFuelCarNumberFocusedId(row.id)
          setClearFuelOutsourcingNameFocusedId(null)
        }}
        onBlur={() => {
          blurTimeout.current = setTimeout(() => setFuelCarNumberFocusedId(null), 200) // 200ms 딜레이
        }}
      />
    )
  }

  // 공사일보의 작업 내용 조회

  // 공사일보에서 주요공정

  const {
    // data: outsourcingData,
    fetchNextPage: workerFetchNextPage,
    hasNextPage: workerHasNextPage,
    isFetching: workerFetching,
    refetch: workerRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['workerView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetWorkerStatusService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleWorkerRefetch = async () => {
    const res = await workerRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allWorkerProcess = res.data.pages.flatMap((page) => page.data.content)

    if (allWorkerProcess.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetWorker()
      return
    }

    const fetched = allWorkerProcess.map((item: any) => ({
      id: item.id,
      workName: item.workName,
      isToday: item.isToday,
      workDetails: item.workDetails.map((detail: any) => ({
        id: detail.id,
        content: detail.content,
        personnelAndEquipment: detail.personnelAndEquipment,
      })),
    }))

    setIsEditMode(true)
    setField('works', fetched)
  }

  //  전일 내용 복사 로직
  const handleCopyPreviousDay = async (targetDate: string) => {
    if (!targetDate) return

    const maxAttempts = 30
    let attempts = 0
    let found = false
    const previousDate = new Date(targetDate)
    let lastCheckedDateStr = ''

    while (!found && attempts < maxAttempts) {
      previousDate.setDate(previousDate.getDate() - 1)
      lastCheckedDateStr = previousDate.toISOString().slice(0, 10)

      const res = await GetWorkerStatusService({
        pageParam: 0,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: lastCheckedDateStr,
      })

      if (res?.data?.content && res.data.content.length > 0) {
        const prevDayItems = res.data.content.filter((item: any) => item.isToday === false)

        if (prevDayItems.length === 0) {
          // 전일 데이터가 없으면 그냥 다음 단계로 넘어감
          continue
        }

        const fetched = prevDayItems.map((item: any) => ({
          id: item.id,
          workName: item.workName,
          isToday: true, // 전일 데이터이므로 false로 유지
          workDetails: item.workDetails.map((detail: any) => ({
            id: detail.id,
            content: detail.content,
            personnelAndEquipment: detail.personnelAndEquipment,
          })),
        }))

        setIsEditMode(true)
        setField('works', fetched)

        if (lastCheckedDateStr !== getTodayDateString(targetDate)) {
          alert(
            `${getTodayDateString(
              targetDate,
            )} 입력 정보가 없어 ${lastCheckedDateStr} 데이터를 조회했습니다.`,
          )
        } else {
          alert('전일 작업 내용이 복사되었습니다.')
        }

        found = true
        break
      }

      attempts++
    }

    if (!found) {
      alert('최근 1개월 이내 데이터가 없습니다.')
    }
  }

  const handleCopyTodayToTomorrow = () => {
    if (!todayWorks || todayWorks.length === 0) {
      alert('금일 작업 내용이 없습니다.')
      return
    }

    const copied = todayWorks.map((work) => ({
      ...work,
      id: Date.now() + Math.random(), // 새로운 ID
      isToday: false, // 명일 데이터로 설정
      workDetails: work.workDetails.map((detail) => ({
        ...detail,
        id: Date.now() + Math.random(), // 세부 항목도 새로운 ID 부여
      })),
    }))

    // 기존 금일 데이터 유지 + 명일 데이터 새로 덮어쓰기
    const newWorks = [
      ...todayWorks, // 금일 데이터 유지
      ...copied, // 복사된 명일 데이터
    ]

    setIsEditMode(true)
    setField('works', newWorks)

    console.log('금일 → 명일 복사 완료:', copied)
    alert('금일 작업 내용이 명일로 복사되었습니다.')
  }

  const todayWorks = useMemo(() => form.works.filter((w) => w.isToday === true), [form.works])
  const tomorrowWorks = useMemo(() => form.works.filter((w) => w.isToday === false), [form.works])

  const checkedTodayWorkIds = form.checkedWorkerIds.filter((id) =>
    todayWorks.some((w) => w.id === id),
  )
  const checkedTomorrowWorkIds = form.checkedWorkerIds.filter((id) =>
    tomorrowWorks.some((w) => w.id === id),
  )

  const isTodayAllChecked =
    todayWorks.length > 0 && checkedTodayWorkIds.length === todayWorks.length
  const isTomorrowAllChecked =
    tomorrowWorks.length > 0 && checkedTomorrowWorkIds.length === tomorrowWorks.length

  // 공사일보에서 주요공정

  const {
    // data: outsourcingData,
    fetchNextPage: processFetchNextPage,
    hasNextPage: processHasNextPage,
    isFetching: processFetching,
    refetch: processRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['processView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetMainProcessService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleMainProcessRefetch = async () => {
    const res = await processRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allMainProcess = res.data.pages.flatMap((page) => page.data.content)

    if (allMainProcess.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetMainProcess()
      return
    }

    const fetched = allMainProcess.map((item: any) => ({
      id: item.id,
      process: item.process,
      unit: item.unit,
      contractAmount: item.contractAmount,
      previousDayAmount: item.previousDayAmount,
      todayAmount: item.todayAmount,
      cumulativeAmount: item.cumulativeAmount,
      processRate: item.processRate,
    }))

    setIsEditMode(true)
    setField('mainProcesses', fetched)
  }

  // 날짜 → YYYY-MM-DD 문자열 변환 헬퍼
  const formatDateString = (date: Date) => date.toISOString().slice(0, 10)

  // YYYY-MM-DD → MM월 DD일 포맷 변환
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}월 ${day}일`
  }

  // 전일 내용 복사
  const handleMainProcessCopy = async (targetDate: string) => {
    if (!targetDate) return

    let found = false
    let attempts = 0
    const maxAttempts = 30 // 최대 1개월 전까지
    const previousDate = new Date(targetDate)
    let lastCheckedDateStr = ''

    while (!found && attempts < maxAttempts) {
      previousDate.setDate(previousDate.getDate() - 1)
      lastCheckedDateStr = formatDateString(previousDate)

      // 전일(혹은 과거) 데이터 조회
      const res = await GetMainProcessService({
        pageParam: 0,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: lastCheckedDateStr,
      })

      console.log('전일 내용 복사', res)

      if (res?.data?.content && res.data.content.length > 0) {
        const allMainProcess = res.data.content
        const fetched = allMainProcess.map((item: any) => ({
          id: item.id,
          process: item.process,
          unit: item.unit,
          contractAmount: item.contractAmount,
          previousDayAmount: item.previousDayAmount,
          todayAmount: item.todayAmount,
          cumulativeAmount: item.cumulativeAmount,
          processRate: item.processRate,
        }))

        setIsEditMode(true)
        setField('mainProcesses', fetched)

        if (attempts === 0) {
          // 바로 전일 데이터 있음
          alert('전일 주요공정 내용이 복사되었습니다.')
        } else {
          // 며칠 전 데이터 발견
          alert(
            `${formatDisplayDate(targetDate)} 입력정보가 없어 ${formatDisplayDate(
              lastCheckedDateStr,
            )} 데이터를 조회했습니다.`,
          )
        }

        found = true
        break
      }

      attempts++
    }

    // 1개월 내에도 데이터 없을 경우
    if (!found) {
      alert('최근 1개월 이내 주요공정 데이터가 없습니다.')
    }
  }

  const mainProcessesList = useMemo(() => form.mainProcesses, [form.mainProcesses])

  const checkedProcessIds = form.checkedMainProcessIds
  const isProcessAllChecked =
    mainProcessesList.length > 0 && checkedProcessIds.length === mainProcessesList.length

  // 공사일보의 투입현황

  // 기존
  // const inputStatusesList = useMemo(() => form.inputStatuses, [form.inputStatuses])

  // 투입 현황

  const {
    // data: outsourcingData,
    fetchNextPage: inputStatusesFetchNextPage,
    hasNextPage: inputStatusesHasNextPage,
    isFetching: inputStatusesFetching,
    refetch: inputStatusesRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['inputStatusView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetInputStatusService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleInputStatusRefetch = async () => {
    const res = await inputStatusesRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allInputStatus = res.data.pages.flatMap((page) => page.data.content)

    if (allInputStatus.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetInputStatus()
      return
    }

    const fetched = allInputStatus.map((item: any) => ({
      id: item.id,
      category: item.category,
      previousDayCount: item.previousDayCount,
      todayCount: item.todayCount,
      cumulativeCount: item.cumulativeCount,
      type: item.typeCode,
    }))

    setIsEditMode(true)

    setField('inputStatuses', fetched)
  }

  const handleInputProcessCopy = async (targetDate: string) => {
    if (!targetDate) return

    let found = false
    let attempts = 0
    const maxAttempts = 30 // 최대 1개월
    const previousDate = new Date(targetDate)
    let lastCheckedDateStr = ''

    while (!found && attempts < maxAttempts) {
      previousDate.setDate(previousDate.getDate() - 1)
      lastCheckedDateStr = formatDateString(previousDate)

      const res = await GetInputStatusService({
        pageParam: 0,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: lastCheckedDateStr,
      })

      if (res?.data?.content && res.data.content.length > 0) {
        const personnelList = res.data.content.filter((item: any) => item.typeCode === 'PERSONNEL')

        // PERSONNEL 데이터가 없다면 패스
        if (personnelList.length === 0) {
          continue
        }

        // 🔹 변환
        const fetched = personnelList.map((item: any) => ({
          id: item.id,
          category: item.category,
          previousDayCount: item.previousDayCount,
          todayCount: item.todayCount,
          cumulativeCount: item.cumulativeCount,
          type: item.typeCode, // PERSONNEL 고정
        }))

        setIsEditMode(true)
        setField('inputStatuses', fetched)

        if (attempts === 0) {
          alert('전일 투입현황 내용이 복사되었습니다.')
        } else {
          alert(
            `${formatDisplayDate(targetDate)} 입력정보가 없어 ${formatDisplayDate(
              lastCheckedDateStr,
            )} 데이터를 조회했습니다.`,
          )
        }

        found = true
        break
      }

      attempts++
    }

    if (!found) {
      alert('최근 1개월 이내 투입현황 데이터가 없습니다.')
    }
  }

  const handleEquipMentProcessCopy = async (targetDate: string) => {
    if (!targetDate) return

    let found = false
    let attempts = 0
    const maxAttempts = 30 // 최대 1개월
    const previousDate = new Date(targetDate)
    let lastCheckedDateStr = ''

    while (!found && attempts < maxAttempts) {
      previousDate.setDate(previousDate.getDate() - 1)
      lastCheckedDateStr = formatDateString(previousDate)

      const res = await GetInputStatusService({
        pageParam: 0,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: lastCheckedDateStr,
      })

      if (res?.data?.content && res.data.content.length > 0) {
        const personnelList = res.data.content.filter((item: any) => item.typeCode === 'EQUIPMENT')

        // PERSONNEL 데이터가 없다면 패스
        if (personnelList.length === 0) {
          continue
        }

        // 🔹 변환
        const fetched = personnelList.map((item: any) => ({
          id: item.id,
          category: item.category,
          previousDayCount: item.previousDayCount,
          todayCount: item.todayCount,
          cumulativeCount: item.cumulativeCount,
          type: item.typeCode, // PERSONNEL 고정
        }))

        setIsEditMode(true)
        setField('inputStatuses', fetched)

        if (attempts === 0) {
          alert('전일 투입현황 내용이 복사되었습니다.')
        } else {
          alert(
            `${formatDisplayDate(targetDate)} 입력정보가 없어 ${formatDisplayDate(
              lastCheckedDateStr,
            )} 데이터를 조회했습니다.`,
          )
        }

        found = true
        break
      }

      attempts++
    }

    if (!found) {
      alert('최근 1개월 이내 투입현황 데이터가 없습니다.')
    }
  }

  const personnelList = useMemo(
    () => form.inputStatuses.filter((item) => item.type === 'PERSONNEL'),
    [form.inputStatuses],
  )

  const equipmentList = useMemo(
    () => form.inputStatuses.filter((item) => item.type === 'EQUIPMENT'),
    [form.inputStatuses],
  )

  const checkedInputStatusIds = form.checkedInputStatusIds

  const isPersonnelAllChecked =
    personnelList.length > 0 &&
    personnelList.every((item) => checkedInputStatusIds.includes(item.id))

  const isStatusEquipmentAllChecked =
    equipmentList.length > 0 &&
    equipmentList.every((item) => checkedInputStatusIds.includes(item.id))

  // 자재현황 리스트 조회

  const {
    // data: outsourcingData,
    fetchNextPage: materialStatusesFetchNextPage,
    hasNextPage: materialStatusesHasNextPage,
    isFetching: materialStatusesFetching,
    refetch: materialStatusesRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['materialStatusView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetMaterialStatusService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleMaterialStatusRefetch = async () => {
    const res = await materialStatusesRefetch()
    if (!res.data) return

    // content 배열 합치기
    const allMaterialStatus = res.data.pages.flatMap((page) => page.data.content)

    if (allMaterialStatus.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetMaterialStatus()
      return
    }

    const fetched = allMaterialStatus.map((item: any) => ({
      id: item.id,
      materialName: item.materialName,
      unit: item.unit,
      plannedAmount: item.plannedAmount,
      previousDayAmount: item.previousDayAmount,
      todayAmount: item.todayAmount,
      cumulativeAmount: item.cumulativeAmount,
      remainingAmount: item.remainingAmount,
      type: item.typeCode,
    }))

    setIsEditMode(true)

    setField('materialStatuses', fetched)
  }

  // 전일 자재현황 복사
  const handleMaterialProcessCopy = async (targetDate: string) => {
    if (!targetDate) return

    let found = false
    let attempts = 0
    const maxAttempts = 30 // 최대 1개월
    const previousDate = new Date(targetDate)
    let lastCheckedDateStr = ''

    while (!found && attempts < maxAttempts) {
      previousDate.setDate(previousDate.getDate() - 1)
      lastCheckedDateStr = formatDateString(previousDate)

      //  전일(혹은 과거) 자재현황 조회
      const res = await GetMaterialStatusService({
        pageParam: 0,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: lastCheckedDateStr,
      })

      if (res?.data?.content && res.data.content.length > 0) {
        const personnelList = res.data.content.filter(
          (item: any) => item.typeCode === 'COMPANY_SUPPLIED',
        )

        // PERSONNEL 데이터가 없다면 패스
        if (personnelList.length === 0) {
          continue
        }

        //  데이터 존재 시 변환
        const fetched = personnelList.map((item: any) => ({
          id: item.id,
          materialName: item.materialName,
          unit: item.unit,
          plannedAmount: item.plannedAmount,
          previousDayAmount: item.previousDayAmount,
          todayAmount: item.todayAmount,
          cumulativeAmount: item.cumulativeAmount,
          remainingAmount: item.remainingAmount,
          type: item.typeCode, // COMPANY_SUPPLIED / CLIENT_SUPPLIED
        }))

        setIsEditMode(true)
        setField('materialStatuses', fetched)

        // 🔹 알림 메시지 처리
        if (attempts === 0) {
          alert('전일 자재현황 내용이 복사되었습니다.')
        } else {
          alert(
            `${formatDisplayDate(targetDate)} 입력정보가 없어 ${formatDisplayDate(
              lastCheckedDateStr,
            )} 데이터를 조회했습니다.`,
          )
        }

        found = true
        break
      }

      attempts++
    }

    // 🔹 1개월 이내에도 데이터 없을 경우
    if (!found) {
      alert('최근 1개월 이내 자재현황 데이터가 없습니다.')
    }
  }

  // 전일 자재현황 복사
  const handlePaymentMaterialProcessCopy = async (targetDate: string) => {
    if (!targetDate) return

    let found = false
    let attempts = 0
    const maxAttempts = 30 // 최대 1개월
    const previousDate = new Date(targetDate)
    let lastCheckedDateStr = ''

    while (!found && attempts < maxAttempts) {
      previousDate.setDate(previousDate.getDate() - 1)
      lastCheckedDateStr = formatDateString(previousDate)

      //  전일(혹은 과거) 자재현황 조회
      const res = await GetMaterialStatusService({
        pageParam: 0,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: lastCheckedDateStr,
      })

      if (res?.data?.content && res.data.content.length > 0) {
        const personnelList = res.data.content.filter(
          (item: any) => item.typeCode === 'CLIENT_SUPPLIED',
        )

        // PERSONNEL 데이터가 없다면 패스
        if (personnelList.length === 0) {
          continue
        }

        //  데이터 존재 시 변환
        const fetched = personnelList.map((item: any) => ({
          id: item.id,
          materialName: item.materialName,
          unit: item.unit,
          plannedAmount: item.plannedAmount,
          previousDayAmount: item.previousDayAmount,
          todayAmount: item.todayAmount,
          cumulativeAmount: item.cumulativeAmount,
          remainingAmount: item.remainingAmount,
          type: item.typeCode, // COMPANY_SUPPLIED / CLIENT_SUPPLIED
        }))

        setIsEditMode(true)
        setField('materialStatuses', fetched)

        // 🔹 알림 메시지 처리
        if (attempts === 0) {
          alert('전일 자재현황 내용이 복사되었습니다.')
        } else {
          alert(
            `${formatDisplayDate(targetDate)} 입력정보가 없어 ${formatDisplayDate(
              lastCheckedDateStr,
            )} 데이터를 조회했습니다.`,
          )
        }

        found = true
        break
      }

      attempts++
    }

    // 🔹 1개월 이내에도 데이터 없을 경우
    if (!found) {
      alert('최근 1개월 이내 자재현황 데이터가 없습니다.')
    }
  }

  const urgentMaterialList = useMemo(
    () => form.materialStatuses.filter((item) => item.type === 'COMPANY_SUPPLIED'),
    [form.materialStatuses],
  )

  const PaymentMaterialList = useMemo(
    () => form.materialStatuses.filter((item) => item.type === 'CLIENT_SUPPLIED'),
    [form.materialStatuses],
  )

  const checkedMaterialIds = form.checkedMaterialIds

  const isUrgentAllChecked =
    urgentMaterialList.length > 0 &&
    urgentMaterialList.every((item) => checkedMaterialIds.includes(item.id))

  const isPaymentAllChecked =
    PaymentMaterialList.length > 0 &&
    PaymentMaterialList.every((item) => checkedMaterialIds.includes(item.id))

  // 유류 데이터

  const fuelData = useMemo(() => form.fuelInfos, [form.fuelInfos])

  const checkedFuelIds = form.checkedFuelsIds
  const isFuelAllChecked = fuelData.length > 0 && checkedFuelIds.length === fuelData.length

  // 첨부팡리
  const {
    fetchNextPage: fileFetchNextPage,
    hasNextPage: fileHasNextPage,
    isFetching: fileFetching,
    refetch: fileRefetch, // 조회 버튼에서 직접 실행할 수 있게
  } = useInfiniteQuery({
    queryKey: ['fileView', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: ({ pageParam }) =>
      GetAttachedFileByFilterService({
        pageParam,
        siteId: form.siteId,
        siteProcessId: form.siteProcessId,
        reportDate: form.reportDate ? form.reportDate.toISOString().slice(0, 10) : '',
      }),
    enabled: false, // 버튼 누르기 전에는 자동 조회 안 되게
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const handleFileRefetch = async () => {
    const res = await fileRefetch()
    if (!res.data) return

    // file 배열 합치기
    const allFileContents = res.data.pages.flatMap((page) => page.data.content)

    if (allFileContents.length === 0) {
      // 데이터가 아예 없는 경우
      resetFile()
      setIsEditMode(false)
      return
    }

    const fetched = allFileContents.map((item: any) => ({
      id: item.id,
      description: item.description ?? '',
      memo: item.memo ?? '',
      files: [
        {
          id: item.id,
          fileUrl: item.fileUrl ?? '',
          originalFileName: item.originalFileName ?? '',
        },
      ],
    }))

    setIsEditMode(true)
    setField('files', fetched)
  }

  const attachedFiles = useMemo(() => form.files, [form.files])

  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  // 직원에서 증빙 서류 체크 박스 순서

  useEffect(() => {
    if (!form.siteId || !form.siteProcessId || !form.reportDate) return

    const fetchData = async () => {
      if (activeTab === '직원') {
        handleEmployeesRefetch()
        handleEmployeesEvidenceRefetch()
      }
      if (activeTab === '직영/용역') {
        handleContractRefetch()
        handleOutByContractRefetch()
        handleDirectContractRefetch()
        handleContractEvidenceRefetch()
      }
      if (activeTab === '외주(공사)') {
        handleOutsourcingRefetch()
        handleOutSourcingEvidenceRefetch()
      } else if (activeTab === '장비') {
        handleEquipmentRefetch()
        handleEquipmentEvidenceRefetch()
      } else if (activeTab === '유류') {
        handleFuelRefetch()
        handleFuelEvidenceRefetch()
      } else if (activeTab === '현장 사진 등록') {
        handleFileRefetch()
      } else if (activeTab === '공사일보') {
        if (activeSubTab === '주요공정') {
          handleMainProcessRefetch()
        } else if (activeSubTab === '작업내용') {
          handleWorkerRefetch()
        } else if (activeSubTab === '투입현황') {
          handleInputStatusRefetch()
        } else if (activeSubTab === '자재현황') {
          handleMaterialStatusRefetch()
        }
      }
    }

    fetchData()
  }, [activeTab, activeSubTab, form.siteId, form.siteName, form.siteProcessId, form.reportDate])

  // 출역일보 전체 데이터 조회

  console.log(
    'form.siteIdform.siteId',
    form.siteId,
    form.siteName,
    form.siteProcessId,
    form.siteProcessName,
  )

  const detailReportQuery = useQuery({
    queryKey: ['detailReport', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: () =>
      DetaileReport({
        siteId: form.siteId || 0,
        siteProcessId: form.siteProcessId || 0,
        reportDate: getTodayDateString(form.reportDate) || '',
      }),
    enabled: !!form.siteId && !!form.siteProcessId && !!form.reportDate,
  })

  const { data: detailReport } = detailReportQuery

  // 출역일보 가격 가져오기

  const detailFuelPrice = useQuery({
    queryKey: ['oilPrice', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: () =>
      GetFuelPrice({
        siteId: form.siteId || 0,
        siteProcessId: form.siteProcessId || 0,
        reportDate: getTodayDateString(form.reportDate) || '',
      }),
    enabled: !!form.siteId && !!form.siteProcessId && !!form.reportDate,
    refetchOnWindowFocus: false, // 포커스 바뀌어도 재요청 안 함
    refetchOnReconnect: false, // 네트워크 재연결해도 재요청 안 함
    retry: false, // 실패했을 때 자동 재시도 X
  })

  const { data: oilPrice } = detailFuelPrice

  // 출역일보 유류에서 유류 업체명 가져오기

  const detailFuelCompany = useQuery({
    queryKey: ['fuelCompany', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: () =>
      GetFuelCompany({
        siteId: form.siteId || 0,
        siteProcessId: form.siteProcessId || 0,
        reportDate: getTodayDateString(form.reportDate) || '',
      }),
    enabled: !!form.siteId && !!form.siteProcessId && !!form.reportDate,
    refetchOnWindowFocus: false, // 포커스 바뀌어도 재요청 안 함
    refetchOnReconnect: false, // 네트워크 재연결해도 재요청 안 함
    retry: false, // 실패했을 때 자동 재시도 X
  })

  const { data: fuelCompany } = detailFuelCompany

  console.log('fuelCompanyfuelCompany', detailReport)

  useEffect(() => {
    if (detailReport?.status === 200 && !isEditMode) {
      setIsEditMode(true)
      setField('gasolinePrice', oilPrice?.data.gasolinePrice) // 상세 데이터가 있을 때만 세팅

      setField('dieselPrice', oilPrice?.data.dieselPrice) // 상세 데이터가 있을 때만 세팅
      setField('ureaPrice', oilPrice?.data.ureaPrice) // 상세 데이터가 있을 때만 세팅
      setField('outsourcingCompanyId', fuelCompany?.data?.outsourcingCompany?.id)
      setField('outsourcingCompanyName', fuelCompany?.data?.outsourcingCompany?.name)
    }
  }, [detailReport, isEditMode])

  useEffect(() => {
    if (detailReport === undefined) {
      setField('weather', 'BASE') // 상세 데이터가 있을 때만 세팅
    }
    if (detailReport?.status === 200 || oilPrice || fuelCompany) {
      setField('weather', detailReport?.data?.weatherCode) // 상세 데이터가 있을 때만 세팅
      setField('gasolinePrice', oilPrice?.data.gasolinePrice) // 상세 데이터가 있을 때만 세팅
      setField('dieselPrice', oilPrice?.data.dieselPrice) // 상세 데이터가 있을 때만 세팅
      setField('outsourcingCompanyId', fuelCompany?.data?.outsourcingCompany?.id)
      setField('outsourcingCompanyName', fuelCompany?.data?.outsourcingCompany?.name)

      // if (!isEditMode) setIsEditMode(false) // 최초 로딩 시 editMode 설정
    }
  }, [detailReport, oilPrice, fuelCompany])

  // 증빙 서류 조회

  // 직원에 대한 증빙서류 조회

  const { refetch: employeesEvidenceRefetch } = useInfiniteQuery({
    queryKey: ['employeesEvidence', detailReport?.data?.id],
    queryFn: ({ pageParam }) => {
      return GetReportByEvidenceFilterService({
        pageParam,
        id: detailReport?.data?.id,
        fileType: 'EMPLOYEE',
      })
    },
    enabled: !!detailReport?.data?.id, // detailReport.id가 준비될 때만 실행
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.sliceInfo.hasNext ? lastPage.data.sliceInfo.page + 1 : undefined,
  })

  const handleEmployeesEvidenceRefetch = async () => {
    if (!detailReport?.data?.id) return

    const res = await employeesEvidenceRefetch()
    if (!res?.data) return

    const allContents = res.data.pages.flatMap((page) => page.data?.content ?? [])

    if (allContents.length === 0) {
      // setIsEditMode(false)
      resetEmployeesEvidenceFile()
      return
    }

    const fetched = allContents.map((item: any) => ({
      id: item.id,
      fileType: item.fileType,
      name: item.name,
      files: [
        {
          id: item.id,
          fileUrl: item.fileUrl ?? '',
          originalFileName: item.originalFileName ?? '',
        },
      ],
      memo: item.memo,
    }))

    // setIsEditMode(true)
    setField('employeeFile', fetched)
  }

  // 직영 계약직의 증빙 서류

  // 직원에 대한 증빙서류 조회

  const { refetch: contractEvidenceRefetch } = useInfiniteQuery({
    queryKey: ['contractEvidence', detailReport?.data?.id],
    queryFn: ({ pageParam }) => {
      return GetReportByEvidenceFilterService({
        pageParam,
        id: detailReport?.data?.id,
        fileType: 'DIRECT_CONTRACT',
      })
    },
    enabled: !!detailReport?.data?.id, // detailReport.id가 준비될 때만 실행
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.sliceInfo.hasNext ? lastPage.data.sliceInfo.page + 1 : undefined,
  })

  const handleContractEvidenceRefetch = async () => {
    if (!detailReport?.data?.id) return

    const res = await contractEvidenceRefetch()
    if (!res?.data) return

    const allContents = res.data.pages.flatMap((page) => page.data?.content ?? [])

    if (allContents.length === 0) {
      // setIsEditMode(false)
      resetContractEvidenceFile()
      return
    }

    const fetched = allContents.map((item: any) => ({
      id: item.id,
      fileType: item.fileType,
      name: item.name,
      files: [
        {
          id: item.id,
          fileUrl: item.fileUrl ?? '',
          originalFileName: item.originalFileName ?? '',
        },
      ],
      memo: item.memo,
    }))

    // setIsEditMode(true)
    setField('contractProofFile', fetched)
  }

  // 외주(공사) 증빙 서류

  const { refetch: outsourcingEvidenceRefetch } = useInfiniteQuery({
    queryKey: ['outSourcingEvidence', detailReport?.data?.id],
    queryFn: ({ pageParam }) => {
      return GetReportByEvidenceFilterService({
        pageParam,
        id: detailReport?.data?.id,
        fileType: 'OUTSOURCING',
      })
    },
    enabled: !!detailReport?.data?.id, // detailReport.id가 준비될 때만 실행
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.sliceInfo.hasNext ? lastPage.data.sliceInfo.page + 1 : undefined,
  })

  const handleOutSourcingEvidenceRefetch = async () => {
    if (!detailReport?.data?.id) return

    const res = await outsourcingEvidenceRefetch()
    if (!res?.data) return

    const allContents = res.data.pages.flatMap((page) => page.data?.content ?? [])

    if (allContents.length === 0) {
      // setIsEditMode(false)
      resetOutsourcingEvidenceFile()
      return
    }

    const fetched = allContents.map((item: any) => ({
      id: item.id,
      fileType: item.fileType,
      name: item.name,
      files: [
        {
          id: item.id,
          fileUrl: item.fileUrl ?? '',
          originalFileName: item.originalFileName ?? '',
        },
      ],
      memo: item.memo,
    }))

    // setIsEditMode(true)
    setField('outsourcingProofFile', fetched)
  }

  // 장비 데이터
  const { refetch: equipmentEvidenceRefetch } = useInfiniteQuery({
    queryKey: ['equipmentEvidence', detailReport?.data?.id],
    queryFn: ({ pageParam }) => {
      return GetReportByEvidenceFilterService({
        pageParam,
        id: detailReport?.data?.id,
        fileType: 'EQUIPMENT',
      })
    },
    enabled: !!detailReport?.data?.id, // detailReport.id가 준비될 때만 실행
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.sliceInfo.hasNext ? lastPage.data.sliceInfo.page + 1 : undefined,
  })

  const handleEquipmentEvidenceRefetch = async () => {
    if (!detailReport?.data?.id) return

    const res = await equipmentEvidenceRefetch()
    if (!res?.data) return

    const allContents = res.data.pages.flatMap((page) => page.data?.content ?? [])

    if (allContents.length === 0) {
      // setIsEditMode(false)
      resetEquipmentEvidenceFile()
      return
    }

    const fetched = allContents.map((item: any) => ({
      id: item.id,
      fileType: item.fileType,
      name: item.name,
      files: [
        {
          id: item.id,
          fileUrl: item.fileUrl ?? '',
          originalFileName: item.originalFileName ?? '',
        },
      ],
      memo: item.memo,
    }))

    // setIsEditMode(true)
    setField('equipmentProofFile', fetched)
  }

  // 장비 데이터
  const { refetch: fuelEvidenceRefetch } = useInfiniteQuery({
    queryKey: ['fuelEvidence', detailReport?.data?.id],
    queryFn: ({ pageParam }) => {
      return GetReportByEvidenceFilterService({
        pageParam,
        id: detailReport?.data?.id,
        fileType: 'FUEL',
      })
    },
    enabled: !!detailReport?.data?.id, // detailReport.id가 준비될 때만 실행
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.sliceInfo.hasNext ? lastPage.data.sliceInfo.page + 1 : undefined,
  })

  const handleFuelEvidenceRefetch = async () => {
    if (!detailReport?.data?.id) return

    const res = await fuelEvidenceRefetch()
    if (!res?.data) return

    const allContents = res.data.pages.flatMap((page) => page.data?.content ?? [])

    if (allContents.length === 0) {
      // setIsEditMode(false)
      resetFuelEvidenceFile()
      return
    }

    const fetched = allContents.map((item: any) => ({
      id: item.id,
      fileType: item.fileType,
      name: item.name,
      files: [
        {
          id: item.id,
          fileUrl: item.fileUrl ?? '',
          originalFileName: item.originalFileName ?? '',
        },
      ],
      memo: item.memo,
    }))

    // setIsEditMode(true)
    setField('fuelProofFile', fetched)
  }

  // 상세페이지 데이터 로딩되면 바로 직원 증빙 조회 실행
  useEffect(() => {
    if (detailReport?.status === 200 && detailReport.data?.id) {
      if (activeTab === '직원') {
        handleEmployeesEvidenceRefetch()
      } else if (activeTab === '직영/용역') {
        handleContractEvidenceRefetch()
      } else if (activeTab === '외주(공사)') {
        handleOutSourcingEvidenceRefetch()
      } else if (activeTab === '장비') {
        handleEquipmentEvidenceRefetch()
      } else if (activeTab === '유류') {
        handleFuelEvidenceRefetch()
      }
    } else {
      resetEmployeesEvidenceFile()
      resetContractEvidenceFile()
      resetOutsourcingEvidenceFile()
      resetEquipmentEvidenceFile()
      resetFuelEvidenceFile()
    }
  }, [detailReport, activeTab])

  const employeeProof = useMemo(() => form.employeeFile, [form.employeeFile])

  const employeeProofCheckIds = form.employeeCheckId
  const isEmployeeProofAllChecked =
    employeeProof.length > 0 && employeeProofCheckIds.length === employeeProof.length

  // 직영에서 증빙서류 확인

  const contractFileProof = useMemo(() => form.contractProofFile, [form.contractProofFile])

  const contractProofCheckIds = form.contractProofCheckId

  const isContractProofAllChecked =
    contractFileProof.length > 0 && contractProofCheckIds.length === contractFileProof.length

  // 외주(공사) 증빙서류 확인

  const outSourcingFileProof = useMemo(() => form.outsourcingProofFile, [form.outsourcingProofFile])

  const outSourcingProofCheckIds = form.outsourcingProofCheckId

  const isOutSourcingProofAllChecked =
    outSourcingFileProof.length > 0 &&
    outSourcingProofCheckIds.length === outSourcingFileProof.length

  // 장비 증빙 서류

  const equipmentProof = useMemo(() => form.equipmentProofFile, [form.equipmentProofFile])

  const equipmentProofCheckIds = form.equipmentProofCheckId
  const isEquipmentProofAllChecked =
    equipmentProof.length > 0 && equipmentProofCheckIds.length === equipmentProof.length

  // 유류 증빙 서류

  const fuelProof = useMemo(() => form.fuelProofFile, [form.fuelProofFile])

  const fuelProofCheckIds = form.fuelProofCheckId
  const isFuelProofAllChecked =
    fuelProof.length > 0 && fuelProofCheckIds.length === fuelProof.length

  const Deadline = () => {
    CompleteInfoMutation.mutate(
      {
        siteId: form.siteId || 0,
        siteProcessId: form.siteProcessId || 0,
        reportDate: getTodayDateString(form.reportDate) || '',
      },
      {
        onSuccess: () => {
          detailReportQuery.refetch() // React Query 사용 시
        },
      },
    )
  }

  // 권한에 따른 버튼 활성화

  const [myInfo, setMyInfo] = useState<myInfoProps | null>(null)

  const searchParams = useSearchParams()
  const date = searchParams.get('date')
  const siteId = searchParams.get('site')
  const processId = searchParams.get('process')

  const siteName = searchParams.get('siteName')

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    reset()

    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }

    if (!date) return
    setField('reportDate', new Date(date))
    if (siteId) setField('siteId', Number(siteId))
    if (processId) setField('siteProcessId', Number(processId))
    setField('siteName', String(siteName))
  }, [])

  const isHeadOfficeInfo = myInfo?.isHeadOffice

  const roleId = Number(myInfo?.roles?.[0]?.id)
  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted
  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasApproval } = useMenuPermission(roleId, '출역일보', enabled)

  // const [carNumberOptionsByCompany, setCarNumberOptionsByCompany] = useState<Record<any, any[]>>({})

  // const [driverOptionsByCompany, setDriverOptionsByCompany] = useState<Record<number, any[]>>({})

  // 외주(공사)의 항목명 가져온느 변수 값

  // 직영/계약직에서  이름 불러오기

  // 계약직만 데이터 조회

  // const {
  //   data: contractInfo,
  //   fetchNextPage: contractNameFetchNextPage,
  //   hasNextPage: contractNamehasNextPage,
  //   isFetching: contractNameFetching,
  //   isLoading: contractNameLoading,
  // } = useInfiniteQuery({
  //   queryKey: ['contractInfo', selectedCompanyIds[selectId]],
  //   queryFn: ({ pageParam = 0 }) =>
  //     GetContractNameInfoService({
  //       pageParam,
  //       // outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
  //       size: 100,
  //     }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
  //   },
  //   enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  // })
  // // 직영/용역에 이름 키워드 검색

  // // 직영/용역에서 직영 데이터 조회
  // useEffect(() => {
  //   if (!contractInfo) return

  //   const options = contractInfo.pages
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       name: user.name,
  //       type: user.type,
  //       previousDailyWage: user.previousDailyWage || user.dailyWage,
  //       dailyWage: user.dailyWage,
  //       isSeverancePayEligible: user.isSeverancePayEligible,
  //       workType: user.workType,
  //     }))

  //   setContarctNameOptionsByCompany((prev) => ({
  //     ...prev,
  //     [selectedCompanyIds[selectId]]: [
  //       {
  //         id: 0,
  //         name: '선택',
  //         type: '',
  //         previousDailyWage: '',
  //         dailyWage: '',
  //         isSeverancePayEligible: false,
  //         workType: '',
  //       },
  //       ...options,
  //     ],
  //   }))
  // }, [contractInfo, selectedCompanyIds, selectId])

  // 상세페이지 데이터 (예: props나 query에서 가져온 값)
  const ContractOutsourcings = contractData

  // 1. 상세페이지 들어올 때 각 업체별 worker 데이터 API 호출 (직영 용역 데이터 불러옴 언제? 셀렉트 박스 선택 시 )
  useEffect(() => {
    if (!ContractOutsourcings.length) return

    ContractOutsourcings.forEach(async (row) => {
      const companyId = row.outsourcingCompanyId
      const worker = row.laborId

      if (ContarctNameOptionsByCompany[companyId]) {
        return
      }

      // if (companyId === null) {
      //   return
      // }

      try {
        const res = await GetContractNameInfoService({
          pageParam: 0,
          // outsourcingCompanyId: companyId,
          size: 200,
        })

        const options = res.data.content.map((user: any) => ({
          id: user.id,
          name: user.name,
          type: user.type,
          previousDailyWage: user.previousDailyWage || user.dailyWage,
          dailyWage: user.dailyWage,
          isSeverancePayEligible: user.isSeverancePayEligible,
          workType: user.workType,
        }))

        setContarctNameOptionsByCompany((prev) => {
          const exists = options.some((opt: any) => opt.id === worker)

          return {
            ...prev,
            [companyId]: [
              {
                id: 0,
                name: '선택',
                type: '',
                previousDailyWage: '',
                dailyWage: '',
                isSeverancePayEligible: false,
                workType: '',
              },
              ...options,
              // 만약 선택된 worker가 목록에 없으면 추가
              ...(worker && !exists
                ? [
                    {
                      id: worker,
                      name: '',
                      type: '',
                      previousDailyWage: '',
                      dailyWage: '',
                      isSeverancePayEligible: false,
                      workType: '',
                    },
                  ]
                : []),
            ],
          }
        })
      } catch (err) {
        console.error('업체별 인력 조회 실패', err)
      }
    })
  }, [ContractOutsourcings])

  //직영/용역에서 용역에 필요한 이름 검색 하기 위함 ..

  // const {
  //   data: NameByOutsourcingInfo,
  //   fetchNextPage: NameByOutsourcingFetchNextPage,
  //   hasNextPage: NameByOutsourcinghasNextPage,
  //   isFetching: NameByOutsourcingFetching,
  //   isLoading: NameByOutsourcingLoading,
  // } = useInfiniteQuery({
  //   queryKey: ['NameByOutsourcingInfo', selectedCompanyIds[selectId]],
  //   queryFn: ({ pageParam = 0 }) =>
  //     GetContractNameInfoByOutsourcing({
  //       pageParam,
  //       outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
  //       size: 100,
  //     }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
  //   },
  //   enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  // })

  // useEffect(() => {
  //   if (!NameByOutsourcingInfo) return

  //   const options = NameByOutsourcingInfo.pages
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       name: user.name,
  //       type: user.type,
  //       previousDailyWage: user.previousDailyWage || user.dailyWage,
  //       dailyWage: user.dailyWage,
  //       isSeverancePayEligible: user.isSeverancePayEligible,
  //     }))

  //   setOutSourcingByDirectContract((prev) => ({
  //     ...prev,
  //     [selectedCompanyIds[selectId]]: [
  //       {
  //         id: 0,
  //         name: '선택',
  //         type: '',
  //         previousDailyWage: '',
  //         dailyWage: '',
  //         isSeverancePayEligible: false,
  //       },
  //       ...options,
  //     ],
  //   }))
  // }, [NameByOutsourcingInfo, selectedCompanyIds, selectId])

  // 상세페이지 데이터 (예: props나 query에서 가져온 값)

  // 1. 상세페이지 들어올 때 각 업체별 worker 데이터 API 호출 (직영 용역 데이터 불러옴 언제? 셀렉트 박스 선택 시 )
  // useEffect(() => {
  //   if (!OutsourcingInfoBydaily.length) return

  //   OutsourcingInfoBydaily.forEach(async (row) => {
  //     const companyId = row.outsourcingCompanyId
  //     const worker = row.laborId

  //     if (ContarctNameOptionsByCompany[companyId]) {
  //       return
  //     }

  //     if (companyId === null) {
  //       return
  //     }

  //     try {
  //       const res = await GetContractNameInfoByOutsourcing({
  //         pageParam: 0,
  //         outsourcingCompanyId: companyId,
  //         size: 200,
  //       })

  //       const options = res.data.content.map((user: any) => ({
  //         id: user.id,
  //         name: user.name,
  //         type: user.type,
  //         previousDailyWage: user.previousDailyWage || user.dailyWage,
  //         dailyWage: user.dailyWage,
  //         isSeverancePayEligible: user.isSeverancePayEligible,
  //       }))

  //       setOutSourcingByDirectContract((prev) => {
  //         const exists = options.some((opt: any) => opt.id === worker)

  //         return {
  //           ...prev,
  //           [companyId]: [
  //             {
  //               id: 0,
  //               name: '선택',
  //               type: '',
  //               previousDailyWage: '',
  //               dailyWage: '',
  //               isSeverancePayEligible: false,
  //             },
  //             ...options,
  //             // 만약 선택된 worker가 목록에 없으면 추가
  //             ...(worker && !exists
  //               ? [
  //                   {
  //                     id: worker,
  //                     name: '',
  //                     type: '',
  //                     previousDailyWage: '',
  //                     dailyWage: '',
  //                     isSeverancePayEligible: false,
  //                   },
  //                 ]
  //               : []),
  //           ],
  //         }
  //       })
  //     } catch (err) {
  //       console.error('업체별 인력 조회 실패', err)
  //     }
  //   })
  // }, [OutsourcingInfoBydaily])

  // 직영/용역에서 외주 데이터 조회 시 계약한 데이터 가져오기

  // const {
  //   data: directContractNameInfo,
  //   fetchNextPage: directContractNameFetchNextPage,
  //   hasNextPage: directContractNamehasNextPage,
  //   isFetching: directContractNameFetching,
  //   isLoading: directContractNameLoading,
  // } = useInfiniteQuery({
  //   queryKey: ['directContractNameInfo', selectedCompanyIds[selectId]],
  //   queryFn: ({ pageParam = 0 }) =>
  //     GetDirectContractNameInfoService({
  //       pageParam,
  //       outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
  //       size: 100,
  //     }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
  //   },
  //   enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  // })

  // useEffect(() => {
  //   if (!directContractNameInfo) return

  //   const options = directContractNameInfo.pages
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       name: user.contractName,
  //     }))

  //   setDirectContarctNameOptionsByCompany((prev) => ({
  //     ...prev,
  //     [selectedCompanyIds[selectId]]: [
  //       {
  //         id: 0,
  //         name: '선택',
  //       },
  //       ...options,
  //     ],
  //   }))
  // }, [directContractNameInfo, selectedCompanyIds, selectId])

  // 직영에서 상세 데이터 가져올 시 상세 useEffect 넣어줘야 함 (외주의 상세 데이터 조회 계약명)

  // const directContractOutsourcingsDetail = directContractOutsourcings

  // const { data: outDatacontractInfo } = useInfiniteQuery({
  //   queryKey: [
  //     'OutsourcingContractInfo',
  //     selectedCompanyIds[selectId],
  //     selectedOutSourcingContractIds[selectId],
  //   ],
  //   queryFn: ({ pageParam = 0 }) =>
  //     GetOutSourcingNameInfoByLabor({
  //       pageParam,
  //       outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
  //       outsourcingCompanyContractId: selectedOutSourcingContractIds[selectId],
  //       size: 100,
  //     }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
  //   },
  //   enabled: !!selectedCompanyIds[selectId] && !!selectedOutSourcingContractIds[selectId], // testId가 있을 때만 호출
  // })

  // // 직영/용역에서 직영 데이터 조회
  // useEffect(() => {
  //   if (!outDatacontractInfo) return

  //   const options = outDatacontractInfo.pages
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       name: user.name,
  //     }))

  //   setDirectContarctPersonNameByCompany((prev) => ({
  //     ...prev,
  //     [selectedOutSourcingContractIds[selectId]]: [
  //       {
  //         id: 0,
  //         name: '선택',
  //       },
  //       ...options,
  //     ],
  //   }))
  // }, [outDatacontractInfo, selectedOutSourcingContractIds, selectId])

  // 공사의 이름을 불러오는 코드

  // const [outSourcingSubItems, setOutSourcingSubItems] = useState<Record<number, any[]>>({})

  // 외주(공사) 에서 항목명을 상세페이지에서 받아온 다음 화면에 세팅 해주는 코드

  // useEffect(() => {
  //   if (!resultOutsourcing.length) return

  //   resultOutsourcing.forEach(async (row) => {
  //     const companyId = row.outsourcingCompanyId

  //     try {
  //       const res = await GetContractGroup({
  //         pageParam: 0,
  //         id: companyId,
  //         siteId: Number(siteIdList),
  //         size: 200,
  //       })

  //       console.log('@@24 res ', res)

  //       const options = res.data.content.map((user: any) => ({
  //         id: user.outsourcingCompanyContractConstructionGroupId,
  //         name: user.itemName,
  //         items:
  //           user.items
  //             ?.filter((item: any) => !item.deleted)
  //             .map((item: any) => ({
  //               id: item.id,
  //               item: item.item,
  //               specification: item.specification,
  //               unit: item.unit,
  //               quantity: item.quantity ?? 0,
  //             })) ?? [],
  //       }))

  //       setItemNameByOutSourcing((prev) => {
  //         return {
  //           ...prev,
  //           [companyId]: [
  //             {
  //               id: 0,
  //               name: '선택',
  //             },
  //             ...options,
  //           ],
  //         }
  //       })
  //     } catch (err) {
  //       console.error('업체별 인력 조회 실패', err)
  //     }
  //   })
  // }, [resultOutsourcing])
  // 기사

  // 옵션에 따른 상태값

  // const {
  //   data: fuelEquipment,
  //   fetchNextPage: fuelEquipmentFetchNextPage,
  //   hasNextPage: fuelEquipmentHasNextPage,
  //   isFetching: fuelEquipmentIsFetching,
  //   isLoading: fuelEquipmentLoading,
  // } = useInfiniteQuery({
  //   queryKey: ['FuelEquipmentInfo', selectedCompanyIds[selectId], siteIdList],
  //   queryFn: ({ pageParam }) =>
  //     FuelEquipmentNameScroll({
  //       pageParam,
  //       id: selectedCompanyIds[selectId] ?? 0,
  //       siteIdList: Number(siteIdList),
  //       size: 10,
  //     }),

  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
  //   },
  //   enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  // })

  // useEffect(() => {
  //   if (!fuelEquipment) return

  //   const options = fuelEquipment.pages
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       specification: user.specification,
  //       vehicleNumber: user.vehicleNumber,
  //       category: user.category,
  //       unitPrice: user.unitPrice,
  //       taskDescription: user.taskDescription,
  //     }))

  //   setCarNumberOptionsByCompany((prev) => ({
  //     ...prev,
  //     [selectedCompanyIds[selectId]]: [
  //       { id: 0, specification: '', vehicleNumber: '선택', category: '' },
  //       ...options,
  //     ],
  //   }))
  // }, [fuelEquipment, selectedCompanyIds, selectId])

  interface EquipmentTypeOption {
    id: number
    name: string
    taskDescription: string
    unitPrice: number
  }

  // const [testArray, setTestArray] = useState<EquipmentTypeOption[]>([
  //   { id: 0, name: '선택', taskDescription: '', unitPrice: 0 },
  // ])

  // const [testArrayByRow, setTestArrayByRow] = useState<Record<number, EquipmentTypeOption[]>>({})

  // 유류의 업체명 삭제 됨 표시

  // 유효성 검사

  const [isOutsourcingFocused, setIsOutsourcingFocused] = useState(false)

  //유류에서 키워드 검색 이름
  const handleSelectOutsourcing = (selectedUser: any) => {
    setField('outsourcingCompanyName', selectedUser.name)
    setField('outsourcingCompanyId', selectedUser.id)
  }

  const debouncedOutsourcingKeyword = useDebouncedValue(form.outsourcingCompanyName, 300)

  const {
    data: OutsourcingNameData,
    fetchNextPage: OutsourcingeNameFetchNextPage,
    hasNextPage: OutsourcingNameHasNextPage,
    isFetching: OutsourcingNameIsFetching,
    isLoading: OutsourcingNameIsLoading,
  } = useFuelOuysourcingName(debouncedOutsourcingKeyword)

  const OutsourcingRawList = OutsourcingNameData?.pages.flatMap((page) => page.data.content) ?? []
  const outsourcingList = Array.from(
    new Map(OutsourcingRawList.map((user) => [user.name, user])).values(),
  )

  // 유효성 검사 함수
  const validateEmployees = () => {
    // 직원 데이터 검증
    for (const emp of employees) {
      if (!emp.laborId || emp.laborId === 0) {
        return showSnackbar('직원의 이름을 선택해주세요.', 'warning')
      }
      if (!emp.workContent || emp.workContent.trim() === '') {
        return showSnackbar('직원의 작업내용을 입력해주세요.', 'warning')
      }
      if (emp.workQuantity === null || emp.workQuantity === 0 || isNaN(emp.workQuantity)) {
        return showSnackbar('직원의 공수는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }
      if (emp.memo && emp.memo.length > 500) {
        return showSnackbar('직원의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }

    for (const empFile of employeeProof) {
      if (!empFile.name || empFile.name.trim() === '') {
        return showSnackbar('증빙서류의 문서명을 입력해주세요.', 'warning')
      }
    }

    // form 전체 필드 검증 (루프 밖)
    if (form.weather === 'BASE' || form.weather === '' || form.weather === undefined) {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  const validateContract = () => {
    // 1️⃣ 계약직 유효성 체크
    for (const c of contractData) {
      if (c.laborId === 0) {
        return showSnackbar('계약직원의 이름을 선택해주세요.', 'warning')
      }
      if (!c.isTemporary) {
        if (!c.position || c.position.trim() === '') {
          return showSnackbar('계약직원의 직종을 입력해주세요.', 'warning')
        }
      }

      if (!c.workContent || c.workContent.trim() === '') {
        return showSnackbar('계약직원의 작업내용을 입력해주세요.', 'warning')
      }
      if (!c.unitPrice || c.unitPrice === 0) {
        return showSnackbar('계약직원의 단가를 입력해주세요.', 'warning')
      }
      if (c.workQuantity === null || c.workQuantity === 0 || isNaN(c.workQuantity)) {
        return showSnackbar('계약직원의 공수는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }
      if (c.memo && c.memo.length > 500) {
        return showSnackbar('계약직원의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }

    for (const o of directContractByData) {
      // 임시 인력 여부에 따라 이름 체크
      if (o.isTemporary) {
        if (!o.temporaryLaborName || o.temporaryLaborName.trim() === '') {
          return showSnackbar('용역 임시 인력의 이름을 입력해주세요.', 'warning')
        }
      } else {
        if (!o.laborId || o.laborId === 0) {
          return showSnackbar('용역 직원의 이름을 선택해주세요.', 'warning')
        }
      }

      if (!o.isTemporary) {
        if (!o.position || o.position.trim() === '') {
          return showSnackbar('용역 직원의 직종을 입력해주세요.', 'warning')
        }
      }

      if (!o.workContent || o.workContent.trim() === '') {
        return showSnackbar('용역 직원의 작업내용을 입력해주세요.', 'warning')
      }
      if (!o.unitPrice || o.unitPrice === 0) {
        return showSnackbar('용역 직원의 단가를 입력해주세요.', 'warning')
      }
      if (o.workQuantity === null || o.workQuantity === 0 || isNaN(o.workQuantity)) {
        return showSnackbar('용역 직원의 공수는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }
      if (o.memo && o.memo.length > 500) {
        return showSnackbar('용역 직원의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }

      // // 첨부파일 체크 (필요시)
      // if (o.files && o.files.some((f) => !f.name || f.name.trim() === '')) {
      //   return showSnackbar('용역 직원의 첨부파일 이름을 확인해주세요.', 'warning')
      // }
    }

    for (const contractFile of contractFileProof) {
      if (!contractFile.name || contractFile.name.trim() === '') {
        return showSnackbar('증빙서류의 문서명을 입력해주세요.', 'warning')
      }
    }

    if (form.weather === 'BASE' || form.weather === '' || form.weather === undefined) {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  // const validateOutsourcing = () => {
  //   for (const o of outsourcings) {
  //     // 업체명 선택 여부
  //     if (!o.outsourcingCompanyId || o.outsourcingCompanyId === 0) {
  //       return showSnackbar('외주(공사)의 업체명을 선택해주세요.', 'warning')
  //     }

  //     // 이름 선택 여부
  //     if (!o.outsourcingCompanyContractWorkerId || o.outsourcingCompanyContractWorkerId === 0) {
  //       return showSnackbar('외주(공사)의 이름을 선택해주세요.', 'warning')
  //     }

  //     // 구분 필수
  //     if (!o.category || o.category.trim() === '') {
  //       return showSnackbar('외주(공사)의 구분을 입력해주세요.', 'warning')
  //     }

  //     // 작업내용 필수
  //     if (!o.workContent || o.workContent.trim() === '') {
  //       return showSnackbar('외주(공사)의 작업내용을 입력해주세요.', 'warning')
  //     }

  //     // 공수 필수 (0, null, NaN 불가)
  //     if (o.workQuantity === null || o.workQuantity === 0 || isNaN(o.workQuantity)) {
  //       return showSnackbar('외주(공사)의 공수는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
  //     }

  //     // 비고는 500자 제한
  //     if (o.memo && o.memo.length > 500) {
  //       return showSnackbar('외주(공사)의 비고는 500자를 초과할 수 없습니다.', 'warning')
  //     }
  //   }

  //   for (const outSourcingFile of outSourcingFileProof) {
  //     if (!outSourcingFile.name || outSourcingFile.name.trim() === '') {
  //       return showSnackbar('증빙서류의 문서명을 입력해주세요.', 'warning')
  //     }
  //   }

  //   if (form.weather === 'BASE' || form.weather === '') {
  //     return showSnackbar('날씨를 선택해주세요.', 'warning')
  //   }

  //   return true
  // }
  const validateEquipment = () => {
    for (const e of equipmentData) {
      if (!e.outsourcingCompanyId || e.outsourcingCompanyId === 0) {
        return showSnackbar('장비의 업체명을 선택해주세요.', 'warning')
      }
      if (!e.outsourcingCompanyContractDriverId || e.outsourcingCompanyContractDriverId === 0) {
        return showSnackbar('장비의 기사명을 선택해주세요.', 'warning')
      }
      if (
        !e.outsourcingCompanyContractEquipmentId ||
        e.outsourcingCompanyContractEquipmentId === 0
      ) {
        return showSnackbar('장비의 차량번호를 선택해주세요.', 'warning')
      }
      if (!e.specificationName || e.specificationName.trim() === '') {
        return showSnackbar('장비의 규격을 입력해주세요.', 'warning')
      }
      // if (!e.type || e.type.trim() === '') {
      //   return showSnackbar('장비의 구분을 입력해주세요.', 'warning')
      // }
      // if (!e.workContent || e.workContent.trim() === '') {
      //   return showSnackbar('장비의 작업내용을 입력해주세요.', 'warning')
      // }
      // if (e.unitPrice === null || isNaN(e.unitPrice) || e.unitPrice <= 0) {
      //   return showSnackbar('장비의 단가는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      // }
      // if (e.workHours === null || isNaN(e.workHours) || e.workHours <= 0) {
      //   return showSnackbar('장비의 시간은 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      // }
      // if (e.memo && e.memo.length > 500) {
      //   return showSnackbar('장비의 비고는 500자를 초과할 수 없습니다.', 'warning')
      // }
    }

    for (const equipmentFile of equipmentProof) {
      if (!equipmentFile.name || equipmentFile.name.trim() === '') {
        return showSnackbar('증빙서류의 문서명을 입력해주세요.', 'warning')
      }
    }

    if (form.weather === 'BASE' || form.weather === '' || form.weather === undefined) {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }
    return true
  }

  const validateFuel = () => {
    for (const f of fuelData) {
      if (!form.outsourcingCompanyId || form.outsourcingCompanyId === 0) {
        return showSnackbar('유류업체명을 입력해주세요.', 'warning')
      }

      if (!f.equipmentId || f.equipmentId === 0) {
        return showSnackbar('유류의 차량번호를 선택해주세요.', 'warning')
      }
      if (!f.specificationName || f.specificationName.trim() === '') {
        return showSnackbar('유류의 규격을 입력해주세요.', 'warning')
      }
      if (!f.fuelType || f.fuelType.trim() === '' || f.fuelType === '선택') {
        return showSnackbar('유류의 유종을 선택해주세요.', 'warning')
      }
      if (f.fuelAmount === null || isNaN(f.fuelAmount) || f.fuelAmount <= 0) {
        return showSnackbar('유류의 주유량은 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }
      if (f.memo && f.memo.length > 500) {
        return showSnackbar('유류의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }

    for (const FuelFile of fuelProof) {
      if (!FuelFile.name || FuelFile.name.trim() === '') {
        return showSnackbar('증빙서류의 문서명을 입력해주세요.', 'warning')
      }
    }

    if (form.weather === 'BASE' || form.weather === '' || form.weather === undefined) {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  const validateFile = () => {
    for (const file of attachedFiles) {
      if (!file.description || file.description.trim() === '') {
        return showSnackbar('설명을 입력해주세요.', 'warning')
      }

      if (!file.files || file.files.length === 0) {
        return showSnackbar('첨부 파일을 선택해주세요.', 'warning')
      }

      if (file.memo && file.memo.length > 500) {
        return showSnackbar('비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }
    if (form.weather === 'BASE' || form.weather === '' || form.weather === undefined) {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  const previousWeatherRef = useRef(form.weather)

  // useEffect(() => {
  //   if (!outsourcingfuel.length) return

  //   console.log('해당 구분 값 찾기', outsourcingfuel)

  //   outsourcingfuel.forEach(async (row) => {
  //     const companyId = row.outsourcingCompanyId
  //     const driverData = row.driverId
  //     const carNumberId = row.equipmentId
  //     const categoryType = row.categoryType

  //     // ✅ categoryType이 변경되어도 항상 새로 가져오게 하려면
  //     // driverOptionsByCompany[companyId] 캐시 체크를 제거하거나,
  //     // 조건을 완화합니다.
  //     const hasDriverData = driverOptionsByCompany[companyId]
  //     const hasCarData = carNumberOptionsByCompany[companyId]?.some(
  //       (opt) => opt.categoryType === categoryType,
  //     )

  //     // ✅ 이미 같은 타입(categoryType)으로 로드된 적이 있으면 skip
  //     if (hasDriverData && hasCarData) continue

  //     try {
  //       const res = await FuelDriverNameScroll({
  //         pageParam: 0,
  //         id: companyId,
  //         siteIdList: Number(siteIdList),
  //         size: 200,
  //       })

  //       if (res === undefined) return

  //       const options = res.data.content.map((user: any) => ({
  //         id: user.id,
  //         name: user.name + (user.deleted ? ' (삭제됨)' : ''),
  //         deleted: user.deleted,
  //       }))

  //       setDriverOptionsByCompany((prev) => {
  //         const exists = options.some((opt: any) => opt.id === driverData)

  //         return {
  //           ...prev,
  //           [companyId]: [
  //             { id: 0, name: '선택', deleted: false },
  //             ...options,
  //             // 만약 선택된 worker가 목록에 없으면 추가
  //             ...(driverData && !exists ? [{ id: driverData, name: '', deleted: true }] : []),
  //           ],
  //         }
  //       })

  //       const carNumberRes = await FuelEquipmentNameScroll({
  //         pageParam: 0,
  //         id: companyId,
  //         siteIdList: Number(siteIdList),
  //         size: 200,
  //         types: categoryType,
  //       })

  //       const carOptions = carNumberRes.data.content.map((user: any) => ({
  //         id: user.id,
  //         specification: user.specification,
  //         vehicleNumber: user.vehicleNumber,
  //         category: user.category,
  //       }))

  //       setCarNumberOptionsByCompany((prev) => {
  //         const exists = carOptions.some((opt: any) => opt.id === carNumberId)

  //         return {
  //           ...prev,
  //           [companyId]: [
  //             { id: 0, specification: '', vehicleNumber: '선택', category: '', deleted: false },
  //             ...carOptions,
  //             // 만약 선택된 worker가 목록에 없으면 추가
  //             ...(carNumberId && !exists
  //               ? [
  //                   {
  //                     id: carNumberId,
  //                     specification: '',
  //                     vehicleNumber: '',
  //                     category: '',
  //                     deleted: true,
  //                   },
  //                 ]
  //               : []),
  //           ],
  //         }
  //       })
  //     } catch (err) {
  //       console.error('업체별 인력 조회 실패', err)
  //     }
  //   })
  // }, [outsourcingfuel, categoryType])

  //  ui 그림

  // useEffect(() => {
  //   if (!outsourcingfuel.length) return

  //   console.log('해당 구분 값 찾기', outsourcingfuel)

  //   const fetchData = async () => {
  //     for (const row of outsourcingfuel) {
  //       const companyId = row.outsourcingCompanyId
  //       const driverData = row.driverId
  //       const carNumberId = row.equipmentId
  //       const categoryType = row.categoryType

  //       const hasDriverData = driverOptionsByCompany[companyId]
  //       const hasCarData = carNumberOptionsByCompany[companyId]?.some(
  //         (opt) => opt.categoryType === categoryType,
  //       )

  //       if (hasDriverData && hasCarData) continue

  //       try {
  //         // ─────────── 인력 목록 ───────────
  //         const res = await FuelDriverNameScroll({
  //           pageParam: 0,
  //           id: companyId,
  //           siteIdList: Number(siteIdList),
  //           size: 200,
  //         })

  //         if (!res) continue

  //         const options = res.data.content.map((user: any) => ({
  //           id: user.id,
  //           name: user.name + (user.deleted ? ' (삭제됨)' : ''),
  //           deleted: user.deleted,
  //         }))

  //         setDriverOptionsByCompany((prev) => {
  //           const exists = options.some((opt: any) => opt.id === driverData)
  //           return {
  //             ...prev,
  //             [companyId]: [
  //               { id: 0, name: '선택', deleted: false },
  //               ...options,
  //               ...(driverData && !exists ? [{ id: driverData, name: '', deleted: true }] : []),
  //             ],
  //           }
  //         })

  //         // ─────────── 차량 목록 ───────────
  //         const carNumberRes = await FuelEquipmentNameScroll({
  //           pageParam: 0,
  //           id: companyId,
  //           siteIdList: Number(siteIdList),
  //           size: 200,
  //           types: categoryType,
  //         })

  //         const carOptions = carNumberRes.data.content.map((item: any) => ({
  //           id: item.id,
  //           specification: item.specification,
  //           vehicleNumber: item.vehicleNumber,
  //           category: item.category,
  //           categoryType, // ← 캐시 구분용으로 추가
  //         }))

  //         setCarNumberOptionsByCompany((prev) => {
  //           const exists = carOptions.some((opt: any) => opt.id === carNumberId)
  //           return {
  //             ...prev,
  //             [companyId]: [
  //               { id: 0, specification: '', vehicleNumber: '선택', category: '', deleted: false },
  //               ...carOptions,
  //               ...(carNumberId && !exists
  //                 ? [
  //                     {
  //                       id: carNumberId,
  //                       specification: '',
  //                       vehicleNumber: '',
  //                       category: '',
  //                       deleted: true,
  //                       categoryType,
  //                     },
  //                   ]
  //                 : []),
  //             ],
  //           }
  //         })
  //       } catch (err) {
  //         console.error('업체별 인력/차량 조회 실패', err)
  //       }
  //     }
  //   }

  //   fetchData()
  // }, [outsourcingfuel])

  interface subEquipmentTypeOption {
    id: number
    name: string
    fuelType: string
    fuelAmount: number
  }

  const [, setSubEquipmentByRow] = useState<Record<number, subEquipmentTypeOption[]>>({})

  // useEffect(() => {
  //   if (!outsourcingfuel.length) return

  //   const fetchData = async () => {
  //     for (const row of outsourcingfuel) {
  //       const companyId = row.outsourcingCompanyId
  //       const driverData = row.driverId
  //       const carNumberId = row.equipmentId
  //       const categoryType = row.categoryType

  //       const keyRow = `${companyId}_${categoryType}_${row.id}`

  //       const hasDriverData = driverOptionsByCompany[companyId]
  //       const hasCarData = carNumberOptionsByCompany[keyRow]?.some(
  //         (opt) => opt.categoryType === categoryType,
  //       )

  //       if (hasDriverData && hasCarData) continue

  //       try {
  //         // 기사 + 차량 병렬 요청
  //         const [driverRes, carNumberRes] = await Promise.all([
  //           FuelDriverNameScroll({
  //             pageParam: 0,
  //             id: companyId,
  //             siteIdList: Number(siteIdList),
  //             size: 200,
  //           }),
  //           FuelEquipmentNameScroll({
  //             pageParam: 0,
  //             id: companyId,
  //             siteIdList: Number(siteIdList),
  //             size: 200,
  //             types: categoryType,
  //           }),
  //         ])

  //         const driverOptions = (driverRes?.data?.content ?? []).map((user: any) => ({
  //           id: user.id,
  //           name: user.name,
  //           deleted: user.deleted ?? false,
  //         }))

  //         setDriverOptionsByCompany((prev) => {
  //           const exists = driverOptions.some((opt: any) => opt.id === driverData)
  //           return {
  //             ...prev,
  //             [companyId]: [
  //               { id: 0, name: '선택', deleted: false },
  //               ...driverOptions,
  //               ...(driverData && !exists ? [{ id: driverData, name: '', deleted: false }] : []),
  //             ],
  //           }
  //         })

  //         const carOptions = (carNumberRes?.data?.content ?? []).map((user: any) => ({
  //           id: user.id,
  //           specification: user.specification,
  //           vehicleNumber: user.vehicleNumber,
  //           category: user.category,
  //           unitPrice: user.unitPrice,
  //           taskDescription: user.taskDescription,
  //           subEquipments:
  //             user.subEquipments?.map((item: any) => ({
  //               id: item.id,
  //               checkId: item.id,
  //               type: item.type,
  //               typeCode: item.typeCode,
  //               workContent: item.taskDescription ?? '',
  //               unitPrice: item.unitPrice ?? 0,
  //             })) ?? [],
  //         }))

  //         setCarNumberOptionsByCompany((prev) => ({
  //           ...prev,
  //           [keyRow]: [
  //             {
  //               id: 0,
  //               checkId: 0,
  //               specification: '',
  //               vehicleNumber: '선택',
  //               category: '',
  //               unitPrice: '',
  //               taskDescription: '',
  //               subEquipments: [],
  //             },
  //             ...carOptions,
  //           ],
  //         }))

  //         carOptions.forEach((car: any) => {
  //           if (car.subEquipments?.length) {
  //             setSubEquipmentByRow((prev) => ({
  //               ...prev,
  //               [car.id]: [
  //                 { id: 0, name: '선택' },
  //                 ...car.subEquipments.map((sub: any) => ({
  //                   id: sub.id,
  //                   checkId: sub.id,
  //                   name: sub.type || sub.typeCode || '-',
  //                   taskDescription: sub.workContent,
  //                   unitPrice: sub.unitPrice,
  //                 })),
  //               ],
  //             }))
  //           }
  //         })

  //         setSelectedCarNumberIds((prev) => ({ ...prev, [row.id]: carNumberId || 0 }))
  //       } catch (err) {
  //         console.error('업체별 차량/기사 조회 실패', err)
  //       }
  //     }
  //   }

  //   fetchData()
  // }, [outsourcingfuel])

  const cellStyle = {
    border: '1px solid #9CA3AF',
    verticalAlign: 'top',
    padding: '8px',
  }

  return (
    <>
      <div className="flex gap-10 items-center justify-between">
        <div className="flex w-full">
          <div className="flex ">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              현장명
            </label>
            {/* <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
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
                // onInputChange={(value) => setSitesSearch(value)}
                loading={siteNameLoading}
              />
            </div> */}

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

                  console.log('데이터 확인@@', selectedSite)

                  // 선택된 현장 세팅
                  setField('siteId', selectedSite.id)
                  setField('siteName', selectedSite.name)

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
                onFocus={() => {
                  setIsSiteFocused(true)
                }}
                onBlur={() => setIsSiteFocused(false)}
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
                // onInputChange={(value) => setProcessSearch(value)}
                loading={processInfoLoading}
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.reportDate || null}
                onChange={(value) => setField('reportDate', value)}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              날씨 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                value={form.weather || 'BASE'} // nullish 병합 사용
                onChange={(value) => setField('weather', value)}
                options={WeatherTypeMethodOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 상단 탭 */}
      {/* 해당 탭 이동 시 데이터가 초기화 된다고 알려주자  */}
      <div className="flex justify-between mt-14 border-b">
        <div className="flex  ">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 -mb-px border-b-2 cursor-pointer font-medium ${
                activeTab === tab
                  ? 'bg-white border border-gray-500 text-black text-[15px] font-bold rounded-t-md px-8'
                  : 'bg-gray-200 border border-gray-500 text-gray-400 text-[15px] rounded-t-md px-8'
              }`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {detailReport?.data?.status === 'AUTO_COMPLETED' ||
        detailReport?.data?.status === 'COMPLETED' ? (
          <div>
            {detailReport.data.status === 'AUTO_COMPLETED' ? '자동마감' : '마감'}{' '}
            {formatDateSecondTime(detailReport.data.completedAt)}
          </div>
        ) : (
          form.reportDate && (
            <CommonButton
              label="마감"
              disabled={
                !hasApproval ||
                detailReport?.data?.status === 'AUTO_COMPLETED' ||
                detailReport?.data?.status === 'COMPLETED'
              }
              className="px-6 py-2 mb-2"
              variant="secondary"
              onClick={Deadline}
            />
          )
        )}
      </div>

      {activeTab === '직원' && (
        <>
          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold mb-4"> [{activeTab}]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('Employees')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('Employees')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>
            <TableContainer
              component={Paper}
              sx={{
                height: '300px',
                overflowX: 'auto', // 가로 스크롤 허용
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (employeesHasNextPage && !employeesFetching) {
                    employeesFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isAllChecked}
                        indeterminate={checkedIds.length > 0 && !isAllChecked}
                        onChange={(e) => toggleCheckAllItems('Employees', e.target.checked)}
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '이름',
                      '직급(직책)',
                      '작업내용',
                      '공수',
                      '첨부파일',
                      '비고',
                      '등록/수정일',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === 'No' ||
                        label === '비고' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ? (
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
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        직원 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((m, index) => (
                      <TableRow key={m.id}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={checkedIds.includes(m.id)}
                            onChange={(e) => toggleCheckItem('Employees', m.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {employees.length - index}
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {/* <CommonSelect
                            value={m.laborId || 0}
                            onChange={(value) => {
                              const selectedEmployee = employeeInfoOptions.find(
                                (opt) => opt.id === value,
                              )

                              updateItemField('Employees', m.id, 'laborId', value)

                              updateItemField(
                                'Employees',
                                m.id,
                                'grade',
                                selectedEmployee?.grade || '',
                              )
                            }}
                            options={employeeInfoOptions}
                            onScrollToBottom={() => {
                              if (employeehasNextPage && !employeeFetching) employeeFetchNextPage()
                            }}
                            loading={employeeLoading}
                          /> */}

                          <DailyEmployeeNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            placeholder="텍스트 입력"
                            size="small"
                            value={m.grade ?? ''}
                            onChange={(e) =>
                              updateItemField('Employees', m.id, 'grade', e.target.value)
                            }
                            disabled
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            placeholder="텍스트 입력"
                            size="small"
                            value={m.workContent ?? 0}
                            onFocus={() => setClearFocusedRowId(null)}
                            onChange={(e) =>
                              updateItemField('Employees', m.id, 'workContent', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            type="number" // type을 number로 변경
                            placeholder="숫자를 입력해주세요."
                            inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                            value={m.workQuantity ?? ''}
                            onFocus={() => setClearFocusedRowId(null)}
                            onWheel={(e) => {
                              ;(e.target as HTMLInputElement).blur()
                            }}
                            onChange={(e) => {
                              const value = e.target.value
                              const numericValue = value === '' ? null : parseFloat(value)

                              // dailyWork 배열 idx 위치 업데이트
                              updateItemField('Employees', m.id, 'workQuantity', numericValue)
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
                                padding: '10px',
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

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                            <CommonFileInput
                              acceptedExtensions={[
                                'pdf',
                                'txt',
                                'rtf',
                                'docx',
                                'hwp',
                                'xlsx',
                                'csv',
                                'ods',
                                'pptx',
                                'ppt',
                                'odp',
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'tif',
                                'tiff',
                                'bmp',
                                'zip',
                                '7z',
                                'mp3',
                                'wav',
                                'mp4',
                                'mov',
                                'avi',
                                'wmv',
                                'dwg',
                              ]}
                              multiple={false}
                              files={m.files} // 각 항목별 files
                              onChange={(newFiles) => {
                                updateItemField('Employees', m.id, 'files', newFiles.slice(0, 1))
                              }}
                              uploadTarget="WORK_DAILY_REPORT"
                            />
                          </div>
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            value={m.memo ?? ''}
                            onFocus={() => setClearFocusedRowId(null)}
                            onChange={(e) =>
                              updateItemField('Employees', m.id, 'memo', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
                        >
                          <CommonInput
                            placeholder="-"
                            value={m.modifyDate ?? ''}
                            onChange={(value) =>
                              updateItemField('Employees', m.id, 'modifyDate', value)
                            }
                            disabled
                            className="flex-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {employeesFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold border-b-2 mb-4">증빙</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('EmployeeFiles')}
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('EmployeeFiles')}
                />
              </div>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isEmployeeProofAllChecked}
                        indeterminate={
                          employeeProofCheckIds.length > 0 && !isEmployeeProofAllChecked
                        }
                        onChange={(e) => toggleCheckAllItems('EmployeeFiles', e.target.checked)}
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
                  {employeeProof.map((m) => (
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      <TableCell
                        padding="checkbox"
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF' }}
                      >
                        <Checkbox
                          checked={employeeProofCheckIds.includes(m.id)}
                          onChange={(e) => toggleCheckItem('EmployeeFiles', m.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.name}
                          onChange={(e) =>
                            updateItemField('EmployeeFiles', m.id, 'name', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                          <CommonFileInput
                            acceptedExtensions={[
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            multiple={false}
                            files={m.files} // 각 항목별 files
                            onChange={(newFiles) => {
                              updateItemField('EmployeeFiles', m.id, 'files', newFiles.slice(0, 1))
                            }}
                            uploadTarget="WORK_DAILY_REPORT"
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
                            updateItemField('EmployeeFiles', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {/* 직영/계약직 */}

      {activeTab === '직영/용역' && (
        <>
          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold mb-4"> [직영]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('directContracts')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="임시 인력 추가"
                  className="px-7"
                  variant="primary"
                  onClick={() => addTemporaryCheckedItems('directContracts')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('directContracts')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>

            <TableContainer
              component={Paper}
              sx={{
                height: '300px',
                overflowX: 'auto', // 가로 스크롤 허용
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (outsourcingByContractHasNextPage && !outsourcingByContractFetching) {
                    outsourcingByContractFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isContractAllChecked}
                        indeterminate={ContractCheckedIds.length > 0 && !isContractAllChecked}
                        onChange={(e) => toggleCheckAllItems('directContracts', e.target.checked)}
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '이름',
                      '직종',
                      '작업내용',
                      '이전(기준)단가',
                      '단가',
                      '공수',
                      '첨부파일',
                      '비고',
                      '등록/수정일',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === '비고' ||
                        label === 'No' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ? (
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
                  {contractData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        직영/용역 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contractData.map((m, idx) => (
                      <TableRow key={`${m.checkId}-${idx}`}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={ContractCheckedIds.includes(m.checkId)}
                            onChange={(e) =>
                              toggleCheckItem('directContracts', m.checkId, e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {contractData.length - idx}
                        </TableCell>

                        {/* <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {m.isTemporary ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={'라인공영(임시)'}
                              onChange={(e) =>
                                updateItemField(
                                  'directContracts',
                                  m.checkId,
                                  'temporaryCompanyName',
                                  e.target.value,
                                )
                              }
                              placeholder="업체명 입력"
                              InputProps={{
                                sx: {
                                  color: 'red', // 글자색 빨강
                                  WebkitTextFillColor: 'red', // disabled 상태에서도 빨강 유지
                                },
                              }}
                            />
                          ) : (
                            <CommonSelect
                              fullWidth
                              value={selectedCompanyIds[m.checkId] || m.outsourcingCompanyId || 0}
                              onChange={async (value) => {
                                const selectedCompany = companyOptions.find(
                                  (opt) => opt.id === value,
                                )
                                if (!selectedCompany) return

                                // 해당 row만 업데이트
                                setSelectedCompanyIds((prev) => ({
                                  ...prev,
                                  [m.checkId]: selectedCompany.id,
                                }))

                                setSelectId(m.checkId)

                                updateItemField(
                                  'directContracts',
                                  m.checkId,
                                  'outsourcingCompanyId',
                                  selectedCompany.id,
                                )

                                updateItemField(
                                  'directContracts',
                                  m.checkId,
                                  'outsourcingCompanyName',
                                  selectedCompany.name,
                                )

                                // 해당 row 워커만 초기화
                                setSelectContractIds((prev) => ({
                                  ...prev,
                                  [m.checkId]: 0,
                                }))
                              }}
                              options={companyOptions}
                              onScrollToBottom={() => {
                                if (comPanyNamehasNextPage && !comPanyNameFetching)
                                  comPanyNameFetchNextPage()
                              }}
                              loading={comPanyNameLoading}
                            />
                          )}
                        </TableCell> */}

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {m.isTemporary ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={m.temporaryLaborName || ''}
                              onChange={(e) =>
                                updateItemField(
                                  'directContracts',
                                  m.checkId,
                                  'temporaryLaborName',
                                  e.target.value,
                                )
                              }
                              placeholder="이름 입력"
                            />
                          ) : (
                            // <CommonSelect
                            //   value={m.laborId || 0}
                            //   onChange={(value) => {
                            //     const selectedContractName = (
                            //       ContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? []
                            //     ).find((opt) => opt.id === value)

                            //     if (!selectedContractName) return

                            //     if (selectedContractName?.isSeverancePayEligible) {
                            //       showSnackbar(
                            //         '해당 직원 근속일이 6개월에 도달했습니다. 퇴직금 발생에 주의하세요.',
                            //         'error',
                            //       )
                            //     }

                            //     updateItemField('directContracts', m.checkId, 'laborId', value)

                            //     updateItemField(
                            //       'directContracts',
                            //       m.checkId,
                            //       'position',
                            //       selectedContractName.workType,
                            //     )

                            //     updateItemField(
                            //       'directContracts',
                            //       m.checkId,
                            //       'previousPrice',
                            //       selectedContractName?.previousDailyWage ?? 0, // 선택된 항목의 previousDailyWage 자동 입력
                            //     )
                            //   }}
                            //   options={
                            //     ContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? [
                            //       { id: 0, name: '선택' },
                            //     ]
                            //   }
                            //   onScrollToBottom={() => {
                            //     if (contractNamehasNextPage && !contractNameFetching)
                            //       contractNameFetchNextPage()
                            //   }}
                            //   loading={contractNameLoading}
                            // />
                            <DailyDirectContractNameRow key={m.checkId} row={m} />
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            placeholder="텍스트 입력"
                            value={m.position ?? ''}
                            onChange={(e) =>
                              updateItemField(
                                'directContracts',
                                m.checkId,
                                'position',
                                e.target.value,
                              )
                            }
                            disabled
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            placeholder="텍스트 입력 "
                            value={m.workContent ?? ''}
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) =>
                              updateItemField(
                                'directContracts',
                                m.checkId,
                                'workContent',
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            value={
                              m.previousPrice === 0 || m.previousPrice === null
                                ? ''
                                : formatNumber(m.previousPrice)
                            }
                            onChange={(e) => {
                              const numericValue =
                                e.target.value === '' ? null : unformatNumber(e.target.value)

                              updateItemField(
                                'directContracts',
                                m.checkId,
                                'previousPrice',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                backgroundColor: '#E5E7EB', // 연한 회색 (Tailwind gray-200)
                                color: '#111827', // 진한 글자색 (Tailwind gray-900)
                                fontWeight: 'bold', // 글자 강조
                                textAlign: 'center',
                                padding: '10px',
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
                            disabled
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            placeholder="숫자를 입력해주세요."
                            value={
                              m.unitPrice === 0 || m.unitPrice === null
                                ? ''
                                : formatNumber(m.unitPrice)
                            }
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) => {
                              const numericValue =
                                e.target.value === '' ? null : unformatNumber(e.target.value)

                              updateItemField(
                                'directContracts',
                                m.checkId,
                                'unitPrice',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
                                padding: '10px',
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
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            type="number" // type을 number로 변경
                            placeholder="숫자를 입력해주세요."
                            inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                            value={m.workQuantity ?? ''}
                            onWheel={(e) => {
                              ;(e.target as HTMLInputElement).blur()
                            }}
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) => {
                              const value = e.target.value
                              const numericValue = value === '' ? null : parseFloat(value)

                              // dailyWork 배열 idx 위치 업데이트
                              updateItemField(
                                'directContracts',
                                m.checkId,
                                'workQuantity',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
                                padding: '10px',
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
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                            <CommonFileInput
                              acceptedExtensions={[
                                'pdf',
                                'txt',
                                'rtf',
                                'docx',
                                'hwp',
                                'xlsx',
                                'csv',
                                'ods',
                                'pptx',
                                'ppt',
                                'odp',
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'tif',
                                'tiff',
                                'bmp',
                                'zip',
                                '7z',
                                'mp3',
                                'wav',
                                'mp4',
                                'mov',
                                'avi',
                                'wmv',
                                'dwg',
                              ]}
                              multiple={false}
                              files={m.files} // 각 항목별 files
                              onChange={(newFiles) =>
                                updateItemField('directContracts', m.checkId, 'files', newFiles)
                              }
                              uploadTarget="WORK_DAILY_REPORT"
                            />
                          </div>
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            value={m.memo}
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) =>
                              updateItemField('directContracts', m.checkId, 'memo', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
                        >
                          <CommonInput
                            placeholder="-"
                            value={m.modifyDate ?? ''}
                            onChange={(value) =>
                              updateItemField('directContracts', m.checkId, 'modifyDate', value)
                            }
                            disabled
                            className="flex-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {employeesFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          {/* 직영에서 용역 데이터 조회 */}

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold mb-4"> [용역]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('outsourcingByDirectContract')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="임시 인력 추가"
                  className="px-7"
                  variant="primary"
                  onClick={() => addTemporaryCheckedItems('outsourcingByDirectContract')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('outsourcingByDirectContract')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>

            <TableContainer
              component={Paper}
              sx={{
                height: '300px',
                overflowX: 'auto', // 가로 스크롤 허용
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (contractHasNextPage && !contractFetching) {
                    contractFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={directContractAllCheckedIds}
                        indeterminate={
                          directContractCheckedIds.length > 0 && !directContractAllCheckedIds
                        }
                        onChange={(e) =>
                          toggleCheckAllItems('outsourcingByDirectContract', e.target.checked)
                        }
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '업체명',
                      '이름',
                      '직종',
                      '작업내용',
                      '이전(기준)단가',
                      '단가',
                      '공수',
                      '첨부파일',
                      '비고',
                      '등록/수정일',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === '비고' ||
                        label === 'No' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ? (
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
                  {directContractByData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        용역 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    directContractByData.map((m, idx) => (
                      <TableRow key={`${m.checkId}-${idx}`}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={directContractCheckedIds.includes(m.checkId)}
                            onChange={(e) =>
                              toggleCheckItem(
                                'outsourcingByDirectContract',
                                m.checkId,
                                e.target.checked,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {directContractByData.length - idx}
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {m.isTemporary ? (
                            // <CommonSelect
                            //   fullWidth
                            //   value={selectedCompanyIds[m.checkId] || m.outsourcingCompanyId || 0}
                            //   onChange={async (value) => {
                            //     const selectedCompany = companyOptions.find(
                            //       (opt) => opt.id === value,
                            //     )
                            //     if (!selectedCompany) return

                            //     // 해당 row만 업데이트
                            //     setSelectedCompanyIds((prev) => ({
                            //       ...prev,
                            //       [m.checkId]: selectedCompany.id,
                            //     }))

                            //     setSelectId(m.checkId)

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'outsourcingCompanyId',
                            //       selectedCompany.id,
                            //     )

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'outsourcingCompanyName',
                            //       selectedCompany.name,
                            //     )

                            //     // 해당 row 워커만 초기화
                            //     setSelectContractIds((prev) => ({
                            //       ...prev,
                            //       [m.checkId]: 0,
                            //     }))
                            //   }}
                            //   options={companyOptions}
                            //   onScrollToBottom={() => {
                            //     if (comPanyNamehasNextPage && !comPanyNameFetching)
                            //       comPanyNameFetchNextPage()
                            //   }}
                            //   loading={comPanyNameLoading}
                            // />

                            <DailyServiceNameRow key={m.checkId} row={m} />
                          ) : (
                            // <CommonSelect
                            //   fullWidth
                            //   value={selectedCompanyIds[m.checkId] || m.outsourcingCompanyId || 0}
                            //   onChange={async (value) => {
                            //     const selectedCompany = companyOptions.find(
                            //       (opt) => opt.id === value,
                            //     )
                            //     if (!selectedCompany) return

                            //     // 해당 row만 업데이트
                            //     setSelectedCompanyIds((prev) => ({
                            //       ...prev,
                            //       [m.checkId]: selectedCompany.id,
                            //     }))

                            //     setSelectId(m.checkId)

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'outsourcingCompanyId',
                            //       selectedCompany.id,
                            //     )

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'outsourcingCompanyName',
                            //       selectedCompany.name,
                            //     )

                            //     // 해당 row 워커만 초기화
                            //     setSelectContractIds((prev) => ({
                            //       ...prev,
                            //       [m.checkId]: 0,
                            //     }))
                            //   }}
                            //   options={companyOptions}
                            //   onScrollToBottom={() => {
                            //     if (comPanyNamehasNextPage && !comPanyNameFetching)
                            //       comPanyNameFetchNextPage()
                            //   }}
                            //   loading={comPanyNameLoading}
                            // />
                            <DailyServiceNameRow key={m.checkId} row={m} />
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {m.isTemporary ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={m.temporaryLaborName || ''}
                              onChange={(e) =>
                                updateItemField(
                                  'outsourcingByDirectContract',
                                  m.checkId,
                                  'temporaryLaborName',
                                  e.target.value,
                                )
                              }
                              placeholder="이름 입력"
                            />
                          ) : (
                            // <CommonSelect
                            //   value={selectContractIds[m.id] || m.laborId || 0}
                            //   onChange={(value) => {
                            //     const selectedContractName = (
                            //       outSourcingByDirectContract[m.outsourcingCompanyId] ?? []
                            //     ).find((opt) => opt.id === value)

                            //     if (!selectedContractName) return

                            //     if (selectedContractName?.isSeverancePayEligible) {
                            //       showSnackbar(
                            //         '해당 직원 근속일이 6개월에 도달했습니다. 퇴직금 발생에 주의하세요.',
                            //         'error',
                            //       )
                            //     }

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'position',
                            //       selectedContractName.type,
                            //     )

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'laborId',
                            //       value,
                            //     )

                            //     updateItemField(
                            //       'outsourcingByDirectContract',
                            //       m.checkId,
                            //       'previousPrice',
                            //       selectedContractName?.previousDailyWage ?? 0, // 선택된 항목의 previousDailyWage 자동 입력
                            //     )
                            //   }}
                            //   options={
                            //     outSourcingByDirectContract[m.outsourcingCompanyId] ?? [
                            //       { id: 0, name: '선택' },
                            //     ]
                            //   }
                            //   onScrollToBottom={() => {
                            //     if (NameByOutsourcinghasNextPage && !NameByOutsourcingFetching)
                            //       NameByOutsourcingFetchNextPage()
                            //   }}
                            //   loading={NameByOutsourcingLoading}
                            // />
                            <DailyServicePersonNameRow key={m.checkId} row={m} />
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            placeholder="텍스트 입력"
                            value={m.position}
                            onChange={(e) =>
                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'position',
                                e.target.value,
                              )
                            }
                            disabled
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            placeholder="텍스트 입력 "
                            value={m.workContent}
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) =>
                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'workContent',
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            value={
                              m.previousPrice === 0 || m.previousPrice === null
                                ? ''
                                : formatNumber(m.previousPrice)
                            }
                            onChange={(e) => {
                              const numericValue =
                                e.target.value === '' ? null : unformatNumber(e.target.value)

                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'previousPrice',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                backgroundColor: '#E5E7EB', // 연한 회색 (Tailwind gray-200)
                                color: '#111827', // 진한 글자색 (Tailwind gray-900)
                                fontWeight: 'bold', // 글자 강조
                                textAlign: 'center',
                                padding: '10px',
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
                            disabled
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            placeholder="숫자를 입력해주세요."
                            value={
                              m.unitPrice === 0 || m.unitPrice === null
                                ? ''
                                : formatNumber(m.unitPrice)
                            }
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) => {
                              const numericValue =
                                e.target.value === '' ? null : unformatNumber(e.target.value)

                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'unitPrice',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
                                padding: '10px',
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
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            type="number" // type을 number로 변경
                            placeholder="숫자를 입력해주세요."
                            inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                            value={m.workQuantity ?? ''}
                            onWheel={(e) => {
                              ;(e.target as HTMLInputElement).blur()
                            }}
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) => {
                              const value = e.target.value
                              const numericValue = value === '' ? null : parseFloat(value)

                              // dailyWork 배열 idx 위치 업데이트
                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'workQuantity',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
                                padding: '10px',
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
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                            <CommonFileInput
                              acceptedExtensions={[
                                'pdf',
                                'txt',
                                'rtf',
                                'docx',
                                'hwp',
                                'xlsx',
                                'csv',
                                'ods',
                                'pptx',
                                'ppt',
                                'odp',
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'tif',
                                'tiff',
                                'bmp',
                                'zip',
                                '7z',
                                'mp3',
                                'wav',
                                'mp4',
                                'mov',
                                'avi',
                                'wmv',
                                'dwg',
                              ]}
                              multiple={false}
                              files={m.files} // 각 항목별 files
                              onChange={(newFiles) =>
                                updateItemField(
                                  'outsourcingByDirectContract',
                                  m.checkId,
                                  'files',
                                  newFiles,
                                )
                              }
                              uploadTarget="WORK_DAILY_REPORT"
                            />
                          </div>
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            value={m.memo}
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            onChange={(e) =>
                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'memo',
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
                        >
                          <CommonInput
                            placeholder="-"
                            value={m.modifyDate ?? ''}
                            onChange={(value) =>
                              updateItemField(
                                'outsourcingByDirectContract',
                                m.checkId,
                                'modifyDate',
                                value,
                              )
                            }
                            disabled
                            className="flex-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {employeesFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          {/* 직영에서 사용하는 외주  데이터 */}

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold mb-4"> [외주]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('directContractOutsourcings')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('directContractOutsourcings')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>
            <TableContainer
              component={Paper}
              sx={{
                height: '300px',
                overflowX: 'auto', // 가로 스크롤 허용
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (directContractHasNextPage && !directContractFetching) {
                    directContractFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isDirectContractOutsourcingsAllChecked}
                        indeterminate={
                          directContractOutsourcingCheckedIds.length > 0 &&
                          !isDirectContractOutsourcingsAllChecked
                        }
                        onChange={(e) =>
                          toggleCheckAllItems('directContractOutsourcings', e.target.checked)
                        }
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '업체명',
                      '계약명',
                      '이름',
                      '공수',
                      '첨부파일',
                      '비고',
                      '등록/수정일',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === '비고' ||
                        label === 'No' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ? (
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
                  {directContractOutsourcings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        외주 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    directContractOutsourcings.map((m, index) => (
                      <TableRow key={m.id}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={directContractOutsourcingCheckedIds.includes(m.id)}
                            onChange={(e) =>
                              toggleCheckItem('directContractOutsourcings', m.id, e.target.checked)
                            }
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {directContractOutsourcings.length - index}
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {/* <CommonSelect
                            fullWidth
                            // selectedCompanyIds[m.id] ||
                            value={m.outsourcingCompanyId || 0}
                            onChange={async (value) => {
                              const selectedCompany = updatedOutCompanyOptions.find(
                                (opt) => Number(opt.id) === Number(value),
                              )

                              console.log('현재 업체명을 찾기', selectedCompany)

                              setSelectedCompanyIds((prev) => ({
                                ...prev,
                                [m.id]: selectedCompany ? selectedCompany.id : 0,
                              }))

                              setSelectId(m.id)

                              updateItemField(
                                'directContractOutsourcings',
                                m.id,
                                'outsourcingCompanyId',
                                selectedCompany?.id || null,
                              )
                            }}
                            options={updatedOutCompanyOptions}
                            onScrollToBottom={() => {
                              if (withEquipmenthasNextPage && !withEquipmentFetching)
                                withEquipmentFetchNextPage()
                            }}
                            loading={withEquipmentLoading}
                          /> */}

                          <DailyOutsourcingNameRow key={m.id} row={m} />
                        </TableCell>

                        {/* 계약명 */}

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {/* <CommonSelect
                            fullWidth
                            value={m.outsourcingCompanyContractId || 0}
                            onChange={async (value) => {
                              const selectedDirectContractName = (
                                directContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? []
                              ).find((opt) => opt.id === value)

                              setSelectedOutSourcingContractIds((prev) => ({
                                ...prev,
                                [m.id]: selectedDirectContractName
                                  ? selectedDirectContractName.id
                                  : 0,
                              }))

                              if (!selectedDirectContractName) return

                              updateItemField(
                                'directContractOutsourcings',
                                m.id,
                                'outsourcingCompanyContractId',
                                value,
                              )
                            }}
                            options={
                              directContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? [
                                { id: 0, name: '선택' },
                              ]
                            }
                            onScrollToBottom={() => {
                              if (directContractNamehasNextPage && !directContractNameFetching)
                                directContractNameFetchNextPage()
                            }}
                            loading={directContractNameLoading}
                          /> */}

                          <DailyOutsourcingContractNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {/* <CommonSelect
                            value={m.laborId || 0}
                            onChange={(value) => {
                              const key = `${m.outsourcingCompanyId}_${m.outsourcingCompanyContractId}` // ✅ 키 변경
                              const selectedContractName = (
                                directContarctPersonNameByCompany[key] ?? []
                              ).find((opt) => opt.id === value)

                              console.log()
                              if (!selectedContractName) return
                              updateItemField('directContractOutsourcings', m.id, 'laborId', value)
                            }}
                            options={
                              directContarctPersonNameByCompany[
                                `${m.outsourcingCompanyId}_${m.outsourcingCompanyContractId}`
                              ] ?? [{ id: 0, name: '선택' }]
                            }
                            onScrollToBottom={() => {
                              if (contractNamehasNextPage && !contractNameFetching)
                                contractNameFetchNextPage()
                            }}
                            loading={contractNameLoading}
                          /> */}

                          <DailyOutsourcingContractPersonNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                        >
                          <TextField
                            size="small"
                            type="number" // type을 number로 변경
                            placeholder="숫자를 입력해주세요."
                            inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                            onFocus={() => {
                              setClearServiceCompanyFocusedId(null)
                              setClearPersonNameFocusedId(null)
                              setClearServiceOutsourcingCompanyFocusedId(null)
                              setClearServiceOutsourcingContractFocusedId(null)
                              setClearServiceOutsourcingContractPersonNameFocusedId(null)
                              setClearFocusedRowId(null)
                            }}
                            value={m.workQuantity ?? ''}
                            onWheel={(e) => {
                              ;(e.target as HTMLInputElement).blur()
                            }}
                            onChange={(e) => {
                              const value = e.target.value
                              const numericValue = value === '' ? null : parseFloat(value)

                              // dailyWork 배열 idx 위치 업데이트
                              updateItemField(
                                'directContractOutsourcings',
                                m.id,
                                'workQuantity',
                                numericValue,
                              )
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
                                padding: '10px',
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

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                            <CommonFileInput
                              acceptedExtensions={[
                                'pdf',
                                'txt',
                                'rtf',
                                'docx',
                                'hwp',
                                'xlsx',
                                'csv',
                                'ods',
                                'pptx',
                                'ppt',
                                'odp',
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'tif',
                                'tiff',
                                'bmp',
                                'zip',
                                '7z',
                                'mp3',
                                'wav',
                                'mp4',
                                'mov',
                                'avi',
                                'wmv',
                                'dwg',
                              ]}
                              multiple={false}
                              files={m.files} // 각 항목별 files
                              onChange={(newFiles) => {
                                updateItemField(
                                  'directContractOutsourcings',
                                  m.id,
                                  'files',
                                  newFiles.slice(0, 1),
                                )
                              }}
                              uploadTarget="WORK_DAILY_REPORT"
                            />
                          </div>
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            value={m.memo}
                            onChange={(e) =>
                              updateItemField(
                                'directContractOutsourcings',
                                m.id,
                                'memo',
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
                        >
                          <CommonInput
                            placeholder="-"
                            value={m.modifyDate ?? ''}
                            onChange={(value) =>
                              updateItemField(
                                'directContractOutsourcings',
                                m.id,
                                'modifyDate',
                                value,
                              )
                            }
                            disabled
                            className="flex-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {employeesFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold border-b-2 mb-4">증빙</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('directContractFiles')}
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('directContractFiles')}
                />
              </div>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isContractProofAllChecked}
                        indeterminate={
                          contractProofCheckIds.length > 0 && !isContractProofAllChecked
                        }
                        onChange={(e) =>
                          toggleCheckAllItems('directContractFiles', e.target.checked)
                        }
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
                  {contractFileProof.map((m) => (
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      <TableCell
                        padding="checkbox"
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF' }}
                      >
                        <Checkbox
                          checked={contractProofCheckIds.includes(m.id)}
                          onChange={(e) =>
                            toggleCheckItem('directContractFiles', m.id, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.name}
                          onChange={(e) =>
                            updateItemField('directContractFiles', m.id, 'name', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                          <CommonFileInput
                            acceptedExtensions={[
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            multiple={false}
                            files={m.files} // 각 항목별 files
                            onChange={(newFiles) => {
                              updateItemField(
                                'directContractFiles',
                                m.id,
                                'files',
                                newFiles.slice(0, 1),
                              )
                            }}
                            uploadTarget="WORK_DAILY_REPORT"
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
                            updateItemField('directContractFiles', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {activeTab === '외주(공사)' && (
        <>
          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold mb-4"> [{activeTab}]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('outsourcings')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('outsourcings')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>
            <TableContainer
              component={Paper}
              sx={{
                height: '300px',
                overflowX: 'auto', // 가로 스크롤 허용
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (outsourcingHasNextPage && !outsourcingFetching) {
                    outsourcingFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isOutsourcingAllChecked}
                        indeterminate={checkedOutsourcingIds.length > 0 && !isOutsourcingAllChecked}
                        onChange={(e) => toggleCheckAllItems('outsourcings', e.target.checked)}
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '업체명',
                      '항목명',
                      '항목',
                      '규격',
                      '단위',
                      '수량',
                      '첨부파일',
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
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === '비고' ||
                        label === 'No' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ? (
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
                  {resultOutsourcing.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        외주(공사) 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resultOutsourcing.map((m, index) => (
                      <TableRow key={m.id}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={checkedOutsourcingIds.includes(m.id)}
                            onChange={(e) =>
                              toggleCheckItem('outsourcings', m.id, e.target.checked)
                            }
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {resultOutsourcing.length - index}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {/* <CommonSelect
                            fullWidth
                            value={selectedCompanyIds[m.id] || m.outsourcingCompanyId || 0}
                            onChange={async (value) => {
                              const selectedCompany = withEquipmentInfoOptions.find(
                                (opt) => opt.id === value,
                              )
                              if (!selectedCompany) return

                              // 선택한 업체 업데이트
                              setSelectedCompanyIds((prev) => ({
                                ...prev,
                                [m.id]: selectedCompany.id,
                              }))
                              setSelectId(m.id)

                              // 하위 항목 초기화
                              updateItemField(
                                'outsourcings',
                                m.id,
                                'outsourcingCompanyId',
                                selectedCompany.id,
                              )
                              updateItemField(
                                'outsourcings',
                                m.id,
                                'outsourcingCompanyContractConstructionGroupId',
                                0,
                              )
                              updateItemField('outsourcings', m.id, 'items', [])
                            }}
                            options={withEquipmentInfoOptions}
                            onScrollToBottom={() => {
                              if (withEquipmenthasNextPage && !withEquipmentFetching)
                                withEquipmentFetchNextPage()
                            }}
                            loading={withEquipmentLoading}
                          /> */}

                          <DailyWorkOutsourcingNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {/* <CommonSelect
                            fullWidth
                            value={m.outsourcingCompanyContractConstructionGroupId || 0}
                            onChange={async (value) => {
                              if (value === 0) {
                                updateItemField(
                                  'outsourcings',
                                  m.id,
                                  'outsourcingCompanyContractConstructionGroupId',
                                  0,
                                )
                                updateItemField('outsourcings', m.id, 'items', [])
                                return
                              }

                              const selectedItemName = (
                                itemNameByOutSourcing[m.outsourcingCompanyId] ?? []
                              ).find((opt) => opt.id === value)

                              if (!selectedItemName) return

                              updateItemField(
                                'outsourcings',
                                m.id,
                                'outsourcingCompanyContractConstructionGroupId',
                                selectedItemName.id,
                              )

                              if (selectedItemName.items && selectedItemName.items.length > 0) {
                                updateItemField(
                                  'outsourcings',
                                  m.id,
                                  'items',
                                  selectedItemName.items.map((item: any) => ({
                                    id: item.id, // 내부 관리용
                                    outsourcingCompanyContractConstructionName: item.item,
                                    outsourcingCompanyContractConstructionId: item.id,
                                    specification: item.specification,
                                    unit: item.unit,
                                    quantity: item.quantity ?? 0,
                                    memo: '',
                                    fileUrl: '',
                                  })),
                                )
                              }
                            }}
                            options={(() => {
                              const allOptions = itemNameByOutSourcing[m.outsourcingCompanyId] ?? []

                              const selectedGroupIds = form.outsourcingConstructions
                                .filter(
                                  (o) =>
                                    o.outsourcingCompanyId === m.outsourcingCompanyId &&
                                    o.id !== m.id && // 자기 자신 제외
                                    o.outsourcingCompanyContractConstructionGroupId,
                                )
                                .map((o) => o.outsourcingCompanyContractConstructionGroupId)

                              const filteredOptions = allOptions.filter(
                                (opt) => !selectedGroupIds.includes(opt.id),
                              )

                              return filteredOptions.length
                                ? filteredOptions
                                : [{ id: 0, name: '선택' }]
                            })()}
                            onScrollToBottom={() => {
                              if (contractGroupHasNextPage && !contractGroupIsFetching)
                                contractGroupFetchNextPage()
                            }}
                            loading={contractGroupLoading}
                          /> */}

                          <DailyWorkerItemNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {m.items && m.items.length > 0 ? (
                            <div className="flex flex-col ">
                              {m.items.map((item, index) => (
                                <div
                                  key={`${m.id}-${item.id}-${index} + 1`}
                                  className="flex items-center justify-between gap-[4px] mb-[-4px]  w-full"
                                >
                                  <CommonInput
                                    className="text-2xl "
                                    value={item.outsourcingCompanyContractConstructionName || '-'}
                                    onChange={() => {}}
                                    disabled
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <CommonInput
                                className="text-2xl "
                                value={'-'}
                                onChange={() => {}}
                                disabled
                              />
                            </div>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {m.items && m.items.length > 0 ? (
                            <div className="flex flex-col">
                              {m.items.map((item, index) => (
                                <div
                                  key={`${m.id}-${item.id}-${index} + 2`}
                                  className="flex items-center justify-between gap-[4px] mb-[-4px]  w-full"
                                >
                                  <CommonInput
                                    className="text-2xl "
                                    value={item.specification || '-'}
                                    onChange={() => {}}
                                    disabled
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <CommonInput
                                className="text-2xl "
                                value={'-'}
                                onChange={() => {}}
                                disabled
                              />
                            </div>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {m.items && m.items.length > 0 ? (
                            <div className="flex flex-col">
                              {m.items.map((item, index) => (
                                <div
                                  key={`${m.id}-${item.id}-${index} +  3`}
                                  className="flex items-center justify-between gap-[4px] mb-[-4px]  w-full"
                                >
                                  <CommonInput
                                    className="text-2xl "
                                    value={item.unit || '-'}
                                    onChange={() => {}}
                                    disabled
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <CommonInput
                                className="text-2xl "
                                value={'-'}
                                onChange={() => {}}
                                disabled
                              />
                            </div>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {m.items && m.items.length > 0 ? (
                            <div className="flex flex-col ">
                              {m.items.map((item, index) => (
                                <div
                                  key={`${m.id}-${item.id}-${index} + 4`}
                                  className="flex items-center justify-between gap-[4px] mb-[-4px]  w-full"
                                >
                                  <CommonInput
                                    className="text-2xl "
                                    onFocus={() => {
                                      setClearWorkOutsourcingNameFocusedId(null)
                                      setClearWorkerItemNameFocusedId(null)
                                    }}
                                    value={item.quantity ?? 0}
                                    onChange={(value: number) => {
                                      const numericValue = Number(value)
                                      updateContractDetailField(
                                        'construction',
                                        m.id,
                                        item.id,
                                        'quantity',
                                        numericValue,
                                      )
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <CommonInput
                                className="text-2xl "
                                value={'-'}
                                onChange={() => {}}
                                disabled
                              />
                            </div>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {m.items && m.items.length > 0 ? (
                            <div className="flex flex-col ">
                              {m.items.map((item, index) => (
                                <div
                                  key={item.id ?? index}
                                  className="px-2 p-2 w-full flex gap-2.5 items-center justify-center"
                                >
                                  <CommonFileInput
                                    acceptedExtensions={[
                                      'pdf',
                                      'txt',
                                      'rtf',
                                      'docx',
                                      'hwp',
                                      'xlsx',
                                      'csv',
                                      'ods',
                                      'pptx',
                                      'ppt',
                                      'odp',
                                      'jpg',
                                      'jpeg',
                                      'png',
                                      'gif',
                                      'tif',
                                      'tiff',
                                      'bmp',
                                      'zip',
                                      '7z',
                                      'mp3',
                                      'wav',
                                      'mp4',
                                      'mov',
                                      'avi',
                                      'wmv',
                                      'dwg',
                                    ]}
                                    multiple={false}
                                    files={item.files || []}
                                    onChange={(newFiles) => {
                                      updateItemField(
                                        'outsourcings',
                                        m.id,
                                        'items',
                                        m.items.map((it) =>
                                          it.id === item.id
                                            ? { ...it, files: newFiles.slice(0, 1) }
                                            : it,
                                        ),
                                      )
                                    }}
                                    uploadTarget="WORK_DAILY_REPORT"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <CommonInput
                                className="text-2xl "
                                value={'-'}
                                onChange={() => {}}
                                disabled
                              />
                            </div>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {m.items && m.items.length > 0 ? (
                            <div className="flex flex-col">
                              {m.items.map((item, index) => (
                                <div
                                  key={`${m.id}-${item.id}-${index} + 4`}
                                  className="flex items-center justify-between gap-[4px] mb-[-4px]  w-full"
                                >
                                  <CommonInput
                                    className="text-2xl "
                                    value={item.memo ?? 0}
                                    onChange={(value) => {
                                      const numericValue = value
                                      updateContractDetailField(
                                        'construction',
                                        m.id,
                                        item.id,
                                        'memo',
                                        numericValue,
                                      )
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <CommonInput
                                className="text-2xl "
                                value={'-'}
                                onChange={() => {}}
                                disabled
                              />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {outsourcingFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold border-b-2 mb-4">증빙</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('outsourcingFiles')}
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('outsourcingFiles')}
                />
              </div>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isOutSourcingProofAllChecked}
                        indeterminate={
                          outSourcingProofCheckIds.length > 0 && !isOutSourcingProofAllChecked
                        }
                        onChange={(e) => toggleCheckAllItems('outsourcingFiles', e.target.checked)}
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
                  {outSourcingFileProof.map((m) => (
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      <TableCell
                        padding="checkbox"
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF' }}
                      >
                        <Checkbox
                          checked={outSourcingProofCheckIds.includes(m.id)}
                          onChange={(e) =>
                            toggleCheckItem('outsourcingFiles', m.id, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.name}
                          onChange={(e) =>
                            updateItemField('outsourcingFiles', m.id, 'name', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                          <CommonFileInput
                            acceptedExtensions={[
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            multiple={false}
                            files={m.files} // 각 항목별 files
                            onChange={(newFiles) => {
                              updateItemField(
                                'outsourcingFiles',
                                m.id,
                                'files',
                                newFiles.slice(0, 1),
                              )
                            }}
                            uploadTarget="WORK_DAILY_REPORT"
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
                            updateItemField('outsourcingFiles', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {activeTab === '장비' && (
        <>
          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold mb-4"> [{activeTab}]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('equipment')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('equipment')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>

            <TableContainer
              component={Paper}
              sx={{
                minHeight: '300px',
                overflowX: 'auto',
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (equipmentHasNextPage && !equipmentFetching) {
                    equipmentFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isEquipmentAllChecked}
                        indeterminate={checkedEquipmentIds.length > 0 && !isEquipmentAllChecked}
                        onChange={(e) => toggleCheckAllItems('equipment', e.target.checked)}
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '업체명',
                      '기사명',
                      '차량번호',
                      '장비명(규격)',
                      // '구분',
                      '작업내용',
                      '단가',
                      '시간',
                      '첨부파일',
                      '비고',
                      '등록/수정일',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === '비고' ||
                        label === 'No' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ||
                        label === '작업내용' ? (
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
                  {equipmentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        장비 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    equipmentData.map((m, index) => (
                      <TableRow key={m.id}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={checkedEquipmentIds.includes(m.id)}
                            onChange={(e) => toggleCheckItem('equipment', m.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {equipmentData.length - index}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {/* <CommonSelect
                            fullWidth
                            value={selectedCompanyIds[m.id] || m.outsourcingCompanyId || 0}
                            onChange={async (value) => {
                              const selectedCompany = withEquipmentInfoOptions.find(
                                (opt) => opt.id === value,
                              )
                              if (!selectedCompany) return

                              // 해당 row만 업데이트
                              setSelectedCompanyIds((prev) => ({
                                ...prev,
                                [m.id]: selectedCompany.id,
                              }))

                              setSelectId(m.id)

                              updateItemField(
                                'equipment',
                                m.id,
                                'outsourcingCompanyId',
                                selectedCompany.id,
                              )

                              // 해당 row 기사, 차량 초기화
                              setSelectedDriverIds((prev) => ({
                                ...prev,
                                [m.id]: 0,
                              }))

                              setSelectedCarNumberIds((prev) => ({
                                ...prev,
                                [m.id]: 0,
                              }))

                              // 차량 값도 추가
                            }}
                            options={withEquipmentInfoOptions}
                            onScrollToBottom={() => {
                              if (withEquipmenthasNextPage && !withEquipmentFetching)
                                withEquipmentFetchNextPage()
                            }}
                            loading={withEquipmentLoading}
                          /> */}

                          <DailyEquipMentOutsourcingNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          <DailyEquipMentDriverNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          {/* <CommonSelect
                            fullWidth
                            value={
                              selectedCarNumberIds[m.id] ||
                              m.outsourcingCompanyContractEquipmentId ||
                              0
                            }
                            onChange={async (value) => {
                              const selectedCarNumber = carNumberOptionsByCompany[
                                m.outsourcingCompanyId
                              ]?.find((opt) => opt.id === value)
                              if (!selectedCarNumber) return

                              console.log('selectedCarNumber24', selectedCarNumber)

                              // 차량 및 관련 필드 업데이트
                              updateItemField(
                                'equipment',
                                m.id,
                                'outsourcingCompanyContractEquipmentId',
                                selectedCarNumber.id,
                              )
                              updateItemField(
                                'equipment',
                                m.id,
                                'specificationName',
                                selectedCarNumber.specification || '',
                              )
                              updateItemField(
                                'equipment',
                                m.id,
                                'unitPrice',
                                selectedCarNumber.unitPrice || 0,
                              )
                              updateItemField(
                                'equipment',
                                m.id,
                                'workContent',
                                selectedCarNumber.taskDescription || '',
                              )

                              const subEquipments = selectedCarNumber.subEquipments ?? []

                              if (subEquipments.length > 0) {
                                const formattedSubEquipments = subEquipments.map((sub: any) => ({
                                  id: sub.id,
                                  outsourcingCompanyContractSubEquipmentId: sub.id,
                                  type: sub.type || sub.typeCode || '-',
                                  workContent: sub.workContent || sub.taskDescription || '',
                                  description: sub.description || ' ',
                                  unitPrice: sub.unitPrice || 0,
                                  workHours: sub.workHours || 0,
                                  memo: sub.memo || '',
                                }))

                                updateItemField(
                                  'equipment',
                                  m.id,
                                  'subEquipments',
                                  formattedSubEquipments,
                                )

                                const subEquipmentsOptions = formattedSubEquipments.map(
                                  (sub: any) => ({
                                    id: sub.id,
                                    name: sub.type || sub.typeCode || '-',
                                    taskDescription: sub.workContent,
                                    unitPrice: sub.unitPrice,
                                    description: sub.description || ' ',
                                  }),
                                )

                                setTestArrayByRow((prev) => ({
                                  ...prev,
                                  [selectedCarNumber.id]: [
                                    { id: 0, name: '선택' },
                                    ...subEquipmentsOptions,
                                  ],
                                }))

                                console.log('✅ 저장된 subEquipments:', subEquipmentsOptions)
                              } else {
                                updateItemField('equipment', m.id, 'subEquipments', [])
                              }
                            }}
                            options={
                              carNumberOptionsByCompany[m.outsourcingCompanyId] ?? [
                                { id: 0, name: '선택', category: '' },
                              ]
                            }
                            onScrollToBottom={() => {
                              if (fuelEquipmentHasNextPage && !fuelEquipmentIsFetching)
                                fuelEquipmentFetchNextPage()
                            }}
                            loading={fuelEquipmentLoading}
                          /> */}

                          <DailyEquipMentCarNumberRow key={m.id} row={m} />
                        </TableCell>

                        {/* 규격 (서브장비 부분) */}
                        <TableCell align="center" sx={cellStyle}>
                          <div className="flex items-center justify-between mb-2">
                            <TextField
                              size="small"
                              fullWidth
                              value={m.specificationName ?? ''}
                              placeholder="규격명"
                              disabled
                              sx={{
                                '& .MuiInputBase-input': { textAlign: 'center' },
                              }}
                            />
                          </div>

                          {m.subEquipments && m.subEquipments?.length > 0 && (
                            <div className="flex flex-col ">
                              {m.subEquipments.map((item) => (
                                <div
                                  key={item.id || item.outsourcingCompanyContractSubEquipmentId}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <CommonInput
                                    className="flex-1 text-2xl"
                                    value={item.outsourcingCompanyContractSubEquipmentName || 0}
                                    onChange={() => {}}
                                    disabled
                                  />

                                  <CommonInput
                                    className="flex-1 text-2xl"
                                    value={item.description || ''}
                                    onChange={() => {}}
                                    disabled
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          <TextField
                            size="small"
                            placeholder="작업 내용 입력"
                            value={m.workContent}
                            onFocus={() => {
                              setClearEquipmentOutsourcingNameFocusedId(null)
                              setClearEquipmentDriverNameFocusedId(null)
                              setClearEquipmentCarNumberFocusedId(null)
                            }}
                            onChange={(e) =>
                              updateItemField('equipment', m.id, 'workContent', e.target.value)
                            }
                            fullWidth
                          />

                          {m.subEquipments &&
                            m.subEquipments?.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-4 items-center">
                                <TextField
                                  size="small"
                                  placeholder="작업 내용 입력"
                                  value={detail.workContent}
                                  onFocus={() => {
                                    setClearEquipmentOutsourcingNameFocusedId(null)
                                    setClearEquipmentDriverNameFocusedId(null)
                                    setClearEquipmentCarNumberFocusedId(null)
                                  }}
                                  onChange={(e) =>
                                    updateContractDetailField(
                                      'equipment',
                                      m.id,
                                      detail.id,
                                      'workContent',
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                />
                              </div>
                            ))}
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          <TextField
                            size="small"
                            placeholder="작업 내용 입력"
                            value={formatNumber(m.unitPrice)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('equipment', m.id, 'unitPrice', numericValue)
                            }}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { textAlign: 'right' }, // ← 오른쪽 정렬
                            }}
                            fullWidth
                            disabled
                          />
                          {m.subEquipments &&
                            m.subEquipments.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-4 items-center">
                                <TextField
                                  size="small"
                                  placeholder="숫자만"
                                  value={formatNumber(detail.unitPrice)}
                                  onChange={(e) => {
                                    const numericValue = unformatNumber(e.target.value)
                                    updateContractDetailField(
                                      'equipment',
                                      m.id,
                                      detail.id,
                                      'unitPrice',
                                      numericValue,
                                    )
                                  }}
                                  inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { textAlign: 'right' }, // ← 오른쪽 정렬
                                  }}
                                  fullWidth
                                  disabled
                                />
                              </div>
                            ))}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            border: '1px solid  #9CA3AF',
                            padding: '8px',
                            verticalAlign: 'top',
                          }}
                        >
                          <TextField
                            size="small"
                            type="number" // type을 number로 변경
                            placeholder="숫자를 입력해주세요."
                            inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                            value={m.workHours ?? ''}
                            onFocus={() => {
                              setClearEquipmentOutsourcingNameFocusedId(null)
                              setClearEquipmentDriverNameFocusedId(null)
                              setClearEquipmentCarNumberFocusedId(null)
                            }}
                            onWheel={(e) => {
                              ;(e.target as HTMLInputElement).blur()
                            }}
                            onChange={(e) => {
                              const value = e.target.value
                              const numericValue = value === '' ? null : parseFloat(value)

                              // dailyWork 배열 idx 위치 업데이트
                              updateItemField('equipment', m.id, 'workHours', numericValue)
                            }}
                            sx={{
                              height: '100%',
                              '& .MuiInputBase-root': {
                                height: '100%',
                                fontSize: '1rem',
                              },
                              '& input': {
                                textAlign: 'center',
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

                          {m.subEquipments &&
                            m.subEquipments.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-4 items-center">
                                <TextField
                                  size="small"
                                  type="number" // type을 number로 변경
                                  placeholder="숫자를 입력해주세요."
                                  inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                                  value={detail.workHours ?? ''}
                                  onWheel={(e) => {
                                    ;(e.target as HTMLInputElement).blur()
                                  }}
                                  onFocus={() => {
                                    setClearEquipmentOutsourcingNameFocusedId(null)
                                    setClearEquipmentDriverNameFocusedId(null)
                                    setClearEquipmentCarNumberFocusedId(null)
                                  }}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    const numericValue = value === '' ? null : parseFloat(value)

                                    // dailyWork 배열 idx 위치 업데이트
                                    updateContractDetailField(
                                      'equipment',
                                      m.id,
                                      detail.id,
                                      'workHours',
                                      numericValue,
                                    )
                                  }}
                                  sx={{
                                    height: '100%',
                                    '& .MuiInputBase-root': {
                                      height: '100%',
                                      fontSize: '1rem',
                                    },
                                    '& input': {
                                      textAlign: 'center',
                                      padding: '10px',
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
                              </div>
                            ))}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                            <CommonFileInput
                              acceptedExtensions={[
                                'pdf',
                                'txt',
                                'rtf',
                                'docx',
                                'hwp',
                                'xlsx',
                                'csv',
                                'ods',
                                'pptx',
                                'ppt',
                                'odp',
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'tif',
                                'tiff',
                                'bmp',
                                'zip',
                                '7z',
                                'mp3',
                                'wav',
                                'mp4',
                                'mov',
                                'avi',
                                'wmv',
                                'dwg',
                              ]}
                              multiple={false}
                              files={m.files} // 각 항목별 files
                              onChange={(newFiles) => {
                                updateItemField('equipment', m.id, 'files', newFiles.slice(0, 1))
                              }}
                              uploadTarget="WORK_DAILY_REPORT"
                            />
                          </div>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            onFocus={() => {
                              setClearEquipmentOutsourcingNameFocusedId(null)
                              setClearEquipmentDriverNameFocusedId(null)
                              setClearEquipmentCarNumberFocusedId(null)
                            }}
                            value={m.memo}
                            onChange={(e) =>
                              updateItemField('equipment', m.id, 'memo', e.target.value)
                            }
                          />
                          {m.subEquipments &&
                            m.subEquipments.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-4  items-center">
                                <TextField
                                  size="small"
                                  placeholder="500자 이하 텍스트 입력"
                                  onFocus={() => {
                                    setClearEquipmentOutsourcingNameFocusedId(null)
                                    setClearEquipmentDriverNameFocusedId(null)
                                    setClearEquipmentCarNumberFocusedId(null)
                                  }}
                                  value={detail.memo}
                                  onChange={(e) =>
                                    updateContractDetailField(
                                      'equipment',
                                      m.id,
                                      detail.id,
                                      'memo',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            ))}
                        </TableCell>

                        {/* 등록/수정일 (임시: Date.now 기준) */}
                        <TableCell
                          align="center"
                          sx={{
                            border: '1px solid  #9CA3AF',
                            width: '260px',
                            verticalAlign: 'top',
                          }}
                        >
                          <CommonInput
                            placeholder="-"
                            value={m.modifyDate ?? ''}
                            onChange={(value) =>
                              updateItemField('equipment', m.id, 'modifyDate', value)
                            }
                            disabled
                            className="flex-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {equipmentFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold border-b-2 mb-4">증빙</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('equipmentFile')}
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('equipmentFile')}
                />
              </div>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isEquipmentProofAllChecked}
                        indeterminate={
                          equipmentProofCheckIds.length > 0 && !isEquipmentProofAllChecked
                        }
                        onChange={(e) => toggleCheckAllItems('equipmentFile', e.target.checked)}
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
                  {equipmentProof.map((m) => (
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      <TableCell
                        padding="checkbox"
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF' }}
                      >
                        <Checkbox
                          checked={equipmentProofCheckIds.includes(m.id)}
                          onChange={(e) => toggleCheckItem('equipmentFile', m.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.name}
                          onChange={(e) =>
                            updateItemField('equipmentFile', m.id, 'name', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                          <CommonFileInput
                            acceptedExtensions={[
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            multiple={false}
                            files={m.files} // 각 항목별 files
                            onChange={(newFiles) => {
                              updateItemField('equipmentFile', m.id, 'files', newFiles.slice(0, 1))
                            }}
                            uploadTarget="WORK_DAILY_REPORT"
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
                            updateItemField('equipmentFile', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {activeTab === '유류' && (
        <>
          <div>
            <div className="flex mt-10">
              <div className="flex col-span-2">
                <label className="w-36 text-[14px] border border-gray-400 bg-gray-300 flex items-center justify-center font-bold">
                  휘발유
                </label>
                <div className="flex-1 border border-gray-400 px-2 py-2">
                  <AmountInput
                    value={formatNumber(form.gasolinePrice) || 0}
                    onChange={(val) => {
                      const numericValue = unformatNumber(val)
                      setField('gasolinePrice', numericValue)
                      calculateFuelAmount()
                    }}
                    className=" flex-1"
                  />
                </div>
              </div>
              <div className="flex col-span-2">
                <label className="w-36 text-[14px] border border-gray-400 bg-gray-300 flex items-center justify-center font-bold">
                  경유
                </label>
                <div className="flex-1 border border-gray-400 px-2 py-2">
                  <AmountInput
                    value={formatNumber(form.dieselPrice) || 0}
                    onChange={(val) => {
                      const numericValue = unformatNumber(val)
                      setField('dieselPrice', numericValue)
                      calculateFuelAmount()
                    }}
                    className=" flex-1"
                  />
                </div>
              </div>
              <div className="flex col-span-2">
                <label className="w-36 text-[14px] border border-gray-400 bg-gray-300 flex items-center justify-center font-bold">
                  요소수
                </label>
                <div className="flex-1 border border-gray-400 px-2 py-2">
                  <AmountInput
                    value={formatNumber(form.ureaPrice) || 0}
                    onChange={(val) => {
                      const numericValue = unformatNumber(val)
                      setField('ureaPrice', numericValue)
                      calculateFuelAmount()
                    }}
                    className=" flex-1"
                  />
                </div>
              </div>
              <div className="flex">
                <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
                  유류업체명 <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="border border-gray-400  w-full">
                  <InfiniteScrollSelect
                    placeholder="유류 업체명을 입력하세요"
                    keyword={form.outsourcingCompanyName ?? ''}
                    onChangeKeyword={(newKeyword) => {
                      setField('outsourcingCompanyName', newKeyword)

                      if (newKeyword.trim() === '') {
                        setField('outsourcingCompanyName', '')
                        setField('outsourcingCompanyId', 0)
                      }
                    }} // ★필드명과 값 둘 다 넘겨야 함
                    items={outsourcingList}
                    hasNextPage={OutsourcingNameHasNextPage ?? false}
                    fetchNextPage={OutsourcingeNameFetchNextPage}
                    renderItem={(item, isHighlighted) => (
                      <div className={isHighlighted ? 'font-bold text-white p-1  bg-gray-400' : ''}>
                        {item.name}
                      </div>
                    )}
                    onSelect={handleSelectOutsourcing}
                    // shouldShowList={true}
                    isLoading={OutsourcingNameIsLoading || OutsourcingNameIsFetching}
                    debouncedKeyword={debouncedOutsourcingKeyword ?? ''}
                    shouldShowList={isOutsourcingFocused}
                    onFocus={() => setIsOutsourcingFocused(true)}
                    onBlur={() => setIsOutsourcingFocused(false)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-5 mb-2">
              <span className="font-bold mb-4"> [{activeTab}]</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('fuel')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('fuel')}
                  disabled={
                    isHeadOfficeInfo
                      ? false // 본사 정보이면 무조건 활성화
                      : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                        detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                  }
                />
              </div>
            </div>

            <TableContainer
              component={Paper}
              sx={{
                minHeight: '300px',
                overflowX: 'auto',
                overflowY: 'auto',
              }}
              onScroll={(e) => {
                const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                  if (fuelHasNextPage && !fuelFetching) {
                    fuelFetchNextPage()
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isFuelAllChecked}
                        indeterminate={checkedFuelIds.length > 0 && !isFuelAllChecked}
                        onChange={(e) => toggleCheckAllItems('fuel', e.target.checked)}
                        sx={{ color: 'black' }}
                      />
                    </TableCell>
                    {[
                      'No',
                      '업체명',
                      '구분',
                      '차량번호',
                      '규격',
                      '유종',
                      '주유량',
                      '금액',
                      '첨부파일',
                      '비고',
                      '등록/수정일',
                    ].map((label) => (
                      <TableCell
                        key={label}
                        align="center"
                        sx={{
                          backgroundColor: '#D1D5DB',
                          border: '1px solid  #9CA3AF',
                          color: 'black',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {label === '비고' ||
                        label === 'No' ||
                        label === '등록/수정일' ||
                        label === '첨부파일' ||
                        label === '금액' ? (
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
                  {fuelData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                        유류 데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fuelData.map((m, index) => (
                      <TableRow key={m.id}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={checkedFuelIds.includes(m.id)}
                            onChange={(e) => toggleCheckItem('fuel', m.id, e.target.checked)}
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                          {fuelData.length - index}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          {/* <CommonSelect
                            fullWidth
                            // value={m.outsourcingCompanyId || 0}
                            value={selectedCompanyIds[m.id] || m.outsourcingCompanyId || 0}
                            onChange={async (value) => {
                              const selectedCompany = updatedOutCompanyOptions.find(
                                (opt) => Number(opt.id) === Number(value),
                              )

                              setSelectedCompanyIds((prev) => ({
                                ...prev,
                                [m.id]: selectedCompany ? selectedCompany.id : 0,
                              }))

                              setSelectId(m.id)

                              updateItemField(
                                'fuel',
                                m.id,
                                'outsourcingCompanyId',
                                selectedCompany?.id || null,
                              )

                              updateItemField('fuel', m.id, 'driverId', null)
                              updateItemField('fuel', m.id, 'equipmentId', null)
                              updateItemField('fuel', m.id, 'specificationName', '-')

                              setSelectId(m.id)

                              updateItemField(
                                'fuel',
                                m.id,
                                'outsourcingCompanyId',
                                selectedCompany?.id || null,
                              )

                              // 해당 row 기사, 차량 초기화
                              setSelectedDriverIds((prev) => ({
                                ...prev,
                                [m.id]: 0,
                              }))

                              setSelectedCarNumberIds((prev) => ({
                                ...prev,
                                [m.id]: 0,
                              }))

                              // 차량 값도 추가
                            }}
                            options={updatedOutCompanyOptions}
                            onScrollToBottom={() => {
                              if (withEquipmenthasNextPage && !withEquipmentFetching)
                                withEquipmentFetchNextPage()
                            }}
                            loading={withEquipmentLoading}
                          /> */}

                          <DailyFuelOutsourcingNameRow key={m.id} row={m} />
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            border: '1px solid  #9CA3AF',
                            verticalAlign: 'top',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <div className="flex items-center gap-4 justify-center">
                            <label className="flex items-center gap-1">
                              <Radio
                                checked={m.categoryType === 'CONSTRUCTION'}
                                onChange={() => {
                                  setFuelRadioBtn(m.id, 'CONSTRUCTION')
                                  updateItemField('fuel', m.id, 'equipmentId', '')
                                  updateItemField('fuel', m.id, 'equipmentName', '')

                                  updateItemField('fuel', m.id, 'specificationName', '')
                                }}
                                value="CONSTRUCTION"
                                name={`categoryType-${m.id}`} // 각 행별로 고유 그룹
                              />
                              외주
                            </label>

                            <label className="flex items-center gap-1">
                              <Radio
                                checked={m.categoryType === 'EQUIPMENT'}
                                onChange={() => {
                                  setFuelRadioBtn(m.id, 'EQUIPMENT')

                                  updateItemField('fuel', m.id, 'equipmentId', '')
                                  updateItemField('fuel', m.id, 'equipmentName', '')
                                  updateItemField('fuel', m.id, 'specificationName', '')
                                }}
                                value="EQUIPMENT"
                                name={`categoryType-${m.id}`} // 각 행별로 고유 그룹
                              />
                              장비
                            </label>
                          </div>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          {/* <CommonSelect
                            fullWidth
                            value={selectedCarNumberIds[m.id] ?? m.equipmentId ?? 0}
                            onChange={async (value) => {
                              const selectedCarNumber = (
                                carNumberOptionsByCompany[
                                  `${m.outsourcingCompanyId}_${m.categoryType}_${m.id}`
                                ] ?? []
                              ).find((opt) => opt.id === value)

                              if (!selectedCarNumber) return

                              updateItemField('fuel', m.id, 'equipmentId', selectedCarNumber.id)

                              updateItemField(
                                'fuel',
                                m.id,
                                'specificationName',
                                selectedCarNumber.specification || '-',
                              )
                            }}
                            // options={
                            //   carNumberOptionsByCompany[
                            //     `${m.outsourcingCompanyId}_${m.categoryType}_${m.id}`
                            //   ] ?? [{ id: 0, name: '선택' }]
                            // }
                            options={(() => {
                              const key = `${m.outsourcingCompanyId}_${m.categoryType}_${m.id}`
                              const currentSelectedId = selectedCarNumberIds[m.id]

                              const otherSelectedIds = outsourcingfuel
                                .filter(
                                  (o) =>
                                    o.outsourcingCompanyId === m.outsourcingCompanyId &&
                                    o.categoryType === m.categoryType &&
                                    o.id !== m.id,
                                )
                                .map((o) => selectedCarNumberIds[o.id])
                                .filter(Boolean)

                              return (carNumberOptionsByCompany[key] ?? []).filter(
                                (opt) =>
                                  opt.id === currentSelectedId ||
                                  !otherSelectedIds.includes(opt.id),
                              )
                            })()}
                            // onScrollToBottom={() => {
                            //   if (fuelEquipmentHasNextPage && !fuelEquipmentIsFetching)
                            //     fuelEquipmentFetchNextPage()
                            // }}
                            // loading={fuelEquipmentLoading}
                          /> */}

                          <DailyFuelCarNumberRow key={m.id} row={m} />
                        </TableCell>

                        {/* 규격 */}
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          <CommonInput
                            placeholder="자동 입력"
                            value={m.specificationName ?? ''}
                            onChange={(value) =>
                              updateItemField('fuel', m.id, 'specificationName', value)
                            }
                            disabled={true}
                            className=" flex-1"
                          />

                          {/* {m.subEquipments && m.subEquipments?.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2">
                              {m.subEquipments.map((item) => (
                                <div
                                  key={item.id || item.outsourcingCompanyContractSubEquipmentId}
                                  className="flex items-center justify-between gap-2 w-full"
                                  style={{ minHeight: '40px' }}
                                >
                                  <CommonSelect
                                    className="flex-1 text-2xl"
                                    value={item.outsourcingCompanyContractSubEquipmentId || 0}
                                    onChange={(value) => {
                                      updateSubEqByFuel(
                                        m.id,
                                        item.checkId,
                                        'outsourcingCompanyContractSubEquipmentId',
                                        value,
                                      )
                                    }}
                                    disabled
                                    options={
                                      subEquipmentByRow[m.equipmentId] ?? [
                                        { id: 0, name: '선택', taskDescription: '', unitPrice: 0 },
                                      ]
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )} */}
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <CommonSelect
                            fullWidth={true}
                            value={m.fuelType || 'BASE'}
                            onChange={async (value) => {
                              updateItemField('fuel', m.id, 'fuelType', value)
                              calculateFuelAmount()
                            }}
                            options={OilTypeMethodOptions}
                          />

                          {/* {m.subEquipments &&
                            m.subEquipments?.map((detail, index) => (
                              <div key={index} className="flex gap-2 mt-1 items-center">
                                <CommonSelect
                                  fullWidth={true}
                                  value={detail.fuelType || 'BASE'}
                                  onChange={async (value) => {
                                    updateSubEqByFuel(m.id, detail.checkId, 'fuelType', value)
                                    calculateFuelAmount()
                                  }}
                                  options={OilTypeMethodOptions}
                                />
                              </div>
                            ))} */}
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            onFocus={() => {
                              setClearFuelOutsourcingNameFocusedId(null)
                              setClearFuelCarNumberFocusedId(null)
                            }}
                            value={formatNumber(m.fuelAmount)}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('fuel', m.id, 'fuelAmount', numericValue)
                              calculateFuelAmount()
                            }}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { textAlign: 'right' }, // ← 오른쪽 정렬
                            }}
                          />

                          {/* {m.subEquipments &&
                            m.subEquipments?.map((detail, index) => (
                              <div key={index} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  value={formatNumber(detail.fuelAmount) ?? 0}
                                  onChange={(e) => {
                                    const numericValue = unformatNumber(e.target.value)

                                    updateSubEqByFuel(
                                      m.id,
                                      detail.checkId,
                                      'fuelAmount',
                                      numericValue,
                                    )
                                    calculateFuelAmount()
                                  }}
                                  inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { textAlign: 'right' }, // ← 오른쪽 정렬
                                  }}
                                />
                              </div>
                            ))} */}
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(m.amount)}
                            onFocus={() => {
                              setClearFuelOutsourcingNameFocusedId(null)
                              setClearFuelCarNumberFocusedId(null)
                            }}
                            onChange={(e) => {
                              const numericValue = unformatNumber(e.target.value)
                              updateItemField('fuel', m.id, 'amount', numericValue)
                            }}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              style: { textAlign: 'right' }, // ← 오른쪽 정렬
                            }}
                            disabled
                          />

                          {/* {m.subEquipments &&
                            m.subEquipments?.map((detail, index) => (
                              <div key={index} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  placeholder="작업 내용 입력"
                                  value={formatNumber(detail.amount) ?? 0}
                                  onChange={(e) => {
                                    const formatted = unformatNumber(e.target.value)
                                    updateSubEqByFuel(m.id, detail.checkId, 'amount', formatted)
                                  }}
                                  inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { textAlign: 'right' }, // ← 오른쪽 정렬
                                  }}
                                  disabled
                                />
                              </div>
                            ))} */}
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                            <CommonFileInput
                              acceptedExtensions={[
                                'pdf',
                                'txt',
                                'rtf',
                                'docx',
                                'hwp',
                                'xlsx',
                                'csv',
                                'ods',
                                'pptx',
                                'ppt',
                                'odp',
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'tif',
                                'tiff',
                                'bmp',
                                'zip',
                                '7z',
                                'mp3',
                                'wav',
                                'mp4',
                                'mov',
                                'avi',
                                'wmv',
                                'dwg',
                              ]}
                              multiple={false}
                              files={m.files} // 각 항목별 files
                              onChange={(newFiles) => {
                                updateItemField('fuel', m.id, 'files', newFiles.slice(0, 1))
                              }}
                              uploadTarget="WORK_DAILY_REPORT"
                            />
                          </div>
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            size="small"
                            placeholder="500자 이하 텍스트 입력"
                            onFocus={() => {
                              setClearFuelOutsourcingNameFocusedId(null)
                              setClearFuelCarNumberFocusedId(null)
                            }}
                            value={m.memo}
                            onChange={(e) => updateItemField('fuel', m.id, 'memo', e.target.value)}
                          />

                          {/* {m.subEquipments &&
                            m.subEquipments?.map((detail, index) => (
                              <div key={index} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  placeholder="500자 이하 텍스트 입력"
                                  value={detail.memo ?? 0}
                                  onChange={(e) =>
                                    updateSubEqByFuel(m.id, detail.checkId, 'memo', e.target.value)
                                  }
                                  fullWidth
                                />
                              </div>
                            ))} */}
                        </TableCell>

                        {/* 등록/수정일 (임시: Date.now 기준) */}
                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
                        >
                          <CommonInput
                            placeholder="-"
                            value={m.modifyDate ?? ''}
                            onChange={(value) => updateItemField('fuel', m.id, 'modifyDate', value)}
                            disabled
                            className="flex-1"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  <TableRow sx={{ backgroundColor: '#D1D5DB' }}>
                    <TableCell
                      colSpan={6}
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
                      {getGasUseTotal().toLocaleString()}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                    >
                      {getAmountTotal().toLocaleString()}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={3}
                      sx={{ border: '1px solid #9CA3AF', fontSize: '16px', fontWeight: 'bold' }}
                    ></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {fuelFetching && <div className="p-2 text-center">불러오는 중...</div>}
            </TableContainer>
          </div>

          <div>
            <div className="flex justify-between items-center mt-10 mb-2">
              <span className="font-bold border-b-2 mb-4">증빙</span>
              <div className="flex gap-4">
                <CommonButton
                  label="삭제"
                  className="px-7"
                  variant="danger"
                  onClick={() => removeCheckedItems('fuelFile')}
                />
                <CommonButton
                  label="추가"
                  className="px-7"
                  variant="secondary"
                  onClick={() => addItem('fuelFile')}
                />
              </div>
            </div>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                    <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                      <Checkbox
                        checked={isFuelProofAllChecked}
                        indeterminate={fuelProofCheckIds.length > 0 && !isFuelProofAllChecked}
                        onChange={(e) => toggleCheckAllItems('fuelFile', e.target.checked)}
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
                  {fuelProof.map((m) => (
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      <TableCell
                        padding="checkbox"
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF' }}
                      >
                        <Checkbox
                          checked={fuelProofCheckIds.includes(m.id)}
                          onChange={(e) => toggleCheckItem('fuelFile', m.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ border: '1px solid  #9CA3AF' }} align="center">
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.name}
                          onChange={(e) =>
                            updateItemField('fuelFile', m.id, 'name', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                          <CommonFileInput
                            acceptedExtensions={[
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            multiple={false}
                            files={m.files} // 각 항목별 files
                            onChange={(newFiles) => {
                              updateItemField('fuelFile', m.id, 'files', newFiles.slice(0, 1))
                            }}
                            uploadTarget="WORK_DAILY_REPORT"
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
                            updateItemField('fuelFile', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}

      {activeTab === '공사일보' && (
        <>
          <div className="flex justify-between mt-10">
            <div className="flex  ">
              {subTabs.map((subtab) => (
                <button
                  key={subtab}
                  className={`px-4 py-2 -mb-px border-b-2 cursor-pointer font-medium ${
                    activeSubTab === subtab
                      ? 'bg-white border border-gray-400 text-black text-[15px] font-bold rounded-t-md px-8'
                      : 'bg-gray-200 border border-gray-400 text-gray-400 text-[15px] rounded-t-md px-8'
                  }`}
                  onClick={() => handleSubTabClick(subtab)}
                >
                  {subtab}
                </button>
              ))}
            </div>
          </div>

          {activeSubTab === '작업내용' && (
            <>
              <div>
                <div className="flex justify-between items-center mt-5 mb-2">
                  <span className="font-bold mb-4">[금일]</span>
                  <div className="flex gap-4">
                    <CommonButton
                      label="전일 내용 복사"
                      className="px-"
                      variant="secondary"
                      onClick={() =>
                        handleCopyPreviousDay(getTodayDateString(form.reportDate) ?? '')
                      }
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="삭제"
                      className="px-7"
                      variant="danger"
                      onClick={() => removeCheckedItems('worker', '', true)} // true: 금일
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="추가"
                      className="px-7"
                      variant="secondary"
                      onClick={() => addItem('worker', '', true)} // isToday = true
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                  </div>
                </div>

                <TableContainer
                  component={Paper}
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                      if (workerHasNextPage && !workerFetching) {
                        workerFetchNextPage()
                      }
                    }
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                        <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                          <Checkbox
                            checked={isTodayAllChecked}
                            indeterminate={checkedTodayWorkIds.length > 0 && !isTodayAllChecked}
                            onChange={(e) => toggleCheckAllItems('worker', e.target.checked)}
                            sx={{ color: 'black' }}
                          />
                        </TableCell>
                        {['No', '작업명', '내용', '인원 및 장비', '-'].map((label) => (
                          <TableCell
                            key={label}
                            align="center"
                            sx={{
                              backgroundColor: '#D1D5DB',
                              border: '1px solid #9CA3AF',
                              fontWeight: 'bold',
                            }}
                          >
                            {label === 'No' || label === '-' ? (
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
                      {todayWorks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            금일 작업내용 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        todayWorks.map((m, index) => (
                          <TableRow key={m.id}>
                            <TableCell
                              padding="checkbox"
                              align="center"
                              sx={{ border: '1px solid  #9CA3AF' }}
                            >
                              <Checkbox
                                checked={checkedTodayWorkIds.includes(m.id)}
                                onChange={(e) => toggleCheckItem('worker', m.id, e.target.checked)}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                              {todayWorks.length - index}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                            >
                              <TextField
                                size="small"
                                placeholder="작업명 입력"
                                value={m.workName}
                                onChange={(e) =>
                                  updateItemField('worker', m.id, 'workName', e.target.value)
                                }
                              />
                            </TableCell>

                            <TableCell
                              align="center"
                              colSpan={1}
                              sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                            >
                              {m.workDetails.map((detail) => (
                                <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                  <TextField
                                    size="small"
                                    placeholder="작업 내용 입력"
                                    value={detail.content}
                                    onChange={(e) =>
                                      updateSubWorkField(m.id, detail.id, 'content', e.target.value)
                                    }
                                    fullWidth
                                  />
                                </div>
                              ))}
                            </TableCell>

                            <TableCell
                              align="center"
                              colSpan={1}
                              sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                            >
                              {m.workDetails.map((detail) => (
                                <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                  <TextField
                                    size="small"
                                    placeholder="인원 및 장비 입력"
                                    value={detail.personnelAndEquipment}
                                    onChange={(e) =>
                                      updateSubWorkField(
                                        m.id,
                                        detail.id,
                                        'personnelAndEquipment',
                                        e.target.value,
                                      )
                                    }
                                    fullWidth
                                  />
                                </div>
                              ))}
                            </TableCell>

                            <TableCell sx={{ width: '100px', verticalAlign: 'top' }}>
                              {/* 셀 자체의 최대 너비 제한도 추가 가능 */}
                              {m.workDetails.map((detail, index) => (
                                <div key={detail.id} className="flex items-center gap-2 mt-1">
                                  {/* 버튼 조건부 렌더링 */}
                                  {index === 0 ? (
                                    <CommonButton
                                      label="추가"
                                      className="px-7 whitespace-nowrap"
                                      variant="primary"
                                      onClick={() => addWorkDetail(m.id)}
                                    />
                                  ) : (
                                    <CommonButton
                                      label="삭제"
                                      className="px-7 mt-[10px]"
                                      variant="danger"
                                      onClick={() => removeSubWork(m.id, detail.id)}
                                    />
                                  )}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {workerFetching && <div className="p-2 text-center">불러오는 중...</div>}
                </TableContainer>
              </div>

              <div>
                <div className="flex justify-between items-center mt-5 mb-2">
                  <span className="font-bold mb-4"> [명일]</span>
                  <div className="flex gap-4">
                    <CommonButton
                      label="금일 내용 복사"
                      className="px-"
                      variant="secondary"
                      onClick={handleCopyTodayToTomorrow}
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="삭제"
                      className="px-7"
                      variant="danger"
                      onClick={() => removeCheckedItems('worker', '', false)}
                      disabled={
                        isHeadOfficeInfo
                          ? false // 본사 정보이면 무조건 활성화
                          : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                            detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                      }
                    />
                    <CommonButton
                      label="추가"
                      className="px-7"
                      variant="secondary"
                      onClick={() => addItem('worker', '', false)} // isToday = true
                      disabled={
                        isHeadOfficeInfo
                          ? false // 본사 정보이면 무조건 활성화
                          : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                            detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                      }
                    />
                  </div>
                </div>

                <TableContainer
                  component={Paper}
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                      if (workerHasNextPage && !workerFetching) {
                        workerFetchNextPage()
                      }
                    }
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                        <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                          <Checkbox
                            checked={isTomorrowAllChecked}
                            indeterminate={
                              checkedTomorrowWorkIds.length > 0 && !isTomorrowAllChecked
                            }
                            onChange={(e) => toggleCheckAllItems('worker', e.target.checked)}
                            sx={{ color: 'black' }}
                          />
                        </TableCell>
                        {['No', '작업명', '내용', '인원 및 장비', '-'].map((label) => (
                          <TableCell
                            key={label}
                            align="center"
                            sx={{
                              backgroundColor: '#D1D5DB',
                              border: '1px solid  #9CA3AF',
                              color: 'black',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {label === 'No' ||
                            label === '내용' ||
                            label === '인원 및 장비' ||
                            label === '-' ? (
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
                      {tomorrowWorks.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            align="center"
                            sx={{ border: '1px solid #9CA3AF' }}
                          >
                            명일 작업내용 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        tomorrowWorks.map((m, index) => (
                          <TableRow key={m.id}>
                            <TableCell
                              padding="checkbox"
                              align="center"
                              sx={{ border: '1px solid  #9CA3AF' }}
                            >
                              <Checkbox
                                checked={checkedTomorrowWorkIds.includes(m.id)}
                                onChange={(e) => toggleCheckItem('worker', m.id, e.target.checked)}
                              />
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                              {tomorrowWorks.length - index}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                            >
                              <TextField
                                size="small"
                                placeholder="작업명 입력"
                                value={m.workName}
                                onChange={(e) =>
                                  updateItemField('worker', m.id, 'workName', e.target.value)
                                }
                              />
                            </TableCell>

                            <TableCell
                              align="center"
                              colSpan={1}
                              sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                            >
                              {m.workDetails.map((detail) => (
                                <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                  <TextField
                                    size="small"
                                    placeholder="작업 내용 입력"
                                    value={detail.content}
                                    onChange={(e) =>
                                      updateSubWorkField(m.id, detail.id, 'content', e.target.value)
                                    }
                                    fullWidth
                                  />
                                </div>
                              ))}
                            </TableCell>

                            <TableCell
                              align="center"
                              colSpan={1}
                              sx={{ border: '1px solid #9CA3AF', verticalAlign: 'top' }}
                            >
                              {m.workDetails.map((detail) => (
                                <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                  <TextField
                                    size="small"
                                    placeholder="인원 및 장비 입력"
                                    value={detail.personnelAndEquipment}
                                    onChange={(e) =>
                                      updateSubWorkField(
                                        m.id,
                                        detail.id,
                                        'personnelAndEquipment',
                                        e.target.value,
                                      )
                                    }
                                    fullWidth
                                  />
                                </div>
                              ))}
                            </TableCell>

                            <TableCell sx={{ width: '100px', verticalAlign: 'top' }}>
                              {/* 셀 자체의 최대 너비 제한도 추가 가능 */}
                              {m.workDetails.map((detail, index) => (
                                <div key={detail.id} className="flex items-center gap-2 mt-1">
                                  {/* 버튼 조건부 렌더링 */}
                                  {index === 0 ? (
                                    <CommonButton
                                      label="추가"
                                      className="px-7 whitespace-nowrap"
                                      variant="primary"
                                      onClick={() => addWorkDetail(m.id)}
                                    />
                                  ) : (
                                    <CommonButton
                                      label="삭제"
                                      className="px-7 mt-[10px]"
                                      variant="danger"
                                      onClick={() => removeSubWork(m.id, detail.id)}
                                    />
                                  )}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {workerFetching && <div className="p-2 text-center">불러오는 중...</div>}
                </TableContainer>
              </div>
            </>
          )}

          {activeSubTab === '주요공정' && (
            <div>
              <div className="flex justify-between items-center mt-5 mb-2">
                <div></div>
                <div className="flex gap-4">
                  <CommonButton
                    label="전일 내용 복사"
                    className="px-"
                    variant="secondary"
                    onClick={() => handleMainProcessCopy(getTodayDateString(form.reportDate) ?? '')}
                    disabled={
                      isHeadOfficeInfo
                        ? false
                        : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                    }
                  />

                  <CommonButton
                    label="삭제"
                    className="px-7"
                    variant="danger"
                    onClick={() => removeCheckedItems('mainProcesses')} // true: 금일
                    disabled={
                      isHeadOfficeInfo
                        ? false
                        : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                    }
                  />
                  <CommonButton
                    label="추가"
                    className="px-7"
                    variant="secondary"
                    onClick={() => addItem('mainProcesses')} // isToday = true
                    disabled={
                      isHeadOfficeInfo
                        ? false
                        : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                    }
                  />
                </div>
              </div>

              <TableContainer
                component={Paper}
                onScroll={(e) => {
                  const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                  if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                    if (processHasNextPage && !processFetching) {
                      processFetchNextPage()
                    }
                  }
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isProcessAllChecked}
                          indeterminate={checkedProcessIds.length > 0 && !isProcessAllChecked}
                          onChange={(e) => toggleCheckAllItems('mainProcesses', e.target.checked)}
                          sx={{ color: 'black' }}
                        />
                      </TableCell>
                      {['No', '공정', '단위', '계약', '전일', '금일', '누계', '공정율'].map(
                        (label) => (
                          <TableCell
                            key={label}
                            align="center"
                            sx={{
                              backgroundColor: '#D1D5DB',
                              border: '1px solid #9CA3AF',
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
                    {mainProcessesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          주요공정 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      mainProcessesList.map((m, index) => (
                        <TableRow key={m.id}>
                          <TableCell padding="checkbox" align="center">
                            <Checkbox
                              checked={checkedProcessIds.includes(m.id)}
                              onChange={(e) =>
                                toggleCheckItem('mainProcesses', m.id, e.target.checked)
                              }
                            />
                          </TableCell>

                          <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                            {mainProcessesList.length - index}
                          </TableCell>

                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="텍스트 입력"
                              value={m.process}
                              onChange={(e) =>
                                updateItemField('mainProcesses', m.id, 'process', e.target.value)
                              }
                            />
                          </TableCell>

                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="텍스트입력"
                              value={m.unit}
                              onChange={(e) =>
                                updateItemField('mainProcesses', m.id, 'unit', e.target.value)
                              }
                            />
                          </TableCell>

                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="숫자20자, 소수점1자리"
                              value={m.contractAmount}
                              onChange={(e) =>
                                updateItemField(
                                  'mainProcesses',
                                  m.id,
                                  'contractAmount',
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="숫자20자, 소수점1자리"
                              value={m.previousDayAmount}
                              onChange={(e) =>
                                updateItemField(
                                  'mainProcesses',
                                  m.id,
                                  'previousDayAmount',
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="숫자20자, 소수점1자리"
                              value={m.todayAmount}
                              onChange={(e) =>
                                updateItemField(
                                  'mainProcesses',
                                  m.id,
                                  'todayAmount',
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="숫자20자, 소수점1자리"
                              value={m.cumulativeAmount}
                              onChange={(e) =>
                                updateItemField(
                                  'mainProcesses',
                                  m.id,
                                  'cumulativeAmount',
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>

                          <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                            <TextField
                              size="small"
                              placeholder="숫자20자, 소수점1자리"
                              value={m.processRate}
                              onChange={(e) =>
                                updateItemField(
                                  'mainProcesses',
                                  m.id,
                                  'processRate',
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {processFetching && <div className="p-2 text-center">불러오는 중...</div>}
              </TableContainer>
            </div>
          )}

          {activeSubTab === '투입현황' && (
            <>
              <div>
                <div className="flex justify-between items-center mt-5 mb-2">
                  <span className="font-bold mb-4"> [인원]</span>
                  <div className="flex gap-4">
                    <CommonButton
                      label="전일 내용 복사"
                      className="px-"
                      variant="secondary"
                      onClick={() =>
                        handleInputProcessCopy(getTodayDateString(form.reportDate) ?? '')
                      }
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="삭제"
                      className="px-7"
                      variant="danger"
                      onClick={() => removeCheckedItems('inputStatuses', 'PERSONNEL')} // true: 금일
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="추가"
                      className="px-7"
                      variant="secondary"
                      onClick={() => addItem('inputStatuses', 'PERSONNEL')} // isToday = true
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                  </div>
                </div>

                <TableContainer
                  component={Paper}
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                      if (inputStatusesHasNextPage && !inputStatusesFetching) {
                        inputStatusesFetchNextPage()
                      }
                    }
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isPersonnelAllChecked}
                            indeterminate={
                              checkedInputStatusIds.length > 0 && !isPersonnelAllChecked
                            }
                            onChange={(e) => toggleCheckAllItems('mainProcesses', e.target.checked)}
                            sx={{ color: 'black' }}
                          />
                        </TableCell>
                        {['No', '구분', '전일', '금일', '누계'].map((label) => (
                          <TableCell
                            key={label}
                            align="center"
                            sx={{
                              backgroundColor: '#D1D5DB',
                              border: '1px solid #9CA3AF',
                              fontWeight: 'bold',
                            }}
                          >
                            {label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {personnelList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            투입현황 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        personnelList.map((m, index) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedInputStatusIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('inputStatuses', m.id, e.target.checked)
                                }
                              />
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                              {personnelList.length - index}
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="텍스트입력"
                                value={m.category}
                                onChange={(e) =>
                                  updateItemField('inputStatuses', m.id, 'category', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.previousDayCount}
                                onChange={(e) =>
                                  updateItemField(
                                    'inputStatuses',
                                    m.id,
                                    'previousDayCount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.todayCount}
                                onChange={(e) =>
                                  updateItemField(
                                    'inputStatuses',
                                    m.id,
                                    'todayCount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.cumulativeCount}
                                onChange={(e) =>
                                  updateItemField(
                                    'inputStatuses',
                                    m.id,
                                    'cumulativeCount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {inputStatusesFetching && <div className="p-2 text-center">불러오는 중...</div>}
                </TableContainer>
              </div>

              <div>
                <div className="flex justify-between items-center mt-5 mb-2">
                  <span className="font-bold mb-4"> [장비]</span>
                  <div className="flex gap-4">
                    <CommonButton
                      label="전일 내용 복사"
                      className="px-"
                      variant="secondary"
                      onClick={() =>
                        handleEquipMentProcessCopy(getTodayDateString(form.reportDate) ?? '')
                      }
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="삭제"
                      className="px-7"
                      variant="danger"
                      onClick={() => removeCheckedItems('inputStatuses', 'EQUIPMENT')} // true: 금일
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="추가"
                      className="px-7"
                      variant="secondary"
                      onClick={() => addItem('inputStatuses', 'EQUIPMENT')} // isToday = true
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                  </div>
                </div>

                <TableContainer
                  component={Paper}
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                      if (inputStatusesHasNextPage && !inputStatusesFetching) {
                        inputStatusesFetchNextPage()
                      }
                    }
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isStatusEquipmentAllChecked}
                            indeterminate={
                              checkedInputStatusIds.length > 0 && !isStatusEquipmentAllChecked
                            }
                            onChange={(e) => toggleCheckAllItems('mainProcesses', e.target.checked)}
                            sx={{ color: 'black' }}
                          />
                        </TableCell>
                        {['No', '구분', '전일', '금일', '누계'].map((label) => (
                          <TableCell
                            key={label}
                            align="center"
                            sx={{
                              backgroundColor: '#D1D5DB',
                              border: '1px solid #9CA3AF',
                              fontWeight: 'bold',
                            }}
                          >
                            {label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {equipmentList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            투입현황 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        equipmentList.map((m, index) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedInputStatusIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('inputStatuses', m.id, e.target.checked)
                                }
                              />
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                              {equipmentList.length - index}
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="텍스트입력"
                                value={m.category}
                                onChange={(e) =>
                                  updateItemField('inputStatuses', m.id, 'category', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.previousDayCount}
                                onChange={(e) =>
                                  updateItemField(
                                    'inputStatuses',
                                    m.id,
                                    'previousDayCount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.todayCount}
                                onChange={(e) =>
                                  updateItemField(
                                    'inputStatuses',
                                    m.id,
                                    'todayCount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.cumulativeCount}
                                onChange={(e) =>
                                  updateItemField(
                                    'inputStatuses',
                                    m.id,
                                    'cumulativeCount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {inputStatusesFetching && <div className="p-2 text-center">불러오는 중...</div>}
                </TableContainer>
              </div>
            </>
          )}

          {activeSubTab === '자재현황' && (
            <>
              <div>
                <div className="flex justify-between items-center mt-5 mb-2">
                  <span className="font-bold mb-4"> [사급자재]</span>
                  <div className="flex gap-4">
                    <CommonButton
                      label="전일 내용 복사"
                      className="px-"
                      variant="secondary"
                      onClick={() =>
                        handleMaterialProcessCopy(getTodayDateString(form.reportDate) ?? '')
                      }
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />

                    <CommonButton
                      label="삭제"
                      className="px-7"
                      variant="danger"
                      onClick={() => removeCheckedItems('materialStatuses', 'COMPANY_SUPPLIED')} // true: 금일
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="추가"
                      className="px-7"
                      variant="secondary"
                      onClick={() => addItem('materialStatuses', 'COMPANY_SUPPLIED')} // isToday = true
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                  </div>
                </div>

                <TableContainer
                  component={Paper}
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                      if (materialStatusesHasNextPage && !materialStatusesFetching) {
                        materialStatusesFetchNextPage()
                      }
                    }
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isUrgentAllChecked}
                            indeterminate={checkedMaterialIds.length > 0 && !isUrgentAllChecked}
                            onChange={(e) =>
                              toggleCheckAllItems('materialStatuses', e.target.checked)
                            }
                            sx={{ color: 'black' }}
                          />
                        </TableCell>
                        {['No', '품명', '단위', '계획', '전일', '금일', '누계', '잔여'].map(
                          (label) => (
                            <TableCell
                              key={label}
                              align="center"
                              sx={{
                                backgroundColor: '#D1D5DB',
                                border: '1px solid #9CA3AF',
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
                      {urgentMaterialList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            자재현황 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        urgentMaterialList.map((m, index) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedMaterialIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('materialStatuses', m.id, e.target.checked)
                                }
                              />
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                              {urgentMaterialList.length - index}
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="텍스트입력"
                                value={m.materialName}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'materialName',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.unit}
                                onChange={(e) =>
                                  updateItemField('materialStatuses', m.id, 'unit', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.plannedAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'plannedAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.previousDayAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'previousDayAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.todayAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'todayAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.cumulativeAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'cumulativeAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.remainingAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'remainingAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {inputStatusesFetching && <div className="p-2 text-center">불러오는 중...</div>}
                </TableContainer>
              </div>

              <div>
                <div className="flex justify-between items-center mt-5 mb-2">
                  <span className="font-bold mb-4"> [지급자재]</span>
                  <div className="flex gap-4">
                    <CommonButton
                      label="전일 내용 복사"
                      className="px-"
                      variant="secondary"
                      onClick={() =>
                        handlePaymentMaterialProcessCopy(getTodayDateString(form.reportDate) ?? '')
                      }
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />

                    <CommonButton
                      label="삭제"
                      className="px-7"
                      variant="danger"
                      onClick={() => removeCheckedItems('materialStatuses', 'CLIENT_SUPPLIED')} // true: 금일
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                    <CommonButton
                      label="추가"
                      className="px-7"
                      variant="secondary"
                      onClick={() => addItem('materialStatuses', 'CLIENT_SUPPLIED')} // isToday = true
                      disabled={
                        isHeadOfficeInfo
                          ? false
                          : ['AUTO_COMPLETED', 'COMPLETED'].includes(detailReport?.data?.status)
                      }
                    />
                  </div>
                </div>

                <TableContainer
                  component={Paper}
                  onScroll={(e) => {
                    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
                    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                      if (materialStatusesHasNextPage && !materialStatusesFetching) {
                        materialStatusesFetchNextPage()
                      }
                    }
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#D1D5DB', border: '1px solid  #9CA3AF' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isPaymentAllChecked}
                            indeterminate={checkedMaterialIds.length > 0 && !isPaymentAllChecked}
                            onChange={(e) =>
                              toggleCheckAllItems('materialStatuses', e.target.checked)
                            }
                            sx={{ color: 'black' }}
                          />
                        </TableCell>
                        {['No', '품명', '단위', '계획', '전일', '금일', '누계', '잔여'].map(
                          (label) => (
                            <TableCell
                              key={label}
                              align="center"
                              sx={{
                                backgroundColor: '#D1D5DB',
                                border: '1px solid #9CA3AF',
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
                      {PaymentMaterialList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            자재현황 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        PaymentMaterialList.map((m, index) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedMaterialIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('materialStatuses', m.id, e.target.checked)
                                }
                              />
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                              {PaymentMaterialList.length - index}
                            </TableCell>

                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="텍스트입력"
                                value={m.materialName}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'materialName',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.unit}
                                onChange={(e) =>
                                  updateItemField('materialStatuses', m.id, 'unit', e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.plannedAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'plannedAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.previousDayAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'previousDayAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.todayAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'todayAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.cumulativeAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'cumulativeAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                              <TextField
                                size="small"
                                placeholder="숫자20자, 소수점1자리"
                                value={m.remainingAmount}
                                onChange={(e) =>
                                  updateItemField(
                                    'materialStatuses',
                                    m.id,
                                    'remainingAmount',
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {inputStatusesFetching && <div className="p-2 text-center">불러오는 중...</div>}
                </TableContainer>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === '현장 사진 등록' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold mb-4"> [{activeTab}]</span>
            <div className="flex gap-4">
              <CommonButton
                label="삭제"
                className="px-7"
                variant="danger"
                onClick={() => removeCheckedItems('attachedFile')}
                disabled={
                  isHeadOfficeInfo
                    ? false // 본사 정보이면 무조건 활성화
                    : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                      detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                }
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('attachedFile')}
                disabled={
                  isHeadOfficeInfo
                    ? false // 본사 정보이면 무조건 활성화
                    : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                      detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
                }
              />
            </div>
          </div>

          <TableContainer
            component={Paper}
            onScroll={(e) => {
              const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
              if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                if (fileHasNextPage && !fileFetching) {
                  fileFetchNextPage()
                }
              }
            }}
          >
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
                  {['설명', '첨부', '비고'].map((label) => (
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
                      {label === '비고' ? (
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
                {attachedFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      등록 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  attachedFiles.map((m) => (
                    <TableRow key={m.id} sx={{ border: '1px solid  #9CA3AF' }}>
                      {/* 체크박스 */}
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

                      {/* Description */}
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          fullWidth
                          size="medium"
                          placeholder="텍스트 입력"
                          value={m.description ?? ''}
                          onChange={(e) =>
                            updateItemField('attachedFile', m.id, 'description', e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 파일 업로드 */}
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <div className="px-2 p-2 w-full flex gap-2.5 items-center justify-center">
                          <CommonFileInput
                            acceptedExtensions={[
                              'pdf',
                              'txt',
                              'rtf',
                              'docx',
                              'hwp',
                              'xlsx',
                              'csv',
                              'ods',
                              'pptx',
                              'ppt',
                              'odp',
                              'jpg',
                              'jpeg',
                              'png',
                              'gif',
                              'tif',
                              'tiff',
                              'bmp',
                              'zip',
                              '7z',
                              'mp3',
                              'wav',
                              'mp4',
                              'mov',
                              'avi',
                              'wmv',
                              'dwg',
                            ]}
                            multiple={false}
                            files={m.files} // 각 항목별 files
                            onChange={(newFiles) =>
                              updateItemField('attachedFile', m.id, 'files', newFiles)
                            }
                            uploadTarget="WORK_DAILY_REPORT"
                          />
                        </div>
                      </TableCell>

                      {/* Memo */}
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          size="small"
                          placeholder="500자 이하 텍스트 입력"
                          sx={{ width: '100%' }}
                          value={m.memo ?? ''}
                          onChange={(e) =>
                            updateItemField('attachedFile', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {fileFetching && <div className="p-2 text-center">불러오는 중...</div>}
          </TableContainer>
        </div>
      )}

      <div className="flex justify-center gap-10 mt-10">
        <CommonButton label="취소" variant="reset" className="px-10" onClick={reportCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          disabled={
            isHeadOfficeInfo
              ? false // 본사 정보이면 무조건 활성화
              : detailReport?.data?.status === 'AUTO_COMPLETED' ||
                detailReport?.data?.status === 'COMPLETED' // 본사가 아니고 상태가 두 가지 중 하나이면 비활성화
          }
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              if (activeTab === '직원') {
                if (!validateEmployees()) return

                EmployeesModifyMutation.mutate(
                  {
                    siteId: form.siteId || 0,
                    siteProcessId: form.siteProcessId || 0,
                    reportDate: getTodayDateString(form.reportDate) || '',
                  },
                  {
                    onSuccess: async () => {
                      handleEmployeesRefetch() // 직원 데이터 재조회
                      setSaved(true)
                      // 날씨가 바뀌었을 경우만 호출
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
                          activeTab: activeTab,
                        })
                        // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                        previousWeatherRef.current = form.weather
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          showSnackbar(error.message, 'error')
                        } else {
                          showSnackbar('날씨 수정에 실패했습니다.', 'error')
                        }
                      }
                    },
                  },
                )
              } else if (activeTab === '직영/용역') {
                if (!validateContract()) return

                ContractModifyMutation.mutate(
                  {
                    siteId: form.siteId || 0,
                    siteProcessId: form.siteProcessId || 0,
                    reportDate: getTodayDateString(form.reportDate) || '',
                  },
                  {
                    onSuccess: async () => {
                      handleContractRefetch() // 직원 데이터 재조회
                      handleOutByContractRefetch()
                      handleDirectContractRefetch()
                      setSaved(true)
                      // 날씨가 바뀌었을 경우만 호출
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
                          activeTab: activeTab,
                        })
                        // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                        previousWeatherRef.current = form.weather
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          showSnackbar(error.message, 'error')
                        } else {
                          showSnackbar('날씨 수정에 실패했습니다.', 'error')
                        }
                      }
                    },
                  },
                )
              } else if (activeTab === '외주(공사)') {
                // if (!validateOutsourcing()) return

                OutsourcingModifyMutation.mutate(
                  {
                    siteId: form.siteId || 0,
                    siteProcessId: form.siteProcessId || 0,
                    reportDate: getTodayDateString(form.reportDate) || '',
                  },
                  {
                    onSuccess: async () => {
                      handleOutsourcingRefetch() // 직원 데이터 재조회
                      setSaved(true)
                      // 날씨가 바뀌었을 경우만 호출
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
                          activeTab: activeTab,
                        })
                        // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                        previousWeatherRef.current = form.weather
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          showSnackbar(error.message, 'error')
                        } else {
                          showSnackbar('날씨 수정에 실패했습니다.', 'error')
                        }
                      }
                    },
                  },
                )
              } else if (activeTab === '장비') {
                if (!validateEquipment()) return

                EquipmentModifyMutation.mutate(
                  {
                    siteId: form.siteId || 0,
                    siteProcessId: form.siteProcessId || 0,
                    reportDate: getTodayDateString(form.reportDate) || '',
                  },
                  {
                    onSuccess: async () => {
                      handleEquipmentRefetch() // 직원 데이터 재조회
                      setSaved(true)
                      // 날씨가 바뀌었을 경우만 호출
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
                          activeTab: activeTab,
                        })
                        // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                        previousWeatherRef.current = form.weather
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          showSnackbar(error.message, 'error')
                        } else {
                          showSnackbar('날씨 수정에 실패했습니다.', 'error')
                        }
                      }
                    },
                  },
                )
              } else if (activeTab === '유류') {
                if (!validateFuel()) return

                if (modifyFuelNumber === 0) {
                  // modifyFuelNumber가 0이면 신규 등록 mutation
                  createAlreadyFuelMutation.mutate(undefined, {
                    onSuccess: () => {
                      handleFuelRefetch() // 등록 성공 후 실행
                      setSaved(true)
                    },
                  })
                } else {
                  // modifyFuelNumber가 0이 아니면 수정 mutation
                  FuelModifyMutation.mutate(modifyFuelNumber, {
                    onSuccess: async () => {
                      handleFuelRefetch() // 직원 데이터 재조회
                      setSaved(true)
                      // 날씨가 바뀌었을 경우만 호출
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
                          activeTab: activeTab,
                        })
                        // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                        previousWeatherRef.current = form.weather
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          showSnackbar(error.message, 'error')
                        } else {
                          showSnackbar('날씨 수정에 실패했습니다.', 'error')
                        }
                      }
                    },
                  })
                }
              } else if (activeTab === '공사일보') {
                // if (!validateFuel()) return

                if (activeSubTab === '주요공정') {
                  MainProcessModifyMutation.mutate(
                    {
                      siteId: form.siteId || 0,
                      siteProcessId: form.siteProcessId || 0,
                      reportDate: getTodayDateString(form.reportDate) || '',
                    },
                    {
                      onSuccess: async () => {
                        handleMainProcessRefetch() // 주요공정 데이터 재조회
                        setSaved(true)
                        // 날씨가 바뀌었을 경우만 호출
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
                            activeTab: activeTab,
                          })
                          // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                          previousWeatherRef.current = form.weather
                        } catch (error: unknown) {
                          if (error instanceof Error) {
                            showSnackbar(error.message, 'error')
                          } else {
                            showSnackbar('날씨 수정에 실패했습니다.', 'error')
                          }
                        }
                      },
                    },
                  )
                } else if (activeSubTab === '작업내용') {
                  WorkerStatusMutation.mutate(
                    {
                      siteId: form.siteId || 0,
                      siteProcessId: form.siteProcessId || 0,
                      reportDate: getTodayDateString(form.reportDate) || '',
                    },
                    {
                      onSuccess: async () => {
                        handleWorkerRefetch() // 주요공정 데이터 재조회
                        setSaved(true)
                        // 날씨가 바뀌었을 경우만 호출
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
                            activeTab: activeTab,
                          })
                          // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                          previousWeatherRef.current = form.weather
                        } catch (error: unknown) {
                          if (error instanceof Error) {
                            showSnackbar(error.message, 'error')
                          } else {
                            showSnackbar('날씨 수정에 실패했습니다.', 'error')
                          }
                        }
                      },
                    },
                  )
                } else if (activeSubTab === '투입현황') {
                  MainInputStatusMutation.mutate(
                    {
                      siteId: form.siteId || 0,
                      siteProcessId: form.siteProcessId || 0,
                      reportDate: getTodayDateString(form.reportDate) || '',
                    },
                    {
                      onSuccess: async () => {
                        handleInputStatusRefetch() // 주요공정 데이터 재조회
                        setSaved(true)
                        // 날씨가 바뀌었을 경우만 호출
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
                            activeTab: activeTab,
                          })
                          // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                          previousWeatherRef.current = form.weather
                        } catch (error: unknown) {
                          if (error instanceof Error) {
                            showSnackbar(error.message, 'error')
                          } else {
                            showSnackbar('날씨 수정에 실패했습니다.', 'error')
                          }
                        }
                      },
                    },
                  )
                } else if (activeSubTab === '자재현황') {
                  MaterialStatusMutation.mutate(
                    {
                      siteId: form.siteId || 0,
                      siteProcessId: form.siteProcessId || 0,
                      reportDate: getTodayDateString(form.reportDate) || '',
                    },
                    {
                      onSuccess: async () => {
                        handleMaterialStatusRefetch() // 주요공정 데이터 재조회
                        setSaved(true)
                        // 날씨가 바뀌었을 경우만 호출
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
                            activeTab: activeTab,
                          })
                          // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                          previousWeatherRef.current = form.weather
                        } catch (error: unknown) {
                          if (error instanceof Error) {
                            showSnackbar(error.message, 'error')
                          } else {
                            showSnackbar('날씨 수정에 실패했습니다.', 'error')
                          }
                        }
                      },
                    },
                  )
                }
              } else if (activeTab === '현장 사진 등록') {
                if (!validateFile()) return

                FileModifyMutation.mutate(
                  {
                    siteId: form.siteId || 0,
                    siteProcessId: form.siteProcessId || 0,
                    reportDate: getTodayDateString(form.reportDate) || '',
                  },
                  {
                    onSuccess: async () => {
                      handleFileRefetch() // 직원 데이터 재조회
                      setSaved(true)
                      // 날씨가 바뀌었을 경우만 호출
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
                          activeTab: activeTab,
                        })
                        // 성공 후 현재 form.weather를 previousWeatherRef에 업데이트
                        previousWeatherRef.current = form.weather
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          showSnackbar(error.message, 'error')
                        } else {
                          showSnackbar('날씨 수정에 실패했습니다.', 'error')
                        }
                      }
                    },
                  },
                )
              }
            } else {
              if (activeTab === '직원') {
                if (!validateEmployees()) return

                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleEmployeesRefetch() // 등록 성공 후 실행
                    setSaved(true)
                  },
                })
              } else if (activeTab === '직영/용역') {
                if (!validateContract()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleContractRefetch() // 등록 성공 후 실행
                    handleDirectContractRefetch()
                    setSaved(true)
                  },
                })
              } else if (activeTab === '외주(공사)') {
                // if (!validateOutsourcing()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleOutsourcingRefetch() // 등록 성공 후 실행
                    setSaved(true)
                  },
                })
              } else if (activeTab === '장비') {
                if (!validateEquipment()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleEquipmentRefetch() // 등록 성공 후 실행
                    setSaved(true)
                  },
                })
              } else if (activeTab === '유류') {
                if (!validateFuel()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleFuelRefetch() // 등록 성공 후 실행
                    setSaved(true)
                  },
                })
              } else if (activeTab === '공사일보') {
                // if (!validateFuel()) return
                if (activeSubTab === '주요공정') {
                  createDailyMutation.mutate(undefined, {
                    onSuccess: () => {
                      handleMainProcessRefetch() // 등록 성공 후 실행
                      setSaved(true)
                    },
                  })
                } else if (activeSubTab === '작업내용') {
                  createDailyMutation.mutate(undefined, {
                    onSuccess: () => {
                      handleWorkerRefetch() // 등록 성공 후 실행
                      setSaved(true)
                    },
                  })
                } else if (activeSubTab === '투입현황') {
                  createDailyMutation.mutate(undefined, {
                    onSuccess: () => {
                      handleInputStatusRefetch() // 등록 성공 후 실행
                      setSaved(true)
                    },
                  })
                } else if (activeSubTab === '자재현황') {
                  createDailyMutation.mutate(undefined, {
                    onSuccess: () => {
                      handleMaterialStatusRefetch() // 등록 성공 후 실행
                      setSaved(true)
                    },
                  })
                }
              } else if (activeTab === '현장 사진 등록') {
                if (!validateFile()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleFileRefetch() // 등록 성공 후 실행
                    setSaved(true)
                  },
                })
              }
            }
          }}
        />
      </div>
    </>
  )
}
