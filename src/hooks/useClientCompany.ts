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
import { useEffect, useMemo } from 'react'
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
        isActive: search.isActive === '1' ? true : search.isActive === '2' ? false : undefined,
        page: search.currentPage - 1, // 항상 현재 페이지에 맞춤
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

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('발주처 등록이 실패했습니다.', 'error')
      }
    },
  })

  // 발주처 삭제

  const ClientDeleteMutation = useMutation({
    mutationFn: ({ userIds }: { userIds: number[] }) => ClientRemoveService(userIds),

    onSuccess: () => {
      showSnackbar('발주처가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
    },

    onError: () => {
      showSnackbar(' 발주처 삭제에 실패했습니다.', 'error')
    },
  })

  // 발주처 수정

  const ClientModifyMutation = useMutation({
    mutationFn: (userIds: number) => ModifyClientCompany(userIds),

    onSuccess: () => {
      showSnackbar('발주처가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
      // reset()
      // router.push('/ordering')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar(' 발주처 수정에 실패했습니다.', 'error')
      }
    },
  })

  const {
    data: userData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['userInfo'],
    queryFn: ({ pageParam = 0 }) => OrderingInfoNameScroll({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const userOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택', deleted: false }
    const options = (userData?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.username,
        deleted: false,
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
      queryFn: ({ pageParam = 0 }) =>
        CLientCompanyInfoHistoryService(historyId, pageParam, 4, 'updatedAt,desc'),
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
    // 결제수단
    payMethodOptions,

    // 이력
    useClientHistoryDataQuery,
    // 본사 담당자 관련

    userOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  }
}
