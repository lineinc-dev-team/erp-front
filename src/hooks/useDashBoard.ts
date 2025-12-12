import {
  DashBoardBatchDaysInfoService,
  DashBoardBatchInfoService,
  DashBoardInfoService,
  NoHeadOfficeDashBoardInfoService,
} from '@/services/dashBoard/dashBoardService'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

// 로그인한 아이디가 본사 인 경우에만 실행
export default function useDashBoard(isHeadOffice?: boolean) {
  const DashBoardListQuery = useQuery({
    queryKey: ['mainDashBoardInfo'],
    queryFn: () => {
      return DashBoardInfoService()
    },
    enabled: isHeadOffice === true, // ← 조건 추가
  })

  // 본사가아닌 사람들
  const NoHeadOfficeDashBoardListQuery = (keyword: string) =>
    useInfiniteQuery({
      queryKey: ['noHeadOfficeDashBoardInfo', keyword],
      queryFn: () => NoHeadOfficeDashBoardInfoService({ keyword }),
      initialPageParam: 0,
      getNextPageParam: () => undefined,
    })

  const DashBoardBatchListQuery = useQuery({
    queryKey: ['batchDashBoardInfo'],
    queryFn: () => {
      return DashBoardBatchInfoService()
    },
  })

  const DashboarDaysQuery = useQuery({
    queryKey: ['dashBoardDaysInfo', DashBoardBatchListQuery?.data?.data[1]?.code],
    queryFn: () => {
      const rawParams = {
        batchName: DashBoardBatchListQuery?.data?.data[1]?.code,
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

      return DashBoardBatchDaysInfoService(filteredParams)
    },
    enabled: !!DashBoardBatchListQuery?.data?.data[1]?.code,
  })

  return {
    DashBoardListQuery,
    DashBoardBatchListQuery,
    DashboarDaysQuery,
    NoHeadOfficeDashBoardListQuery,
  }
}
