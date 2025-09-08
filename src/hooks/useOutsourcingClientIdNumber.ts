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
