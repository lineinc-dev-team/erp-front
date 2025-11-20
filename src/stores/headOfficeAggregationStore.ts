import { HeadOfficeAggregationSearchState } from '@/types/headOfficeAggregation'
import { create } from 'zustand'

export const useHeadOfficeAggregationSearchStore = create<{
  search: HeadOfficeAggregationSearchState
}>((set) => ({
  search: {
    searchTrigger: 0,
    siteId: 0,
    siteName: '',
    siteProcessId: 0,
    siteProcessName: '',
    yearMonth: '',
    outsourcingCompanyId: 0,
    outsourcingCompanyContractId: 0,

    setField: (field, value) =>
      set((state) => ({
        search: { ...state.search, [field]: value },
      })),

    handleSearch: () =>
      set((state) => ({
        search: {
          ...state.search,
          searchTrigger: state.search.searchTrigger + 1,
        },
      })),

    reset: () =>
      set((state) => ({
        search: {
          ...state.search,
          searchTrigger: 0,
          siteId: 0,
          siteName: '',
          siteProcessId: 0,
          siteProcessName: '',
          yearMonth: '',
          outsourcingCompanyId: 0,
          outsourcingCompanyContractId: 0,
        },
      })),
  },
}))
