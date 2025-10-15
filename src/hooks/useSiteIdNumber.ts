import { useDailyFormStore } from '@/stores/dailyReportStore'
import { useFuelFormStore, useFuelSearchStore } from '@/stores/fuelAggregationStore'
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

  const fuelSearch = useFuelSearchStore((state) => state.search)

  const dailyForm = useDailyFormStore((state) => state.form)

  // 노무 명세

  // 출역일보

  if (pathname.startsWith('/fuelAggregation/registration')) {
    return fuelForm?.siteId
  } else if (pathname.startsWith('/fuelAggregation')) {
    return fuelSearch?.siteId
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

export const useOutSourcingId = () => {
  const pathname = usePathname()

  const dailyForm = useDailyFormStore((state) => state.form)

  const lastModifiedRowId = useDailyFormStore((state) => state.lastModifiedRowId)

  // 노무 명세

  if (pathname.startsWith('/dailyReport/registration')) {
    // 마지막으로 수정한 row가 있으면 그 row의 업체 ID 반환
    if (lastModifiedRowId != null) {
      const modifiedRow = dailyForm.directContracts?.find(
        (item) => item.checkId === lastModifiedRowId,
      )
      console.log('modifiedRowmodifiedRow', modifiedRow, lastModifiedRowId)

      if (modifiedRow && modifiedRow.outsourcingCompanyName?.trim() !== '') {
        return modifiedRow.outsourcingCompanyId
      }
    }

    // 마지막 수정 row가 없거나 업체명이 없으면, 첫 번째 업체명 있는 row 반환
    // const firstRowWithCompany = dailyForm.directContracts?.find(
    //   (item) => item.outsourcingCompanyName && item.outsourcingCompanyName.trim() !== '',
    // )
    // return firstRowWithCompany?.outsourcingCompanyId ?? 0
    return undefined
  }

  return ''
}
