/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
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
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  GetEmployeesByFilterService,
  GetEquipmentByFilterService,
  GetFuelByFilterService,
  GetOutsoucingByFilterService,
  ModifyWeatherReport,
  OutsourcingWorkerNameScroll,
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

export default function DailyReportRegistrationView() {
  const {
    form,
    setField,
    updateItemField,
    removeCheckedItems,
    addTemporaryCheckedItems,
    resetEmployees,
    resetDirectContracts,
    resetOutsourcing,
    resetEquipment,
    resetFuel,
    resetFile,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,

    // 직원 정보
  } = useDailyFormStore()

  const { WeatherTypeMethodOptions } = useFuelAggregation()

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

    // 업체명

    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useOutSourcingContract()

  const {
    createDailyMutation,
    EmployeesModifyMutation,
    OutsourcingModifyMutation,
    EquipmentModifyMutation,
    ContractModifyMutation,
    FuelModifyMutation,
    FileModifyMutation,

    CompleteInfoMutation,

    reportCancel,
    employeeInfoOptions,
    employeeFetchNextPage,
    employeehasNextPage,
    employeeFetching,
    employeeLoading,

    contractNameInfoOptions,
    contractNameFetchNextPage,
    contractNamehasNextPage,
    contractNameFetching,
    contractNameLoading,

    // 인력의 정보 조회

    withEquipmentInfoOptions,
    withEquipmentFetchNextPage,
    withEquipmenthasNextPage,
    withEquipmentFetching,
    withEquipmentLoading,
  } = useDailyReport()

  const { showSnackbar } = useSnackbarStore()

  const { OilTypeMethodOptions } = useFuelAggregation()

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<{ [rowId: number]: number }>({})
  const [selectId, setSelectId] = useState(0)
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<{ [rowId: number]: number }>({})

  // 옵션에 따른 상태값

  const [workerOptionsByCompany, setWorkerOptionsByCompany] = useState<Record<number, any[]>>({})

  const [modifyFuelNumber, setModifyFuelNumber] = useState(0)

  // 체크 박스에 활용
  //   const employees = form.employees

  const tabs = ['직원', '직영/계약직', '외주', '장비', '유류', '현장 사진 등록']
  const [activeTab, setActiveTab] = useState('직원')

  const handleTabClick = (tab: string) => {
    const confirmLeave = window.confirm(
      `현재 ${activeTab}의 데이터를 저장 혹은 수정하지 않았습니다. 이동하시면 데이터는 초기화 됩니다. 이동하시겠습니까?`,
    )
    if (!confirmLeave) return // 취소 시 이동하지 않음

    // 이전 탭에 맞는 reset 함수만 실행
    switch (activeTab) {
      case '직원':
        resetEmployees()
        break
      case '직영/계약직':
        resetDirectContracts()
        break
      case '외주':
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
      laborId: item.labor?.id ?? 0,
      name: item.labor?.name ?? '',
      type: item.labor?.type ?? '',
      workContent: item.workContent,
      workQuantity: item.workQuantity,
      memo: item.memo,
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('employees', fetched)
  }

  // 직원

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
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('directContracts', fetched)
  }

  const contractData = useMemo(() => form.directContracts, [form.directContracts])

  const ContractCheckedIds = form.checkeddirectContractsIds
  const isContractAllChecked =
    contractData.length > 0 && ContractCheckedIds.length === contractData.length

  // 외주 조회

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
      outsourcingCompanyContractWorkerId: item.outsourcingCompanyWorker?.id ?? 0,
      category: item.category ?? '',
      workContent: item.workContent,
      workQuantity: item.workQuantity,
      memo: item.memo,
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('outsourcings', fetched)
  }

  // 외주
  const resultOutsourcing = useMemo(() => form.outsourcings, [form.outsourcings])
  const checkedOutsourcingIds = form.checkedOutsourcingIds
  const isOutsourcingAllChecked =
    resultOutsourcing.length > 0 && checkedOutsourcingIds.length === resultOutsourcing.length

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

    // content 배열 합치기
    const allEquipmentContents = res.data.pages.flatMap((page) => page.data.content)

    if (allEquipmentContents.length === 0) {
      // 데이터가 아예 없는 경우
      setIsEditMode(false)
      resetEquipment()
      return
    }

    const fetched = allEquipmentContents.map((item: any) => ({
      id: item.id,
      outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
      outsourcingCompanyContractDriverId: item.outsourcingCompanyContractDriver.id ?? 0,
      outsourcingCompanyContractEquipmentId: item.outsourcingCompanyContractEquipment?.id ?? '',
      specificationName: item.outsourcingCompanyContractEquipment.specification ?? '',
      type: item.outsourcingCompanyContractEquipment.category ?? '',
      workContent: item.workContent,
      unitPrice: item.unitPrice,
      workHours: item.workHours,
      memo: item.memo,
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

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
      driverId: item.outsourcingCompanyDriver.id ?? 0,
      equipmentId: item.outsourcingCompanyEquipment?.id ?? '',
      specificationName: item.outsourcingCompanyEquipment.specification ?? '',
      fuelType: item.fuelTypeCode ?? '',
      fuelAmount: item.fuelAmount,
      memo: item.memo,
      modifyDate: `${getTodayDateString(item.createdAt)} / ${getTodayDateString(item.updatedAt)}`,
    }))

    setIsEditMode(true)
    setField('fuelInfos', fetched)
    setModifyFuelNumber(allFuels[0]?.fuelAggregationId)
  }
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

  useEffect(() => {
    if (!form.siteId || !form.siteProcessId || !form.reportDate) return

    const fetchData = async () => {
      if (activeTab === '직원') {
        handleEmployeesRefetch()
      }
      if (activeTab === '직영/계약직') {
        handleContractRefetch()
      }
      if (activeTab === '외주') {
        handleOutsourcingRefetch()
      } else if (activeTab === '장비') {
        handleEquipmentRefetch()
      } else if (activeTab === '유류') {
        handleFuelRefetch()
      } else if (activeTab === '현장 사진 등록') {
        handleFileRefetch()
      }
    }

    fetchData()
  }, [activeTab, form.siteId, form.siteProcessId, form.reportDate])

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

  useEffect(() => {
    if (detailReport?.status === 200 && !isEditMode) {
      setIsEditMode(true)
    }
  }, [detailReport, isEditMode])

  useEffect(() => {
    if (detailReport === undefined) {
      setField('weather', 'BASE') // 상세 데이터가 있을 때만 세팅
    }
    if (detailReport?.status === 200) {
      setField('weather', detailReport.data.weatherCode) // 상세 데이터가 있을 때만 세팅
      if (!isEditMode) setIsEditMode(true) // 최초 로딩 시 editMode 설정
    }
  }, [detailReport])

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

  useEffect(() => {
    const headerData = sessionStorage.getItem('myInfo')
    if (headerData) {
      setMyInfo(JSON.parse(headerData))
    }
  }, [])

  const isHeadOfficeInfo = myInfo?.isHeadOffice

  const roleId = Number(myInfo?.roles?.[0]?.id)
  const rolePermissionStatus = myInfo?.roles?.[0]?.deleted
  const enabled = rolePermissionStatus === false && !!roleId && !isNaN(roleId)

  // "계정 관리" 메뉴에 대한 권한
  const { hasApproval } = useMenuPermission(roleId, '출역일보', enabled)

  const {
    data: workerList,
    fetchNextPage: workerListFetchNextPage,
    hasNextPage: workerListHasNextPage,
    isFetching: workerListIsFetching,
    isLoading: workerListLoading,
  } = useInfiniteQuery({
    queryKey: ['WorkDataInfo', selectedCompanyIds[selectId]],
    queryFn: ({ pageParam = 0 }) =>
      OutsourcingWorkerNameScroll({
        pageParam,
        id: selectedCompanyIds[selectId] || 0,
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
    if (!workerList) return

    const options = workerList.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        category: user.category,
      }))

    setWorkerOptionsByCompany((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [{ id: 0, name: '선택', category: '' }, ...options],
    }))
  }, [workerList, selectedCompanyIds, selectId])

  // 상세페이지 데이터 (예: props나 query에서 가져온 값)
  const outsourcings = resultOutsourcing

  // 1. 상세페이지 들어올 때 각 업체별 worker 데이터 API 호출
  useEffect(() => {
    if (!outsourcings.length) return

    outsourcings.forEach(async (row) => {
      const companyId = row.outsourcingCompanyId
      const worker = row.outsourcingCompanyContractWorkerId
      if (!companyId) return

      try {
        const res = await OutsourcingWorkerNameScroll({
          pageParam: 0,
          id: companyId,
          size: 10,
        })

        const options = res.data.content.map((user: any) => ({
          id: user.id,
          name: user.name,
          category: user.category,
        }))

        setWorkerOptionsByCompany((prev) => {
          const exists = options.some((opt: any) => opt.id === worker)

          return {
            ...prev,
            [companyId]: [
              { id: 0, name: '선택', category: '' },
              ...options,
              // 만약 선택된 worker가 목록에 없으면 추가
              ...(worker && !exists ? [{ id: worker, name: '', category: '' }] : []),
            ],
          }
        })
      } catch (err) {
        console.error('업체별 인력 조회 실패', err)
      }
    })
  }, [outsourcings])

  // 장비에서 업체명 선택 시 기사명과 차량번호를 선택해주는 코드

  const [selectedDriverIds, setSelectedDriverIds] = useState<{ [rowId: number]: number }>({})

  // 옵션에 따른 상태값

  const [driverOptionsByCompany, setDriverOptionsByCompany] = useState<Record<number, any[]>>({})

  // 업체명 id

  const {
    data: fuelDriver,
    fetchNextPage: fuelDriverFetchNextPage,
    hasNextPage: fuelDriverHasNextPage,
    isFetching: fuelDriverIsFetching,
    isLoading: fuelDriverLoading,
  } = useInfiniteQuery({
    queryKey: ['FuelDriverInfo', selectedCompanyIds[selectId]],

    queryFn: ({ pageParam }) =>
      FuelDriverNameScroll({
        pageParam,
        id: selectedCompanyIds[selectId] || 0,
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

  //차량번호 & 규격 무한 스크롤
  const [selectedCarNumberIds, setSelectedCarNumberIds] = useState<{ [rowId: number]: number }>({})

  // 옵션에 따른 상태값

  const [carNumberOptionsByCompany, setCarNumberOptionsByCompany] = useState<Record<number, any[]>>(
    {},
  )

  const {
    data: fuelEquipment,
    fetchNextPage: fuelEquipmentFetchNextPage,
    hasNextPage: fuelEquipmentHasNextPage,
    isFetching: fuelEquipmentIsFetching,
    isLoading: fuelEquipmentLoading,
  } = useInfiniteQuery({
    queryKey: ['FuelEquipmentInfo', selectedCompanyIds[selectId]],
    queryFn: ({ pageParam }) =>
      FuelEquipmentNameScroll({
        pageParam,
        id: selectedCompanyIds[selectId] || 0,
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

  useEffect(() => {
    if (!outsourcingfuel.length) return

    outsourcingfuel.forEach(async (row) => {
      const companyId = row.outsourcingCompanyId
      const driverData = row.driverId
      const carNumberId = row.equipmentId
      if (!companyId) return

      try {
        const res = await FuelDriverNameScroll({
          pageParam: 0,
          id: companyId,
          size: 200,
        })

        const options = res.data.content.map((user: any) => ({
          id: user.id,
          name: user.name + (user.deleted ? ' (삭제됨)' : ''),
          deleted: user.deleted,
        }))

        setDriverOptionsByCompany((prev) => {
          const exists = options.some((opt: any) => opt.id === driverData)

          return {
            ...prev,
            [companyId]: [
              { id: 0, name: '선택', deleted: false },
              ...options,
              // 만약 선택된 worker가 목록에 없으면 추가
              ...(driverData && !exists ? [{ id: driverData, name: '', deleted: true }] : []),
            ],
          }
        })

        const carNumberRes = await FuelEquipmentNameScroll({
          pageParam: 0,
          id: companyId,
          size: 200,
        })

        const carOptions = carNumberRes.data.content.map((user: any) => ({
          id: user.id,
          specification: user.specification,
          vehicleNumber: user.vehicleNumber + (user.deleted ? ' (삭제됨)' : ''),
          category: user.category,
        }))

        setCarNumberOptionsByCompany((prev) => {
          const exists = carOptions.some((opt: any) => opt.id === carNumberId)

          return {
            ...prev,
            [companyId]: [
              { id: 0, specification: '', vehicleNumber: '선택', category: '', deleted: false },
              ...carOptions,
              // 만약 선택된 worker가 목록에 없으면 추가
              ...(carNumberId && !exists
                ? [
                    {
                      id: carNumberId,
                      specification: '',
                      vehicleNumber: '',
                      category: '',
                      deleted: true,
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
  }, [outsourcingfuel])

  // 유효성 검사

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

    // form 전체 필드 검증 (루프 밖)
    if (form.weather === 'BASE' || form.weather === '') {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  const validateContract = () => {
    for (const c of contractData) {
      // 이름(직원) 선택 여부
      if (c.laborId === 0) {
        return showSnackbar('계약직원의 이름을 선택해주세요.', 'warning')
      }

      if (!c.position || c.position.trim() === '') {
        return showSnackbar('계약직원의 직급을 입력해주세요.', 'warning')
      }

      // 작업내용 필수
      if (!c.workContent || c.workContent.trim() === '') {
        return showSnackbar('계약직원의 작업내용을 입력해주세요.', 'warning')
      }

      if (!c.unitPrice || c.unitPrice === 0) {
        return showSnackbar('계약직원의 단가를 입력해주세요.', 'warning')
      }

      // 공수 필수 (0, null, NaN 불가)
      if (c.workQuantity === null || c.workQuantity === 0 || isNaN(c.workQuantity)) {
        return showSnackbar('계약직원의 공수는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }

      // 비고는 500자 제한
      if (c.memo && c.memo.length > 500) {
        return showSnackbar('계약직원의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }
    if (form.weather === 'BASE' || form.weather === '') {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }
    return true
  }

  const validateOutsourcing = () => {
    for (const o of outsourcings) {
      // 업체명 선택 여부
      if (!o.outsourcingCompanyId || o.outsourcingCompanyId === 0) {
        return showSnackbar('외주의 업체명을 선택해주세요.', 'warning')
      }

      // 이름 선택 여부
      if (!o.outsourcingCompanyContractWorkerId || o.outsourcingCompanyContractWorkerId === 0) {
        return showSnackbar('외주의 이름을 선택해주세요.', 'warning')
      }

      // 구분 필수
      if (!o.category || o.category.trim() === '') {
        return showSnackbar('외주의 구분을 입력해주세요.', 'warning')
      }

      // 작업내용 필수
      if (!o.workContent || o.workContent.trim() === '') {
        return showSnackbar('외주의 작업내용을 입력해주세요.', 'warning')
      }

      // 공수 필수 (0, null, NaN 불가)
      if (o.workQuantity === null || o.workQuantity === 0 || isNaN(o.workQuantity)) {
        return showSnackbar('외주의 공수는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }

      // 비고는 500자 제한
      if (o.memo && o.memo.length > 500) {
        return showSnackbar('외주의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }

    if (form.weather === 'BASE' || form.weather === '') {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }
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
      if (!e.type || e.type.trim() === '') {
        return showSnackbar('장비의 구분을 입력해주세요.', 'warning')
      }
      if (!e.workContent || e.workContent.trim() === '') {
        return showSnackbar('장비의 작업내용을 입력해주세요.', 'warning')
      }
      if (e.unitPrice === null || isNaN(e.unitPrice) || e.unitPrice <= 0) {
        return showSnackbar('장비의 단가는 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }
      if (e.workHours === null || isNaN(e.workHours) || e.workHours <= 0) {
        return showSnackbar('장비의 시간은 0보다 큰 숫자를 입력해야 합니다.', 'warning')
      }
      if (e.memo && e.memo.length > 500) {
        return showSnackbar('장비의 비고는 500자를 초과할 수 없습니다.', 'warning')
      }
    }

    if (form.weather === 'BASE' || form.weather === '') {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  const validateFuel = () => {
    for (const f of fuelData) {
      if (!f.outsourcingCompanyId || f.outsourcingCompanyId === 0) {
        return showSnackbar('유류의 업체명을 선택해주세요.', 'warning')
      }
      if (!f.driverId || f.driverId === 0) {
        return showSnackbar('유류의 기사명을 선택해주세요.', 'warning')
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

    if (form.weather === 'BASE' || form.weather === '') {
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
    if (form.weather === 'BASE' || form.weather === '') {
      return showSnackbar('날씨를 선택해주세요.', 'warning')
    }

    return true
  }

  const previousWeatherRef = useRef(form.weather)

  return (
    <>
      <div className="flex gap-10 items-center justify-between">
        <div>
          <h1 className="text-2xl mb-3 whitespace-nowrap"> 출역일보</h1>
        </div>
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
        )}
      </div>

      {activeTab === '직원' && (
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
                  {['이름', '작업내용', '공수', '비고', '등록/수정일'].map((label) => (
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
                      {label === '비고' || label === '등록/수정일' ? (
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
                    <TableCell colSpan={7} align="center" sx={{ border: '1px solid #9CA3AF' }}>
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
                          onChange={async (value) =>
                            updateItemField('Employees', m.id, 'laborId', value)
                          }
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
                          value={
                            m.workQuantity === 0 || m.workQuantity === null ? '' : m.workQuantity
                          }
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
      )}

      {/* 직영/계약직 */}

      {activeTab === '직영/계약직' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold mb-4"> [{activeTab}]</span>
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
                      checked={isContractAllChecked}
                      indeterminate={ContractCheckedIds.length > 0 && !isContractAllChecked}
                      onChange={(e) => toggleCheckAllItems('directContracts', e.target.checked)}
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
                      {label === '비고' || label === '등록/수정일' ? (
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
                    <TableCell colSpan={10} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      직영/계약직 데이터가 없습니다.
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
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
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
                            value={m.outsourcingCompanyId || 0}
                            onChange={async (value) => {
                              const selectedCompany = companyOptions.find((opt) => opt.id === value)
                              if (!selectedCompany) return

                              updateItemField(
                                'directContracts',
                                m.checkId,
                                'outsourcingCompanyId',
                                selectedCompany.id,
                              )
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
                              // 선택된 옵션 찾기
                              const selectedOption = contractNameInfoOptions.find(
                                (opt) => opt.id === value,
                              )

                              if (selectedOption?.isSeverancePayEligible) {
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
                                selectedOption?.previousDailyWage ?? 0, // 선택된 항목의 previousDailyWage 자동 입력
                              )
                            }}
                            options={contractNameInfoOptions}
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

                            updateItemField('directContracts', m.checkId, 'unitPrice', numericValue)
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
                          value={
                            m.workQuantity === 0 || m.workQuantity === null ? '' : m.workQuantity
                          }
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
      )}

      {activeTab === '외주' && (
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
                  {['업체명', '이름', '구분', '작업내용', '공수', '비고', '등록/수정일'].map(
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
                        {label === '비고' || label === '등록/수정일' ? (
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
                    <TableCell colSpan={8} align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      외주 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  resultOutsourcing.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell
                        padding="checkbox"
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF' }}
                      >
                        <Checkbox
                          checked={checkedOutsourcingIds.includes(m.id)}
                          onChange={(e) => toggleCheckItem('outsourcings', m.id, e.target.checked)}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <CommonSelect
                          fullWidth
                          value={selectedCompanyIds[m.id] || m.outsourcingCompanyId || 0}
                          onChange={async (value) => {
                            const selectedCompany = companyOptions.find((opt) => opt.id === value)
                            if (!selectedCompany) return

                            // 해당 row만 업데이트
                            setSelectedCompanyIds((prev) => ({
                              ...prev,
                              [m.id]: selectedCompany.id,
                            }))

                            setSelectId(m.id)

                            // 필드 업데이트
                            updateItemField(
                              'outsourcings',
                              m.id,
                              'outsourcingCompanyId',
                              selectedCompany.id,
                            )

                            // 해당 row 워커만 초기화
                            setSelectedWorkerIds((prev) => ({
                              ...prev,
                              [m.id]: 0,
                            }))
                          }}
                          options={companyOptions}
                          onScrollToBottom={() => {
                            if (comPanyNamehasNextPage && !comPanyNameFetching)
                              comPanyNameFetchNextPage()
                          }}
                          loading={comPanyNameLoading}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <CommonSelect
                          fullWidth
                          // value={m.outsourcingCompanyContractWorkerId || 0}
                          value={
                            selectedWorkerIds[m.id] || m.outsourcingCompanyContractWorkerId || 0
                          }
                          onChange={async (value) => {
                            const selectedWorker = (
                              workerOptionsByCompany[m.outsourcingCompanyId] ?? []
                            ).find((opt) => opt.id === value)
                            if (!selectedWorker) return

                            updateItemField(
                              'outsourcings',
                              m.id,
                              'outsourcingCompanyContractWorkerId',
                              selectedWorker.id,
                            )

                            updateItemField(
                              'outsourcings',
                              m.id,
                              'category',
                              selectedWorker.category ?? '-', // category 없으면 '-'
                            )
                          }}
                          options={
                            workerOptionsByCompany[m.outsourcingCompanyId] ?? [
                              { id: 0, name: '선택', category: '' },
                            ]
                          }
                          onScrollToBottom={() => {
                            if (workerListHasNextPage && !workerListIsFetching)
                              workerListFetchNextPage()
                          }}
                          loading={workerListLoading}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          placeholder="텍스트 입력"
                          size="small"
                          value={m.category ?? ''}
                          onChange={(e) =>
                            updateItemField('outsourcings', m.id, 'category', e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          placeholder="텍스트 입력"
                          size="small"
                          value={m.workContent}
                          onChange={(e) =>
                            updateItemField('outsourcings', m.id, 'workContent', e.target.value)
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
                          value={
                            m.workQuantity === 0 || m.workQuantity === null ? '' : m.workQuantity
                          }
                          onChange={(e) => {
                            const value = e.target.value
                            const numericValue = value === '' ? null : parseFloat(value)

                            // dailyWork 배열 idx 위치 업데이트
                            updateItemField('outsourcings', m.id, 'workQuantity', numericValue)
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
                        <TextField
                          size="small"
                          placeholder="500자 이하 텍스트 입력"
                          value={m.memo}
                          onChange={(e) =>
                            updateItemField('outsourcings', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 등록/수정일 (임시: Date.now 기준) */}
                      <TableCell
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
                      >
                        <CommonInput
                          placeholder="-"
                          value={m.modifyDate ?? ''}
                          onChange={(value) =>
                            updateItemField('outsourcings', m.id, 'modifyDate', value)
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
            {outsourcingFetching && <div className="p-2 text-center">불러오는 중...</div>}
          </TableContainer>
        </div>
      )}

      {activeTab === '장비' && (
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
                    '규격',
                    '구분',
                    '작업내용',
                    '단가',
                    '시간',
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
                      {label === '비고' || label === '등록/수정일' ? (
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
                    <TableCell colSpan={11} align="center" sx={{ border: '1px solid #9CA3AF' }}>
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

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
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

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
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

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <CommonSelect
                          fullWidth
                          value={
                            selectedCarNumberIds[m.id] ||
                            m.outsourcingCompanyContractEquipmentId ||
                            0
                          }
                          onChange={async (value) => {
                            const selectedCarNumber = (
                              carNumberOptionsByCompany[m.outsourcingCompanyId] ?? []
                            ).find((opt) => opt.id === value)

                            if (!selectedCarNumber) return

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
                              'type',
                              selectedCarNumber.category || '-', // type 없으면 '-'
                            )
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

                      {/* 규격 */}
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        {m.specificationName ?? '-'}
                      </TableCell>

                      {/* 구분 */}
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        {m.type ?? '-'}
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          size="small"
                          placeholder="텍스트 입력"
                          value={m.workContent}
                          onChange={(e) =>
                            updateItemField('equipment', m.id, 'workContent', e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                      >
                        <TextField
                          size="small"
                          placeholder="숫자만"
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
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          size="small"
                          placeholder="500자 이하 텍스트 입력"
                          value={m.memo}
                          onChange={(e) =>
                            updateItemField('equipment', m.id, 'memo', e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 등록/수정일 (임시: Date.now 기준) */}
                      <TableCell
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF', width: '260px' }}
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
      )}

      {activeTab === '유류' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
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
                    '기사명',
                    '차량번호',
                    '규격',
                    '유종',
                    '주유량',
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
                      {label === '비고' || label === '등록/수정일' ? (
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
                    <TableCell colSpan={9} align="center" sx={{ border: '1px solid #9CA3AF' }}>
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

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <CommonSelect
                          fullWidth
                          // value={m.outsourcingCompanyId || 0}
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
                              'fuel',
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

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <CommonSelect
                          fullWidth
                          value={selectedDriverIds[m.id] || m.driverId || 0}
                          onChange={async (value) => {
                            const selectedDriver = (
                              driverOptionsByCompany[m.outsourcingCompanyId] ?? []
                            ).find((opt) => opt.id === value)

                            if (!selectedDriver) return

                            updateItemField('fuel', m.id, 'driverId', selectedDriver.id)
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

                      <TableCell>
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
                              selectedCarNumber.specification || '',
                            )
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

                      {/* 규격 */}
                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        {m.specificationName ?? '-'}
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <CommonSelect
                          fullWidth={true}
                          value={m.fuelType || 'BASE'}
                          onChange={async (value) => {
                            updateItemField('fuel', m.id, 'fuelType', value)
                          }}
                          options={OilTypeMethodOptions}
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}
                      >
                        <TextField
                          size="small"
                          placeholder="숫자만"
                          value={formatNumber(m.fuelAmount)}
                          onChange={(e) => {
                            const numericValue = unformatNumber(e.target.value)
                            updateItemField('fuel', m.id, 'fuelAmount', numericValue)
                          }}
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                            style: { textAlign: 'right' }, // ← 오른쪽 정렬
                          }}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                        <TextField
                          size="small"
                          placeholder="500자 이하 텍스트 입력"
                          value={m.memo}
                          onChange={(e) => updateItemField('fuel', m.id, 'memo', e.target.value)}
                        />
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
              </TableBody>
            </Table>

            {fuelFetching && <div className="p-2 text-center">불러오는 중...</div>}
          </TableContainer>
        </div>
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

                      // 날씨가 바뀌었을 경우만 호출
                      if (previousWeatherRef.current !== form.weather) {
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
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
                      }
                    },
                  },
                )
              } else if (activeTab === '직영/계약직') {
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

                      // 날씨가 바뀌었을 경우만 호출
                      if (previousWeatherRef.current !== form.weather) {
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
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
                      }
                    },
                  },
                )
              } else if (activeTab === '외주') {
                if (!validateOutsourcing()) return

                OutsourcingModifyMutation.mutate(
                  {
                    siteId: form.siteId || 0,
                    siteProcessId: form.siteProcessId || 0,
                    reportDate: getTodayDateString(form.reportDate) || '',
                  },
                  {
                    onSuccess: async () => {
                      handleOutsourcingRefetch() // 직원 데이터 재조회

                      // 날씨가 바뀌었을 경우만 호출
                      if (previousWeatherRef.current !== form.weather) {
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
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

                      // 날씨가 바뀌었을 경우만 호출
                      if (previousWeatherRef.current !== form.weather) {
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
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
                      }
                    },
                  },
                )
              } else if (activeTab === '유류') {
                if (!validateFuel()) return

                FuelModifyMutation.mutate(modifyFuelNumber, {
                  onSuccess: async () => {
                    handleFuelRefetch() // 직원 데이터 재조회

                    // 날씨가 바뀌었을 경우만 호출
                    if (previousWeatherRef.current !== form.weather) {
                      try {
                        await ModifyWeatherReport({
                          siteId: form.siteId || 0,
                          siteProcessId: form.siteProcessId || 0,
                          reportDate: getTodayDateString(form.reportDate) || '',
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
                    }
                  },
                })
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

                      // 날씨가 바뀌었을 경우만 호출
                      if (previousWeatherRef.current !== form.weather) {
                        try {
                          await ModifyWeatherReport({
                            siteId: form.siteId || 0,
                            siteProcessId: form.siteProcessId || 0,
                            reportDate: getTodayDateString(form.reportDate) || '',
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
                  },
                })
              } else if (activeTab === '직영/계약직') {
                if (!validateContract()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleContractRefetch() // 등록 성공 후 실행
                  },
                })
              } else if (activeTab === '외주') {
                if (!validateOutsourcing()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleOutsourcingRefetch() // 등록 성공 후 실행
                  },
                })
              } else if (activeTab === '장비') {
                if (!validateEquipment()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleEquipmentRefetch() // 등록 성공 후 실행
                  },
                })
              } else if (activeTab === '유류') {
                if (!validateFuel()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleFuelRefetch() // 등록 성공 후 실행
                  },
                })
              } else if (activeTab === '현장 사진 등록') {
                if (!validateFile()) return
                createDailyMutation.mutate(undefined, {
                  onSuccess: () => {
                    handleFileRefetch() // 등록 성공 후 실행
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
