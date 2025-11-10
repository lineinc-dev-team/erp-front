import { FinalAggregationSearchState } from '@/types/finalAggregation'
import { create } from 'zustand'

export const useFinalAggregationSearchStore = create<{ search: FinalAggregationSearchState }>(
  (set) => ({
    search: {
      searchTrigger: 0,
      siteId: 0,
      siteName: '',
      siteProcessId: 0,
      siteProcessName: '',
      yearMonth: '',

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
          },
        })),
    },
  }),
)
