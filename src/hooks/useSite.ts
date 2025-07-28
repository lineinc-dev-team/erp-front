import {
  CreateSiteInfo,
  ModifySiteService,
  OrderingPersonScroll,
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

  useEffect(() => {
    if (search.currentPage !== 1) {
      search.setField('currentPage', 1)
    }
  }, [search])

  // useQuery 쪽 수정
  const SiteListQuery = useQuery({
    queryKey: [
      'ClientInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        name: search.name,
        type: search.type === '선택' ? '' : search.type,
        processName: search.processName,
        city: search.city,
        district: search.district,
        processStatus: search.ProcessStatus.length > 0 ? search.ProcessStatus : undefined,
        clientCompanyName: search.clientCompanyName,
        createdBy: search.createdBy,
        startDate: getTodayDateString(search.startDate),
        endDate: getTodayDateString(search.endDate),
        createdStartDate: getTodayDateString(search.createdStartDate),
        createdEndDate: getTodayDateString(search.createdEndDate),
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '날짜순'
            ? 'createdAt.desc'
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

      return SiteInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
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
        queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
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
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('현장이 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['siteInfo'] })
        resetForm()
        router.push('/sites')
      }
    },

    onError: () => {
      showSnackbar(' 현장 수정에 실패했습니다.', 'error')
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
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
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
    const defaultOption = { label: '선택', value: '0' }
    const options = (orderPersonInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.name,
        value: user.id,
      }))

    return [defaultOption, ...options]
  }, [orderPersonInfo])

  return {
    createSiteMutation,
    SiteListQuery,
    SiteDeleteMutation,
    ModifySiteMutation,

    //발주처 담당자 관련
    useOrderingPersonInfiniteScroll,
    orderSearch,
    setOrderSearch,
    orderOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  }
}
