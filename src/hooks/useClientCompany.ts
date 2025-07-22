import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useRouter } from 'next/navigation'
import { useOrderingFormStore } from '@/stores/orderingStore'
import {
  CreateClientCompany,
  ModifyClientCompany,
  OrderingInfoNameScroll,
} from '@/services/ordering/orderingRegistrationService'
import { ClientCompanyInfoService, ClientRemoveService } from '@/services/ordering/orderingService'
import { useMemo, useState } from 'react'

export function useClientCompany() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useOrderingFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 발주처 조회
  const ClientQuery = useQuery({
    queryKey: ['ClientInfo'],
    queryFn: ClientCompanyInfoService,
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

  // 발주처 본사 담당자
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

  console.log('12345', userData)
  const userOptions = useMemo(() => {
    return (userData?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.username,
        value: user.id,
      }))
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
