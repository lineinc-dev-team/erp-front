import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import { useRouter } from 'next/navigation'
import { useOrderingFormStore } from '@/stores/orderingStore'
import { ModifyClientCompany } from '@/services/ordering/orderingRegistrationService'
import { useMemo, useState } from 'react'
import {
  CreatedailyReport,
  GetEmployeeInfoService,
  OutsourcingWorkerNameScroll,
} from '@/services/dailyReport/dailyReportRegistrationService'
import { useOutSourcingClientId } from './useOutsourcingClientIdNumber'

export function useDailyReport() {
  const { showSnackbar } = useSnackbarStore()
  const { reset } = useOrderingFormStore()

  const router = useRouter()
  const queryClient = useQueryClient()

  // 출역일보 등록
  const createDailyMutation = useMutation({
    mutationFn: CreatedailyReport,
    onSuccess: () => {
      showSnackbar('출역일보가 등록 되었습니다.', 'success')
      // 초기화 로직
      queryClient.invalidateQueries({ queryKey: ['DailyInfo'] })
      reset()
      router.push('/dailyReport/registration')
    },
    onError: () => {
      showSnackbar('출역일보 등록이 실패했습니다.', 'error')
    },
  })

  // 발주처 수정

  const ClientModifyMutation = useMutation({
    mutationFn: (userIds: number) => ModifyClientCompany(userIds),

    onSuccess: () => {
      if (window.confirm('수정하시겠습니까?')) {
        showSnackbar('발주처가 수정 되었습니다.', 'success')
        queryClient.invalidateQueries({ queryKey: ['ClientInfo'] })
        reset()
        router.push('/ordering')
      }
    },

    onError: () => {
      showSnackbar(' 발주처 수정에 실패했습니다.', 'error')
    },
  })

  // 발주처에서 사용하는 유저 정보데이터
  // 조회에서 이름 검색 스크롤

  // 구분을 기타로 선택 시 보여주는 쿼리

  const [EmployeeSearch, setEmployeeSearch] = useState('')

  const {
    data: employeeInfo,
    fetchNextPage: employeeFetchNextPage,
    hasNextPage: employeehasNextPage,
    isFetching: employeeFetching,
    isLoading: employeeLoading,
  } = useInfiniteQuery({
    queryKey: ['employeeInfo', EmployeeSearch],
    queryFn: ({ pageParam }) => GetEmployeeInfoService({ pageParam, keyword: EmployeeSearch }),
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

  // 업체명의 인력 조회cp

  //차량번호 & 규격 무한 스크롤

  const clientId = useOutSourcingClientId()

  const [workerSearch, setWorkerSearch] = useState('')

  const {
    data: workerList,
    fetchNextPage: workerListFetchNextPage,
    hasNextPage: workerListHasNextPage,
    isFetching: workerListIsFetching,
    isLoading: workerListLoading,
  } = useInfiniteQuery({
    queryKey: ['WorkDataInfo', workerSearch, clientId],
    queryFn: ({ pageParam }) =>
      OutsourcingWorkerNameScroll({
        pageParam,
        id: clientId || 0,
        keyword: workerSearch,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const { sliceInfo } = lastPage.data
      return sliceInfo.hasNext ? sliceInfo.page + 1 : undefined
    },
    enabled: !!clientId,
  })

  const workListOptions = useMemo(() => {
    const defaultOption = {
      id: 0,
      name: '선택',
      category: '',
    }
    const options = (workerList?.pages || [])
      .flatMap((page) => page.data.content)
      .map((user) => ({
        id: user.id,
        name: user.name,
        category: user.category,
      }))

    return [defaultOption, ...options]
  }, [workerList])

  return {
    createDailyMutation,
    ClientModifyMutation,

    setEmployeeSearch,
    employeeInfoOptions,
    employeeFetchNextPage,
    employeehasNextPage,
    employeeFetching,
    employeeLoading,

    // 인력 정보 조회

    workListOptions,
    setWorkerSearch,
    workerListFetchNextPage,
    workerListHasNextPage,
    workerListIsFetching,
    workerListLoading,
  }
}
