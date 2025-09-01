import {
  CreateSiteInfo,
  ModifySiteService,
  OrderingPersonScroll,
  SiteIdInfoService,
  SiteInfoHistoryService,
} from '@/services/sites/siteRegistrationService'
import { SiteInfoService, SiteRemoveService } from '@/services/sites/siteService'
import { useSiteFormStore, useSiteSearchStore } from '@/stores/siteStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { getTodayDateString } from '@/utils/formatters'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function useSite() {
  const { showSnackbar } = useSnackbarStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 리셋하기위한 폼
  const resetForm = useSiteFormStore((state) => state.resetForm)

  // 현장 조회 데이터
  // 발주처 조회
  const search = useSiteSearchStore((state) => state.search)

  const pathName = usePathname()
  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const SiteListQuery = useQuery({
    queryKey: [
      'siteInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        name: search.name || '',
        type: search.type === '선택' ? '' : search.type,
        processName: search.processName || '',
        city: search.city || '',
        district: search.district || '',
        processStatuses: search.processStatuses.length > 0 ? search.processStatuses : undefined,
        clientCompanyName: search.clientCompanyName || '',
        createdBy: search.createdBy || '',
        startDate: getTodayDateString(search.startDate),
        endDate: getTodayDateString(search.endDate),
        createdStartDate: getTodayDateString(search.createdStartDate),
        createdEndDate: getTodayDateString(search.createdEndDate),
        managerName: search.managerName || '',
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

      return SiteInfoService(filteredParams)
    },
    enabled: pathName === '/sites', // 경로 체크
  })

  // 현장!! 등록
  const createSiteMutation = useMutation({
    mutationFn: CreateSiteInfo,
    onSuccess: () => {
      showSnackbar('현장이 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['siteInfo'] })
      resetForm()
      router.push('/sites')
    },
    onError: () => {
      showSnackbar('현장 등록이 실패했습니다.', 'error')
    },
  })

  // 현장 삭제!
  const SiteDeleteMutation = useMutation({
    mutationFn: ({ siteIds }: { siteIds: number[] }) => SiteRemoveService(siteIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('현장이 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['siteInfo'] })
      }
    },

    onError: () => {
      showSnackbar(' 현장 삭제에 실패했습니다.', 'error')
    },
  })

  // 현장 수정
  const ModifySiteMutation = useMutation({
    mutationFn: (siteModifyId: number) => ModifySiteService(siteModifyId),

    onSuccess: () => {
      showSnackbar('현장이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['siteInfo'] })
      resetForm()
      router.push('/sites')
    },

    onError: () => {
      showSnackbar('현장 수정에 실패했습니다.', 'error')
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

  const [orderSearch, setOrderSearch] = useState('')

  const {
    data: orderPersonInfo,
    fetchNextPage: orderPersonFetchNextPage,
    hasNextPage: orderPersonHasNextPage,
    isFetching: orderPersonIsFetching,
    isLoading: orderPersonIsLoading,
  } = useInfiniteQuery({
    queryKey: ['orderInfo', orderSearch],
    queryFn: ({ pageParam }) => OrderingPersonScroll({ pageParam, keyword: orderSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const orderOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택' }
    const options = (orderPersonInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [orderPersonInfo])

  const { data: siteTypeId } = useQuery({
    queryKey: ['siteTypeInfo'],
    queryFn: SiteIdInfoService,
  })

  const siteTypeOptions = [{ code: 'BASE', name: '선택' }, ...(siteTypeId?.data ?? [])]

  const useSiteHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['SiteHistoryList', historyId],
      queryFn: ({ pageParam = 0 }) =>
        SiteInfoHistoryService(historyId, pageParam, 4, 'updatedAt,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  return {
    createSiteMutation,
    SiteListQuery,
    SiteDeleteMutation,
    ModifySiteMutation,
    siteTypeOptions,

    //발주처 담당자 관련
    useOrderingPersonInfiniteScroll,
    orderSearch,
    setOrderSearch,
    orderOptions,
    orderPersonFetchNextPage,
    orderPersonHasNextPage,
    orderPersonIsFetching,
    orderPersonIsLoading,

    // 현장 수정이력조회
    useSiteHistoryDataQuery,
  }
}
