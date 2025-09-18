import { useDailyFormStore } from '@/stores/dailyReportStore'
import { useFuelFormStore } from '@/stores/fuelAggregationStore'
import { usePathname } from 'next/navigation'

export const useOutSourcingClientId = () => {
  const pathname = usePathname()
  const fuelForm = useFuelFormStore((state) => state.form)

  const dailyForm = useDailyFormStore((state) => state.form)

  if (pathname.startsWith('/fuelAggregation/registration')) {
    return fuelForm.fuelInfos.length > 0 ? fuelForm.fuelInfos[0].outsourcingCompanyId : 0
  } else if (pathname.startsWith('/dailyReport/registration')) {
    if (dailyForm.outsourcings.length > 0) {
      return dailyForm.outsourcings[0].outsourcingCompanyId
    } else if (dailyForm.outsourcingEquipments.length > 0) {
      return dailyForm.outsourcingEquipments[0].outsourcingCompanyId
    } else if (dailyForm.fuels.length > 0) {
      return dailyForm.fuels[0].outsourcingCompanyId
    }
    return 0
  }

  return 0
}

export const useOutSourcingInfoClientId = (
  selectedCompanyIds: { [rowId: number]: number },
  rowId: number, // 현재 row id를 추가로 받기
) => {
  const pathname = usePathname()
  const fuelForm = useFuelFormStore((state) => state.form)
  const dailyForm = useDailyFormStore((state) => state.form)

  if (!selectedCompanyIds[rowId]) return 0 // 해당 row 선택이 없으면 0

  // row별 회사 id
  const selectedCompanyId = selectedCompanyIds[rowId]

  if (pathname.startsWith('/fuelAggregation/registration')) {
    const matched = fuelForm.fuelInfos.find((item) => item.id === Number(rowId))
    return matched?.outsourcingCompanyId ?? selectedCompanyId
  }

  if (pathname.startsWith('/dailyReport/registration')) {
    const matched =
      dailyForm.outsourcings.find((item) => item.id === Number(rowId)) ||
      dailyForm.outsourcingEquipments.find((item) => item.id === Number(rowId)) ||
      dailyForm.fuels.find((item) => item.id === Number(rowId))

    return matched?.outsourcingCompanyId ?? selectedCompanyId
  }

  return selectedCompanyId
}
