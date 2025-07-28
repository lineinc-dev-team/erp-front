import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import {
  CreateManagementSteel,
  ModifySteelManagement,
} from '@/services/managementSteel/managementSteelRegistrationService'
import { useManagementSteelFormStore, useSteelSearchStore } from '@/stores/managementSteelStore'
import {
  ManagementSteelInfoService,
  SteelApproveService,
  SteelReleaseService,
  SteelRemoveService,
} from '@/services/managementSteel/managementSteelService'
import { useEffect, useMemo, useState } from 'react'
import { getTodayDateString } from '@/utils/formatters'
import {
  SitesPersonScroll,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'

export function useManagementSteel() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useManagementSteelFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 강재 관리등록
  const createSteelMutation = useMutation({
    mutationFn: CreateManagementSteel,
    onSuccess: () => {
      showSnackbar('강재관리가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['steelInfo'] })
      reset()
      router.push('/managementSteel')
    },
    onError: () => {
      showSnackbar('강재관리 등록에 실패했습니다.', 'error')
    },
  })

  // 강재 관리 조회

  const search = useSteelSearchStore((state) => state.search)

  const pathName = usePathname()

  useEffect(() => {
    if (search.currentPage !== 1) {
      search.setField('currentPage', 1)
    }
  }, [])

  // useQuery 쪽 수정
  const SteelListQuery = useQuery({
    queryKey: [
      'SteelInfo',
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
        itemName: search.itemName,
        type: search.type === '선택' ? '' : search.type,
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

      return ManagementSteelInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
  })

  //강재데이터 삭제!
  const SteelDeleteMutation = useMutation({
    mutationFn: ({ steelManagementIds }: { steelManagementIds: number[] }) =>
      SteelRemoveService(steelManagementIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('강재 관리가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
      }
    },

    onError: () => {
      showSnackbar('강재 관리 삭제에 실패했습니다.', 'error')
    },
  })

  //강재데이터 승인!
  const SteelApproveMutation = useMutation({
    mutationFn: ({ steelManagementIds }: { steelManagementIds: number[] }) =>
      SteelApproveService(steelManagementIds),

    onSuccess: () => {
      if (window.confirm('정말 승인 하시겠습니까?')) {
        showSnackbar('강재 관리가 승인되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
      }
    },

    onError: () => {
      showSnackbar('강재 관리 승인에 실패했습니다.', 'error')
    },
  })

  //강재데이터 반출!
  const SteelReleaseMutation = useMutation({
    mutationFn: ({ steelManagementIds }: { steelManagementIds: number[] }) =>
      SteelReleaseService(steelManagementIds),

    onSuccess: () => {
      if (window.confirm('정말 반출 하시겠습니까?')) {
        showSnackbar('강재 관리가 반출되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
      }
    },

    onError: () => {
      showSnackbar('강재 관리 반출에 실패했습니다.', 'error')
    },
  })

  //   // 발주처 수정

  const SteelModifyMutation = useMutation({
    mutationFn: (SteelId: number) => ModifySteelManagement(SteelId),

    onSuccess: () => {
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('강재수불부가 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
        reset()
        router.push('/managementSteel')
      }
    },

    onError: () => {
      showSnackbar('강재수불부 수정에 실패했습니다.', 'error')
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
    createSteelMutation,
    SteelDeleteMutation,
    SteelApproveMutation,
    SteelListQuery,
    SteelReleaseMutation,
    SteelModifyMutation,

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
