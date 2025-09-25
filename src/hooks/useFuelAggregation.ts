import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getTodayDateString } from '@/utils/formatters'
import {
  CreateFuelInfo,
  FuelDriverNameScroll,
  FuelEquipmentNameScroll,
  FuelInfoHistoryService,
  FuelOilTypeService,
  FuelWeatherTypeService,
  ModifyFuel,
} from '@/services/fuelAggregation/fuelAggregationRegistrationService'
import { useFuelFormStore, useFuelSearchStore } from '@/stores/fuelAggregationStore'
import { useOutSourcingClientId } from './useOutsourcingClientIdNumber'
import {
  FuelAggregationInfoService,
  FuelAggregationRemoveService,
  FuelCarNumberTypeService,
} from '@/services/fuelAggregation/fuelAggregationService'

export function useFuelAggregation() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useFuelFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: weatherTypeInfoId } = useQuery({
    queryKey: ['WeatherTypeInfo'],
    queryFn: FuelWeatherTypeService,
  })

  const WeatherTypeMethodOptions = [
    { code: 'BASE', name: '선택' },
    ...(weatherTypeInfoId?.data ?? []),
  ]

  // 기름 종류 셀렉트

  const { data: oilTypeInfoId } = useQuery({
    queryKey: ['OilTypeInfo'],
    queryFn: FuelOilTypeService,
  })

  const OilTypeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(oilTypeInfoId?.data ?? [])]

  // 기사명 무한 스클로

  // 업체명 id
  const clientId = useOutSourcingClientId()

  const [driverSearch, setDriverSearch] = useState('')

  const {
    data: fuelDriver,
    fetchNextPage: fuelDriverFetchNextPage,
    hasNextPage: fuelDriverHasNextPage,
    isFetching: fuelDriverIsFetching,
    isLoading: fuelDriverLoading,
  } = useInfiniteQuery({
    queryKey: ['FuelDriverInfo', driverSearch, clientId],
    queryFn: ({ pageParam }) =>
      FuelDriverNameScroll({
        pageParam,
        id: clientId || 0,
        keyword: driverSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!clientId,
  })

  const fuelDriverOptions = useMemo(() => {
    const defaultOption = { id: 0, name: '선택' }
    const options = (fuelDriver?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [fuelDriver])

  //차량번호 & 규격 무한 스크롤

  const [equipmentSearch, setEquipmentSearch] = useState('')

  const {
    data: fuelEquipment,
    fetchNextPage: fuelEquipmentFetchNextPage,
    hasNextPage: fuelEquipmentHasNextPage,
    isFetching: fuelEquipmentIsFetching,
    isLoading: fuelEquipmentLoading,
  } = useInfiniteQuery({
    queryKey: ['FuelEquipmentInfo', equipmentSearch, clientId],
    queryFn: ({ pageParam }) =>
      FuelEquipmentNameScroll({
        pageParam,
        id: clientId || 0,
        keyword: equipmentSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!clientId,
  })

  const fuelEquipmentOptions = useMemo(() => {
    const defaultOption = {
      id: 0,
      specification: '',
      vehicleNumber: '선택',
      category: '',
    }
    const options = (fuelEquipment?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        specification: user.specification,
        vehicleNumber: user.vehicleNumber,
        category: user.category,
      }))

    return [defaultOption, ...options]
  }, [fuelEquipment])

  // 유류집계 관리등록
  const createFuelMutation = useMutation({
    mutationFn: CreateFuelInfo,
    onSuccess: () => {
      showSnackbar('유류집계가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['FuelAggregationInfo'] })
      reset()
      router.push('/fuelAggregation')
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('유류집계 등록에 실패했습니다.', 'error')
      }
    },
  })

  // 유류집계 관리 조회

  const search = useFuelSearchStore((state) => state.search)

  const pathName = usePathname()

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const FuelListQuery = useQuery({
    queryKey: [
      'FuelAggregationInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName,
        processName: search.processName,
        fuelTypes: search.fuelTypes,
        outsourcingCompanyName: search.outsourcingCompanyName,
        vehicleNumber: search.vehicleNumber,
        dateStartDate: getTodayDateString(search.dateStartDate),
        dateEndDate: getTodayDateString(search.dateEndDate),
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '오래된순'
            ? 'id,asc'
            : 'username,asc',
      }

      const filteredParams = Object.fromEntries(
        Object.entries(rawParams).filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== '' &&
            !(typeof value === 'number' && isNaN(value)),
        ),
      )

      return FuelAggregationInfoService(filteredParams)
    },
    enabled: pathName === '/fuelAggregation', // 경로 체크
  })

  //유류 데이터 삭제!
  const FuelDeleteMutation = useMutation({
    mutationFn: ({ fuelAggregationIds }: { fuelAggregationIds: number[] }) =>
      FuelAggregationRemoveService(fuelAggregationIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('유류집계가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['FuelAggregationInfo'] })
      }
      router.push('/fuelAggregation')
    },

    onError: () => {
      showSnackbar('유류집계 삭제에 실패했습니다.', 'error')
    },
  })

  // 유류 수정

  const FuelModifyMutation = useMutation({
    mutationFn: (fuelId: number) => ModifyFuel(fuelId),

    onSuccess: () => {
      showSnackbar('유류집계가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['FuelAggregationInfo'] })
      // reset()
      // router.push('/fuelAggregation')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('유류집계 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 유류쪽 !! 수정이력 조회 쿼리
  const useFuelHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['FuelAggregationInfo', historyId],
      queryFn: ({ pageParam = 0 }) => FuelInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  const FuelCancel = () => {
    router.push('/fuelAggregation')
  }

  //차량번호 & 규격 무한 스크롤

  const [carNumberSearch, setCarNumberSearch] = useState('')

  const {
    data: carNumberSearchData,
    fetchNextPage: carNumberFetchNextPage,
    hasNextPage: carNumberHasNextPage,
    isFetching: carNumberIsFetching,
    isLoading: carNumberLoading,
  } = useInfiniteQuery({
    queryKey: ['CarNumberInfo', carNumberSearch],
    queryFn: ({ pageParam }) =>
      FuelCarNumberTypeService({
        pageParam,
        keyword: carNumberSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
  })

  const carNumberOptions = useMemo(() => {
    const defaultOption = {
      id: 0,
      specification: '',
      vehicleNumber: '선택',
    }

    const options = (carNumberSearchData?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        specification: user.specification,
        vehicleNumber: user.vehicleNumber,
      }))

    // vehicleNumber 기준 중복 제거
    const uniqueOptions = options.filter(
      (item, index, self) =>
        index === self.findIndex((v) => v.vehicleNumber === item.vehicleNumber),
    )

    return [defaultOption, ...uniqueOptions]
  }, [carNumberSearchData])

  return {
    createFuelMutation,
    FuelModifyMutation,

    FuelDeleteMutation,

    FuelListQuery,
    FuelCancel,
    WeatherTypeMethodOptions,
    OilTypeMethodOptions,

    useFuelHistoryDataQuery,

    // 기사 정보
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

    // 조회에서 사용하는 차량번호 조회
    carNumberOptions,
    setCarNumberSearch,
    carNumberFetchNextPage,
    carNumberHasNextPage,
    carNumberIsFetching,
    carNumberLoading,
  }
}
