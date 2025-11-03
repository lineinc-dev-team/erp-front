/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Typography,
} from '@mui/material'
import CommonDatePicker from '../common/DatePicker'
import {
  formatDateTime,
  formatNumber,
  getTodayDateString,
  unformatNumber,
} from '@/utils/formatters'
import { useParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import useOutSourcingContract from '@/hooks/useOutSourcingContract'
import { SitesProcessNameScroll } from '@/services/managementCost/managementCostRegistrationService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useFuelAggregation } from '@/hooks/useFuelAggregation'
import { useFuelFormStore } from '@/stores/fuelAggregationStore'
import CommonInput from '../common/Input'
import {
  FuelDetailService,
  FuelDriverNameScroll,
  FuelEquipmentNameScroll,
} from '@/services/fuelAggregation/fuelAggregationRegistrationService'
import { FuelInfo, FuelListInfoData } from '@/types/fuelAggregation'
import { useDailyReport } from '@/hooks/useDailyReport'
import { HistoryItem } from '@/types/ordering'
import CommonFileInput from '../common/FileInput'
import { InfiniteScrollSelect } from '../common/InfiniteScrollSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedEffect'
import AmountInput from '../common/AmountInput'
import { useSiteId } from '@/hooks/useSiteIdNumber'
// import { useEffect } from 'react'
// import { AttachedFile, DetailItem } from '@/types/managementSteel'

export default function FuelAggregationRegistrationView({ isEditMode = false }) {
  const {
    setField,
    form,
    updateItemField,
    removeCheckedItems,
    reset,
    addItem,
    updateMemo,
    toggleCheckAllItems,
    toggleCheckItem,
    setFuelRadioBtn,
  } = useFuelFormStore()

  const { showSnackbar } = useSnackbarStore()

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

  const {
    withEquipmentInfoOptions,
    withEquipmentFetchNextPage,
    withEquipmenthasNextPage,
    withEquipmentFetching,
    withEquipmentLoading,
  } = useDailyReport()

  const {
    WeatherTypeMethodOptions,
    FuelCancel,
    FuelModifyMutation,
    createFuelMutation,
    OilTypeMethodOptions,
    FuelDeleteMutation,
    useFuelHistoryDataQuery,
  } = useFuelAggregation()

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'black' },
      '&:hover fieldset': { borderColor: 'black' },
      '&.Mui-focused fieldset': { borderColor: 'black' },
    },
  }

  // 체크 박스에 활용
  const fuelInfo = form.fuelInfos
  const checkedIds = form.checkedFuelItemIds
  const isAllChecked = fuelInfo.length > 0 && checkedIds.length === fuelInfo.length

  // 상세페이지 로직

  const params = useParams()
  const fuelDetailId = Number(params?.id)

  const { data } = useQuery({
    queryKey: ['FuelAggregationInfo'],
    queryFn: () => FuelDetailService(fuelDetailId),
    enabled: isEditMode && !!fuelDetailId, // 수정 모드일 때만 fetch
  })

  const PROPERTY_NAME_MAP: Record<string, string> = {
    siteName: '현장명',
    processName: '공정명',
    outsourcingCompanyName: '업체명',
    dateFormat: '일자',
    weatherName: '날씨',
    driverName: '기사명',
    equipmentSpecification: '규격',
    vehicleNumber: '차량번호',
    fuelTypeName: '유종',
    fuelAmount: '주유량',
    memo: '비고',
    originalFileName: '파일 이름',
    gasolinePrice: '휘발유',
    dieselPrice: '경유',
    ureaPrice: '요소수',
  }

  const {
    data: materialHistoryList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFuelHistoryDataQuery(fuelDetailId, isEditMode)

  const historyList = useFuelFormStore((state) => state.form.changeHistories)

  const siteIdList = useSiteId() // 훅 실행해서 값 받기

  // const [updatedSiteOptions, setUpdatedSiteOptions] = useState(sitesOptions)

  // useEffect(() => {
  //   if (data && isEditMode) {
  //     const client = data.data

  //     // 기존 siteOptions 복사
  //     const newSiteOptions = [...sitesOptions]

  //     if (client.site) {
  //       const siteName = client.site.name + (client.site.deleted ? ' (삭제됨)' : '')

  //       // 이미 options에 있는지 체크
  //       const exists = newSiteOptions.some((s) => s.id === client.site.id)
  //       if (!exists) {
  //         newSiteOptions.push({
  //           id: client.site.id,
  //           name: siteName,
  //           deleted: client.site.deleted,
  //         })
  //       }
  //     }

  //     // 삭제된 현장 / 일반 현장 분리
  //     const deletedSites = newSiteOptions.filter((s) => s.deleted)
  //     const normalSites = newSiteOptions.filter((s) => !s.deleted && s.id !== 0)

  //     // 최종 옵션 배열 세팅
  //     setUpdatedSiteOptions([
  //       newSiteOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
  //       ...deletedSites,
  //       ...normalSites,
  //     ])

  //     // 선택된 현장 id 세팅
  //     setField('siteId', client.site?.id ?? 0)
  //   } else if (!isEditMode) {
  //     // 등록 모드
  //     setUpdatedSiteOptions(sitesOptions)
  //     setField('siteId', 0)
  //   }
  // }, [data, isEditMode, sitesOptions])

  const [updatedProcessOptions, setUpdatedProcessOptions] = useState(processOptions)

  useEffect(() => {
    if (isEditMode && data) {
      const client = data.data

      const newProcessOptions = [...processOptions]

      if (client.process) {
        const isDeleted = client.process.deleted
        const processName = client.process.name + (isDeleted ? ' (삭제됨)' : '')

        if (!newProcessOptions.some((p) => p.id === client.process.id)) {
          newProcessOptions.push({
            id: client.process.id,
            name: processName,
            deleted: isDeleted,
          })
        }

        if (!form.siteProcessId) {
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
      // 등록 모드에서는 항상 processOptions로 초기화
      setUpdatedProcessOptions(processOptions)
    }
  }, [data, isEditMode, processOptions, setField])

  useEffect(() => {
    if (data && isEditMode === true) {
      const client = data.data

      // // 상세 항목 가공
      const formattedDetails = (client.fuelInfos ?? []).map((item: FuelListInfoData) => ({
        id: item.id,
        outsourcingCompanyId: item.outsourcingCompany?.id ?? 0,
        businessNumber: item.outsourcingCompany?.businessNumber ?? '',
        driverId: item?.driver?.id ?? 0,
        categoryType: item.categoryTypeCode,
        specificationName: item?.equipment?.specification ?? '',
        fuelType: item.fuelTypeCode ?? '',
        fuelAmount: item.fuelAmount ?? '0',
        equipmentId: item?.equipment?.id ?? 0,
        createdAt: item.createdAt ?? '',
        updatedAt: item.updatedAt ?? '',
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

      setField('fuelInfos', formattedDetails)

      // 각 필드에 값 세팅
      setField('siteId', client.site?.id ?? '')
      setField('siteProcessId', client.process?.id ?? '')

      setField('gasolinePrice', client.gasolinePrice ?? 0)
      setField('dieselPrice', client.dieselPrice ?? 0)
      setField('ureaPrice', client.ureaPrice ?? 0)

      setField('siteName', client.site?.name ?? '')
      setField('siteProcessName', client.process?.name ?? '')

      setField('date', client.date ? new Date(client.date) : null)
      setField('weather', client.weatherCode)
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
    if (materialHistoryList?.pages) {
      const allHistories = materialHistoryList.pages.flatMap((page) =>
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
  }, [materialHistoryList, setField])

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

  function validateFuelForm(form: FuelInfo) {
    if (!form.siteId) return '현장명을 선택하세요.'
    if (!form.siteProcessId) return '공정명을 선택하세요.'
    if (form.weather === 'BASE') return '날씨를 선택하세요.'

    // 담당자 유효성 체크
    if (fuelInfo.length > 0) {
      for (const item of fuelInfo) {
        if (!item.outsourcingCompanyId) return '업체명을 선택하세요.'
        if (!item.equipmentId) return '차량번호를 선택하세요.'
        if (!item.specificationName?.trim()) return '규격이 올바르지 않습니다.'
        if (!item.fuelType?.trim()) return '유종을 선택하세요.'
        if (!item.fuelAmount) return '주유량을 입력하세요.'

        if (item.memo.length > 500) {
          return '유류정보의 비고는 500자 이하로 입력해주세요.'
        }
      }
    }

    return null
  }

  const handleFuelSubmit = () => {
    const errorMsg = validateFuelForm(form)
    if (errorMsg) {
      showSnackbar(errorMsg, 'warning')
      return
    }

    if (!form.fuelInfos || form.fuelInfos.length === 0) {
      showSnackbar('유류정보 항목을 1개 이상 입력해주세요.', 'warning')
      return
    }

    if (isEditMode) {
      if (window.confirm('수정하시겠습니까?')) {
        FuelModifyMutation.mutate(fuelDetailId)
      }
    } else {
      createFuelMutation.mutate()
    }
  }

  // 유류의 업체명 삭제 됨 표시

  const [updatedOutCompanyOptions, setUpdatedOutCompanyOptions] = useState(withEquipmentInfoOptions)

  useEffect(() => {
    if (isEditMode && data) {
      const client = data.data
      const newOptions = [...withEquipmentInfoOptions]

      if (client.fuelInfos && Array.isArray(client.fuelInfos)) {
        client.fuelInfos.forEach((fuel: any) => {
          const company = fuel.outsourcingCompany

          if (!company) return

          const isDeleted = company.deleted
          const displayName = company.name + (isDeleted ? ' (삭제됨)' : '')

          // 이미 리스트에 존재하는 경우 → 이름만 수정
          const existingIndex = newOptions.findIndex((opt) => opt.id === company.id)
          if (existingIndex !== -1) {
            newOptions[existingIndex] = {
              ...newOptions[existingIndex],
              name: displayName,
              deleted: isDeleted,
            }
          } else {
            // 없는 경우 새로 추가
            newOptions.push({
              id: company.id,
              name: displayName,
              deleted: isDeleted,
            })
          }
        })
      }

      const deletedCompanies = newOptions.filter((c) => c.deleted)
      const normalCompanies = newOptions.filter((c) => !c.deleted && c.id !== 0)

      setUpdatedOutCompanyOptions([
        newOptions.find((s) => s.id === 0) ?? { id: 0, name: '선택', deleted: false },
        ...deletedCompanies,
        ...normalCompanies,
      ])
    } else if (!isEditMode) {
      // 신규 등록 시 초기화
      setUpdatedOutCompanyOptions(withEquipmentInfoOptions)
    }
  }, [data, isEditMode, withEquipmentInfoOptions])

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<{ [rowId: number]: number }>({})
  const [selectId, setSelectId] = useState(0)

  // const [selectedDriverIds, setSelectedDriverIds] = useState<{ [rowId: number]: number }>({})

  const [driverOptionsByCompany, setDriverOptionsByCompany] = useState<Record<number, any[]>>({})

  // 업체명 id

  // const {
  //   data: fuelDriver,
  //   fetchNextPage: fuelDriverFetchNextPage,
  //   hasNextPage: fuelDriverHasNextPage,
  //   isFetching: fuelDriverIsFetching,
  //   isLoading: fuelDriverLoading,
  // } = useInfiniteQuery({
  //   queryKey: ['FuelDriverInfo', selectedCompanyIds[selectId] || 0, siteIdList],

  //   queryFn: ({ pageParam }) =>
  //     FuelDriverNameScroll({
  //       pageParam,
  //       id: selectedCompanyIds[selectId] || 0,
  //       siteIdList: Number(siteIdList),
  //       size: 200,
  //     }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
  //   },
  //   enabled: !!selectedCompanyIds[selectId],
  // })

  // useEffect(() => {
  //   if (!fuelDriver) return

  //   const options = fuelDriver.pages
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       name: user.name,
  //       deleted: user.deleted,
  //     }))

  //   setDriverOptionsByCompany((prev) => ({
  //     ...prev,
  //     [selectedCompanyIds[selectId]]: [{ id: 0, name: '선택', deleted: false }, , ...options],
  //   }))
  // }, [fuelDriver, selectedCompanyIds, selectId])

  const [selectedCarNumberIds, setSelectedCarNumberIds] = useState<{ [rowId: number]: number }>({})

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
    queryKey: ['FuelEquipmentInfo', selectedCompanyIds[selectId], siteIdList],
    queryFn: ({ pageParam }) =>
      FuelEquipmentNameScroll({
        pageParam,
        id: selectedCompanyIds[selectId] || 0,
        siteIdList: Number(siteIdList),
        size: 200,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!selectedCompanyIds[selectId], // testId가 있을 때만 호출
  })

  // 상세페이지 들어올떄 기사명, 차량번호  데이터 호출

  useEffect(() => {
    if (!fuelEquipment) return

    const options = fuelEquipment.pages
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        specification: user.specification,
        vehicleNumber: user.vehicleNumber,
        category: user.category,
        deleted: user.deleted,
      }))

    setCarNumberOptionsByCompany((prev) => ({
      ...prev,
      [selectedCompanyIds[selectId]]: [
        { id: 0, specification: '', vehicleNumber: '선택', category: '', deleted: false },
        ...options,
      ],
    }))
  }, [fuelEquipment, selectedCompanyIds, selectId])

  const outsourcings = fuelInfo

  useEffect(() => {
    if (!outsourcings.length) return

    outsourcings.forEach(async (row) => {
      const companyId = row.outsourcingCompanyId
      const driverData = row.driverId
      const carNumberId = row.equipmentId

      if (driverOptionsByCompany[companyId] && carNumberOptionsByCompany[companyId]) {
        return
      }

      try {
        const res = await FuelDriverNameScroll({
          pageParam: 0,
          id: companyId,
          siteIdList: Number(siteIdList),
          size: 200,
        })

        if (res === undefined) return

        const options = res?.data?.content?.map((user: any) => ({
          id: user.id,
          name: user.name + (user.deleted ? ' (삭제됨)' : ''),
          deleted: user.deleted,
        }))

        setDriverOptionsByCompany((prev) => {
          const exists = options?.some((opt: any) => opt.id === driverData)

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
          siteIdList: Number(siteIdList),
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
  }, [outsourcings])

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
                disabled={true}
                placeholder="현장명을 입력하세요"
                keyword={form.siteName}
                onChangeKeyword={(newKeyword) => {
                  setField('siteName', newKeyword)

                  // 현장명 지웠을 경우 공정명도 같이 초기화
                  if (newKeyword === '') {
                    setField('siteProcessName', '')
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
                    } else {
                      setField('siteProcessName', '')
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
            {/* <div className="border border-gray-400 px-2 p-2 w-full flex items-center">
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
                disabled
              />
            </div> */}
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
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36 text-[14px] flex items-center border border-gray-400 justify-center bg-gray-300 font-bold text-center">
              일자 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border flex items-center gap-4 border-gray-400 px-2 w-full">
              <CommonDatePicker
                value={form.date}
                onChange={(value) => setField('date', value)}
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              날씨 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <CommonSelect
                fullWidth={true}
                value={form.weather || 'BASE'}
                onChange={(value) => setField('weather', value)}
                options={WeatherTypeMethodOptions}
                disabled
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              휘발유
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <AmountInput
                value={formatNumber(form.gasolinePrice) ?? ''}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  setField('gasolinePrice', numericValue)
                }}
                className=" flex-1"
              />
            </div>
          </div>

          <div className="flex">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              경유
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <AmountInput
                value={formatNumber(form.dieselPrice) ?? ''}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  setField('dieselPrice', numericValue)
                }}
                className=" flex-1"
              />
            </div>
          </div>
          <div className="flex ">
            <label className="w-36  text-[14px] flex items-center border border-gray-400  justify-center bg-gray-300  font-bold text-center">
              요소수
            </label>
            <div className="border border-gray-400 px-2 w-full flex gap-3 items-center p-3">
              <AmountInput
                value={formatNumber(form.ureaPrice) ?? ''}
                onChange={(val) => {
                  const numericValue = unformatNumber(val)
                  setField('ureaPrice', numericValue)
                }}
                className=" flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-10 mb-2">
          <span className="font-bold border-b-2 mb-4">유류정보</span>
          <div className="flex gap-4">
            <CommonButton
              label="삭제"
              className="px-7"
              variant="danger"
              onClick={() => removeCheckedItems('FuelInfo')}
            />
            <CommonButton
              label="추가"
              className="px-7"
              variant="secondary"
              onClick={() => addItem('FuelInfo')}
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
                    onChange={(e) => toggleCheckAllItems('FuelInfo', e.target.checked)}
                    sx={{ color: 'black' }}
                  />
                </TableCell>
                {['업체명', '구분', '차량번호', '규격', '유종', '주유량', '첨부파일', '비고'].map(
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
                      {label === '비고' || label === '첨부파일' ? (
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
                {isEditMode && (
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: '#D1D5DB',
                      border: '1px solid  #9CA3AF',
                      color: 'black',
                      fontWeight: 'bold',
                    }}
                  >
                    등록/수정일
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {fuelInfo.map((m) => (
                <TableRow key={m.id}>
                  {/* 체크박스 */}
                  <TableCell padding="checkbox" sx={{ border: '1px solid  #9CA3AF' }}>
                    <Checkbox
                      checked={checkedIds.includes(m.id)}
                      onChange={(e) => toggleCheckItem('FuelInfo', m.id, e.target.checked)}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonSelect
                      fullWidth
                      value={selectedCompanyIds[m.id] || m.outsourcingCompanyId || 0}
                      onChange={async (value) => {
                        const selectedCompany = updatedOutCompanyOptions.find(
                          (opt) => opt.id === value,
                        )
                        // ✅ 업체 선택 시 — 어떤 업체를 선택하든 전부 초기화
                        setSelectedCompanyIds((prev) => ({
                          ...prev,
                          [m.id]: selectedCompany ? selectedCompany.id : 0,
                        }))

                        setSelectId(m.id)

                        // ✅ 업체 정보 업데이트
                        updateItemField(
                          'FuelInfo',
                          m.id,
                          'outsourcingCompanyId',
                          selectedCompany?.id || null,
                        )

                        updateItemField('FuelInfo', m.id, 'driverId', null)
                        updateItemField('FuelInfo', m.id, 'equipmentId', null)
                        updateItemField('FuelInfo', m.id, 'specificationName', '')
                        updateItemField('FuelInfo', m.id, 'type', '-')

                        setSelectId(m.id)

                        updateItemField(
                          'FuelInfo',
                          m.id,
                          'outsourcingCompanyId',
                          selectedCompany?.id || null,
                        )

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

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <div className="flex items-center gap-4 justify-center">
                      <label className="flex items-center gap-1">
                        <Radio
                          checked={m.categoryType === 'EQUIPMENT'}
                          onChange={() => setFuelRadioBtn(m.id, 'EQUIPMENT')}
                          value="EQUIPMENT"
                          name={`categoryType-${m.id}`} // 각 행별로 고유 그룹
                        />
                        외주
                      </label>

                      <label className="flex items-center gap-1">
                        <Radio
                          checked={m.categoryType === 'CONSTRUCTION'}
                          onChange={() => setFuelRadioBtn(m.id, 'CONSTRUCTION')}
                          value="CONSTRUCTION"
                          name={`categoryType-${m.id}`} // 각 행별로 고유 그룹
                        />
                        장비
                      </label>
                    </div>
                  </TableCell>

                  {/* <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonSelect
                      fullWidth
                      value={selectedDriverIds[m.id] || m.driverId || 0}
                      onChange={async (value) => {
                        const selectedDriver = (
                          driverOptionsByCompany[m.outsourcingCompanyId] ?? []
                        ).find((opt) => opt?.id === value)

                        if (!selectedDriver) return

                        updateItemField('FuelInfo', m.id, 'driverId', selectedDriver.id)
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
                  </TableCell> */}

                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonSelect
                      fullWidth
                      value={selectedCarNumberIds[m.id] || m.equipmentId || 0}
                      onChange={async (value) => {
                        if (value === 0) {
                          updateItemField('FuelInfo', m.id, 'equipmentId', null)
                          updateItemField('FuelInfo', m.id, 'specificationName', '')
                          updateItemField('FuelInfo', m.id, 'type', '-')
                          return
                        }

                        const selectedCarNumber = (
                          carNumberOptionsByCompany[m.outsourcingCompanyId] ?? []
                        ).find((opt) => opt.id === value)

                        if (!selectedCarNumber) return

                        updateItemField('FuelInfo', m.id, 'equipmentId', selectedCarNumber.id)

                        updateItemField(
                          'FuelInfo',
                          m.id,
                          'specificationName',
                          selectedCarNumber.specification || '',
                        )

                        updateItemField(
                          'FuelInfo',
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
                  <TableCell sx={{ border: '1px solid  #9CA3AF', width: '150px' }}>
                    <CommonInput
                      placeholder="자동 입력"
                      value={m.specificationName ?? ''}
                      onChange={(value) =>
                        updateItemField('FuelInfo', m.id, 'specificationName', value)
                      }
                      disabled={true}
                      className=" flex-1"
                    />
                  </TableCell>
                  {/* 유종 */}
                  <TableCell sx={{ border: '1px solid  #9CA3AF' }}>
                    <CommonSelect
                      fullWidth={true}
                      value={m.fuelType || 'BASE'}
                      onChange={async (value) => {
                        updateItemField('FuelInfo', m.id, 'fuelType', value)
                      }}
                      options={OilTypeMethodOptions}
                    />
                  </TableCell>
                  {/* 주유량 */}
                  <TableCell align="center" sx={{ border: '1px solid #9CA3AF', width: '120px' }}>
                    <TextField
                      size="small"
                      placeholder="'-'없이 숫자만 입력"
                      value={formatNumber(m.fuelAmount)}
                      onChange={(e) => {
                        const formatted = unformatNumber(e.target.value)
                        updateItemField('FuelInfo', m.id, 'fuelAmount', formatted)
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
                          updateItemField('FuelInfo', m.id, 'files', newFiles.slice(0, 1))
                        }}
                        uploadTarget="WORK_DAILY_REPORT"
                      />
                    </div>
                  </TableCell>
                  {/* 비고 */}
                  <TableCell align="center" sx={{ border: '1px solid  #9CA3AF' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="500자 이하 텍스트 입력"
                      value={m.memo}
                      onChange={(e) => updateItemField('FuelInfo', m.id, 'memo', e.target.value)}
                      variant="outlined"
                      sx={textFieldStyle}
                    />
                  </TableCell>
                  {isEditMode && (
                    <TableCell align="center" sx={{ border: '1px solid  #9CA3AF', width: '260px' }}>
                      <CommonInput
                        placeholder="자동 입력"
                        value={m.modifyDate ?? ''}
                        onChange={(value) => updateItemField('FuelInfo', m.id, 'modifyDate', value)}
                        disabled={true}
                        className=" flex-1"
                      />
                    </TableCell>
                  )}
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
        {isEditMode && (
          <CommonButton
            label="삭제"
            variant="danger"
            onClick={() => {
              FuelDeleteMutation.mutate({
                fuelAggregationIds: [fuelDetailId],
              })
            }}
            className="px-3"
          />
        )}

        <CommonButton label="취소" variant="reset" className="px-10" onClick={FuelCancel} />

        <CommonButton
          label={isEditMode ? '+ 수정' : '+ 등록'}
          className="px-10 font-bold"
          variant="secondary"
          onClick={handleFuelSubmit}
        />
      </div>
    </>
  )
}
