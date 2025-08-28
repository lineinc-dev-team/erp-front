import { useDailyFormStore } from '@/stores/dailyReportStore'
import { useFuelFormStore, useFuelSearchStore } from '@/stores/fuelAggregationStore'
import { useCostSearchStore, useManagementCostFormStore } from '@/stores/managementCostsStore'
import { useManagementSteelFormStore, useSteelSearchStore } from '@/stores/managementSteelStore'
import {
  useManagementMaterialFormStore,
  useMaterialSearchStore,
} from '@/stores/materialManagementStore'
import { useContractFormStore, useContractSearchStore } from '@/stores/outsourcingContractStore'
import { usePathname } from 'next/navigation'

export const useSiteId = () => {
  const pathname = usePathname()
  const search = useContractSearchStore((state) => state.search)
  const form = useContractFormStore((state) => state.form)
  const materialForm = useManagementMaterialFormStore((state) => state.form)
  const materialSearchForm = useMaterialSearchStore((state) => state.search)

  // 강재수불부
  const steelForm = useManagementSteelFormStore((state) => state.form)
  const steelSearchForm = useSteelSearchStore((state) => state.search)

  // 관리비 조회

  const costForm = useManagementCostFormStore((state) => state.form)
  const costSearchForm = useCostSearchStore((state) => state.search)

  // 유류집계

  const fuelForm = useFuelFormStore((state) => state.form)
  const fuelSearchForm = useFuelSearchStore((state) => state.search)

  // 출역일보

  const dailyForm = useDailyFormStore((state) => state.form)

  if (pathname.startsWith('/fuelAggregation/registration')) {
    return fuelForm?.siteId
  } else if (pathname.startsWith('/outsourcingContract/registration')) {
    return form?.siteId
  } else if (pathname.startsWith('/outsourcingContract')) {
    return search?.siteId
  } else if (pathname.startsWith('/materialManagement/registration')) {
    return materialForm?.siteId
  } else if (pathname.startsWith('/materialManagement')) {
    return materialSearchForm?.siteId
  } else if (pathname.startsWith('/managementSteel/registration')) {
    return steelForm?.siteId
  } else if (pathname.startsWith('/managementSteel')) {
    return steelSearchForm?.siteId
  } else if (pathname.startsWith('/fuelAggregation')) {
    return fuelSearchForm?.siteId
  } else if (pathname.startsWith('/managementCost/registration')) {
    return costForm?.siteId
  } else if (pathname.startsWith('/managementCost')) {
    return costSearchForm?.siteId
  } else if (pathname.startsWith('/dailyReport/registration')) {
    return dailyForm?.siteId
  }
  return 0
}
