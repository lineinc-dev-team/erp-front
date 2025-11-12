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
  GetEmployeesByFilterService,
  GetEquipmentByFilterService,
  GetFuelByFilterService,
  GetFuelCompany,
  GetFuelPrice,
  GetInputStatusService,
  GetMainProcessService,
  GetMaterialStatusService,
  GetOutsoucingByFilterService,
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
import { useSearchParams } from 'next/navigation'
import AmountInput from '../common/AmountInput'
import { useSiteId } from '@/hooks/useSiteIdNumber'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import { useManagementCost } from '@/hooks/useManagementCost'

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
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  } = useOutSourcingContract()

  const {
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useManagementCost()

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
    employeeInfoOptions,
    employeeFetchNextPage,
    employeehasNextPage,
    employeeFetching,
    employeeLoading,

    // 인력의 정보 조회

    withEquipmentInfoOptions,
    withEquipmentFetchNextPage,
    withEquipmenthasNextPage,
    withEquipmentFetching,
    withEquipmentLoading,

    MainProcessModifyMutation,

    MaterialStatusMutation,
  } = useDailyReport()

  const { showSnackbar } = useSnackbarStore()

  const siteIdList = useSiteId() // 훅 실행해서 값 받기

  const { OilTypeMethodOptions } = useFuelAggregation()

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Record<number, number>>({})

  const [selectId, setSelectId] = useState(0)

  // 직영 계약직에서 사용하는 해당 변수
  const [selectContractIds, setSelectContractIds] = useState<{ [rowId: number]: number }>({})

  // 옵션에 따른 상태값

  // const [workerOptionsByCompany] = useState<Record<number, any[]>>({})

  const [ContarctNameOptionsByCompany, setContarctNameOptionsByCompany] = useState<
    Record<number, any[]>
  >({})

  // 직영/용역에서  용역의 이름을 가져올 변수명

  const [outSourcingByDirectContract, setOutSourcingByDirectContract] = useState<
    Record<number, any[]>
  >({})

  // 직영/용역에서 외주의 계약명 가져오는 변수

  const [directContarctNameOptionsByCompany, setDirectContarctNameOptionsByCompany] = useState<
    Record<number, any[]>
  >({})

  const [modifyFuelNumber, setModifyFuelNumber] = useState(0)

  // 체크 박스에 활용
  //   const employees = form.employees
  //'외주(공사)',
  const tabs = ['직원', '직영/용역', '장비', '유류', '공사일보', '현장 사진 등록']
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
      position: item.position,
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
      laborId: item.labor?.id ?? 0,
      position: item.position,
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
      checkId: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
      groups: item.groups.map((groupItem: any) => ({
        id: groupItem.id,
        checkId: groupItem.id,
        outsourcingCompanyContractConstructionGroupId:
          groupItem.outsourcingCompanyContractConstructionGroup?.id ?? 0,

        items: groupItem.items.map((it: any) => ({
          id: it.id,
          checkId: it.id,
          specification: it.specification ?? '',
          quantity: it.quantity ?? 0,
          unit: it.unit ?? '',
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
            it.outsourcingCompanyContractConstruction?.outsourcingCompanyContractConstructionId ??
            0,
        })),
        isSubVisible: true, // <- 서브 항목 렌더링 여부 플래그 추가
      })),
    }))

    console.log('setSelectedCompanyIdssetSelectedCompanyIds', fetched)

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

  console.log('처음 생성 리스트 확인', resultOutsourcing)
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
      outsourcingCompanyContractDriverId: item.outsourcingCompanyContractDriver?.id ?? 0,
      outsourcingCompanyContractEquipmentId: item.outsourcingCompanyContractEquipment?.id ?? 0,
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
    setTestArrayByRow(subEquipmentsByRow)

    setIsEditMode(true)
    setField('outsourcingEquipments', fetched)
  }

  // 장비
  const equipmentData = useMemo(() => form.outsourcingEquipments, [form.outsourcingEquipments])
  const checkedEquipmentIds = form.checkedEquipmentIds
  const isEquipmentAllChecked =
    equipmentData.length > 0 && checkedEquipmentIds.length === equipmentData.length

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
      deleted: item.outsourcingCompany.deleted,
      driverId: item.outsourcingCompanyDriver?.id ?? 0,
      equipmentId: item.outsourcingCompanyEquipment?.id ?? '',
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

      console.log('2455', res)

      if (res?.data?.content && res.data.content.length > 0) {
        const allWorkerProcess = res.data.content
        const fetched = allWorkerProcess.map((item: any) => ({
          id: item.id,
          workName: item.workName,
          isToday: true,
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
        // 🔹 데이터 존재 시 변환
        const allInputStatus = res.data.content
        const fetched = allInputStatus.map((item: any) => ({
          id: item.id,
          category: item.category,
          previousDayCount: item.previousDayCount,
          todayCount: item.todayCount,
          cumulativeCount: item.cumulativeCount,
          type: item.typeCode, // PERSONNEL / EQUIPMENT
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
        //  데이터 존재 시 변환
        const allMaterialStatus = res.data.content
        const fetched = allMaterialStatus.map((item: any) => ({
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

  const [updatedOutCompanyOptions, setUpdatedOutCompanyOptions] = useState(withEquipmentInfoOptions)

  useEffect(() => {
    if (isEditMode && fuelData && withEquipmentInfoOptions?.length > 0) {
      const newOptions = [...withEquipmentInfoOptions]

      fuelData.forEach((fuel: any) => {
        const companyId = Number(fuel.outsourcingCompanyId)
        const companyName = fuel.outsourcingCompanyName
        const isDeleted = fuel.deleted
        const displayName = companyName + (isDeleted ? ' (삭제됨)' : '')

        const existingIndex = newOptions.findIndex((opt) => Number(opt.id) === Number(companyId))

        if (existingIndex !== -1) {
          // 이미 있으면 이름 업데이트
          // newOptions[existingIndex] = {
          //   ...newOptions[existingIndex],
          //   name: displayName,
          //   deleted: isDeleted,
          // }
        } else {
          // 없으면 새로 추가
          newOptions.push({
            id: companyId,
            name: displayName,
            deleted: isDeleted,
          })
        }
      })

      const deletedCompanies = newOptions.filter((c) => c.deleted)
      const normalCompanies = newOptions.filter((c) => !c.deleted && c.id !== 0)

      setUpdatedOutCompanyOptions([
        { id: 0, name: '선택', deleted: false },
        ...deletedCompanies,
        ...normalCompanies,
      ])
    } else if (!isEditMode) {
      setUpdatedOutCompanyOptions(withEquipmentInfoOptions)
    }
  }, [fuelData, isEditMode, withEquipmentInfoOptions])

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
  }, [activeTab, activeSubTab, form.siteId, form.siteProcessId, form.reportDate])

  // 출역일보 전체 데이터 조회

  const detailReportQuery = useQuery({
    queryKey: ['detailReport', form.siteId, form.siteProcessId, form.reportDate],
    queryFn: () =>
      DetaileReport({
        siteId: form.siteId || 0,
        siteProcessId: form.siteProcessId || 0,
        reportDate: getTodayDateString(form.reportDate) || '',
      }),
    enabled: !!form.siteId && !!form.siteProcessId && !!form.reportDate,
    refetchOnWindowFocus: false, // 포커스 바뀌어도 재요청 안 함
    refetchOnReconnect: false, // 네트워크 재연결해도 재요청 안 함
    retry: false, // 실패했을 때 자동 재시도 X
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

  console.log('fuelCompanyfuelCompany', fuelCompany)

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

      if (!isEditMode) setIsEditMode(true) // 최초 로딩 시 editMode 설정
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
  }, [])

  const isHeadOfficeInfo = myInfo?.isHeadOffice

  const roleId = Number(myInfo?.roles?.[0]?.id)
  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted
  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasApproval } = useMenuPermission(roleId, '출역일보', enabled)

  const [carNumberOptionsByCompany, setCarNumberOptionsByCompany] = useState<Record<number, any[]>>(
    {},
  )

  const [driverOptionsByCompany, setDriverOptionsByCompany] = useState<Record<number, any[]>>({})

  // 직영/계약직에서  이름 불러오기

  // 계약직만 데이터 조회

  const {
    data: contractInfo,
    fetchNextPage: contractNameFetchNextPage,
    hasNextPage: contractNamehasNextPage,
    isFetching: contractNameFetching,
    isLoading: contractNameLoading,
  } = useInfiniteQuery({
    queryKey: ['contractInfo', selectedCompanyIds[selectId]],
    queryFn: ({ pageParam = 0 }) =>
      GetContractNameInfoService({
        pageParam,
        // outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
        size: 100,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  })

  // 직영/용역에서 직영 데이터 조회
  useEffect(() => {
    if (!contractInfo) return

    const options = contractInfo.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        type: user.type,
        previousDailyWage: user.previousDailyWage || user.dailyWage,
        dailyWage: user.dailyWage,
        isSeverancePayEligible: user.isSeverancePayEligible,
      }))

    setContarctNameOptionsByCompany((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [
        {
          id: 0,
          name: '선택',
          type: '',
          previousDailyWage: '',
          dailyWage: '',
          isSeverancePayEligible: false,
        },
        ...options,
      ],
    }))
  }, [contractInfo, selectedCompanyIds, selectId])

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

  const {
    data: NameByOutsourcingInfo,
    fetchNextPage: NameByOutsourcingFetchNextPage,
    hasNextPage: NameByOutsourcinghasNextPage,
    isFetching: NameByOutsourcingFetching,
    isLoading: NameByOutsourcingLoading,
  } = useInfiniteQuery({
    queryKey: ['NameByOutsourcingInfo', selectedCompanyIds[selectId]],
    queryFn: ({ pageParam = 0 }) =>
      GetContractNameInfoByOutsourcing({
        pageParam,
        outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
        size: 100,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  })

  useEffect(() => {
    if (!NameByOutsourcingInfo) return

    const options = NameByOutsourcingInfo.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        type: user.type,
        previousDailyWage: user.previousDailyWage || user.dailyWage,
        dailyWage: user.dailyWage,
        isSeverancePayEligible: user.isSeverancePayEligible,
      }))

    setOutSourcingByDirectContract((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [
        {
          id: 0,
          name: '선택',
          type: '',
          previousDailyWage: '',
          dailyWage: '',
          isSeverancePayEligible: false,
        },
        ...options,
      ],
    }))
  }, [NameByOutsourcingInfo, selectedCompanyIds, selectId])

  // 상세페이지 데이터 (예: props나 query에서 가져온 값)
  const OutsourcingInfoBydaily = directContractByData

  // 1. 상세페이지 들어올 때 각 업체별 worker 데이터 API 호출 (직영 용역 데이터 불러옴 언제? 셀렉트 박스 선택 시 )
  useEffect(() => {
    if (!OutsourcingInfoBydaily.length) return

    OutsourcingInfoBydaily.forEach(async (row) => {
      const companyId = row.outsourcingCompanyId
      const worker = row.laborId

      if (ContarctNameOptionsByCompany[companyId]) {
        return
      }

      if (companyId === null) {
        return
      }

      try {
        const res = await GetContractNameInfoByOutsourcing({
          pageParam: 0,
          outsourcingCompanyId: companyId,
          size: 200,
        })

        const options = res.data.content.map((user: any) => ({
          id: user.id,
          name: user.name,
          type: user.type,
          previousDailyWage: user.previousDailyWage || user.dailyWage,
          dailyWage: user.dailyWage,
          isSeverancePayEligible: user.isSeverancePayEligible,
        }))

        setOutSourcingByDirectContract((prev) => {
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
  }, [OutsourcingInfoBydaily])

  // 직영/용역에서 외주 데이터 조회 시 계약한 데이터 가져오기

  const {
    data: directContractNameInfo,
    fetchNextPage: directContractNameFetchNextPage,
    hasNextPage: directContractNamehasNextPage,
    isFetching: directContractNameFetching,
    isLoading: directContractNameLoading,
  } = useInfiniteQuery({
    queryKey: ['directContractNameInfo', selectedCompanyIds[selectId]],
    queryFn: ({ pageParam = 0 }) =>
      GetDirectContractNameInfoService({
        pageParam,
        outsourcingCompanyId: selectedCompanyIds[selectId] || 0,
        size: 100,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  })

  useEffect(() => {
    if (!directContractNameInfo) return

    const options = directContractNameInfo.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.contractName,
      }))

    setDirectContarctNameOptionsByCompany((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [
        {
          id: 0,
          name: '선택',
        },
        ...options,
      ],
    }))
  }, [directContractNameInfo, selectedCompanyIds, selectId])

  // 직영에서 상세 데이터 가져올 시 상세 useEffect 넣어줘야 함 (외주의 상세 데이터 조회 계약명)

  const directContractOutsourcingsDetail = directContractOutsourcings

  useEffect(() => {
    if (!directContractOutsourcingsDetail.length) return

    const configList = [
      {
        key: 'direct', // 구분자
        api: GetDirectContractNameInfoService,
        setState: setDirectContarctNameOptionsByCompany,
        optionsByCompany: ContarctNameOptionsByCompany, // 직접 연결 시 state 구분 가능
        extract: (row: any) => ({
          companyId: row.outsourcingCompanyId,
          selectedId: row.outsourcingCompanyContractId,
        }),
        mapData: (item: any) => ({
          id: item.id,
          name: item.contractName,
        }),
      },
      {
        key: 'normal',
        api: GetContractNameInfoService,
        setState: setContarctNameOptionsByCompany,
        optionsByCompany: ContarctNameOptionsByCompany,
        extract: (row: any) => ({
          companyId: row.outsourcingCompanyId,
          selectedId: row.laborId,
        }),
        mapData: (item: any) => ({
          id: item.id,
          name: item.name,
        }),
      },
    ]

    configList.forEach(({ api, setState, optionsByCompany, extract, mapData }) => {
      directContractOutsourcingsDetail.forEach(async (row) => {
        const { companyId, selectedId } = extract(row)
        if (companyId === null) return
        if (optionsByCompany[companyId]) return

        try {
          const res = await api({
            pageParam: 0,
            outsourcingCompanyId: companyId,
            size: 200,
          })

          const options = res.data.content.map(mapData)
          const exists = options.some((opt: any) => opt.id === selectedId)

          setState((prev: any) => ({
            ...prev,
            [companyId]: [
              {
                id: 0,
                name: '선택',
              },
              ...options,
              ...(selectedId && !exists ? [{ id: selectedId, name: '' }] : []),
            ],
          }))
        } catch (err) {
          console.error('업체별 데이터 조회 실패', err)
        }
      })
    })
  }, [directContractOutsourcingsDetail])

  const {
    data: contractGroupList,
    // fetchNextPage: contractGroupFetchNextPage,
    // hasNextPage: contractGroupHasNextPage,
    // isFetching: contractGroupIsFetching,
    // isLoading: contractGroupLoading,
  } = useInfiniteQuery({
    queryKey: ['ContractGroupInfo', selectedCompanyIds[selectId], siteIdList],
    queryFn: ({ pageParam = 0 }) =>
      GetContractGroup({
        pageParam,
        id: selectedCompanyIds[selectId] ?? 0,
        siteId: Number(siteIdList),
        size: 10,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId],
  })

  useEffect(() => {
    if (!contractGroupList) return

    // 1️⃣ 백엔드에서 받아온 그룹 데이터를 정리
    // const options = contractGroupList.pages
    //   .flatMap((page) => page.data.content)
    //   .map((group) => ({
    //     id: group.outsourcingCompanyContractConstructionGroupId,
    //     name: group.itemName,
    //     items: group.items
    //       .filter((item: any) => !item.deleted)
    //       .map((item: any) => ({
    //         id: item.outsourcingCompanyContractConstructionId,
    //         item: item.item,
    //         specification: item.specification,
    //         unit: item.unit,
    //         quantity: item.quantity ?? 0,
    //       })),
    //     deleted: group.deleted,
    //   }))
  }, [contractGroupList, selectedCompanyIds, selectId])

  // useEffect(() => {
  //   co
  //   // 모든 외주공사 데이터를 순회
  //   resultOutsourcing.forEach((row) => {
  //     const groupOptions = contractGroupOptionsByCompany[row.outsourcingCompanyId] ?? []
  //     const firstGroup = groupOptions.find((g) => g.id !== 0)
  //     if (!firstGroup) return

  //     console.log('firstGroupfirstGroup', firstGroup)
  //     // 상위 그룹 선택값 초기화
  //     setSelectedConstructionGroupId((prev) => ({
  //       ...prev,
  //       [row.checkId]: firstGroup.id,
  //     }))
  //   })
  // }, [contractGroupOptionsByCompany])

  // // 하위 그룹 선택값 초기화 (첫 번째 그룹이 있다면)
  // setSelectedConstructionSubGroupIds((prev) => ({
  //   ...prev,
  //   [row.checkId]: firstGroup.id,
  // }))

  // 출역일보 외주(공사) 데이터를 불러올때 사용하는 로직 상세페이지 로직임
  // useEffect(() => {
  //   if (!resultOutsourcing.length) return

  //   const companyIds = [
  //     ...new Set(resultOutsourcing.map((m) => m.outsourcingCompanyId).filter(Boolean)),
  //   ]

  //   companyIds.forEach(async (companyId) => {
  //     try {
  //       const res = await GetContractGroup({
  //         pageParam: 0,
  //         id: companyId,
  //         siteId: Number(siteIdList),
  //         size: 10,
  //       })

  //       const content = res?.data?.content ?? []

  //       const options = content.map((item: any) => ({
  //         id: item.outsourcingCompanyContractConstructionGroupId,
  //         name: item.itemName,
  //         items: item.items ?? [],
  //       }))

  //     } catch (err) {
  //       console.error(`ContractGroup 불러오기 실패 - companyId: ${companyId}`, err)
  //     }
  //   })
  // }, [resultOutsourcing, siteIdList])

  // 외주(공사)에 대한 규격 데이터 확인

  // 규격을 관리 할 수 있는 변수

  // 외주(공사)에서 규격 다루는 변수
  // const [specificationOptionsByCompany, setSpecificationOptionsByCompany] = useState<{
  //   [key: string]: { id: number; name: string }[]
  // }>({})

  // resultOutsourcing이 갱신될 때마다 규격 옵션 세팅
  // useEffect(() => {
  //   if (!resultOutsourcing.length) return

  //   const newSpecificationOptions: typeof specificationOptionsByCompany = {}

  //   resultOutsourcing.forEach((item) => {
  //     const companyId = item.outsourcingCompanyId
  //     const allSpecs = item.groups
  //       .flatMap((group) => group.items)
  //       .map((it) => it.specification)
  //       .filter(Boolean) // 빈 값 제거

  //     if (allSpecs.length > 0) {
  //       newSpecificationOptions[companyId] = [
  //         { id: 0, name: '선택' },
  //         ...allSpecs.map((spec, idx) => ({ id: idx + 1, name: spec })),
  //       ]
  //     } else {
  //       newSpecificationOptions[companyId] = [{ id: 0, name: '선택' }]
  //     }
  //   })

  //   setSpecificationOptionsByCompany(newSpecificationOptions)
  // }, [resultOutsourcing])

  // 옵션에 따른 상태값

  // 업체명 id

  const {
    data: fuelDriver,
    fetchNextPage: fuelDriverFetchNextPage,
    hasNextPage: fuelDriverHasNextPage,
    isFetching: fuelDriverIsFetching,
    isLoading: fuelDriverLoading,
  } = useInfiniteQuery({
    queryKey: ['FuelDriverInfo', selectedCompanyIds[selectId], siteIdList],

    queryFn: ({ pageParam }) =>
      FuelDriverNameScroll({
        pageParam,
        id: selectedCompanyIds[selectId] ?? 0,
        siteIdList: Number(siteIdList),
        size: 10,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  })

  useEffect(() => {
    if (!fuelDriver) return

    const options = fuelDriver.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    setDriverOptionsByCompany((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [{ id: 0, name: '선택' }, ...options],
    }))
  }, [fuelDriver, selectedCompanyIds, selectId])

  // 기사
  const [selectedDriverIds, setSelectedDriverIds] = useState<{ [rowId: number]: number }>({})
  //차량번호 & 규격 무한 스크롤
  const [selectedCarNumberIds, setSelectedCarNumberIds] = useState<{ [rowId: number]: number }>({})

  // 옵션에 따른 상태값

  const {
    data: fuelEquipment,
    fetchNextPage: fuelEquipmentFetchNextPage,
    hasNextPage: fuelEquipmentHasNextPage,
    isFetching: fuelEquipmentIsFetching,
    isLoading: fuelEquipmentLoading,
  } = useInfiniteQuery({
    queryKey: ['FuelEquipmentInfo', selectedCompanyIds[selectId], siteIdList],
    queryFn: ({ pageParam }) =>
      FuelEquipmentNameScroll({
        pageParam,
        id: selectedCompanyIds[selectId] ?? 0,
        siteIdList: Number(siteIdList),
        size: 10,
      }),

    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  })

  useEffect(() => {
    if (!fuelEquipment) return

    const options = fuelEquipment.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        specification: user.specification,
        vehicleNumber: user.vehicleNumber,
        category: user.category,
        unitPrice: user.unitPrice,
        taskDescription: user.taskDescription,
      }))

    setCarNumberOptionsByCompany((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [
        { id: 0, specification: '', vehicleNumber: '선택', category: '' },
        ...options,
      ],
    }))
  }, [fuelEquipment, selectedCompanyIds, selectId])

  const outsourcingfuel = fuelData

  const equipmentDataResult = equipmentData

  interface EquipmentTypeOption {
    id: number
    name: string
    taskDescription: string
    unitPrice: number
  }

  // const [testArray, setTestArray] = useState<EquipmentTypeOption[]>([
  //   { id: 0, name: '선택', taskDescription: '', unitPrice: 0 },
  // ])

  const [testArrayByRow, setTestArrayByRow] = useState<Record<number, EquipmentTypeOption[]>>({})

  useEffect(() => {
    if (!equipmentDataResult.length) return

    const fetchData = async () => {
      for (const row of equipmentDataResult) {
        const companyId = row.outsourcingCompanyId
        const driverData = row.outsourcingCompanyContractDriverId
        const carNumberId = row.outsourcingCompanyContractEquipmentId

        try {
          // 기사 + 차량 병렬 요청
          const [driverRes, carNumberRes] = await Promise.all([
            FuelDriverNameScroll({
              pageParam: 0,
              id: companyId,
              siteIdList: Number(siteIdList),
              size: 200,
            }),
            FuelEquipmentNameScroll({
              pageParam: 0,
              id: companyId,
              siteIdList: Number(siteIdList),
              size: 200,
            }),
          ])

          // ✅ 기사 옵션
          const driverOptions = (driverRes?.data?.content ?? []).map((user: any) => ({
            id: user.id,
            name: user.name,
            deleted: user.deleted ?? false,
          }))

          setDriverOptionsByCompany((prev) => {
            const exists = driverOptions.some((opt: any) => opt.id === driverData)
            return {
              ...prev,
              [companyId]: [
                { id: 0, name: '선택', deleted: false },
                ...driverOptions,
                ...(driverData && !exists ? [{ id: driverData, name: '', deleted: false }] : []),
              ],
            }
          })

          const carOptions = (carNumberRes?.data?.content ?? []).map((user: any) => ({
            id: user.id,
            specification: user.specification,
            vehicleNumber: user.vehicleNumber,
            category: user.category,
            unitPrice: user.unitPrice,
            taskDescription: user.taskDescription,
            subEquipments:
              user.subEquipments?.map((item: any) => ({
                id: item.id,
                type: item.type,
                typeCode: item.typeCode,
                workContent: item.taskDescription ?? '',
                unitPrice: item.unitPrice ?? 0,
              })) ?? [],
          }))

          setCarNumberOptionsByCompany((prev) => ({
            ...prev,
            [companyId]: [
              {
                id: 0,
                specification: '',
                vehicleNumber: '선택',
                category: '',
                unitPrice: '',
                taskDescription: '',
                subEquipments: [],
              },
              ...carOptions,
            ],
          }))

          // ✅ subEquipments 세팅
          carOptions.forEach((car: any) => {
            if (car.subEquipments?.length) {
              setTestArrayByRow((prev) => ({
                ...prev,
                [car.id]: [
                  { id: 0, name: '선택' },
                  ...car.subEquipments.map((sub: any) => ({
                    id: sub.id,
                    name: sub.type || sub.typeCode || '-',
                    taskDescription: sub.workContent,
                    unitPrice: sub.unitPrice,
                  })),
                ],
              }))
            }
          })

          // ✅ 각 행의 선택값 초기화
          setSelectedDriverIds((prev) => ({ ...prev, [row.id]: driverData || 0 }))
          setSelectedCarNumberIds((prev) => ({ ...prev, [row.id]: carNumberId || 0 }))
        } catch (err) {
          console.error('업체별 차량/기사 조회 실패', err)
        }
      }
    }

    fetchData()
  }, [equipmentDataResult])

  // 유류의 업체명 삭제 됨 표시

  // 유효성 검사

  const [isOutsourcingFocused, setIsOutsourcingFocused] = useState(false)

  // 유저 선택 시 처리
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
      if (!c.position || c.position.trim() === '') {
        return showSnackbar('계약직원의 직급을 입력해주세요.', 'warning')
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

    // 2️⃣ 용역(outsourcingByDirectContract) 유효성 체크
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

      if (!o.position || o.position.trim() === '') {
        return showSnackbar('용역 직원의 직급을 입력해주세요.', 'warning')
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

    // 3️⃣ 증빙 파일 체크
    for (const contractFile of contractFileProof) {
      if (!contractFile.name || contractFile.name.trim() === '') {
        return showSnackbar('증빙서류의 문서명을 입력해주세요.', 'warning')
      }
    }

    // 4️⃣ 날씨 선택 체크
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
      if (!f.outsourcingCompanyId || f.outsourcingCompanyId === 0) {
        return showSnackbar('유류의 업체명을 선택해주세요.', 'warning')
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

  useEffect(() => {
    if (!outsourcingfuel.length) return

    const fetchData = async () => {
      for (const row of outsourcingfuel) {
        const companyId = row.outsourcingCompanyId
        const driverData = row.driverId
        const carNumberId = row.equipmentId
        const categoryType = row.categoryType

        const hasDriverData = driverOptionsByCompany[companyId]
        const hasCarData = carNumberOptionsByCompany[companyId]?.some(
          (opt) => opt.categoryType === categoryType,
        )

        if (hasDriverData && hasCarData) continue

        try {
          // 기사 + 차량 병렬 요청
          const [driverRes, carNumberRes] = await Promise.all([
            FuelDriverNameScroll({
              pageParam: 0,
              id: companyId,
              siteIdList: Number(siteIdList),
              size: 200,
            }),
            FuelEquipmentNameScroll({
              pageParam: 0,
              id: companyId,
              siteIdList: Number(siteIdList),
              size: 200,
            }),
          ])

          const driverOptions = (driverRes?.data?.content ?? []).map((user: any) => ({
            id: user.id,
            name: user.name,
            deleted: user.deleted ?? false,
          }))

          setDriverOptionsByCompany((prev) => {
            const exists = driverOptions.some((opt: any) => opt.id === driverData)
            return {
              ...prev,
              [companyId]: [
                { id: 0, name: '선택', deleted: false },
                ...driverOptions,
                ...(driverData && !exists ? [{ id: driverData, name: '', deleted: false }] : []),
              ],
            }
          })

          const carOptions = (carNumberRes?.data?.content ?? []).map((user: any) => ({
            id: user.id,
            specification: user.specification,
            vehicleNumber: user.vehicleNumber,
            category: user.category,
            unitPrice: user.unitPrice,
            taskDescription: user.taskDescription,
            subEquipments:
              user.subEquipments?.map((item: any) => ({
                id: item.id,
                checkId: item.id,
                type: item.type,
                typeCode: item.typeCode,
                workContent: item.taskDescription ?? '',
                unitPrice: item.unitPrice ?? 0,
              })) ?? [],
          }))

          setCarNumberOptionsByCompany((prev) => ({
            ...prev,
            [companyId]: [
              {
                id: 0,
                checkId: 0,
                specification: '',
                vehicleNumber: '선택',
                category: '',
                unitPrice: '',
                taskDescription: '',
                subEquipments: [],
              },
              ...carOptions,
            ],
          }))

          carOptions.forEach((car: any) => {
            if (car.subEquipments?.length) {
              setSubEquipmentByRow((prev) => ({
                ...prev,
                [car.id]: [
                  { id: 0, name: '선택' },
                  ...car.subEquipments.map((sub: any) => ({
                    id: sub.id,
                    checkId: sub.id,
                    name: sub.type || sub.typeCode || '-',
                    taskDescription: sub.workContent,
                    unitPrice: sub.unitPrice,
                  })),
                ],
              }))
            }
          })

          setSelectedCarNumberIds((prev) => ({ ...prev, [row.id]: carNumberId || 0 }))
        } catch (err) {
          console.error('업체별 차량/기사 조회 실패', err)
        }
      }
    }

    fetchData()
  }, [outsourcingfuel])

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
                // onInputChange={(value) => setSitesSearch(value)}
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
                        {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
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
                    employees.map((m) => (
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
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <CommonSelect
                            value={m.laborId || 0}
                            onChange={(value) => {
                              // 1️⃣ 선택된 직원 정보 찾기
                              const selectedEmployee = employeeInfoOptions.find(
                                (opt) => opt.id === value,
                              )

                              // 2️⃣ laborId 업데이트
                              updateItemField('Employees', m.id, 'laborId', value)

                              // 3️⃣ grade 값 자동 반영
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
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <TextField
                            placeholder="텍스트 입력"
                            size="small"
                            value={m.grade}
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
                            value={m.workContent}
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
                            value={m.memo}
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
                      '이름',
                      '직급(직책)',
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
                        {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
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
                            <CommonSelect
                              value={m.laborId || 0}
                              onChange={(value) => {
                                const selectedContractName = (
                                  ContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? []
                                ).find((opt) => opt.id === value)

                                if (!selectedContractName) return

                                if (selectedContractName?.isSeverancePayEligible) {
                                  showSnackbar(
                                    '해당 직원 근속일이 6개월에 도달했습니다. 퇴직금 발생에 주의하세요.',
                                    'error',
                                  )
                                }

                                updateItemField('directContracts', m.checkId, 'laborId', value)

                                updateItemField(
                                  'directContracts',
                                  m.checkId,
                                  'previousPrice',
                                  selectedContractName?.previousDailyWage ?? 0, // 선택된 항목의 previousDailyWage 자동 입력
                                )
                              }}
                              options={
                                ContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? [
                                  { id: 0, name: '선택' },
                                ]
                              }
                              onScrollToBottom={() => {
                                if (contractNamehasNextPage && !contractNameFetching)
                                  contractNameFetchNextPage()
                              }}
                              loading={contractNameLoading}
                            />
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
                                'directContracts',
                                m.checkId,
                                'position',
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
                            placeholder="텍스트 입력 "
                            value={m.workContent}
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
                      '업체명',
                      '이름',
                      '직급(직책)',
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
                        {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
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
                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          {m.isTemporary ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={'라인공영(임시)'}
                              onChange={(e) =>
                                updateItemField(
                                  'outsourcingByDirectContract',
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
                                  'outsourcingByDirectContract',
                                  m.checkId,
                                  'outsourcingCompanyId',
                                  selectedCompany.id,
                                )

                                updateItemField(
                                  'outsourcingByDirectContract',
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
                            <CommonSelect
                              value={selectContractIds[m.id] || m.laborId || 0}
                              onChange={(value) => {
                                const selectedContractName = (
                                  outSourcingByDirectContract[m.outsourcingCompanyId] ?? []
                                ).find((opt) => opt.id === value)

                                if (!selectedContractName) return

                                if (selectedContractName?.isSeverancePayEligible) {
                                  showSnackbar(
                                    '해당 직원 근속일이 6개월에 도달했습니다. 퇴직금 발생에 주의하세요.',
                                    'error',
                                  )
                                }

                                updateItemField(
                                  'outsourcingByDirectContract',
                                  m.checkId,
                                  'laborId',
                                  value,
                                )

                                updateItemField(
                                  'outsourcingByDirectContract',
                                  m.checkId,
                                  'previousPrice',
                                  selectedContractName?.previousDailyWage ?? 0, // 선택된 항목의 previousDailyWage 자동 입력
                                )
                              }}
                              options={
                                outSourcingByDirectContract[m.outsourcingCompanyId] ?? [
                                  { id: 0, name: '선택' },
                                ]
                              }
                              onScrollToBottom={() => {
                                if (NameByOutsourcinghasNextPage && !NameByOutsourcingFetching)
                                  NameByOutsourcingFetchNextPage()
                              }}
                              loading={NameByOutsourcingLoading}
                            />
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
                    {['업체명', '계약명', '이름', '공수', '첨부파일', '비고', '등록/수정일'].map(
                      (label) => (
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
                          {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
                            label
                          ) : (
                            <div className="flex items-center justify-center">
                              <span>{label}</span>
                              <span className="text-red-500 ml-1">*</span>
                            </div>
                          )}
                        </TableCell>
                      ),
                    )}
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
                    directContractOutsourcings.map((m) => (
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

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <CommonSelect
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
                          />
                        </TableCell>

                        {/* 계약명 */}

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <CommonSelect
                            fullWidth
                            value={m.outsourcingCompanyContractId || 0}
                            onChange={async (value) => {
                              const selectedDirectContractName = (
                                directContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? []
                              ).find((opt) => opt.id === value)

                              console.log(
                                'selectedDirectContractNameselectedDirectContractName',
                                selectedDirectContractName,
                              )

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
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                          <CommonSelect
                            value={m.laborId || 0}
                            onChange={(value) => {
                              const selectedContractName = (
                                ContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? []
                              ).find((opt) => opt.id === value)

                              if (!selectedContractName) return

                              updateItemField('directContractOutsourcings', m.id, 'laborId', value)
                            }}
                            options={
                              ContarctNameOptionsByCompany[m.outsourcingCompanyId] ?? [
                                { id: 0, name: '선택' },
                              ]
                            }
                            onScrollToBottom={() => {
                              if (contractNamehasNextPage && !contractNameFetching)
                                contractNameFetchNextPage()
                            }}
                            loading={contractNameLoading}
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
                    {['업체명', '항목명', '항목', '규격', '단위', '수량', '비고', '첨부파일'].map(
                      (label) => (
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
                          {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
                            label
                          ) : (
                            <div className="flex items-center justify-center">
                              <span>{label}</span>
                              <span className="text-red-500 ml-1">*</span>
                            </div>
                          )}
                        </TableCell>
                      ),
                    )}
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
                    resultOutsourcing.map((m) => (
                      <TableRow key={m.checkId}>
                        <TableCell
                          padding="checkbox"
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF' }}
                        >
                          <Checkbox
                            checked={checkedOutsourcingIds.includes(m.checkId)}
                            onChange={(e) =>
                              toggleCheckItem('outsourcings', m.checkId, e.target.checked)
                            }
                          />
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
                        {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
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
                    equipmentData.map((m) => (
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

                        <TableCell align="center" sx={cellStyle}>
                          <CommonSelect
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
                          />
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          <CommonSelect
                            fullWidth
                            value={
                              selectedDriverIds[m.id] || m.outsourcingCompanyContractDriverId || 0
                            }
                            onChange={async (value) => {
                              const selectedDriver = (
                                driverOptionsByCompany[m.outsourcingCompanyId] ?? []
                              ).find((opt) => opt.id === value)

                              if (!selectedDriver) return

                              updateItemField(
                                'equipment',
                                m.id,
                                'outsourcingCompanyContractDriverId',
                                selectedDriver.id,
                              )
                            }}
                            options={
                              driverOptionsByCompany[m.outsourcingCompanyId] ?? [
                                { id: 0, name: '선택', category: '' },
                              ]
                            }
                            onScrollToBottom={() => {
                              if (fuelDriverHasNextPage && !fuelDriverIsFetching)
                                fuelDriverFetchNextPage()
                            }}
                            loading={fuelDriverLoading}
                          />
                        </TableCell>

                        <TableCell align="center" sx={cellStyle}>
                          <CommonSelect
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
                                  }),
                                )

                                // ✅ 차량 ID 기준으로 서브장비 옵션 저장
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
                          />
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

                          {/* ✅ subEquipments 있을 때만 표시 */}
                          {m.subEquipments && m.subEquipments?.length > 0 && (
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
                                      updateContractDetailField(
                                        m.id,
                                        item.id,
                                        'outsourcingCompanyContractSubEquipmentId',
                                        value,
                                      )
                                    }}
                                    disabled
                                    // ✅ 차량ID 기준으로 서브장비 옵션 불러오기
                                    options={
                                      testArrayByRow[m.outsourcingCompanyContractEquipmentId] ?? [
                                        { id: 0, name: '선택', taskDescription: '', unitPrice: 0 },
                                      ]
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>

                        {/* 구분 */}
                        {/* <TableCell
                          align="center"
                          sx={{
                            border: '1px solid  #9CA3AF',
                            verticalAlign: 'top',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {m.type ?? '-'}
                        </TableCell> */}

                        <TableCell align="center" sx={cellStyle}>
                          <TextField
                            size="small"
                            placeholder="작업 내용 입력"
                            value={m.workContent}
                            onChange={(e) =>
                              updateItemField('equipment', m.id, 'workContent', e.target.value)
                            }
                            fullWidth
                            disabled
                          />

                          {m.subEquipments &&
                            m.subEquipments?.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  placeholder="작업 내용 입력"
                                  value={detail.workContent}
                                  onChange={(e) =>
                                    updateContractDetailField(
                                      m.id,
                                      detail.id,
                                      'workContent',
                                      e.target.value,
                                    )
                                  }
                                  fullWidth
                                  disabled
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
                              <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  placeholder="숫자만"
                                  value={formatNumber(detail.unitPrice)}
                                  onChange={(e) => {
                                    const numericValue = unformatNumber(e.target.value)
                                    updateContractDetailField(
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
                            value={m.workHours === 0 || m.workHours === null ? '' : m.workHours}
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

                          {m.subEquipments &&
                            m.subEquipments.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  type="number" // type을 number로 변경
                                  placeholder="숫자를 입력해주세요."
                                  inputProps={{ step: 0.1, min: 0 }} // 소수점 1자리, 음수 방지
                                  value={
                                    detail.workHours === 0 || detail.workHours === null
                                      ? ''
                                      : detail.workHours
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value
                                    const numericValue = value === '' ? null : parseFloat(value)

                                    // dailyWork 배열 idx 위치 업데이트
                                    updateContractDetailField(
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
                            value={m.memo}
                            onChange={(e) =>
                              updateItemField('equipment', m.id, 'memo', e.target.value)
                            }
                          />
                          {m.subEquipments &&
                            m.subEquipments.map((detail) => (
                              <div key={detail.id} className="flex gap-2 mt-1 items-center">
                                <TextField
                                  size="small"
                                  placeholder="500자 이하 텍스트 입력"
                                  value={detail.memo}
                                  onChange={(e) =>
                                    updateContractDetailField(
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
                    value={formatNumber(form.gasolinePrice) ?? ''}
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
                    value={formatNumber(form.dieselPrice) ?? ''}
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
                    value={formatNumber(form.ureaPrice) ?? ''}
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
                  유류업체명
                </label>
                <div className="border border-gray-400  w-full">
                  <InfiniteScrollSelect
                    placeholder="유류 업체명을 입력하세요"
                    keyword={form.outsourcingCompanyName ?? ''}
                    onChangeKeyword={(newKeyword) => setField('outsourcingCompanyName', newKeyword)} // ★필드명과 값 둘 다 넘겨야 함
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
                        {label === '비고' || label === '등록/수정일' || label === '첨부파일' ? (
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
                    fuelData.map((m) => (
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

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          <CommonSelect
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
                          />
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
                          <CommonSelect
                            fullWidth
                            value={selectedCarNumberIds[m.id] || m.equipmentId || 0}
                            onChange={async (value) => {
                              const selectedCarNumber = (
                                carNumberOptionsByCompany[m.outsourcingCompanyId] ?? []
                              ).find((opt) => opt.id === value)

                              if (!selectedCarNumber) return

                              updateItemField('fuel', m.id, 'equipmentId', selectedCarNumber.id)

                              updateItemField(
                                'fuel',
                                m.id,
                                'specificationName',
                                selectedCarNumber.specification || '-',
                              )

                              updateItemField(
                                'fuel',
                                m.id,
                                'amount',
                                selectedCarNumber.unitPrice || '-',
                              )

                              // const subEquipments = selectedCarNumber.subEquipments ?? []

                              // if (subEquipments.length > 0) {
                              //   const formattedSubEquipments = subEquipments.map((sub: any) => ({
                              //     id: null,
                              //     checkId: sub.id,
                              //     outsourcingCompanyContractSubEquipmentId: sub.id,
                              //     type: sub.type || sub.typeCode || '-',
                              //     memo: sub.memo || '',
                              //   }))

                              //   updateItemField(
                              //     'fuel',
                              //     m.id,
                              //     'subEquipments',
                              //     formattedSubEquipments,
                              //   )

                              //   const subEquipmentsOptions = formattedSubEquipments.map(
                              //     (sub: any) => ({
                              //       id: sub.id,
                              //       checkId: sub.id,
                              //       name: sub.type || sub.typeCode || '-',
                              //       taskDescription: sub.workContent,
                              //       unitPrice: sub.unitPrice,
                              //     }),
                              //   )

                              //   setSubEquipmentByRow((prev) => ({
                              //     ...prev,
                              //     [selectedCarNumber.id]: [
                              //       { id: 0, name: '선택' },
                              //       ...subEquipmentsOptions,
                              //     ],
                              //   }))
                              // } else {
                              //   updateItemField('fuel', m.id, 'subEquipments', [])
                              // }
                            }}
                            options={(
                              carNumberOptionsByCompany[m.outsourcingCompanyId] ?? []
                            ).filter(
                              (opt) =>
                                opt.id === selectedCarNumberIds[m.id] || // 현재 row의 선택값은 그대로
                                !Object.values(selectedCarNumberIds).includes(opt.id),
                            )}
                            onScrollToBottom={() => {
                              if (fuelEquipmentHasNextPage && !fuelEquipmentIsFetching)
                                fuelEquipmentFetchNextPage()
                            }}
                            loading={fuelEquipmentLoading}
                          />
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

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
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

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          <TextField
                            size="small"
                            placeholder="숫자만"
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

                        <TableCell
                          align="center"
                          sx={{ border: '1px solid  #9CA3AF', verticalAlign: 'top' }}
                        >
                          <TextField
                            size="small"
                            placeholder="숫자만"
                            value={formatNumber(m.amount)}
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
                                updateItemField('fuel', m.id, 'files', newFiles.slice(0, 1))
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
                        {['작업명', '내용', '인원 및 장비', '-'].map((label) => (
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
                      {todayWorks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            금일 작업내용 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        todayWorks.map((m) => (
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
                        {['작업명', '내용', '인원 및 장비', '-'].map((label) => (
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
                            {label === '내용' || label === '인원 및 장비' || label === '-' ? (
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
                        tomorrowWorks.map((m) => (
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
                      {['공정', '단위', '계약', '전일', '금일', '누계', '공정율'].map((label) => (
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
                    {mainProcessesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          주요공정 데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      mainProcessesList.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell padding="checkbox" align="center">
                            <Checkbox
                              checked={checkedProcessIds.includes(m.id)}
                              onChange={(e) =>
                                toggleCheckItem('mainProcesses', m.id, e.target.checked)
                              }
                            />
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
                        {['구분', '전일', '금일', '누계'].map((label) => (
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
                        personnelList.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedInputStatusIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('inputStatuses', m.id, e.target.checked)
                                }
                              />
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
                        {['구분', '전일', '금일', '누계'].map((label) => (
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
                        equipmentList.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedInputStatusIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('inputStatuses', m.id, e.target.checked)
                                }
                              />
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
                        {['품명', '단위', '계획', '전일', '금일', '누계', '잔여'].map((label) => (
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
                      {urgentMaterialList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            자재현황 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        urgentMaterialList.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedMaterialIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('materialStatuses', m.id, e.target.checked)
                                }
                              />
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
                        {['품명', '단위', '계획', '전일', '금일', '누계', '잔여'].map((label) => (
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
                      {PaymentMaterialList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            자재현황 데이터가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        PaymentMaterialList.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell padding="checkbox" align="center">
                              <Checkbox
                                checked={checkedMaterialIds.includes(m.id)}
                                onChange={(e) =>
                                  toggleCheckItem('materialStatuses', m.id, e.target.checked)
                                }
                              />
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
