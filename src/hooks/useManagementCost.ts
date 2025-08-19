import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import {
  CreateManagementCost,
  ModifyCostManagement,
  SitesPersonScroll,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'
import { useCostSearchStore, useManagementCostFormStore } from '@/stores/managementCostsStore'
import { useEffect, useMemo, useState } from 'react'
import {
  CostRemoveService,
  ManagementCostInfoService,
} from '@/services/managementCost/managementCostService'
import { getTodayDateString } from '@/utils/formatters'
import { useSiteSearchStore } from '@/stores/siteStore'

export function useManagementCost() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useManagementCostFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

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

  useEffect(() => {
    if (search.currentPage !== 1) {
      search.setField('currentPage', 1)
    }
  }, [search])

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
        name: search.name,
        processName: search.processName,
        itemType: search.itemType === '선택' ? '' : search.itemType,
        itemDescription: search.itemDescription,
        paymentStartDate: getTodayDateString(search.paymentStartDate),
        paymentEndDate: getTodayDateString(search.paymentEndDate),
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '날짜순'
            ? 'paymentDate.desc'
            : 'id.asc',
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

      console.log('검색 파라미터', filteredParams)

      return ManagementCostInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
    enabled: pathName === '/login', // 경로 체크
  })

  //관리비 삭제!
  const CostDeleteMutation = useMutation({
    mutationFn: ({ managementCostIds }: { managementCostIds: number[] }) =>
      CostRemoveService(managementCostIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('관리비가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['CostInfo'] })
      }
    },

    onError: () => {
      showSnackbar('관리비 삭제에 실패했습니다.', 'error')
    },
  })

  // 관리비 수정

  const CostModifyMutation = useMutation({
    mutationFn: (costId: number) => ModifyCostManagement(costId),

    onSuccess: () => {
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('관리비가 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['CostInfo'] })
        reset()
        router.push('/managementCost')
      }
    },

    onError: () => {
      showSnackbar('관리비 수정에 실패했습니다.', 'error')
    },
  })

  // 현장명데이터를 가져옴 무한 스크롤

  const useSitesPersonInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['siteInfo', keyword],
      queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const [sitesSearch, setSitesSearch] = useState('')

  const {
    data: siteNameInfo,
    fetchNextPage: siteNameFetchNextPage,
    hasNextPage: siteNamehasNextPage,
    isFetching: siteNameFetching,
    isLoading: siteNameLoading,
  } = useInfiniteQuery({
    queryKey: ['siteInfo', sitesSearch],
    queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword: sitesSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const sitesOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택' }
    const options = (siteNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [siteNameInfo])

  // 공정명

  const useProcessNameInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['processInfo', keyword],
      queryFn: ({ pageParam }) => SitesProcessNameScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const [processSearch, setProcessSearch] = useState('')

  const siteSearch = useSiteSearchStore((state) => state.search)

  const {
    data: processInfo,
    fetchNextPage: processInfoFetchNextPage,
    hasNextPage: processInfoHasNextPage,
    isFetching: processInfoIsFetching,
    isLoading: processInfoLoading,
  } = useInfiniteQuery({
    queryKey: ['processInfo', processSearch, siteSearch.nameId],
    queryFn: ({ pageParam }) =>
      SitesProcessNameScroll({
        pageParam,
        siteId: siteSearch.nameId,
        keyword: processSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!siteSearch.nameId,
  })

  const processOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택' }
    const options = (processInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [processInfo])

  return {
    createCostMutation,
    CostListQuery,
    CostDeleteMutation,
    CostModifyMutation,

    // 현장명 무한 스크롤
    useSitesPersonInfiniteScroll,
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명

    useProcessNameInfiniteScroll,
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  }
}
