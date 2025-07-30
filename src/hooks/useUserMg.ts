import { useAccountFormStore, useAccountManagementStore } from '@/stores/accountManagementStore'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import {
  CreateAccount,
  DepartmentIdInfoService,
  GradeIdInfoService,
  ModifyUserManagement,
  ModifyUserPasswordManagement,
  PositionIdInfoService,
  UserInfoNameScroll,
  UserInfoService,
  UserRemoveService,
} from '@/services/account/accountManagementService'
import { useEffect } from 'react'
import { getTodayDateString } from '@/utils/formatters'

export function useUserMg() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useAccountFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // useQuery 쪽 수정

  const search = useAccountManagementStore((state) => state.search)

  const pathName = usePathname()

  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  const userQuery = useQuery({
    queryKey: [
      'userInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        username: search.username ? search.username : '',
        roleId: search.roleId === '0' ? '' : search.roleId,
        isActive: search.isActive === '0' ? '' : search.isActive,
        createdStartDate: getTodayDateString(search.createdStartDate),
        createdEndDate: getTodayDateString(search.createdEndDate),
        lastLoginStartDate: getTodayDateString(search.lastLoginStartDate),
        lastLoginEndDate: getTodayDateString(search.lastLoginEndDate),
        departmentId: search.departmentId === 0 ? '' : search.departmentId,
        gradeId: search.gradeId === 0 ? '' : search.gradeId,
        positionId: search.positionId === 0 ? '' : search.positionId,
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort: search.arraySort === '최신순' ? 'id,desc' : 'username,asc',
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

      return UserInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
    enabled: pathName === '/account', // 경로 체크
  })

  // 조회에서 이름 검색 스크롤
  const useUserInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['userInfo', keyword],
      queryFn: ({ pageParam }) => UserInfoNameScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  // 계정 추가
  const createUserMutation = useMutation({
    mutationFn: CreateAccount,
    onSuccess: () => {
      showSnackbar('계정이 추가되었습니다.', 'success')
      // 초기화 로직
      reset()
      queryClient.invalidateQueries({ queryKey: ['userInfo'] })
      router.push('/account')
    },
    onError: () => {
      showSnackbar('계정 추가에 실패했습니다.', 'error')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ModifyUserManagement,
    onSuccess: () => {
      showSnackbar('계정이 수정되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['userInfo'] })
      router.push('/account')
    },
    onError: () => {
      showSnackbar('계정 수정에 실패했습니다.', 'error')
    },
  })

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

  const handleNewAccountCreate = () => {
    router.push('/account/registration')
  }

  const handleAccountCancel = () => {
    router.push('/account')
  }

  //  비밀번호 초기화
  const resetPasswordMutation = useMutation({
    mutationFn: ModifyUserPasswordManagement,
    onSuccess: () => {
      showSnackbar('비밀번호가 초기화되었습니다.', 'success')
    },
    onError: () => {
      showSnackbar('비밀번호 초기화에 실패했습니다.', 'error')
    },
  })

  const { data: departmentId } = useQuery({
    queryKey: ['departmentInfo'],
    queryFn: DepartmentIdInfoService,
  })

  const departmentOptions = [{ id: 0, name: '선택' }, ...(departmentId?.data ?? [])]

  const { data: positionId } = useQuery({
    queryKey: ['positionInfo'],
    queryFn: PositionIdInfoService,
  })

  const positionOptions = [{ id: 0, name: '선택' }, ...(positionId?.data ?? [])]

  const { data: gradeId } = useQuery({
    queryKey: ['gradeInfo'],
    queryFn: GradeIdInfoService,
  })

  const gradeOptions = [{ id: 0, name: '선택' }, ...(gradeId?.data ?? [])]

  return {
    userQuery,
    createUserMutation,
    updateUserMutation,
    resetPasswordMutation,
    deleteMutation,
    departmentOptions,
    positionOptions,
    gradeOptions,

    handleNewAccountCreate,
    handleAccountCancel,
    useUserInfiniteScroll,

    // updateMutation,
    // deleteMutation,
    // resetPasswordMutation,
  }
}
