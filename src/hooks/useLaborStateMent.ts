import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import {
  LaborExcelModifyMutation,
  LaborStateMentInfoHistoryService,
  LaborStateMentListInfoService,
  LaborSummaryMemoModifyMutation,
  LaborSummaryModifyMutation,
} from '@/services/laborStateMent/laborStateMentService'
import { useLaborStateMentSearchStore } from '@/stores/laborStateMentStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

export function useLaborStateMentInfo() {
  // 인력정보 조회
  const { showSnackbar } = useSnackbarStore()

  const queryClient = useQueryClient()

  const search = useLaborStateMentSearchStore((state) => state.search)

  const pathName = usePathname()

  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const LaborStateMentListQuery = useQuery({
    queryKey: [
      'LaborStateInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName === '선택' ? undefined : search.siteName,
        processName: search.processName === '선택' ? undefined : search.processName,
        yearMonth: search.yearMonth,

        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort: search.arraySort === '최신순' ? 'id,desc' : 'id,asc',
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

      return LaborStateMentListInfoService(filteredParams)
    },
    enabled: pathName === '/laborStatement', // 경로 체크
  })

  // 명세서 집계 수정

  // mutation 정의
  const LaborSummarytModifyBtn = useMutation({
    mutationFn: (laborSummaryId: number) => LaborSummaryModifyMutation(laborSummaryId),

    onSuccess: async () => {
      showSnackbar('노무명세서가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['LaborStateInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('노무명세서 수정에 실패했습니다.', 'error')
      }
    },
  })

  const laborExcelModifyBtn = useMutation({
    mutationFn: () => LaborExcelModifyMutation(), // payload는 내부에서 store 기준으로 생성됨

    onSuccess: () => {
      showSnackbar('노무명세서가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['LaborStateInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error')
      } else {
        showSnackbar('노무명세서 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 수정이력 조회 쿼리
  const useLaborStaMentHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['LaborhistoryList', historyId],
      queryFn: ({ pageParam = 0 }) =>
        LaborStateMentInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  // 변경 이력 수정

  // mutation 정의
  const LaborSummaryMemotModifyBtn = useMutation({
    mutationFn: ({ id, memo }: { id: number; memo: string }) =>
      LaborSummaryMemoModifyMutation(id, memo),

    onSuccess: async () => {
      showSnackbar('노무명세서가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['LaborStateInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('노무명세서 수정에 실패했습니다.', 'error')
      }
    },
  })

  return {
    LaborStateMentListQuery,
    LaborSummarytModifyBtn,
    laborExcelModifyBtn,

    LaborSummaryMemotModifyBtn,
    useLaborStaMentHistoryDataQuery,
  }
}
