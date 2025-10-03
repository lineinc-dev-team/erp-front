import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import {
  CreateManagementSteel,
  ModifySteelManagement,
  SteelInfoHistoryService,
} from '@/services/managementSteel/managementSteelRegistrationService'
import { useManagementSteelFormStore, useSteelSearchStore } from '@/stores/managementSteelStore'
import {
  ManagementSteelInfoService,
  SteelRemoveService,
} from '@/services/managementSteel/managementSteelService'
import { useEffect } from 'react'
import { getTodayDateString } from '@/utils/formatters'

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
      queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
      reset()
      router.push('/managementSteel')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('강재관리 등록에 실패했습니다.', 'error')
      }
    },
  })

  // 강재 관리 조회

  const search = useSteelSearchStore((state) => state.search)

  const pathName = usePathname()

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

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
        siteName: search.siteName === '선택' ? undefined : search.siteName,
        siteProcessName: search.siteProcessName,
        itemName: search.itemName,
        type: search.type === 'BASE' ? '' : search.type,
        outsourcingCompanyName:
          search.outsourcingCompanyName === '선택' ? undefined : search.outsourcingCompanyName,
        startDate: getTodayDateString(search.startDate),
        endDate: getTodayDateString(search.endDate),
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

      return ManagementSteelInfoService(filteredParams)
    },
    enabled: pathName === '/managementSteel',
  })

  //강재데이터 삭제!
  const SteelDeleteMutation = useMutation({
    mutationFn: ({ steelManagementIds }: { steelManagementIds: number[] }) =>
      SteelRemoveService(steelManagementIds),

    onSuccess: () => {
      showSnackbar('강재 관리가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('강재 관리 삭제에 실패했습니다.', 'error')
      }
    },
  })

  //강재데이터 승인!
  // const SteelApproveMutation = useMutation({
  //   mutationFn: ({ steelManagementIds }: { steelManagementIds: number[] }) =>
  //     SteelApproveService(steelManagementIds),

  //   onSuccess: () => {
  //     showSnackbar('강재 관리가 승인되었습니다.', 'success')
  //     queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
  //   },

  //   onError: () => {
  //     showSnackbar('승인 실패: 이미 반출된 건은 승인 상태로 변경할 수 없습니다.', 'error')
  //   },
  // })

  //강재데이터 반출!
  // const SteelReleaseMutation = useMutation({
  //   mutationFn: ({ steelManagementIds }: { steelManagementIds: number[] }) =>
  //     SteelReleaseService(steelManagementIds),

  //   onSuccess: () => {
  //     showSnackbar('강재 관리가 반출되었습니다.', 'success')
  //     queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
  //   },

  //   onError: () => {
  //     showSnackbar('반출 실패: 승인되지 않은 건은 반출할 수 없습니다.', 'error')
  //   },
  // })

  //   // 발주처 수정

  const SteelModifyMutation = useMutation({
    mutationFn: (SteelId: number) => ModifySteelManagement(SteelId),

    onSuccess: () => {
      showSnackbar('강재수불부가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['SteelInfo'] })
      // reset()
      // router.push('/managementSteel')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('강재수불부 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 수정 이력

  // 수정이력 조회 쿼리
  const useSteelHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['SteelInfo', historyId],
      queryFn: ({ pageParam = 0 }) => SteelInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  // 구분 조회

  // const { data: steelTypeInfoId } = useQuery({
  //   queryKey: ['steelTypeInfo'],
  //   queryFn: SteelTypeIdInfoService,
  // })

  // const SteelTypeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(steelTypeInfoId?.data ?? [])]

  const steelCancel = () => {
    router.push('/managementSteel')
  }
  return {
    createSteelMutation,
    SteelDeleteMutation,
    SteelListQuery,
    SteelModifyMutation,
    steelCancel,

    useSteelHistoryDataQuery,
  }
}
