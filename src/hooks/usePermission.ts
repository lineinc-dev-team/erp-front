import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

import {
  CreatePermission,
  MenuListService,
  ModifyPermissionService,
  PermissionGroupRemove,
  PermissionService,
  SinglepermissionMenuService,
  SinglepermissionService,
  SinglepermissionUserService,
  UserInfoFromPermissionService,
} from '@/services/permission/permissonService'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import { usePermissionGroupStore, usePermissionSearchStore } from '@/stores/permissionStore'
import {
  SitesPersonScroll,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'

export function usePermission() {
  const queryClient = useQueryClient()
  const { showSnackbar } = useSnackbarStore()
  const router = useRouter()
  const { reset } = usePermissionGroupStore()

  // useQuery 쪽 수정

  const search = usePermissionSearchStore((state) => state.search)

  const pathName = usePathname()

  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  const permissionListQuery = useQuery({
    queryKey: [
      'permissionInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        userSearch: search.userSearch ? search.userSearch : '',
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'createdAt,desc'
            : search.arraySort === '오래된순'
            ? 'createdAt,asc'
            : 'name,asc',
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

      return PermissionService(filteredParams)
    },
    staleTime: 1000 * 30,
    enabled: pathName === '/permissionGroup', // 경로 체크
  })

  // 권한 그룹 삭제 함수
  const permissionDeleteMutation = useMutation({
    mutationFn: ({ roleIds }: { roleIds: number[] }) => PermissionGroupRemove(roleIds),

    onSuccess: () => {
      showSnackbar('권한 그룹이 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['permissionInfo'] })
    },

    onError: () => {
      showSnackbar(' 권한 그룹 삭제에 실패했습니다.', 'error')
    },
  })

  // 조회에서 이름 검색 스크롤
  const useUserAccountInfiniteScroll = (loginIdKeyword: string) => {
    return useInfiniteQuery({
      queryKey: ['permissionUserInfo', loginIdKeyword], // 키워드가 바뀔 때 쿼리 리패치 되도록
      queryFn: ({ pageParam = 0 }) => UserInfoFromPermissionService({ pageParam, loginIdKeyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
    })
  }

  // 권한 그룹 등록
  const createPermissionMutation = useMutation({
    mutationFn: CreatePermission,
    onSuccess: () => {
      showSnackbar('권한 그룹이 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['permissionInfo'] })
      reset()
      router.push('/permissionGroup')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('권한 그룹 등록에 실패했습니다.', 'error')
      }
    },
  })

  // 권한 수정
  const PermissionModifyMutation = useMutation({
    mutationFn: (permissionModifyId: number) => ModifyPermissionService(permissionModifyId),

    onSuccess: () => {
      showSnackbar('권한 그룹이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['permissionInfo'] })
      // reset()
      // router.push('/permissionGroup')
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar(' 권한 그룹 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 메뉴조회
  const useMenuListQuery = () => {
    return useQuery({
      queryKey: ['menuInfo'],
      queryFn: MenuListService,
    })
  }

  // 상세조회
  const useSinglepermissionListQuery = (id: number, enabled: boolean) => {
    return useQuery({
      queryKey: ['permissionDetail', id],
      queryFn: () => SinglepermissionService(id),
      enabled: enabled && !!id && !isNaN(id), // id가 유효할 때만 호출
    })
  }

  const useSinglepermissionUserListQuery = (singleId: number, enabled: boolean) => {
    return useQuery({
      queryKey: ['permissionInfo', singleId],
      queryFn: () => SinglepermissionUserService(singleId),
      enabled: enabled && !!singleId && !isNaN(singleId), // id가 유효할 때만 호출
    })
  }
  const useSinglepermissionMenuListQuery = (singleId: number, enabled: boolean) => {
    return useQuery({
      queryKey: ['menuInfoMenus', singleId],
      queryFn: () => SinglepermissionMenuService(singleId),
      enabled: enabled && !!singleId && !isNaN(singleId), // id가 유효할 때만 호출
    })
  }

  // 권한 그룹에서 사용하는 현장/공정 데이터 가져오기

  const pathname = usePathname()
  const isPermissionRegistrationPage = pathname.startsWith('/permissionGroup/registration')

  // 현장명데이터를 가져옴 무한 스크롤

  const [sitesSearch, setSitesSearch] = useState('')

  const {
    data: siteNameInfo,
    fetchNextPage: siteNameFetchNextPage,
    hasNextPage: siteNamehasNextPage,
    isFetching: siteNameFetching,
    isLoading: siteNameLoading,
  } = useInfiniteQuery({
    queryKey: ['siteInfo', sitesSearch],
    queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword: sitesSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
    enabled: isPermissionRegistrationPage,
  })

  const sitesOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택' }
    const options = (siteNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [siteNameInfo])

  // 공정명

  const [processSearch, setProcessSearch] = useState('')

  const permissionForm = usePermissionGroupStore((state) => state.form)

  const selectedSiteId = permissionForm.siteProcesses[0]?.siteId

  const {
    data: processInfo,
    fetchNextPage: processInfoFetchNextPage,
    hasNextPage: processInfoHasNextPage,
    isFetching: processInfoIsFetching,
    isLoading: processInfoLoading,
  } = useInfiniteQuery({
    queryKey: ['permisionInProcessInfo', processSearch, selectedSiteId],
    queryFn: ({ pageParam }) =>
      SitesProcessNameScroll({
        pageParam,
        siteId: selectedSiteId,
        keyword: processSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!permissionForm.siteProcesses && isPermissionRegistrationPage,
  })

  const processOptions = useMemo(() => {
    const defaultOption = { id: '0', name: '선택' }
    const options = (processInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [processInfo])

  const handlePermissionCancel = () => {
    router.push('/permissionGroup')
  }
  return {
    permissionListQuery,
    permissionDeleteMutation,
    createPermissionMutation,
    PermissionModifyMutation,
    useUserAccountInfiniteScroll,
    useMenuListQuery,
    handlePermissionCancel,

    // 권한 그룹 등록에서 현장/공정에 자동 완성 무한 스크롤
    // useSitesPersonInfiniteScroll,
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명

    // useProcessNameInfiniteScroll,
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,

    // 상세
    useSinglepermissionListQuery,
    useSinglepermissionMenuListQuery,
    useSinglepermissionUserListQuery,
  }
}
