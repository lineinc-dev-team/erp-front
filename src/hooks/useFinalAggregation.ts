import {
  EquipmentCostInfoServiceByAggregate,
  EquipmentStatusInfoServiceByAggregate,
  FuelInfoServiceByAggregate,
  FuelPriceInfoServiceByAggregate,
  GetConstructionDetailServiceByAggregate,
  GetConstructionServiceByAggregate,
  GetdeductionAmountServiceByAggregate,
  GetHeadOfficeServiceByAggregate,
  GetMealFeeCompanyServiceByAggregate,
  GetMealFeeDetailServiceByAggregate,
  LaborCostInfoServiceByAggregate,
  LaborPayInfoServiceByAggregate,
  ManagementCostInfoServiceByAggregate,
  ManagementOutSourcingInfoServiceByAggregate,
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
  outsourcingCompanyId,
  outsourcingCompanyContractId,
}: {
  yearMonth?: string
  siteId: number
  siteProcessId: number
  fuelType?: string
  laborType?: string
  type?: string
  tabName?: string
  outsourcingCompanyId?: number
  outsourcingCompanyContractId?: number
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
    enabled: !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
  })

  // 본사 집계 조회

  const HeadOfficeListQuery = useQuery({
    queryKey: ['headOfficeInfo', yearMonth, siteId, siteProcessId],
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

      return GetHeadOfficeServiceByAggregate(filteredParams)
    },
    enabled: !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
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
    enabled: [yearMonth, siteId, siteProcessId, fuelType].every(Boolean),
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
    enabled: !!yearMonth && !!siteId && !!siteProcessId, // 필수값 있을 때만 실행
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

  // 관리비 조회
  const ManagementCostListQuery = useQuery({
    queryKey: ['managementCostInfo', yearMonth, siteId, siteProcessId],
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

      return ManagementCostInfoServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'MANAGEMENT' &&
      !!yearMonth &&
      !!siteId &&
      !!siteProcessId &&
      outsourcingCompanyId === 0, // 필수값 있을 때만 실행
  })

  // 관리비에서 식대 거래처명 조회
  const MealFeeCompanyListQuery = useQuery({
    queryKey: ['mealFeeCompanyInfo', yearMonth, siteId, siteProcessId],
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

      return GetMealFeeCompanyServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'MANAGEMENT' &&
      !!yearMonth &&
      !!siteId &&
      !!siteProcessId &&
      outsourcingCompanyId === 0, // 필수값 있을 때만 실행
  })

  // 집계 관리비에서 상세 데이터 조회

  const MealFeeDetailListQuery = useQuery({
    queryKey: ['mealFeeDetailInfo', yearMonth, siteId, siteProcessId, outsourcingCompanyId],
    queryFn: () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth: yearMonth,
        outsourcingCompanyId: outsourcingCompanyId === 0 ? undefined : outsourcingCompanyId,
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

      return GetMealFeeDetailServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'MANAGEMENT' &&
      !!yearMonth &&
      !!siteId &&
      !!siteProcessId &&
      !!outsourcingCompanyId, // 필수값 있을 때만 실행
  })

  // 외주 조회
  const ManagementOutSourcingListQuery = useQuery({
    queryKey: ['managementOutSourcingInfo', yearMonth, siteId, siteProcessId],
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

      return ManagementOutSourcingInfoServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'OUTSOURCING' &&
      !!yearMonth &&
      !!siteId &&
      !!siteProcessId &&
      outsourcingCompanyContractId === 0, // 필수값 있을 때만 실행
  })

  // 외주에서 거래처명 조회
  const ConstructionListQuery = useQuery({
    queryKey: ['constructionInfo', siteId, siteProcessId],
    queryFn: () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
      }

      const filteredParams = Object.fromEntries(
        Object.entries(rawParams).filter(
          ([, value]) =>
            value !== undefined && value !== null && !(typeof value === 'number' && isNaN(value)),
        ),
      )

      return GetConstructionServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'OUTSOURCING' &&
      !!siteId &&
      !!siteProcessId &&
      outsourcingCompanyContractId === 0, // 필수값 있을 때만 실행
  })

  // 집계 관리비에서 상세 데이터 조회

  const ConstructionDetailListQuery = useQuery({
    queryKey: [
      'constructionDetailInfo',
      yearMonth,
      siteId,
      siteProcessId,
      outsourcingCompanyContractId,
    ],
    queryFn: () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth: yearMonth,
        outsourcingCompanyContractId:
          outsourcingCompanyContractId === 0 ? undefined : outsourcingCompanyContractId,
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

      return GetConstructionDetailServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'OUTSOURCING' &&
      !!yearMonth &&
      !!siteId &&
      !!siteProcessId &&
      !!outsourcingCompanyContractId, // 필수값 있을 때만 실행
  })

  // 외주(공사)에서 공제금액의 집계 조회

  const DeductionAmountDetailListQuery = useQuery({
    queryKey: [
      'DeductionAmountDetailInfo',
      yearMonth,
      siteId,
      siteProcessId,
      outsourcingCompanyContractId,
    ],
    queryFn: () => {
      const rawParams = {
        siteId: siteId === 0 ? undefined : siteId,
        siteProcessId: siteProcessId === 0 ? undefined : siteProcessId,
        yearMonth: yearMonth,
        outsourcingCompanyContractId:
          outsourcingCompanyContractId === 0 ? undefined : outsourcingCompanyContractId,
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

      return GetdeductionAmountServiceByAggregate(filteredParams)
    },
    enabled:
      tabName === 'OUTSOURCING' &&
      !!yearMonth &&
      !!siteId &&
      !!siteProcessId &&
      !!outsourcingCompanyContractId, // 필수값 있을 때만 실행
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
    ManagementCostListQuery,
    MealFeeCompanyListQuery,
    MealFeeDetailListQuery,
    ManagementOutSourcingListQuery,

    ConstructionListQuery,
    ConstructionDetailListQuery,
    DeductionAmountDetailListQuery,
    HeadOfficeListQuery,
  }
}
