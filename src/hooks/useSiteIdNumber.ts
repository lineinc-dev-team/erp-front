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

  return 0
}
