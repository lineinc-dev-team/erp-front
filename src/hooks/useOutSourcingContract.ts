import {
  SitesPersonScroll,
  SitesProcessNameScroll,
} from '@/services/managementCost/managementCostRegistrationService'
import {
  ContractModifyMutation,
  CreateOutsourcingContract,
  GetCompanyNameInfoService,
  OutsourcingContractCategoryTypeInfoService,
  OutsourcingContractDeductionIdInfoService,
  OutsourcingContractInfoHistoryService,
  OutsourcingContractStatuseIdInfoService,
  OutsourcingContractTaxIdInfoService,
  OutsourcingContractTypesIdInfoService,
} from '@/services/outsourcingContract/outsourcingContractRegistrationService'
import {
  OutsourcingContractInfoService,
  OutsourcingContractRemoveService,
} from '@/services/outsourcingContract/outsourcingContractService'
import { useContractFormStore, useContractSearchStore } from '@/stores/outsourcingContractStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { getTodayDateString } from '@/utils/formatters'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSiteId } from './useSiteIdNumber'

export default function useOutSourcingContract() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useContractFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 외주업체 조회
  const search = useContractSearchStore((state) => state.search)

  const form = useContractFormStore((state) => state.form)

  const pathName = usePathname()

  // 초기 화면에 들어왔을 때 currentPage 1로 세팅 (예: useEffect 등에서)
  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const OutsourcingContractListQuery = useQuery({
    queryKey: [
      'OutsourcingContractInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort /* 필요한 상태들 추가 */,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName === '선택' ? '' : search.siteName,

        processName: search.processName,
        companyName: search.companyName,
        businessNumber: search.businessNumber,
        contractType: search.contractType === 'BASE' ? '' : search.contractType,
        contractStatus: search.contractStatus === 'BASE' ? '' : search.contractStatus,
        contractStartDate: getTodayDateString(search.contractStartDate),
        contractEndDate: getTodayDateString(search.contractEndDate),
        contactName: search.contactName,
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

      return OutsourcingContractInfoService(filteredParams)
    },
    enabled: pathName === '/outsourcingContract', // 경로 체크
  })

  const createOutSourcingContractMutation = useMutation({
    mutationFn: CreateOutsourcingContract,
    onSuccess: () => {
      showSnackbar('외주계약이 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['OutsourcingContractInfo'] })
      reset()
      router.push('/outsourcingContract')
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('외주계약 등록에 실패했습니다.', 'error')
      }
    },
  })

  // 등록 취소
  const outsourcingCancel = () => {
    router.push('/outsourcingContract')
  }

  // mutation 정의
  const ContractModifyBtn = useMutation({
    mutationFn: (outsourcingContractId: number) => ContractModifyMutation(outsourcingContractId),

    onSuccess: async () => {
      showSnackbar('외주업체 계약이 수정 되었습니다.', 'success')

      if (form.type === 'SERVICE') {
        queryClient.invalidateQueries({ queryKey: ['OutsourcingContractInfo'] })
        queryClient.invalidateQueries({ queryKey: ['OutsourcingPersonDetailInfo'] })
      } else if (form.type === 'CONSTRUCTION') {
        queryClient.invalidateQueries({ queryKey: ['OutsourcingContractInfo'] })
        queryClient.invalidateQueries({ queryKey: ['OutsourcingConstructionDetailInfo'] })
      } else if (form.type === 'EQUIPMENT') {
        queryClient.invalidateQueries({ queryKey: ['OutsourcingContractInfo'] })
        queryClient.invalidateQueries({ queryKey: ['OutsourcingEqDetailInfo'] })
        queryClient.invalidateQueries({ queryKey: ['OutsourcingDrDetailInfo'] })
      }
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('외주업체 계약 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 삭제
  const OutsourcingContractDeleteMutation = useMutation({
    mutationFn: ({ contractIds }: { contractIds: number[] }) =>
      OutsourcingContractRemoveService(contractIds),

    onSuccess: () => {
      showSnackbar('외주업체 계약이 삭제되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['OutsourcingContractInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar(' 외주업체 계약 삭제에 실패했습니다.', 'error')
      }
    },
  })

  // 수정이력 조회 쿼리
  const useOutsourcingContractHistoryDataQuery = (historyId: number, enabled: boolean) => {
    return useInfiniteQuery({
      queryKey: ['OutsourcingContractInfo', historyId],
      queryFn: ({ pageParam = 0 }) =>
        OutsourcingContractInfoHistoryService(historyId, pageParam, 4, 'id,desc'),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage?.data
        const nextPage = sliceInfo?.page + 1

        return sliceInfo?.hasNext ? nextPage : undefined
      },
      enabled: enabled && !!historyId && !isNaN(historyId),
    })
  }

  const [sitesSearch, setSitesSearch] = useState('')

  const {
    data: siteNameInfo,
    fetchNextPage: siteNameFetchNextPage,
    hasNextPage: siteNamehasNextPage,
    isFetching: siteNameFetching,
    isLoading: siteNameLoading,
  } = useInfiniteQuery({
    queryKey: ['ContractsiteInfo', sitesSearch],
    queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword: sitesSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const sitesOptions = useMemo(() => {
    const defaultOption = { id: 0, name: '선택', deleted: false }
    const options = (siteNameInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        deleted: false,
      }))

    return [defaultOption, ...options]
  }, [siteNameInfo])

  const useSitePersonNameListInfiniteScroll = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['ContractsiteInfo', keyword],
      queryFn: ({ pageParam }) => SitesPersonScroll({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1
        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  const [processSearch, setProcessSearch] = useState('')

  const isSearchPage = pathName.includes('/outsourcingContract')

  const siteId = useSiteId() // 훅 실행해서 값 받기

  const {
    data: processInfo,
    fetchNextPage: processInfoFetchNextPage,
    hasNextPage: processInfoHasNextPage,
    isFetching: processInfoIsFetching,
    isLoading: processInfoLoading,
  } = useInfiniteQuery({
    queryKey: ['ContractprocessInfo', processSearch, siteId],
    queryFn: ({ pageParam }) =>
      SitesProcessNameScroll({
        pageParam,
        siteId: siteId,
        keyword: processSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: true,
  })

  const processOptions = useMemo(() => {
    const defaultOption = { id: 0, name: '선택', deleted: false }
    const options = (processInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        deleted: false,
      }))

    return [defaultOption, ...options]
  }, [processInfo])

  // 구분 데이터 가져오는 스크롤
  const { data: typeInfoId } = useQuery({
    queryKey: ['ContractTypeInfo'],
    queryFn: OutsourcingContractTypesIdInfoService,
    enabled: isSearchPage, // 등록 페이지일 때만 실행
  })

  const typeMethodOptions = [{ code: 'BASE', name: '선택' }, ...(typeInfoId?.data ?? [])]

  //  세금데이터 가져오는 스크롤
  const { data: taxInfoId } = useQuery({
    queryKey: ['ContractTaxInfo'],
    queryFn: OutsourcingContractTaxIdInfoService,
  })

  console.log('typeMethodOptionstypeMethodOptionstypeMethodOptions', typeMethodOptions)
  const taxMethodOptions = [{ code: 'BASE', name: '선택' }, ...(taxInfoId?.data ?? [])]

  const { data: daduInfoId } = useQuery({
    queryKey: ['ContractdaduInfo'],
    queryFn: OutsourcingContractDeductionIdInfoService,
  })

  const deduMethodOptions = [...(daduInfoId?.data ?? [])]

  const { data: statusInfoId } = useQuery({
    queryKey: ['ContractStatusInfo'],
    queryFn: OutsourcingContractStatuseIdInfoService,
    enabled: isSearchPage, // 등록 페이지일 때만 실행
  })

  const statusMethodOptions = [{ code: 'BASE', name: '선택' }, ...(statusInfoId?.data ?? [])]

  // 장비에서만 보이는 유형
  const { data: categoryInfoId } = useQuery({
    queryKey: ['CategoryInfoIdStatusInfo'],
    queryFn: OutsourcingContractCategoryTypeInfoService,
  })

  const categoryMethodOptions = [{ code: 'BASE', name: '선택' }, ...(categoryInfoId?.data ?? [])]

  // 업체명 리스트 + 사업자등록 번호

  // const {
  //   data: comPanyNameInfo,
  //   fetchNextPage: comPanyNameFetchNextPage,
  //   hasNextPage: comPanyNamehasNextPage,
  //   isFetching: comPanyNameFetching,
  //   isLoading: comPanyNameLoading,
  // } = useInfiniteQuery({
  //   queryKey: ['compnayInfo'],
  //   queryFn: ({ pageParam = 0 }) => GetCompanyNameInfoService({ pageParam }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage) => {
  //     const { sliceInfo } = lastPage.data
  //     const nextPage = sliceInfo.page + 1
  //     return sliceInfo.hasNext ? nextPage : undefined
  //   },
  // })

  // const companyOptions = useMemo(() => {
  //   const defaultOption = { id: 0, name: '선택', businessNumber: '', deleted: false }

  //   const options = (comPanyNameInfo?.pages || [])
  //     .flatMap((page) => page.data.content)
  //     .map((user) => ({
  //       id: user.id,
  //       name: user.name,
  //       businessNumber: user.businessNumber,
  //       ceoName: user.ceoName,
  //       bankName: user.bankName,
  //       accountNumber: user.accountNumber,
  //       accountHolder: user.accountHolder,
  //       deleted: false,
  //     }))

  //   return [defaultOption, ...options]
  // }, [comPanyNameInfo])

  const useOutsourcingNameListInfiniteScroll = (keyword: string, type: string = '') => {
    return useInfiniteQuery({
      queryKey: ['outsourcingInfo', keyword, type], // type도 queryKey에 포함
      queryFn: ({ pageParam }) => GetCompanyNameInfoService({ pageParam, keyword, type }), // type이 없으면 빈 문자열
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1
        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

  return {
    OutsourcingContractListQuery,
    createOutSourcingContractMutation,

    typeMethodOptions,
    taxMethodOptions,
    deduMethodOptions,
    statusMethodOptions,
    categoryMethodOptions,

    outsourcingCancel,
    ContractModifyBtn,
    OutsourcingContractDeleteMutation,
    useOutsourcingContractHistoryDataQuery,

    // 업체명
    useOutsourcingNameListInfiniteScroll,
    // 외주계약등록에서 사용 할 현장명
    // setSitesSearch,
    // sitesOptions,
    // siteNameFetchNextPage,
    // siteNamehasNextPage,
    // siteNameFetching,
    // siteNameLoading,

    useSitePersonNameListInfiniteScroll,

    sitesOptions,
    setSitesSearch,
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
