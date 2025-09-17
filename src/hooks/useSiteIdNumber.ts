import { useDailyFormStore } from '@/stores/dailyReportStore'
import { useFuelFormStore } from '@/stores/fuelAggregationStore'
import { useManagementCostFormStore } from '@/stores/managementCostsStore'
import { useManagementSteelFormStore } from '@/stores/managementSteelStore'
import { useManagementMaterialFormStore } from '@/stores/materialManagementStore'
import { useContractFormStore } from '@/stores/outsourcingContractStore'
import { usePathname } from 'next/navigation'

export const useSiteId = () => {
  const pathname = usePathname()
  const form = useContractFormStore((state) => state.form)
  const materialForm = useManagementMaterialFormStore((state) => state.form)

  // 강재수불부
  const steelForm = useManagementSteelFormStore((state) => state.form)

  // 관리비 조회

  const costForm = useManagementCostFormStore((state) => state.form)

  // 유류집계

  const fuelForm = useFuelFormStore((state) => state.form)

  // 노무 명세

  // 출역일보

  const dailyForm = useDailyFormStore((state) => state.form)

  if (pathname.startsWith('/fuelAggregation/registration')) {
    return fuelForm?.siteId
  } else if (pathname.startsWith('/outsourcingContract/registration')) {
    return form?.siteId
  } else if (pathname.startsWith('/materialManagement/registration')) {
    return materialForm?.siteId
  } else if (pathname.startsWith('/managementSteel/registration')) {
    return steelForm?.siteId
  } else if (pathname.startsWith('/managementCost/registration')) {
    return costForm?.siteId
  } else if (pathname.startsWith('/dailyReport/registration')) {
    return dailyForm?.siteId
  }
  return ''
}
