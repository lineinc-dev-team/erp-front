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
  const SteelForm = useManagementSteelFormStore((state) => state.form)
  const SteelSearchForm = useSteelSearchStore((state) => state.search)

  if (pathname.startsWith('/outsourcingContract/registration')) {
    return form?.siteId
  }
  if (pathname.startsWith('/outsourcingContract')) {
    return search?.siteId
  }
  if (pathname.startsWith('/materialManagement/registration')) {
    return materialForm?.siteId
  }
  if (pathname.startsWith('/materialManagement')) {
    return materialSearchForm?.siteId ?? 0
  }
  if (pathname.startsWith('/managementSteel/registration')) {
    return SteelForm?.siteId ?? 0
  }
  if (pathname.startsWith('/managementSteel')) {
    return SteelSearchForm?.siteId ?? 0
  }

  return 0
}
