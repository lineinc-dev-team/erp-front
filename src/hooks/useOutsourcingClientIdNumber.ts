import { useFuelFormStore } from '@/stores/fuelAggregationStore'
import { usePathname } from 'next/navigation'

export const useOutSourcingClientId = () => {
  const pathname = usePathname()
  const fuelForm = useFuelFormStore((state) => state.form)

  if (pathname.startsWith('/fuelAggregation/registration')) {
    return fuelForm.fuelInfos.length > 0 ? fuelForm.fuelInfos[0].outsourcingCompanyId : 0
  }

  return 0
}
