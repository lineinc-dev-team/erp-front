import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import {
  CostInfoHistoryService,
  CostNameTypeService,
  CreateManagementCost,
  GetPersonCostInfoService,
  ModifyCostManagement,
} from '@/services/managementCost/managementCostRegistrationService'
import { useCostSearchStore, useManagementCostFormStore } from '@/stores/managementCostsStore'
import { useEffect, useMemo, useState } from 'react'
import {
  CostRemoveService,
  GetTypeCostDesInfoService,
  ManagementCostInfoService,
} from '@/services/managementCost/managementCostService'
import { getTodayDateString } from '@/utils/formatters'
import { GetCompanyNameInfoService } from '@/services/outsourcingContract/outsourcingContractRegistrationService'

export function useManagementCost() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useManagementCostFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 관리비 등록에서 항목 타입 조회

  const { data: costNameTypeInfoId } = useQuery({
    queryKey: ['costNameTypeInfo'],
    queryFn: CostNameTypeService,
  })

  const CostNameTypeMethodOptions = [
    { code: 'BASE', name: '선택' },
    ...(costNameTypeInfoId?.data ?? []),
  ]

  // 관리비 등록
  const createCostMutation = useMutation({
    mutationFn: CreateManagementCost,
    onSuccess: () => {
      showSnackbar('관리비가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['costInfo'] })
      reset()
      router.push('/managementCost')
    },
    onError: () => {
      showSnackbar('관리비 등록에 실패했습니다.', 'error')
    },
  })

  // 관리비 조회

  const search = useCostSearchStore((state) => state.search)

  const pathName = usePathname()

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const CostListQuery = useQuery({
    queryKey: [
      'CostInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName === '선택' ? null : search.siteName,
        processName: search.processName === '선택' ? null : search.processName,
        itemType: search.itemType === '선택' ? null : search.itemType,
        itemTypeDescription:
          search.itemTypeDescription === '선택' ? null : search.itemTypeDescription,
        outsourcingCompanyName:
          search.outsourcingCompanyName === '선택' ? null : search.outsourcingCompanyName,
        paymentStartDate: getTodayDateString(search.paymentStartDate),
        paymentEndDate: getTodayDateString(search.paymentEndDate),
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '오래된순'
            ? 'id,asc'
            : 'outsourcingCompany.name,desc',
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

      return ManagementCostInfoService(filteredParams)
    },
    enabled: pathName === '/managementCost', // 경로 체크
  })

  //관리비 삭제!
  const CostDeleteMutation = useMutation({
    mutationFn: ({ managementCostIds }: { managementCostIds: number[] }) =>
      CostRemoveService(managementCostIds),

    onSuccess: () => {
      showSnackbar('관리비가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['CostInfo'] })
    },

    onError: () => {
      showSnackbar('관리비 삭제에 실패했습니다.', 'error')
    },
  })

  // 관리비 수정

  const CostModifyMutation = useMutation({
    mutationFn: (costId: number) => ModifyCostManagement(costId),

    onSuccess: () => {
      showSnackbar('관리비가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['CostInfo'] })
      // reset()
      // router.push('/managementCost')
    },

    onError: () => {
      showSnackbar('관리비 수정에 실패했습니다.', 'error')
    },
  })

  // 업체명에 관한 무한 스크롤
  const [CompanySearch, setCompanySearch] = useState('')

  const {
    data: comPanyNameInfo,
    fetchNextPage: comPanyNameFetchNextPage,
    hasNextPage: comPanyNamehasNextPage,
    isFetching: comPanyNameFetching,
    isLoading: comPanyNameLoading,
  } = useInfiniteQuery({
    queryKey: ['compnayInfo', CompanySearch],
    queryFn: ({ pageParam }) => GetCompanyNameInfoService({ pageParam, keyword: CompanySearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const companyOptions = useMemo(() => {
    const defaultOption = { id: -1, name: '선택', businessNumber: '', deleted: false }
    const options = (comPanyNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        businessNumber: user.businessNumber,
        ceoName: user.ceoName,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountHolder: user.accountHolder,
        deleted: false,
      }))

    return [defaultOption, ...options]
  }, [comPanyNameInfo])

  // 항목이 기타일 시 보여주는 설명 쿼리

  const [CostItemDesSearch, setCostItemDesSearch] = useState('')

  const {
    data: CostItemDesInfo,
    fetchNextPage: CostItemDesFetchNextPage,
    hasNextPage: CostItemDeshasNextPage,
    isFetching: CostItemDesFetching,
    isLoading: CostItemDesLoading,
  } = useInfiniteQuery({
    queryKey: ['costDESInfo', CostItemDesSearch],
    queryFn: ({ pageParam }) =>
      GetTypeCostDesInfoService({ pageParam, keyword: CostItemDesSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const costDesOptions = useMemo(() => {
    const defaultOptions = [{ id: 0, itemTypeDescription: '선택' }]

    const options = (CostItemDesInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        itemTypeDescription: user.itemTypeDescription,
      }))

    return [...defaultOptions, ...options]
  }, [CostItemDesInfo])

  // 식대에서 인력 조회

  const [PersonSearch, setPersonSearch] = useState('')

  const {
    data: PersonSearchInfo,
    fetchNextPage: PersonSearchFetchNextPage,
    hasNextPage: PersonSearchhasNextPage,
    isFetching: PersonSearchFetching,
    isLoading: PersonSearchLoading,
  } = useInfiniteQuery({
    queryKey: ['personInfo', PersonSearch],
    queryFn: ({ pageParam }) => GetPersonCostInfoService({ pageParam, keyword: PersonSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const personDataOptions = useMemo(() => {
    const defaultOptions = [{ id: 0, name: '선택' }]

    const options = (PersonSearchInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [...defaultOptions, ...options]
  }, [PersonSearchInfo])

  const useCostHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['CostHistoryList', historyId],
      queryFn: ({ pageParam = 0 }) => CostInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  const costCancel = () => {
    router.push('/managementCost')
  }

  return {
    CostNameTypeMethodOptions,
    costCancel,
    useCostHistoryDataQuery,

    createCostMutation,
    CostListQuery,
    CostDeleteMutation,
    CostModifyMutation,

    // 업체명
    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,

    // 조회 시 항목의 기타 설명
    setCostItemDesSearch,
    costDesOptions,
    CostItemDesFetchNextPage,
    CostItemDeshasNextPage,
    CostItemDesFetching,
    CostItemDesLoading,

    // 인력 데이터 조회
    setPersonSearch,
    personDataOptions,
    PersonSearchFetchNextPage,
    PersonSearchhasNextPage,
    PersonSearchFetching,
    PersonSearchLoading,
  }
}
