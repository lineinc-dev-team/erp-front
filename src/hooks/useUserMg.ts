import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useRouter } from 'next/navigation'
import {
  CreateAccount,
  UserInfoService,
  UserRemoveService,
  // UpdateAccount,
  // DeleteAccount,
  // ResetPassword,
} from '@/services/account/accountManagementService'

export function useUserMg() {
  const { showSnackbar } = useSnackbarStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const userQuery = useQuery({
    queryKey: ['userInfo'],
    queryFn: UserInfoService,
  })

  const createUserMutation = useMutation({
    mutationFn: CreateAccount,
    onSuccess: () => {
      showSnackbar('계정이 추가되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['userInfo'] })
      router.push('/account/registration')
    },
    onError: () => {
      showSnackbar('계정 추가에 실패했습니다.', 'error')
    },
  })

  // const updateMutation = useMutation({
  //   mutationFn: UpdateAccount,
  //   onSuccess: () => {
  //     showSnackbar('계정이 수정되었습니다.', 'success')
  //     queryClient.invalidateQueries({ queryKey: ['userInfo'] })
  //   },
  //   onError: () => {
  //     showSnackbar('계정 수정에 실패했습니다.', 'error')
  //   },
  // })

  const deleteMutation = useMutation({
    mutationFn: ({ userIds }: { userIds: number[] }) => UserRemoveService(userIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('유저 계정이 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['userInfo'] })
      }
    },

    onError: () => {
      showSnackbar(' 유저 계정 삭제에 실패했습니다.', 'error')
    },
  })

  // ✅ 비밀번호 초기화
  // const resetPasswordMutation = useMutation({
  //   mutationFn: ResetPassword,
  //   onSuccess: () => {
  //     showSnackbar('비밀번호가 초기화되었습니다.', 'success')
  //   },
  //   onError: () => {
  //     showSnackbar('비밀번호 초기화에 실패했습니다.', 'error')
  //   },
  // })

  return {
    userQuery,
    createUserMutation,
    deleteMutation,
    // updateMutation,
    // deleteMutation,
    // resetPasswordMutation,
  }
}
