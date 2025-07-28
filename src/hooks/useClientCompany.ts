import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useRouter } from 'next/navigation'
import { useOrderingFormStore, useOrderingSearchStore } from '@/stores/orderingStore'
import {
  CreateClientCompany,
  ModifyClientCompany,
  OrderingInfoNameScroll,
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

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.currentPage !== 1) {
      search.setField('currentPage', 1)
    }
  }, [search])

  // useQuery 쪽 수정
  const ClientQuery = useQuery({
    queryKey: [
      'ClientInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort /* 필요한 상태들 추가 */,
    ],
    queryFn: () => {
      const rawParams = {
        name: search.name,
        businessNumber: search.businessNumber,
        ceoName: search.ceoName,
        phoneNumber: search.landlineNumber,
        contactName: search.orderCEOname,
        email: search.email,
        createdStartDate: getTodayDateString(search.startDate),
        createdEndDate: getTodayDateString(search.endDate),
        isActive:
          search.isActive === '사용' ? true : search.isActive === '미사용' ? false : undefined,
        page: search.currentPage - 1, // 항상 현재 페이지에 맞춤
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

      return ClientCompanyInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
  })

  // 발주처 등록
  const createClientMutation = useMutation({
    mutationFn: CreateClientCompany,
    onSuccess: () => {
      showSnackbar('발주처가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['clientInfo'] })
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
        queryClient.invalidateQueries({ queryKey: ['clientInfo'] })
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
    const defaultOption = { label: '선택', value: '0' }
    const options = (userData?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.username,
        value: user.id,
      }))

    return [defaultOption, ...options]
  }, [userData])

  return {
    ClientQuery,
    createClientMutation,
    ClientDeleteMutation,
    ClientModifyMutation,
    useUserOrderingInfiniteScroll,

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
