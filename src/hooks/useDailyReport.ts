import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useMemo } from 'react'
import {
  CompleteInfoData,
  CreatedailyReport,
  GetContractNameInfoService,
  GetEmployeeInfoService,
  GetWithEquipmentService,
  ModifyContractReport,
  ModifyEmployeesReport,
  ModifyEquipmentReport,
  ModifyFileReport,
  ModifyFuelReport,
  ModifyOutsourcingReport,
} from '@/services/dailyReport/dailyReportRegistrationService'
import { useDailyFormStore } from '@/stores/dailyReportStore'

export function useDailyReport() {
  const { showSnackbar } = useSnackbarStore()

  const {
    // 직원 정보
  } = useDailyFormStore()

  // const router = useRouter()

  const queryClient = useQueryClient()

  // 출역일보 등록
  const createDailyMutation = useMutation({
    mutationFn: CreatedailyReport,
    onSuccess: () => {
      showSnackbar('출역일보가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['DailyCreate'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보 등록이 실패했습니다.', 'error')
      }
    },
  })

  // 출역일보 수정

  const EmployeesModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyEmployeesReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보(직원)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyEmployee'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(직원) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 외주 수정
  const OutsourcingModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyOutsourcingReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보(외주)가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyOut'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(외주) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 장비를 가지고 있는 업체만 조회 쿼리

  const {
    data: withEquipmentInfo,
    fetchNextPage: withEquipmentFetchNextPage,
    hasNextPage: withEquipmenthasNextPage,
    isFetching: withEquipmentFetching,
    isLoading: withEquipmentLoading,
  } = useInfiniteQuery({
    queryKey: ['withEquipmentInfo'],
    queryFn: ({ pageParam = 0 }) => GetWithEquipmentService({ pageParam, size: 6 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const withEquipmentInfoOptions = useMemo(() => {
    const defaultOptions = [{ id: 0, name: '선택', deleted: false }]

    const options = (withEquipmentInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        deleted: false,
      }))

    return [...defaultOptions, ...options]
  }, [withEquipmentInfo])

  // 장비 수정
  const EquipmentModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyEquipmentReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보(장비)가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyEq'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(장비) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 직영/계약직 수정

  const ContractModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyContractReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보(직영/계약직)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyContract'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(직영/계약직) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 유류 수정
  const FuelModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyFuelReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보(유류)가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyFuel'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(유류) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 파일 수정

  // 유류 수정
  const FileModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyFileReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보(현장 사진)을 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyFileInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(현장 사진) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 마감 활성화
  const CompleteInfoMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => CompleteInfoData({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('출역일보 정보가 마감 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['CompleteInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보 정보가 마감 에 실패했습니다.', 'error')
      }
    },
  })

  const {
    data: employeeInfo,
    fetchNextPage: employeeFetchNextPage,
    hasNextPage: employeehasNextPage,
    isFetching: employeeFetching,
    isLoading: employeeLoading,
  } = useInfiniteQuery({
    queryKey: ['employeeInfo'],
    queryFn: ({ pageParam = 0 }) => GetEmployeeInfoService({ pageParam, size: 6 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const employeeInfoOptions = useMemo(() => {
    const defaultOptions = [{ id: 0, name: '선택', type: '' }]

    const options = (employeeInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        type: user.type,
      }))

    return [...defaultOptions, ...options]
  }, [employeeInfo])

  // 계약직만 데이터 조회

  const {
    data: contractInfo,
    fetchNextPage: contractNameFetchNextPage,
    hasNextPage: contractNamehasNextPage,
    isFetching: contractNameFetching,
    isLoading: contractNameLoading,
  } = useInfiniteQuery({
    queryKey: ['contractInfo'],
    queryFn: ({ pageParam = 0 }) => GetContractNameInfoService({ pageParam, size: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  console.log('contractInfo', contractInfo)

  const contractNameInfoOptions = useMemo(() => {
    const defaultOptions = [
      {
        id: 0,
        name: '선택',
        type: '',
        previousDailyWage: '',
        dailyWage: '',
        isSeverancePayEligible: false,
      },
    ]

    const options = (contractInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        type: user.type,
        previousDailyWage: user.previousDailyWage,
        dailyWage: user.dailyWage,
        isSeverancePayEligible: user.isSeverancePayEligible,
      }))

    return [...defaultOptions, ...options]
  }, [contractInfo])

  // 업체명의 인력 조회cp

  // // 회사 변경
  // const handleCompanyChange = (rowId: number, companyId: number) => {
  //   setSelectedCompanyIds((prev) => ({
  //     ...prev,
  //     [rowId]: companyId,
  //   }))

  //   updateItemField('outsourcings', rowId, 'outsourcingCompanyId', companyId)
  //   updateItemField('outsourcings', rowId, 'outsourcingCompanyContractWorkerId', 0)
  // }

  // // selectedCompanyIds가 바뀌면 testNumber 업데이트
  // const newTestId = useOutSourcingInfoClientId(selectedCompanyIds)

  const reportCancel = () => {
    // router.push('dailyReport/registration')
    // router.refresh()
    window.location.reload() // push 후 강제 새로고침
  }

  return {
    createDailyMutation,
    EmployeesModifyMutation,

    ContractModifyMutation,

    OutsourcingModifyMutation,
    EquipmentModifyMutation,
    FuelModifyMutation,
    FileModifyMutation,

    CompleteInfoMutation,

    reportCancel,
    employeeInfoOptions,
    employeeFetchNextPage,
    employeehasNextPage,
    employeeFetching,
    employeeLoading,

    // 계약직 이름

    contractNameInfoOptions,
    contractNameFetchNextPage,
    contractNamehasNextPage,
    contractNameFetching,
    contractNameLoading,

    // 인력 정보 조회

    // 장비를 가지고 있는 업체명
    withEquipmentInfoOptions,
    withEquipmentFetchNextPage,
    withEquipmenthasNextPage,
    withEquipmentFetching,
    withEquipmentLoading,
  }
}
