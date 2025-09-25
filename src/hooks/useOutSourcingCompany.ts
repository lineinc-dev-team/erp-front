import {
  ContractHistoryService,
  CreateOutsourcingCompany,
  ModifyOutsourcingCompany,
  OutsourcingCompanyInfoHistoryService,
  OutsourcingDeductionIdInfoService,
  OutsourcingTypesIdInfoService,
} from '@/services/outsourcingCompany/outsourcingCompanyRegistrationService'
import {
  OutsourcingCompanyInfoService,
  OutsourcingCompanyRemoveService,
} from '@/services/outsourcingCompany/outsourcingCompanyService'
import {
  useOutsourcingFormStore,
  useOutsourcingSearchStore,
} from '@/stores/outsourcingCompanyStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { getTodayDateString } from '@/utils/formatters'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function useOutSourcingCompany() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useOutsourcingFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  const search = useOutsourcingSearchStore((state) => state.search)
  const { setField, form } = useOutsourcingFormStore()
  const pathName = usePathname()

  const params = useParams()

  const outsourcingCompanyId = Number(params?.id)

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const OutsourcingListQuery = useQuery({
    queryKey: [
      'OutsourcingInfo',
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
        type: search.type === 'BASE' ? '' : search.type,
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

      return OutsourcingCompanyInfoService(filteredParams)
    },
    enabled: pathName === '/outsourcingCompany', // 경로 체크
  })

  const createOutSourcingMutation = useMutation({
    mutationFn: CreateOutsourcingCompany,
    onSuccess: () => {
      showSnackbar('외주업체가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['OutsourcingInfo'] })
      reset()
      router.push('/outsourcingCompany')
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('외주업체 등록이 실패했습니다.', 'error')
      }
    },
  })

  const { data: typeInfoId } = useQuery({
    queryKey: ['typeInfofo'],
    queryFn: OutsourcingTypesIdInfoService,
  })

  const typeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(typeInfoId?.data ?? [])]

  const { data: deductionInfoId } = useQuery({
    queryKey: ['deductionInfo'],
    queryFn: OutsourcingDeductionIdInfoService,
  })

  const deductionMethodOptions = [...(deductionInfoId?.data ?? [])]

  const outsourcingCancel = () => {
    router.push('/outsourcingCompany')
  }

  // 수정 쿼리
  const OutsourcingModifyMutation = useMutation({
    mutationFn: (outsourcingIds: number) => ModifyOutsourcingCompany(outsourcingIds),

    onSuccess: () => {
      showSnackbar('외주업체가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['OutsourcingInfo'] })
      // reset()
      // router.push('/outsourcingCompany')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar(' 외주업체 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 삭제
  const OutsourcingDeleteMutation = useMutation({
    mutationFn: ({ outsourcingCompanyIds }: { outsourcingCompanyIds: number[] }) =>
      OutsourcingCompanyRemoveService(outsourcingCompanyIds),

    onSuccess: () => {
      showSnackbar('외주업체가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['OutsourcingInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar(' 외주업체 삭제에 실패했습니다.', 'error')
      }
    },
  })

  // 수정이력 조회 쿼리

  const useOutsourcingCompanyHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['historyList', historyId],
      queryFn: ({ pageParam = 0 }) =>
        OutsourcingCompanyInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  useEffect(() => {
    if (form.searchTrigger && form.currentPage !== 0) {
      setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.searchTrigger])

  const useContractHistoryDataQuery = useQuery({
    queryKey: ['OutsourcingContractInfo', outsourcingCompanyId, form.currentPage, form.pageCount],
    queryFn: () => {
      const rawParams = {
        page: Math.max(0, (form.currentPage ?? 1) - 1),
        size: 10,
        sort: 'createdAt,desc',
        outsourcingCompanyId,
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

      return ContractHistoryService(outsourcingCompanyId, filteredParams)
    },
    enabled: !!outsourcingCompanyId && !isNaN(outsourcingCompanyId),
  })

  return {
    OutsourcingListQuery,
    createOutSourcingMutation,
    typeMethodOptions,
    deductionMethodOptions,
    outsourcingCancel,
    OutsourcingModifyMutation,
    OutsourcingDeleteMutation,
    useOutsourcingCompanyHistoryDataQuery,

    // 계약이력

    useContractHistoryDataQuery,
  }
}
