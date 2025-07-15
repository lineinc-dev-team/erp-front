import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  GroupUserResponse,
  MenuPermissionResponse,
  PermissionResponse,
  PermissionSingleResponse,
} from '@/types/allRoles'
import {
  addUsersToRole,
  GroupUserList,
  GroupUserRemove,
  MenuPermissionService,
  PermissionGroupAdd,
  PermissionGroupRemove,
  PermissionService,
  PermissionSingleService,
} from '@/services/permission/permissonService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useRouter } from 'next/navigation'

export function usePermission() {
  const queryClient = useQueryClient()
  const { showSnackbar } = useSnackbarStore()
  const router = useRouter()

  //권한 그룹에 필요한 상태 관리

  const [permissionGroupCheck, setPermissionGroupCheck] = useState<number[]>([])

  const [open, setOpen] = useState(false)

  const [checkGroupId, setCheckGroupId] = useState<number>(1)

  // 체크 데이터 확인
  const [selectedPermissions, setSelectedPermissions] = useState<
    { id: number; menuId: number; action: string }[]
  >([])

  const { data, isLoading, isError, error } = useQuery<PermissionResponse, Error>({
    queryKey: ['PermissionService'],
    queryFn: PermissionService,
  })

  useEffect(() => {
    if (isError) {
      if (error instanceof Error && error.message === '권한이 없습니다.') {
        showSnackbar('접근 권한이 없습니다.', 'warning')
        router.push('/business')
      }
    }
  }, [isError, error])

  // 권한 메뉴별 권한 조회
  const {
    data: PermissionData,
    isLoading: PermissionLoading,
    isError: PermissionError,
  } = useQuery<MenuPermissionResponse>({
    queryKey: ['MenuPermissionService'],
    queryFn: () => MenuPermissionService(checkGroupId),
  })

  // 권한 그룹 삭제 함수
  const { mutate: deletePermissionList } = useMutation({
    mutationFn: ({ roleIds }: { roleIds: number[] }) => PermissionGroupRemove(roleIds),
    onSuccess: () => {
      showSnackbar('권한 유저가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({
        queryKey: ['PermissionService'],
      })

      setPermissionGroupCheck([])
    },
    onError: () => {
      showSnackbar('삭제에 실패했습니다.', 'error')
    },
  })

  const allRoles = data?.data.content ?? []
  const allPermissionGroupChecked =
    permissionGroupCheck.length === allRoles.length && allRoles.length !== 0

  //  권한 메뉴별 권한 체크박스 핸들러
  const handlePermissionGroupCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setPermissionGroupCheck(allRoles.map((g) => g.id))
    else setPermissionGroupCheck([])
  }

  // 권한 메뉴별 권한 개별 체크
  const handlePermissionGroupCheck = (id: number) => {
    if (permissionGroupCheck.includes(id)) {
      setPermissionGroupCheck(permissionGroupCheck.filter((i) => i !== id))
    } else {
      setPermissionGroupCheck([...permissionGroupCheck, id])
    }
  }

  // 권한 그룹 추가 할 수 있는 로직

  // mutation
  const { mutateAsync: addGroup } = useMutation({
    mutationFn: (name: string) => PermissionGroupAdd(name),
    onSuccess: () => {
      showSnackbar('그룹이 추가되었습니다.', 'success')
      queryClient.invalidateQueries({
        queryKey: ['PermissionService'],
        refetchType: 'active', // optional, active가 default
      })
      handleClose()
    },
    onError: () => {
      showSnackbar('그룹 추가에 실패했습니다.', 'error')
    },
  })

  const [permissionGroupOpen, setPermissionGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState('')

  const handleOpen = () => setPermissionGroupOpen(true)
  const handleClose = () => {
    setGroupName('')
    setPermissionGroupOpen(false)
  }

  const handleAdd = async () => {
    if (!groupName.trim()) {
      showSnackbar('그룹 이름을 입력해주세요.', 'warning')
      return
    }
    try {
      await addGroup(groupName)
      handleClose()
    } catch (err) {
      console.error('추가 실패:', err)
    }
  }

  // 그룹 체크 상태
  const [groupChecked, setGroupChecked] = useState<number[]>([])
  const [selectedId, setSelectedId] = useState<number>(1)

  // 단일 (선택) 그룹 조회
  const {
    data: singleData,
    isLoading: singleLoading,
    isError: singleError,
  } = useQuery<PermissionSingleResponse>({
    queryKey: ['PermissionSingleService'],
    queryFn: () => PermissionSingleService(selectedId),
    enabled: !!selectedId,
  })

  // 권한 그룹에 속한 유저 조회

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<GroupUserResponse>({
    queryKey: ['GroupUserList'],
    queryFn: () => GroupUserList(selectedId),
  })

  const alluserData = userData?.data.content ?? []
  const allGroupChecked = groupChecked.length === alluserData.length && alluserData.length !== 0

  // 권한 그룹 유저 삭제
  // 삭제 mutation
  const { mutate: deleteUserList } = useMutation({
    mutationFn: ({ selectedId, groupChecked }: { selectedId: number; groupChecked: number[] }) =>
      GroupUserRemove(selectedId, groupChecked),
    onSuccess: () => {
      showSnackbar('권한 유저가 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({
        queryKey: ['GroupUserList'],
      })

      setGroupChecked([])
    },
    onError: () => {
      showSnackbar('삭제에 실패했습니다.', 'error')
    },
  })

  // 권한 그룹 유저 추가

  const [useModalOpen, setUseModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    id: '', // 그룹 ID
    userIds: '', // "1,2,3" 처럼 임시 문자열로 입력 받아보기
  })

  const userGroupOpen = () => setUseModalOpen(true)
  const userGroupClose = () => {
    setUseModalOpen(false)
    // 폼 초기화
    setFormData({
      id: '',
      userIds: '',
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // mutation
  const { mutateAsync: addUserGroup } = useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: number; userIds: number[] }) =>
      addUsersToRole(roleId, userIds),

    onSuccess: () => {
      showSnackbar('그룹이 추가되었습니다.', 'success')
      queryClient.invalidateQueries({
        queryKey: ['GroupUserList'],
      })
      handleClose()
    },

    onError: () => {
      showSnackbar('그룹 추가에 실패했습니다.', 'error')
    },
  })

  // 체크박스 핸들러
  const handleGroupCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setGroupChecked(alluserData.map((g) => g.id))
    else setGroupChecked([])
  }

  const handleGroupCheck = (id: number) => {
    if (groupChecked.includes(id)) {
      setGroupChecked(groupChecked.filter((i) => i !== id))
    } else {
      setGroupChecked([...groupChecked, id])
    }
  }

  // 삭제 핸들러 로직 !!

  // 권한 그룹 관리 삭제
  const handlePermissonGroupDelete = () => {
    if (permissionGroupCheck.length === 0) {
      showSnackbar('삭제할 그룹을 선택해주세요.', 'warning')
      return
    }
    if (window.confirm('정말 선택한 그룹을 삭제하시겠습니까?')) {
      deletePermissionList({ roleIds: permissionGroupCheck })
    }
  }

  //권한 그룹 안에 유저 삭제
  const handleGroupDelete = () => {
    if (groupChecked.length === 0) {
      showSnackbar('삭제할 그룹을 선택해주세요.', 'warning')
      return
    }
    if (window.confirm('정말 선택한 그룹을 삭제하시겠습니까?')) {
      console.log('데이터 확인4455', selectedId, groupChecked)
      deleteUserList({ selectedId, groupChecked })
    }
  }

  useEffect(() => {
    if (PermissionData) {
      const initial = PermissionData.data.flatMap((menu) =>
        menu.permissions.map((p) => ({
          menuId: menu.id,
          id: p.id,
          action: p.action,
        })),
      )
      setSelectedPermissions(initial)
    }
  }, [PermissionData])

  const handlePermissionToggle = (menuId: number, id: number, action: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, { menuId, id, action }])
    } else {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !(p.menuId === menuId && p.id === id && p.action === action)),
      )
    }
  }

  const userGroupAdd = async () => {
    try {
      await addUserGroup({
        roleId: 4,
        userIds: [4],
      })
      console.log('추가 완료!')
    } catch (err) {
      console.error('추가 실패:', err)
    }
  }

  return {
    handleClose,
    userGroupAdd,
    handleOpen,
    groupName,
    setGroupName,
    handleAdd,
    permissionGroupOpen,
    useModalOpen,
    handleChange,
    formData,
    userGroupOpen,
    userGroupClose,

    allRoles,
    handlePermissonGroupDelete,
    handlePermissionGroupCheckAll,
    handlePermissionGroupCheck,
    allPermissionGroupChecked,
    permissionGroupCheck,
    isLoading,
    isError,
    allGroupChecked,
    groupChecked,
    handleGroupCheck,
    handleGroupCheckAll,
    handleGroupDelete,
    selectedId,
    setSelectedId,
    checkGroupId,
    setCheckGroupId,
    open,
    setOpen,
    singleData,
    singleLoading,
    singleError,
    PermissionData,
    PermissionLoading,
    PermissionError,
    selectedPermissions,
    handlePermissionToggle,
    setSelectedPermissions,
    userData,
    userLoading,
    userError,
    alluserData,
  }
}
