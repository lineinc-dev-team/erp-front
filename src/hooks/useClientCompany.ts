import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import { useOrderingFormStore, useOrderingSearchStore } from '@/stores/orderingStore'
import {
  CLientCompanyInfoHistoryService,
  CreateClientCompany,
  ModifyClientCompany,
  OrderingInfoNameScroll,
  PayIdInfoService,
} from '@/services/ordering/orderingRegistrationService'
import { ClientCompanyInfoService, ClientRemoveService } from '@/services/ordering/orderingService'
import { useEffect, useMemo, useState } from 'react'
import { getTodayDateString } from '@/utils/formatters'

export function useClientCompany() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useOrderingFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 발주처 조회
  const search = useOrderingSearchStore((state) => state.search)
  const pathName = usePathname()
  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const ClientQuery = useQuery({
    queryKey: [
      'ClientInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort /* 필요한 상태들 추가 */,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        name: search.name,
        businessNumber: search.businessNumber,
        ceoName: search.ceoName,
        landlineNumber: search.landlineNumber,
        contactName: search.contactName,
        email: search.email,
        userName: search.userName,
        createdStartDate: getTodayDateString(search.startDate),
        createdEndDate: getTodayDateString(search.endDate),
        isActive:
          search.isActive === '사용' ? true : search.isActive === '미사용' ? false : undefined,
        page: search.currentPage - 1, // 항상 현재 페이지에 맞춤
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '오래된순'
            ? 'id.asc'
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

      return ClientCompanyInfoService(filteredParams)
    },
    enabled: pathName === '/ordering', // 경로 체크
  })

  // 발주처 등록
  const createClientMutation = useMutation({
    mutationFn: CreateClientCompany,
    onSuccess: () => {
      showSnackbar('발주처가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
      reset()
      router.push('/ordering')
    },
    onError: () => {
      showSnackbar('발주처 등록이 실패했습니다.', 'error')
    },
  })

  // 발주처 삭제

  const ClientDeleteMutation = useMutation({
    mutationFn: ({ userIds }: { userIds: number[] }) => ClientRemoveService(userIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('발주처가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
      }
    },

    onError: () => {
      showSnackbar(' 발주처 삭제에 실패했습니다.', 'error')
    },
  })

  // 발주처 수정

  const ClientModifyMutation = useMutation({
    mutationFn: (userIds: number) => ModifyClientCompany(userIds),

    onSuccess: () => {
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('발주처가 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
        reset()
        router.push('/ordering')
      }
    },

    onError: () => {
      showSnackbar(' 발주처 수정에 실패했습니다.', 'error')
    },
  })

  // 발주처에서 사용하는 유저 정보데이터
  // 조회에서 이름 검색 스크롤
  const useUserOrderingInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['userInfo', keyword],
      queryFn: ({ pageParam }) => OrderingInfoNameScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const [userSearch, setUserSearch] = useState('')

  const {
    data: userData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['userInfo', userSearch],
    queryFn: ({ pageParam }) => OrderingInfoNameScroll({ pageParam, keyword: userSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const userOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택' }
    const options = (userData?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.username,
      }))

    return [defaultOption, ...options]
  }, [userData])

  const orderingCancel = () => {
    router.push('/ordering')
  }

  const { data: payInfoId } = useQuery({
    queryKey: ['positionInfo'],
    queryFn: PayIdInfoService,
  })

  const payMethodOptions = [{ code: 'BASE', name: '선택' }, ...(payInfoId?.data ?? [])]

  const useClientHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['ClientHistoryList', historyId],
      queryFn: ({ pageParam = 0 }) => CLientCompanyInfoHistoryService(historyId, pageParam, 4),
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
    ClientQuery,
    orderingCancel,
    createClientMutation,
    ClientDeleteMutation,
    ClientModifyMutation,
    useUserOrderingInfiniteScroll,
    // 결제수단
    payMethodOptions,

    // 이력
    useClientHistoryDataQuery,
    // 본사 담당자 관련
    userSearch,
    setUserSearch,
    userOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  }
}
