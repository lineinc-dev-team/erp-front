import {
  EquipmentCostInfoServiceByAggregate,
  EquipmentStatusInfoServiceByAggregate,
  FuelInfoServiceByAggregate,
  FuelPriceInfoServiceByAggregate,
  LaborCostInfoServiceByAggregate,
  LaborPayInfoServiceByAggregate,
  MaterialInfoServiceByAggregate,
  OutsourcingLaborCostInfoServiceByAggregate,
  WeatherInfoServiceByAggregate,
} from '@/services/finalAggregation/finalAggregationService'
import { useQuery } from '@tanstack/react-query'

export default function useFinalAggregationView({
  yearMonth,
  siteId,
  siteProcessId,
  fuelType,
  laborType,
  type,
  tabName,
}: {
  yearMonth: string
  siteId: number
  siteProcessId: number
  fuelType?: string
  laborType?: string
  type?: string
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

  // 노무비 조회

  const LaborCostListQuery = useQuery({
    queryKey: ['LaborCostInfo', { yearMonth, siteId, siteProcessId, laborType }],
    queryFn: async () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth,
        laborType,
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

      return await LaborCostInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'LABOR' && [yearMonth, siteId, siteProcessId, laborType].every(Boolean),
  })

  // 노무비에서 용역 데이터 불러오기
  const OutSourcingLaborCostListQuery = useQuery({
    queryKey: ['outSourcingLaborInfo', yearMonth, siteId, siteProcessId],
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

      return OutsourcingLaborCostInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'LABOR' && !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  // 노무비에서 용역 데이터 불러오기
  const EquipmentLaborCostListQuery = useQuery({
    queryKey: ['equipmentLaborInfo', yearMonth, siteId, siteProcessId],
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

      return EquipmentCostInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'EQUIPMENT' && !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  // 장비비 가동현황에서 용역 데이터 불러오기
  const EquipmentStatusLaborCostListQuery = useQuery({
    queryKey: ['equipmentStatusLaborInfo', yearMonth, siteId, siteProcessId],
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

      return EquipmentStatusInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'EQUIPMENT_OPERATION' && !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  // 장비비 가동현황 날씨 조회

  const WeatherInfoListQuery = useQuery({
    queryKey: ['weatherInfo', yearMonth, siteId, siteProcessId],
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

      return WeatherInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'EQUIPMENT_OPERATION' && !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  // 노무비 명세서
  const LaborPayCostListQuery = useQuery({
    queryKey: ['LaborPayInfo', { yearMonth, siteId, siteProcessId, type }],
    queryFn: async () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth,
        type,
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

      return await LaborPayInfoServiceByAggregate(filteredParams)
    },
    enabled: tabName === 'LABOR_DETAIL' && [yearMonth, siteId, siteProcessId, type].every(Boolean),
  })

  return {
    MaterialListQuery,
    OilListQuery,
    fuelPricelListQuery,
    LaborCostListQuery,
    OutSourcingLaborCostListQuery,
    EquipmentLaborCostListQuery,
    EquipmentStatusLaborCostListQuery,
    WeatherInfoListQuery,
    LaborPayCostListQuery,
  }
}
