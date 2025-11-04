import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useEffect, useMemo } from 'react'
import {
  CompleteInfoData,
  CreatedailyReport,
  DailyAlreadyFuelInfo,
  DailyListInfoService,
  GetEmployeeInfoService,
  GetWithEquipmentService,
  ModifyContractReport,
  ModifyDailyFuel,
  ModifyDirectContractReport,
  ModifyEmployeesReport,
  ModifyEquipmentReport,
  ModifyFileReport,
  ModifyInputStatusReport,
  ModifyMainProcessReport,
  ModifyMaterialStatusReport,
  // ModifyFuelReport,
  ModifyOutsourcingReport,
  ModifyWorkerReport,
} from '@/services/dailyReport/dailyReportRegistrationService'
import { useDailyFormStore, useDailySearchList } from '@/stores/dailyReportStore'
import { usePathname } from 'next/navigation'
import { getTodayDateString } from '@/utils/formatters'

export function useDailyReport() {
  const { showSnackbar } = useSnackbarStore()

  // 출역일보 조회

  const search = useDailySearchList((state) => state.search)

  const pathName = usePathname()

  useEffect(() => {
    if (search.searchTrigger && search.currentPage !== 0) {
      search.setField('currentPage', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.searchTrigger])

  // useQuery 쪽 수정
  const DailyListQuery = useQuery({
    queryKey: [
      'DailyInfo',
      search.searchTrigger,
      search.currentPage,
      search.pageCount,
      search.arraySort,
      pathName,
    ],
    queryFn: () => {
      const rawParams = {
        siteName: search.siteName === '선택' ? undefined : search.siteName,
        processName: search.processName === '선택' ? undefined : search.processName,

        isCompleted:
          search.isCompleted === '선택' ? undefined : search.isCompleted === 'Y' ? true : false,

        isEvidenceSubmitted:
          search.isEvidenceSubmitted === '선택'
            ? undefined
            : search.isEvidenceSubmitted === 'Y'
            ? true
            : false,

        startDate: getTodayDateString(search.startDate),
        endDate: getTodayDateString(search.endDate),

        page: search.currentPage - 1,
        size: Number(search.pageCount) || 10,
        sort: search.arraySort === '최신순' ? 'reportDate,desc ' : 'reportDate,asc',
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

      return DailyListInfoService(filteredParams)
    },
    enabled: pathName === '/dailyReport', // 경로 체크
  })

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
    queryFn: ({ pageParam = 0 }) => GetWithEquipmentService({ pageParam, size: 200 }),
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

  const useOutsourcingNameByFuel = (keyword: string) => {
    return useInfiniteQuery({
      queryKey: ['withEquipmentInfo', keyword],
      queryFn: ({ pageParam }) => GetWithEquipmentService({ pageParam, keyword }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const { sliceInfo } = lastPage.data
        const nextPage = sliceInfo.page + 1
        return sliceInfo.hasNext ? nextPage : undefined
      },
    })
  }

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
    mutationFn: async ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => {
      const res1 = await ModifyContractReport({ siteId, siteProcessId, reportDate })

      const res2 = await ModifyDirectContractReport({ siteId, siteProcessId, reportDate })

      // 필요하다면 두 응답을 함께 리턴
      return { res1, res2 }
    },

    onSuccess: () => {
      showSnackbar('출역일보(직영)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['DailyContract'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(직영) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 공사일보(주요공정)

  const MainProcessModifyMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyMainProcessReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('공사일보(주요공정)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['MainProcess'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('공사일보(주요공정) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 공사일보(투입현황)

  const MainInputStatusMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyInputStatusReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('공사일보(투입현황)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['inputStatus'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('공사일보(투입현황) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 공사일보(자재현황)

  const MaterialStatusMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyMaterialStatusReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('공사일보(자재현황)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['materialStatus'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('공사일보(자재현황) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 공사일보(작업현황)

  const WorkerStatusMutation = useMutation({
    mutationFn: ({
      siteId,
      siteProcessId,
      reportDate,
    }: {
      siteId: number
      siteProcessId: number
      reportDate: string
    }) => ModifyWorkerReport({ siteId, siteProcessId, reportDate }),

    onSuccess: () => {
      showSnackbar('공사일보(작업현황)이 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['workerStatus'] })
      // reset()
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('공사일보(작업현황) 수정에 실패했습니다.', 'error')
      }
    },
  })

  const FuelModifyMutation = useMutation({
    mutationFn: (fuelId: number) => ModifyDailyFuel(fuelId),

    onSuccess: () => {
      showSnackbar('출역일보(유류집계)가 수정 되었습니다.', 'success')
      queryClient.invalidateQueries({ queryKey: ['FuelAggregationInfo'] })
    },

    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보(유류집계) 수정에 실패했습니다.', 'error')
      }
    },
  })

  // 유류 수정
  // const FuelModifyMutation = useMutation({
  //   mutationFn: ({
  //     siteId,
  //     siteProcessId,
  //     reportDate,
  //   }: {
  //     siteId: number
  //     siteProcessId: number
  //     reportDate: string
  //   }) => ModifyFuelReport({ siteId, siteProcessId, reportDate }),

  //   onSuccess: () => {
  //     showSnackbar('출역일보(유류)가 수정 되었습니다.', 'success')
  //     queryClient.invalidateQueries({ queryKey: ['DailyFuel'] })
  //   },

  //   onError: (error: unknown) => {
  //     if (error instanceof Error) {
  //       showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
  //     } else {
  //       showSnackbar('출역일보(유류) 수정에 실패했습니다.', 'error')
  //     }
  //   },
  // })

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

  // 출역일보 직원 키워드 검색

  // const useEmployeeInfoInfiniteScroll = (keyword: string) => {
  //   return useInfiniteQuery({
  //     queryKey: ['employeeInfo', keyword],
  //     queryFn: ({ pageParam }) => GetEmployeeInfoService({ pageParam, keyword }),
  //     initialPageParam: 0,
  //     getNextPageParam: (lastPage) => {
  //       const { sliceInfo } = lastPage.data
  //       const nextPage = sliceInfo.page + 1
  //       return sliceInfo.hasNext ? nextPage : undefined
  //     },
  //   })
  // }

  const {
    data: employeeInfo,
    fetchNextPage: employeeFetchNextPage,
    hasNextPage: employeehasNextPage,
    isFetching: employeeFetching,
    isLoading: employeeLoading,
  } = useInfiniteQuery({
    queryKey: ['employeeInfo'],
    queryFn: ({ pageParam = 0 }) => GetEmployeeInfoService({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      const nextPage = sliceInfo.page + 1
      return sliceInfo.hasNext ? nextPage : undefined
    },
  })

  const employeeInfoOptions = useMemo(() => {
    const defaultOptions = [{ id: 0, name: '선택', type: '', grade: '' }]

    const options = (employeeInfo?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        type: user.type,
        grade: user.grade,
      }))

    return [...defaultOptions, ...options]
  }, [employeeInfo])

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

  // 유류집계 관리등록
  const createAlreadyFuelMutation = useMutation({
    mutationFn: DailyAlreadyFuelInfo,
    onSuccess: () => {
      showSnackbar('출역일보(유류집계)가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['Al'] })
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showSnackbar(error.message, 'error') // 여기서 서버 메시지 그대로 노출
      } else {
        showSnackbar('출역일보 등록이 실패했습니다.', 'error')
      }
    },
  })

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
    // useEmployeeInfoInfiniteScroll,

    employeeInfoOptions,
    employeeFetchNextPage,
    employeehasNextPage,
    employeeFetching,
    employeeLoading,
    // 계약직 이름

    // 인력 정보 조회

    // 장비를 가지고 있는 업체명
    withEquipmentInfoOptions,
    withEquipmentFetchNextPage,
    withEquipmenthasNextPage,
    withEquipmentFetching,
    withEquipmentLoading,

    MainInputStatusMutation,

    WorkerStatusMutation,

    DailyListQuery,

    MainProcessModifyMutation,
    MaterialStatusMutation,
    useOutsourcingNameByFuel,

    createAlreadyFuelMutation,
  }
}
