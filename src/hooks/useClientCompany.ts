import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useRouter } from 'next/navigation'
import { useOrderingFormStore } from '@/stores/orderingStore'
import {
  CreateClientCompany,
  ModifyClientCompany,
} from '@/services/ordering/orderingRegistrationService'
import { ClientCompanyInfoService, ClientRemoveService } from '@/services/ordering/orderingService'

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

  return {
    ClientQuery,
    createClientMutation,
    ClientDeleteMutation,
    ClientModifyMutation,
  }
}
