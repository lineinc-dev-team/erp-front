import {
  CreateSiteManament,
  ModifySiteManagement,
  SiteManagementInfoHistoryService,
} from '@/services/siteManament/siteManamentRegistrationService'
import {
  SiteManagementInfoService,
  SiteManamentRemoveService,
} from '@/services/siteManament/siteManamentService'
import { OrderingPersonScroll, SiteIdInfoService } from '@/services/sites/siteRegistrationService'
import { useSiteManamentFormStore, useSiteManamentSearchStore } from '@/stores/siteManamentStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { getTodayDateString } from '@/utils/formatters'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

export default function useSiteManament() {
  const { showSnackbar } = useSnackbarStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 리셋하기위한 폼
  const resetForm = useSiteManamentFormStore((state) => state.reset)

  // 현장 조회 데이터
  // 발주처 조회
  const search = useSiteManamentSearchStore((state) => state.search)

  const pathName = usePathname()
  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const SiteManamentListQuery = useQuery({
    queryKey: [
      'siteManaInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName === '선택' ? undefined : search.siteName,
        siteProcessName: search.siteProcessName,
        startYearMonth: getTodayDateString(search.startYearMonth),
        endYearMonth: getTodayDateString(search.endYearMonth),

        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '오래된순'
            ? 'id,asc'
            : 'name,desc',
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

      return SiteManagementInfoService(filteredParams)
    },
    enabled: pathName === '/siteManagement', // 경로 체크
  })

  // 현장 관리비 !! 등록
  const createSiteManamentMutation = useMutation({
    mutationFn: CreateSiteManament,
    onSuccess: () => {
      showSnackbar('현장/본사 관리비가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['siteManaInfo'] })
      resetForm()
      router.push('/siteManagement')
    },
    onError: () => {
      showSnackbar('현장/본사 관리비 등록에 실패했습니다.', 'error')
    },
  })

  // 현장 삭제!
  const SiteManamentDeleteMutation = useMutation({
    mutationFn: ({ siteManagementCostIds }: { siteManagementCostIds: number[] }) =>
      SiteManamentRemoveService(siteManagementCostIds),

    onSuccess: () => {
      showSnackbar('현장/본사 관리비가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['siteManaInfo'] })
    },

    onError: () => {
      showSnackbar('현장/본사 관리비 삭제에 실패했습니다.', 'error')
    },
  })

  // 현장 수정
  const ModifySiteManamentMutation = useMutation({
    mutationFn: (siteId: number) => ModifySiteManagement(siteId),

    onSuccess: () => {
      showSnackbar('현장/본사 관리비가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['siteManaInfo'] })
    },

    onError: () => {
      showSnackbar('현장/본사 관리비 수정에 실패했습니다.', 'error')
    },
  })

  // 발주처 담당자들 발주처에 리스트에 값이 있어야 함
  // 발주처 본사 담당자
  // 조회에서 이름 검색 스크롤
  const useOrderingPersonInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['orderInfo', keyword],
      queryFn: ({ pageParam }) => OrderingPersonScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const useOrderingNameListInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['orderInfo', keyword],
      queryFn: ({ pageParam }) => OrderingPersonScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1
        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const { data: siteTypeId } = useQuery({
    queryKey: ['siteTypeInfo'],
    queryFn: SiteIdInfoService,
  })

  const siteTypeOptions = [{ code: 'BASE', name: '선택' }, ...(siteTypeId?.data ?? [])]

  const useSiteManagementHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['siteManaInfo', historyId],
      queryFn: ({ pageParam = 0 }) =>
        SiteManagementInfoHistoryService(historyId, pageParam, 4, 'updatedAt,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  const {
    data: orderPersonInfo,
    fetchNextPage: orderPersonFetchNextPage,
    hasNextPage: orderPersonHasNextPage,
    isFetching: orderPersonIsFetching,
    isLoading: orderPersonIsLoading,
  } = useInfiniteQuery({
    queryKey: ['orderInfo'],
    queryFn: ({ pageParam = 0 }) => OrderingPersonScroll({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const orderOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택', deleted: false }
    const options = (orderPersonInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        deleted: false,
      }))

    return [defaultOption, ...options]
  }, [orderPersonInfo])

  return {
    createSiteManamentMutation,
    SiteManamentListQuery,

    SiteManamentDeleteMutation,

    ModifySiteManamentMutation,

    siteTypeOptions,

    //발주처 담당자 관련
    useOrderingPersonInfiniteScroll,
    useOrderingNameListInfiniteScroll,

    orderPersonFetchNextPage,
    orderPersonHasNextPage,
    orderPersonIsFetching,
    orderPersonIsLoading,
    orderOptions,

    // 현장 수정이력조회
    useSiteManagementHistoryDataQuery,
  }
}
