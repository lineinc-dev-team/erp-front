import {
  SitesPersonScroll,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'
import {
  ModifyOutsourcingCompany,
  OutsourcingCompanyInfoHistoryService,
} from '@/services/outsourcingCompany/outsourcingCompanyRegistrationService'
import {
  OutsourcingCompanyInfoService,
  OutsourcingCompanyRemoveService,
} from '@/services/outsourcingCompany/outsourcingCompanyService'
import {
  CreateOutsourcingContract,
  GetCompanyNameInfoService,
  OutsourcingContractCategoryTypeInfoService,
  OutsourcingContractDeductionIdInfoService,
  OutsourcingContractStatuseIdInfoService,
  OutsourcingContractTaxIdInfoService,
  OutsourcingContractTypesIdInfoService,
} from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import {
  useOutsourcingFormStore,
  useOutsourcingSearchStore,
} from '@/stores/outsourcingCompanyStore'
import { useContractFormStore } from '@/stores/outsourcingContractStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { getTodayDateString } from '@/utils/formatters'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function useOutSourcingContract() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useOutsourcingFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 외주업체 조회
  const search = useOutsourcingSearchStore((state) => state.search)

  const pathName = usePathname()

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
        type: search.type,
        createdStartDate: getTodayDateString(search.startDate),
        createdEndDate: getTodayDateString(search.endDate),
        isActive: search.isActive === '1' ? true : search.isActive === '2' ? false : undefined,
        page: search.currentPage - 1, // 항상 현재 페이지에 맞춤
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

      return OutsourcingCompanyInfoService(filteredParams)
    },
    staleTime: 1000 * 30,
    enabled: pathName === '/outsourcingCompany', // 경로 체크
  })

  const createOutSourcingContractMutation = useMutation({
    mutationFn: CreateOutsourcingContract,
    onSuccess: () => {
      showSnackbar('외주계약이 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['outsourcingContractInfo'] })
      reset()
      router.push('/outsourcingContract')
    },
    onError: () => {
      showSnackbar('외주계약 등록에 실패했습니다.', 'error')
    },
  })

  const outsourcingCancel = () => {
    router.push('/outsourcingContract')
  }

  // 수정 쿼리
  const OutsourcingModifyMutation = useMutation({
    mutationFn: (outsourcingIds: number) => ModifyOutsourcingCompany(outsourcingIds),

    onSuccess: () => {
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('외주업체가 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['outsourcingInfo'] })
        reset()
        router.push('/outsourcingCompany')
      }
    },

    onError: () => {
      showSnackbar(' 외주업체 수정에 실패했습니다.', 'error')
    },
  })

  // 삭제
  const OutsourcingDeleteMutation = useMutation({
    mutationFn: ({ outsourcingCompanyIds }: { outsourcingCompanyIds: number[] }) =>
      OutsourcingCompanyRemoveService(outsourcingCompanyIds),

    onSuccess: () => {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        showSnackbar('외주업체가 삭제되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['OutsourcingInfo'] })
      }
    },

    onError: () => {
      showSnackbar(' 외주업체 삭제에 실패했습니다.', 'error')
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

  // 현장명, 공정명 무한 스크롤 기능

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
  })

  const sitesOptions = useMemo(() => {
    const defaultOption = { id: 0, name: '선택' }
    const options = (siteNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [siteNameInfo])

  const [processSearch, setProcessSearch] = useState('')

  const getSiteName = useContractFormStore((state) => state.form)

  const {
    data: processInfo,
    fetchNextPage: processInfoFetchNextPage,
    hasNextPage: processInfoHasNextPage,
    isFetching: processInfoIsFetching,
    isLoading: processInfoLoading,
  } = useInfiniteQuery({
    queryKey: ['processInfo', processSearch, getSiteName.siteId],
    queryFn: ({ pageParam }) =>
      SitesProcessNameScroll({
        pageParam,
        siteId: getSiteName.siteId,
        keyword: processSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!getSiteName.siteId,
  })

  const processOptions = useMemo(() => {
    const defaultOption = { id: 0, name: '선택' }
    const options = (processInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [processInfo])

  // 구분 데이터 가져오는 스크롤
  const { data: typeInfoId } = useQuery({
    queryKey: ['ContractTypeInfo'],
    queryFn: OutsourcingContractTypesIdInfoService,
  })

  const typeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(typeInfoId?.data ?? [])]

  //  세금데이터 가져오는 스크롤
  const { data: taxInfoId } = useQuery({
    queryKey: ['ContractTaxInfo'],
    queryFn: OutsourcingContractTaxIdInfoService,
  })

  const taxMethodOptions = [{ code: 'BASE', name: '선택' }, ...(taxInfoId?.data ?? [])]

  const { data: daduInfoId } = useQuery({
    queryKey: ['ContractdaduInfo'],
    queryFn: OutsourcingContractDeductionIdInfoService,
  })

  const deduMethodOptions = [{ code: 'BASE', name: '선택' }, ...(daduInfoId?.data ?? [])]

  const { data: statusInfoId } = useQuery({
    queryKey: ['ContractStatusInfo'],
    queryFn: OutsourcingContractStatuseIdInfoService,
  })

  const statusMethodOptions = [{ code: 'BASE', name: '선택' }, ...(statusInfoId?.data ?? [])]

  // 장비에서만 보이는 유형
  const { data: categoryInfoId } = useQuery({
    queryKey: ['CategoryInfoIdStatusInfo'],
    queryFn: OutsourcingContractCategoryTypeInfoService,
  })

  const categoryMethodOptions = [{ code: 'BASE', name: '선택' }, ...(categoryInfoId?.data ?? [])]

  // 업체명 리스트 + 사업자등록 번호

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
    const defaultOption = { id: 0, name: '선택' }
    const options = (comPanyNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
      }))

    return [defaultOption, ...options]
  }, [comPanyNameInfo])

  return {
    OutsourcingListQuery,
    createOutSourcingContractMutation,

    typeMethodOptions,
    taxMethodOptions,
    deduMethodOptions,
    statusMethodOptions,
    categoryMethodOptions,

    outsourcingCancel,
    OutsourcingModifyMutation,
    OutsourcingDeleteMutation,
    useOutsourcingCompanyHistoryDataQuery,

    // 업체명
    setCompanySearch,
    companyOptions,
    comPanyNameFetchNextPage,
    comPanyNamehasNextPage,
    comPanyNameFetching,
    comPanyNameLoading,

    // 외주계약등록에서 사용 할 현장명
    setSitesSearch,
    sitesOptions,
    siteNameFetchNextPage,
    siteNamehasNextPage,
    siteNameFetching,
    siteNameLoading,

    // 공정명
    setProcessSearch,
    processOptions,
    processInfoFetchNextPage,
    processInfoHasNextPage,
    processInfoIsFetching,
    processInfoLoading,
  }
}
