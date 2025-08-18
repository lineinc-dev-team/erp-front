import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  CreateManagementMaterial,
  MaterialInfoHistoryService,
  MaterialInputTypeService,
  ModifyMaterialManagement,
} from '@/services/materialManagement/materialManagementRegistrationService'
import {
  useManagementMaterialFormStore,
  useMaterialSearchStore,
} from '@/stores/materialManagementStore'
import { getTodayDateString } from '@/utils/formatters'
import {
  ManagementMaterialInfoService,
  MaterialRemoveService,
} from '@/services/materialManagement/materialManagementService'

export function useManagementMaterial() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useManagementMaterialFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: materialTypeInfoId } = useQuery({
    queryKey: ['InputTypeInfo'],
    queryFn: MaterialInputTypeService,
  })

  const InputTypeMethodOptions = [
    { code: 'BASE', label: '선택' },
    ...(materialTypeInfoId?.data ?? []),
  ]

  // 강재 관리등록
  const createMaterialMutation = useMutation({
    mutationFn: CreateManagementMaterial,
    onSuccess: () => {
      showSnackbar('자재가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['MaterialInfo'] })
      reset()
      router.push('/materialManagement')
    },
    onError: () => {
      showSnackbar('자재 등록에 실패했습니다.', 'error')
    },
  })

  // 자재 관리 조회

  const search = useMaterialSearchStore((state) => state.search)

  const pathName = usePathname()

  // const params = useParams()
  // const outsourcingCompanyId = Number(params?.id)

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const MaterialListQuery = useQuery({
    queryKey: [
      'MaterialInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName,
        processName: search.processName,
        materialName: search.materialName,
        outsourcingCompanyName: search.outsourcingCompanyName,
        deliveryStartDate: getTodayDateString(search.deliveryStartDate),
        deliveryEndDate: getTodayDateString(search.deliveryEndDate),
        page: search.currentPage - 1,
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

      return ManagementMaterialInfoService(filteredParams)
    },
    enabled: pathName === '/materialManagement', // 경로 체크
  })

  //자재데이터 삭제!
  const MaterialDeleteMutation = useMutation({
    mutationFn: ({ materialManagementIds }: { materialManagementIds: number[] }) =>
      MaterialRemoveService(materialManagementIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('자재 관리가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['MaterialInfo'] })
      }
    },

    onError: () => {
      showSnackbar('자재 관리 삭제에 실패했습니다.', 'error')
    },
  })

  // 자재데이터 수정

  const MaterialModifyMutation = useMutation({
    mutationFn: (materialId: number) => ModifyMaterialManagement(materialId),

    onSuccess: () => {
      showSnackbar('자재비가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['MaterialInfo'] })
      reset()
      router.push('/materialManagement')
    },

    onError: () => {
      showSnackbar('자재비 수정에 실패했습니다.', 'error')
    },
  })

  // 수정이력 조회 쿼리
  const useMaterialHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['MaterialHistoryList', historyId],
      queryFn: ({ pageParam = 0 }) =>
        MaterialInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  const materialCancel = () => {
    router.push('/materialManagement')
  }

  return {
    createMaterialMutation,
    MaterialModifyMutation,
    MaterialListQuery,
    MaterialDeleteMutation,
    materialCancel,
    InputTypeMethodOptions,

    useMaterialHistoryDataQuery,
  }
}
