import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  SitesPersonScroll,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'
import {
  CreateManagementMaterial,
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

  // 강재 관리등록
  const createMaterialMutation = useMutation({
    mutationFn: CreateManagementMaterial,
    onSuccess: () => {
      showSnackbar('자재가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['materialInfo'] })
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

  useEffect(() => {
    if (search.currentPage !== 1) {
      search.setField('currentPage', 1)
    }
  }, [search])

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
        deliveryStartDate: getTodayDateString(search.deliveryStartDate),
        deliveryEndDate: getTodayDateString(search.deliveryEndDate),
        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort:
          search.arraySort === '최신순'
            ? 'id,desc'
            : search.arraySort === '날짜순'
            ? 'paymentDate.desc'
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

      console.log('검색 파라미터', filteredParams)

      return ManagementMaterialInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
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
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('자재비가 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['MaterialInfo'] })
        reset()
        router.push('/materialManagement')
      }
    },

    onError: () => {
      showSnackbar('자재비 수정에 실패했습니다.', 'error')
    },
  })

  // 현장명데이터를 가져옴 무한 스크롤

  const useSitesPersonInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['siteInfo', keyword],
      queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const [sitesSearch, setSitesSearch] = useState('')

  const {
    data: orderPersonInfo,
    // fetchNextPage,
    // hasNextPage,
    // isFetching,
    // isLoading,
  } = useInfiniteQuery({
    queryKey: ['siteInfo', sitesSearch],
    queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword: sitesSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const sitesOptions = useMemo(() => {
    const defaultOption = { label: '선택', value: '0' }
    const options = (orderPersonInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.name,
        value: user.id,
      }))

    return [defaultOption, ...options]
  }, [orderPersonInfo])

  // 공정명

  const useProcessNameInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['processInfo', keyword],
      queryFn: ({ pageParam }) => SitesProcessNameScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1

        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const [processSearch, setProcessSearch] = useState('')

  const {
    data: processInfo,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['processInfo', processSearch],
    queryFn: ({ pageParam }) => SitesProcessNameScroll({ pageParam, keyword: processSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const processOptions = useMemo(() => {
    const defaultOption = { label: '선택', value: '0' }
    const options = (processInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        label: user.name,
        value: user.id,
      }))

    return [defaultOption, ...options]
  }, [processInfo])

  return {
    createMaterialMutation,
    MaterialModifyMutation,
    MaterialListQuery,
    MaterialDeleteMutation,

    // 현장명 무한 스크롤
    useSitesPersonInfiniteScroll,
    setSitesSearch,
    sitesOptions,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,

    // 공정명
    useProcessNameInfiniteScroll,
    setProcessSearch,
    processOptions,
  }
}
