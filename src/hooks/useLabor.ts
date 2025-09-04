import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useManagementMaterialFormStore } from '@/stores/materialManagementStore'

import {
  CreateLabor,
  LabelTypeService,
  LaborInfoHistoryService,
  ModifyLaborData,
  WorkTypeService,
} from '@/services/labor/laborRegistrationService'
import { GetCompanyNameInfoService } from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import {
  GetTypeDesInfoService,
  LaborListInfoService,
  LaborListRemoveService,
} from '@/services/labor/laborService'
import { useLaborSearchStore } from '@/stores/laborStore'

export function useLaborInfo() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useManagementMaterialFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  //   공종 구분조회
  const { data: workTypeInfoId } = useQuery({
    queryKey: ['LaborWorkTypeInfo'],
    queryFn: WorkTypeService,
  })

  const WorkTypeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(workTypeInfoId?.data ?? [])]

  //   노무 구분 조회
  const { data: laborTypeInfoId } = useQuery({
    queryKey: ['LaborTypeInfo'],
    queryFn: LabelTypeService,
  })

  const LaborTypeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(laborTypeInfoId?.data ?? [])]

  // 인력정보 등록
  const createLaborInfo = useMutation({
    mutationFn: CreateLabor,
    onSuccess: () => {
      showSnackbar('인력정보가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['LaborInfo'] })
      reset()
      router.push('/labors')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('인력정보 등록에 실패했습니다.', 'error')
      }
    },
  })

  // 인력정보 조회

  const search = useLaborSearchStore((state) => state.search)

  const pathName = usePathname()

  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const LaborListQuery = useQuery({
    queryKey: [
      'LaborInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        type: search.type === 'BASE' ? undefined : search.type,
        typeDescription: search.typeDescription === '선택' ? undefined : search.typeDescription,
        name: search.name,
        residentNumber: search.residentNumber,
        outsourcingCompanyId:
          search.outsourcingCompanyId === -1 ? undefined : search.outsourcingCompanyId,
        phoneNumber: search.phoneNumber,
        isHeadOffice:
          search.outsourcingCompanyId === -1
            ? undefined
            : search.outsourcingCompanyId === 0
            ? true
            : false,

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

      return LaborListInfoService(filteredParams)
    },
    enabled: pathName === '/labors', // 경로 체크
  })

  //인력정보 삭제!
  const LaborDeleteMutation = useMutation({
    mutationFn: ({ laborIds }: { laborIds: number[] }) => LaborListRemoveService(laborIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('인력정보가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['LaborInfo'] })
      }
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('인력정보 삭제에 실패했습니다.', 'error')
      }
    },
  })

  // 인력정보 수정

  const LaborModifyMutation = useMutation({
    mutationFn: (laborId: number) => ModifyLaborData(laborId),

    onSuccess: () => {
      showSnackbar('인력정보가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['LaborInfo'] })
      reset()
      router.push('/labors')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('인력정보 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 인력정보 조회 쿼리
  const useLaborHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['LaborHistoryList', historyId],
      queryFn: ({ pageParam = 0 }) => LaborInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  const laborCancel = () => {
    router.push('/labors')
  }

  const [CompanySearch, setCompanySearch] = useState('')

  const {
    data: comPanyNameInfo,
    fetchNextPage: comPanyNameFetchNextPage,
    hasNextPage: comPanyNamehasNextPage,
    isFetching: comPanyNameFetching,
    isLoading: comPanyNameLoading,
  } = useInfiniteQuery({
    queryKey: ['compnayInfo', CompanySearch],
    queryFn: ({ pageParam }) => GetCompanyNameInfoService({ pageParam, keyword: CompanySearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const companyOptions = useMemo(() => {
    const defaultOptions = [
      { id: -1, name: '선택', deleted: false },
      { id: 0, name: '라인공영', deleted: false },
    ]

    const options = (comPanyNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        deleted: false,
      }))

    return [...defaultOptions, ...options]
  }, [comPanyNameInfo])

  // 구분을 기타로 선택 시 보여주는 쿼리

  const [ETCdesSearch, setETCdesSearch] = useState('')

  const {
    data: etcDescriptionInfo,
    fetchNextPage: etcDescriptionFetchNextPage,
    hasNextPage: etcDescriptionhasNextPage,
    isFetching: etcDescriptionFetching,
    isLoading: etcDescriptionLoading,
  } = useInfiniteQuery({
    queryKey: ['etcInfo', ETCdesSearch],
    queryFn: ({ pageParam }) => GetTypeDesInfoService({ pageParam, keyword: ETCdesSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const etcDesOptions = useMemo(() => {
    const defaultOptions = [{ id: 0, typeDescription: '선택' }]

    const options = (etcDescriptionInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        typeDescription: user.typeDescription,
      }))

    return [...defaultOptions, ...options]
  }, [etcDescriptionInfo])

  return {
    createLaborInfo,
    WorkTypeMethodOptions,
    LaborTypeMethodOptions,

    LaborDeleteMutation,

    LaborModifyMutation,
    LaborListQuery,
    laborCancel,

    useLaborHistoryDataQuery,

    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,

    // 기타의 설명 데이터 값

    etcDesOptions,
    setETCdesSearch,
    etcDescriptionFetchNextPage,
    etcDescriptionhasNextPage,
    etcDescriptionFetching,
    etcDescriptionLoading,
  }
}
