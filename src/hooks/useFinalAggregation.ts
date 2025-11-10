import {
  FuelInfoServiceByAggregate,
  FuelPriceInfoServiceByAggregate,
  MaterialInfoServiceByAggregate,
} from '@/services/finalAggregation/finalAggregationService'
import { useQuery } from '@tanstack/react-query'

export default function useFinalAggregationView({
  yearMonth,
  siteId,
  siteProcessId,
  fuelType,
  tabName,
}: {
  yearMonth: string
  siteId: number
  siteProcessId: number
  fuelType?: string
  tabName: string
}) {
  // 재료비 집계
  const MaterialListQuery = useQuery({
    queryKey: ['materialInfo', yearMonth, siteId, siteProcessId],
    queryFn: () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth: yearMonth,
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

      return MaterialInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'MATERIAL' && !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  // 유류집계 리스트 조회

  const OilListQuery = useQuery({
    queryKey: ['OilInfo', { yearMonth, siteId, siteProcessId, fuelType }],
    queryFn: async () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth,
        fuelType,
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

      return await FuelInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'FUEL' && [yearMonth, siteId, siteProcessId, fuelType].every(Boolean),
  })

  // 집계에서 유류집계쪽 날짜별 기름 가격 조회

  const fuelPricelListQuery = useQuery({
    queryKey: ['fuelPricelInfo', yearMonth, siteId, siteProcessId],
    queryFn: () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth: yearMonth,
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

      return FuelPriceInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'FUEL' && !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  return { MaterialListQuery, OilListQuery, fuelPricelListQuery }
}
