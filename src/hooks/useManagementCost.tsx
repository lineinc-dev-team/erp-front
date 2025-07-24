import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import {
  CreateManagementCost,
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
  }, [])

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
        siteId: search.siteId,
        siteProcessId: search.siteProcessId,
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
    data: orderPersonInfo,
    // fetchNextPage,
    // hasNextPage,
    // isFetching,
    // isLoading,
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
    const defaultOption = { label: '선택', value: '0' }
    const options = (orderPersonInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.name,
        value: user.id,
      }))

    return [defaultOption, ...options]
  }, [orderPersonInfo])

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

  const {
    data: processInfo,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['processInfo', processSearch],
    queryFn: ({ pageParam }) => SitesProcessNameScroll({ pageParam, keyword: processSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const processOptions = useMemo(() => {
    const defaultOption = { label: '선택', value: '0' }
    const options = (processInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.name,
        value: user.id,
      }))

    return [defaultOption, ...options]
  }, [processInfo])

  return {
    createCostMutation,
    CostListQuery,
    CostDeleteMutation,

    // 현장명 무한 스크롤
    useSitesPersonInfiniteScroll,
    setSitesSearch,
    sitesOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,

    // 공정명

    useProcessNameInfiniteScroll,
    setProcessSearch,
    processOptions,
  }
}
