/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CommonSelect from '../common/Select'
import CommonButton from '../common/Button'
import { useOrderingFormStore } from '@/stores/orderingStore'
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
import { useClientCompany } from '@/hooks/useClientCompany'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { HistoryItem } from '@/types/ordering'
import { ClientDetailService } from '@/services/ordering/orderingRegistrationService'
import CommonDatePicker from '../common/DatePicker'
import { useDailyReport } from '@/hooks/useDailyReport'
import { useDailyFormStore } from '@/stores/dailyReportStore'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import {
  GetAttachedFileByFilterService,
  GetEmployeesByFilterService,
  GetEquipmentByFilterService,
  GetFuelByFilterService,
  GetOutsoucingByFilterService,
} from '@/services/dailyReport/dailyReportRegistrationService'
import CommonSelectByName from '../common/CommonSelectByName'
import CommonFileInput from '../common/FileInput'
import { formatDateTime } from '@/utils/formatters'

export default function DailyReportRegistrationView({ isEditMode = false }) {
  const {
    form,
    setField,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    toggleCheckItem,
    toggleCheckAllItems,

    // 직원 정보
  } = useDailyFormStore()

  const {} = useOutSourcingContract()

  const { WeatherTypeMethodOptions } = useFuelAggregation()

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

    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,
  } = useOutSourcingContract()

  const { ClientModifyMutation, orderingCancel, useClientHistoryDataQuery } = useClientCompany()

  const {
    createDailyMutation,
    setEmployeeSearch,
    employeeInfoOptions,
    employeeFetchNextPage,
    employeehasNextPage,
    employeeFetching,
    employeeLoading,

    // 인력의 정보 조회

    workListOptions,
    setWorkerSearch,
    workerListFetchNextPage,
    workerListHasNextPage,
    workerListIsFetching,
    workerListLoading,
  } = useDailyReport()

  const {
    setDriverSearch,
    fuelDriverOptions,
    fuelDriverFetchNextPage,
    fuelDriverHasNextPage,
    fuelDriverIsFetching,
    fuelDriverLoading,

    // 차량번호 & 장비명
    setEquipmentSearch,
    fuelEquipmentOptions,
    fuelEquipmentFetchNextPage,
    fuelEquipmentHasNextPage,
    fuelEquipmentIsFetching,
    fuelEquipmentLoading,

    OilTypeMethodOptions,
  } = useFuelAggregation()

  // 체크 박스에 활용
  //   const employees = form.employees

  const params = useParams()
  const clientCompanyId = Number(params?.id)

  const tabs = ['직원', '직영/계약직', '외주', '장비', '유류', '현장 사진 등록']
  const [activeTab, setActiveTab] = useState('직원')

  const {
    isFetchingNextPage,
    fetchNextPage: clientFetchNextPage,
    hasNextPage: clientHasNextPage,
    isLoading: clientIsLoading,
  } = useClientHistoryDataQuery(clientCompanyId, isEditMode)

  const historyList = useOrderingFormStore((state) => state.form.changeHistories)

  const { data } = useQuery({
    queryKey: ['ClientDetailInfo'],
    queryFn: () => ClientDetailService(clientCompanyId),
    enabled: isEditMode && !!clientCompanyId, // 수정 모드일 때만 fetch
  })

  useEffect(() => {
    if (data && isEditMode === true) {
      // 담당자 데이터 가공
    } else {
      reset()
    }
  }, [data, isEditMode, reset, setField])

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (clientIsLoading || isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && clientHasNextPage) {
          clientFetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [clientFetchNextPage, clientHasNextPage, isFetchingNextPage, clientIsLoading],
  )

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

    const fetched = res.data.pages.flatMap((page) =>
      page.data.content.map((item: any) => ({
        id: item.id,
        laborId: item.labor?.id ?? 0,
        name: item.labor?.name ?? '',
        type: item.labor?.type ?? '',
        workContent: item.workContent,
        workQuantity: item.workQuantity,
        memo: item.memo,
      })),
    )

    // 중복 제거 후 form.employees에 넣기
    setField('employees', fetched)
  }

  // 직원

  const employees = useMemo(() => form.employees, [form.employees])

  const checkedIds = form.checkedManagerIds
  const isAllChecked = employees.length > 0 && checkedIds.length === employees.length

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
    if (!res.data) {
      // 조회 실패 또는 데이터 없음 → 빈 배열로 초기화
      setField('outsourcings', [])
      return
    }

    const fetched = res.data.pages.flatMap((page) =>
      page.data.content.map((item: any) => ({
        id: item.id,
        outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
        outsourcingCompanyContractWorkerId: item.outsourcingCompanyWorker?.id ?? '',
        category: item.category ?? '',
        workContent: item.workContent,
        workQuantity: item.workQuantity,
        memo: item.memo,
      })),
    )

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
    if (!res.data) {
      // 조회 실패 또는 데이터 없음 → 빈 배열로 초기화
      setField('outsourcingEquipments', [])
      return
    }

    const fetched = res.data.pages.flatMap((page) =>
      page.data.content.map((item: any) => ({
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
      })),
    )

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
    if (!res.data) {
      // 조회 실패 또는 데이터 없음 → 빈 배열로 초기화
      setField('fuels', [])
      return
    }

    const fetched = res.data.pages.flatMap((page) =>
      page.data.content.map((item: any) => ({
        id: item.id,
        outsourcingCompanyContractId: item.outsourcingCompany?.id ?? 0,
        outsourcingCompanyContractDriverId: item.outsourcingCompanyDriver.id ?? 0,
        outsourcingCompanyContractEquipmentId: item.outsourcingCompanyEquipment?.id ?? '',
        specificationName: item.outsourcingCompanyEquipment.specification ?? '',
        fuelType: item.fuelType ?? '',
        fuelAmount: item.fuelAmount,
        memo: item.memo,
      })),
    )

    setField('fuels', fetched)
  }
  const fuelData = useMemo(() => form.fuels, [form.fuels])

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
    if (!res.data) {
      setField('files', [])
      return
    }

    const fetched = res.data.pages.flatMap((page) =>
      page.data.content.map((item: any) => ({
        id: item.id,
        description: item.description ?? '',
        memo: item.memo ?? '',
        files: [
          {
            id: item.id,
            fileUrl: item.fileUrl ?? '',
            name: item.originalFileName,
          },
        ],
      })),
    )

    setField('files', fetched)
  }

  const attachedFiles = useMemo(() => form.files, [form.files])

  const fileCheckIds = form.checkedAttachedFileIds
  const isFilesAllChecked = attachedFiles.length > 0 && fileCheckIds.length === attachedFiles.length

  console.log('받아온 attachedFilesattachedFilesattachedFiles', attachedFiles)
  return (
    <>
      <div className="flex gap-10 items-center justify-between">
        <div>
          <h1 className="text-2xl mb-3 whitespace-nowrap"> 출역일보</h1>
        </div>
        <div className="flex">
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
              일자
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.reportDate}
                onChange={(value) => setField('reportDate', value)}
              />
            </div>
          </div>
          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              날씨
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonSelect
                fullWidth={true}
                value={form.weather || 'BASE'}
                onChange={(value) => setField('weather', value)}
                options={WeatherTypeMethodOptions}
              />
            </div>
          </div>
        </div>
        <CommonButton
          label="조회"
          className="px-7 whitespace-nowrap"
          variant="primary"
          onClick={async () => {
            if (activeTab === '직원') {
              await employeesRefetch({
                throwOnError: false,
                cancelRefetch: false,
              })
              handleEmployeesRefetch()
            } else if (activeTab === '외주') {
              await outsourcingRefetch({ throwOnError: false, cancelRefetch: false })
              handleOutsourcingRefetch()
            } else if (activeTab === '장비') {
              await equipmentRefetch({ throwOnError: false, cancelRefetch: false })
              handleEquipmentRefetch()
            } else if (activeTab === '유류') {
              await fuelRefetch({ throwOnError: false, cancelRefetch: false })
              handleFuelRefetch()
            } else if (activeTab === '현장 사진 등록') {
              await fileRefetch({ throwOnError: false, cancelRefetch: false })
              handleFileRefetch()
            }
          }}
        />
      </div>

      {/* 상단 탭 */}
      <div className="flex border-b border-gray-400 mb-4 mt-14">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px border-b-2 cursor-pointer font-medium ${
              activeTab === tab
                ? 'bg-white border border-gray-500 text-black text-[15px] font-bold rounded-t-md px-8'
                : 'bg-gray-200 border border-gray-500 text-gray-400 text-[15px] rounded-t-md px-8'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
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
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('Employees')}
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
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((m) => (
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
                        value={m.laborId || 0} // 현재 직원 선택값
                        onChange={async (value) => {
                          updateItemField('Employees', m.id, 'laborId', value)

                          // 선택한 직원 이름 찾기
                          const selectedEmployee = employeeInfoOptions.find(
                            (opt) => opt.id === value,
                          )
                          if (!selectedEmployee) return

                          // 직원 이름, 타입 등 동기화
                          //   updateItemField('Employees', m.id, 'name', selectedEmployee.name ?? '')
                          //   updateItemField('Employees', m.id, 'type', selectedEmployee.type ?? '')
                        }}
                        options={employeeInfoOptions}
                        onScrollToBottom={() => {
                          if (employeehasNextPage && !employeeFetching) {
                            employeeFetchNextPage()
                          }
                        }}
                        onInputChange={(value) => setEmployeeSearch(value)}
                        loading={employeeLoading}
                      />
                    </TableCell>
                    {/* <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        placeholder="텍스트 입력"
                        size="small"
                        value={m.workContent}
                        onChange={(e) => updateItemField('Employees', m.id, 'workContent', e.target.value)}
                      />
                    </TableCell> */}
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
                      sx={{
                        border: '1px solid #9CA3AF',
                        padding: '8px',
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="'-'없이 숫자만 입력"
                        value={m.workQuantity}
                        onChange={(e) => {
                          const officeNumber = Number(e.target.value)
                          updateItemField('Employees', m.id, 'workQuantity', officeNumber)
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) => updateItemField('Employees', m.id, 'memo', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('outsourcings')}
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
                        {label}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {resultOutsourcing.map((m) => (
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
                        value={m.outsourcingCompanyId || 0}
                        onChange={async (value) => {
                          const selectedCompany = companyOptions.find((opt) => opt.id === value)
                          if (!selectedCompany) return

                          updateItemField(
                            'outsourcings',
                            m.id,
                            'outsourcingCompanyId',
                            selectedCompany.id,
                          )
                        }}
                        options={companyOptions}
                        onScrollToBottom={() => {
                          if (comPanyNamehasNextPage && !comPanyNameFetching)
                            comPanyNameFetchNextPage()
                        }}
                        onInputChange={(value) => setCompanySearch(value)}
                        loading={comPanyNameLoading}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <CommonSelect
                        fullWidth
                        value={m.outsourcingCompanyContractWorkerId || 0}
                        onChange={async (value) => {
                          const selectedCompany = workListOptions.find((opt) => opt.id === value)
                          if (!selectedCompany) return

                          updateItemField(
                            'outsourcings',
                            m.id,
                            'outsourcingCompanyContractWorkerId',
                            selectedCompany.id,
                          )

                          updateItemField(
                            'outsourcings',
                            m.id,
                            'category',
                            selectedCompany.category ?? '-', // category 없으면 '-'
                          )
                        }}
                        options={workListOptions}
                        onScrollToBottom={() => {
                          if (workerListHasNextPage && !workerListIsFetching)
                            workerListFetchNextPage()
                        }}
                        onInputChange={(value) => setWorkerSearch(value)}
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

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}>
                      <TextField
                        size="small"
                        placeholder="'-'없이 숫자만 입력"
                        value={m.workQuantity}
                        onChange={(e) => {
                          const workQuantity = Number(e.target.value)
                          updateItemField('outsourcings', m.id, 'workQuantity', workQuantity)
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) =>
                          updateItemField('outsourcings', m.id, 'memo', e.target.value)
                        }
                      />
                    </TableCell>

                    {/* 등록/수정일 (임시: Date.now 기준) */}
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {new Date().toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
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
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('equipment')}
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
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {equipmentData.map((m) => (
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
                        value={m.outsourcingCompanyId || 0}
                        onChange={async (value) => {
                          const selectedCompany = companyOptions.find((opt) => opt.id === value)
                          if (!selectedCompany) return

                          updateItemField(
                            'equipment',
                            m.id,
                            'outsourcingCompanyId',
                            selectedCompany.id,
                          )
                        }}
                        options={companyOptions}
                        onScrollToBottom={() => {
                          if (comPanyNamehasNextPage && !comPanyNameFetching)
                            comPanyNameFetchNextPage()
                        }}
                        onInputChange={(value) => setCompanySearch(value)}
                        loading={comPanyNameLoading}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <CommonSelect
                        fullWidth
                        value={m.outsourcingCompanyContractDriverId}
                        onChange={async (value) => {
                          const selectedDriver = fuelDriverOptions.find((opt) => opt.id === value)
                          if (!selectedDriver) return

                          updateItemField(
                            'equipment',
                            m.id,
                            'outsourcingCompanyContractDriverId',
                            selectedDriver.id,
                          )
                        }}
                        options={fuelDriverOptions}
                        onScrollToBottom={() => {
                          if (fuelDriverHasNextPage && !fuelDriverIsFetching)
                            fuelDriverFetchNextPage()
                        }}
                        onInputChange={(value) => setDriverSearch(value)}
                        loading={fuelDriverLoading}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <CommonSelect
                        fullWidth
                        value={m.outsourcingCompanyContractEquipmentId || 0} // 장비 선택은 ID 기준
                        onChange={async (value) => {
                          const selectedEquipment = fuelEquipmentOptions.find(
                            (opt) => opt.id === value,
                          )
                          if (!selectedEquipment) return

                          updateItemField(
                            'equipment',
                            m.id,
                            'outsourcingCompanyContractEquipmentId',
                            selectedEquipment.id,
                          )

                          updateItemField(
                            'equipment',
                            m.id,
                            'specificationName',
                            selectedEquipment.specification || '',
                          )

                          updateItemField(
                            'equipment',
                            m.id,
                            'type',
                            selectedEquipment.category || '-', // type 없으면 '-'
                          )
                        }}
                        options={fuelEquipmentOptions}
                        onScrollToBottom={() => {
                          if (fuelEquipmentHasNextPage && !fuelEquipmentIsFetching)
                            fuelEquipmentFetchNextPage()
                        }}
                        onInputChange={(value) => setEquipmentSearch(value)}
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

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}>
                      <TextField
                        size="small"
                        placeholder="입력"
                        value={m.unitPrice || ''}
                        onChange={(e) =>
                          updateItemField('equipment', m.id, 'unitPrice', e.target.value)
                        }
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={Number(m.workHours)}
                        onChange={(e) =>
                          updateItemField('equipment', m.id, 'workHours', e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) => updateItemField('equipment', m.id, 'memo', e.target.value)}
                      />
                    </TableCell>

                    {/* 등록/수정일 (임시: Date.now 기준) */}
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {new Date().toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
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
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('fuel')}
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
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {fuelData.map((m) => (
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
                        value={m.outsourcingCompanyContractId || 0}
                        onChange={async (value) => {
                          const selectedCompany = companyOptions.find((opt) => opt.id === value)
                          if (!selectedCompany) return

                          updateItemField(
                            'fuel',
                            m.id,
                            'outsourcingCompanyContractId',
                            selectedCompany.id,
                          )
                        }}
                        options={companyOptions}
                        onScrollToBottom={() => {
                          if (comPanyNamehasNextPage && !comPanyNameFetching)
                            comPanyNameFetchNextPage()
                        }}
                        onInputChange={(value) => setCompanySearch(value)}
                        loading={comPanyNameLoading}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <CommonSelect
                        fullWidth
                        value={m.outsourcingCompanyContractDriverId}
                        onChange={async (value) => {
                          const selectedDriver = fuelDriverOptions.find((opt) => opt.id === value)
                          if (!selectedDriver) return

                          updateItemField(
                            'fuel',
                            m.id,
                            'outsourcingCompanyContractDriverId',
                            selectedDriver.id,
                          )
                        }}
                        options={fuelDriverOptions}
                        onScrollToBottom={() => {
                          if (fuelDriverHasNextPage && !fuelDriverIsFetching)
                            fuelDriverFetchNextPage()
                        }}
                        onInputChange={(value) => setDriverSearch(value)}
                        loading={fuelDriverLoading}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <CommonSelect
                        fullWidth
                        value={m.outsourcingCompanyContractEquipmentId || 0} // 장비 선택은 ID 기준
                        onChange={async (value) => {
                          const selectedEquipment = fuelEquipmentOptions.find(
                            (opt) => opt.id === value,
                          )
                          if (!selectedEquipment) return

                          updateItemField(
                            'fuel',
                            m.id,
                            'outsourcingCompanyContractEquipmentId',
                            selectedEquipment.id,
                          )

                          updateItemField(
                            'fuel',
                            m.id,
                            'specificationName',
                            selectedEquipment.specification || '',
                          )

                          updateItemField(
                            'fuel',
                            m.id,
                            'type',
                            selectedEquipment.category || '-', // type 없으면 '-'
                          )
                        }}
                        options={fuelEquipmentOptions}
                        onScrollToBottom={() => {
                          if (fuelEquipmentHasNextPage && !fuelEquipmentIsFetching)
                            fuelEquipmentFetchNextPage()
                        }}
                        onInputChange={(value) => setEquipmentSearch(value)}
                        loading={fuelEquipmentLoading}
                      />
                    </TableCell>

                    {/* 규격 */}
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {m.specificationName ?? '-'}
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <CommonSelectByName
                        fullWidth={true}
                        value={m.fuelType || '선택'}
                        onChange={async (value) => {
                          updateItemField('fuel', m.id, 'fuelType', value)
                        }}
                        options={OilTypeMethodOptions}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF', padding: '8px' }}>
                      <TextField
                        size="small"
                        placeholder="입력"
                        value={m.fuelAmount}
                        onChange={(e) => {
                          const fuelAmount = Number(e.target.value)
                          updateItemField('fuel', m.id, 'fuelAmount', fuelAmount)
                        }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) => updateItemField('fuel', m.id, 'memo', e.target.value)}
                      />
                    </TableCell>

                    {/* 등록/수정일 (임시: Date.now 기준) */}
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      {new Date().toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
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
              />
              <CommonButton
                label="추가"
                className="px-7"
                variant="secondary"
                onClick={() => addItem('attachedFile')}
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
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attachedFiles.map((m) => (
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
                          // files={m.files || []} // m.files가 배열이면 바로 전달

                          files={m.files}
                          onChange={(newFiles) =>
                            updateItemField('attachedFile', m.id, 'files', newFiles)
                          }
                          uploadTarget="CLIENT_COMPANY"
                        />
                      </div>
                    </TableCell>

                    {/* Memo */}
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        sx={{ width: '100%' }}
                        value={m.memo ?? ''}
                        onChange={(e) =>
                          updateItemField('attachedFile', m.id, 'memo', e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {fileFetching && <div className="p-2 text-center">불러오는 중...</div>}
          </TableContainer>
        </div>
      )}

      {/* {activeTab === '직영/계약직' && (
        <div>
          <div className="flex justify-between items-center mt-10 mb-2">
            <span className="font-bold  mb-4"> [{activeTab}]</span>
            <div className="flex gap-4">
              <CommonButton
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
                      onChange={(e) => toggleCheckAllItems('manager', e.target.checked)}
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
                    '전화번호',
                    '개인 휴대폰',
                    '이메일',
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
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {managers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell
                      padding="checkbox"
                      align="center"
                      sx={{ border: '1px solid  #9CA3AF' }}
                    >
                      <Checkbox
                        checked={checkedIds.includes(m.id)}
                        onChange={(e) => toggleCheckItem('manager', m.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #9CA3AF' }}>
                      <Radio
                        checked={m.isMain === true}
                        onChange={() => setRepresentativeManager(m.id)}
                        value={m.id}
                        name="representative"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        placeholder="텍스트 입력"
                        size="small"
                        value={m.name}
                        onChange={(e) => updateItemField('manager', m.id, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        placeholder="텍스트 입력"
                        size="small"
                        value={m.position}
                        onChange={(e) =>
                          updateItemField('manager', m.id, 'position', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        placeholder="텍스트 입력"
                        size="small"
                        value={m.department}
                        onChange={(e) =>
                          updateItemField('manager', m.id, 'department', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        border: '1px solid #9CA3AF',
                        padding: '8px',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CommonSelect
                          value={m.managerAreaNumber}
                          onChange={(value) => {
                            updateItemField('manager', m.id, 'managerAreaNumber', value)
                          }}
                          options={AreaCode}
                        />

                        <TextField
                          size="small"
                          placeholder="'-'없이 숫자만 입력"
                          value={m.landlineNumber}
                          onChange={(e) => {
                            const formatAreaNumber = formatPersonNumber(e.target.value)
                            updateItemField('manager', m.id, 'landlineNumber', formatAreaNumber)
                          }}
                          sx={{ width: 120 }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="'-'없이 숫자만 입력"
                        value={m.phoneNumber}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value)
                          updateItemField('manager', m.id, 'phoneNumber', formatted)
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.email}
                        onChange={(e) => updateItemField('manager', m.id, 'email', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                      <TextField
                        size="small"
                        placeholder="텍스트 입력"
                        value={m.memo}
                        onChange={(e) => updateItemField('manager', m.id, 'memo', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )} */}

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
                        border: '1px solid  #9CA3AF',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.content}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ border: '1px solid  #9CA3AF', whiteSpace: 'pre-line' }}
                    >
                      {item.updatedBy}
                    </TableCell>
                  </TableRow>
                ))}
                {clientHasNextPage && (
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
        <CommonButton label="취소" variant="reset" className="px-10" onClick={orderingCancel} />
        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={() => {
            if (isEditMode) {
              ClientModifyMutation.mutate(clientCompanyId)
            } else {
              createDailyMutation.mutate()
            }
          }}
        />
      </div>
    </>
  )
}
