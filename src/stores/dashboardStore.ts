import { FinalDashBoardSearchState } from '@/types/dashBoard'
import { create } from 'zustand'

export const useFinalDashboardSearchStore = create<{ search: FinalDashBoardSearchState }>(
  (set) => ({
    search: {
      siteId: 0,
      siteName: '',
      siteProcessId: 0,
      siteProcessName: '',

      setField: (field, value) =>
        set((state) => ({
          search: { ...state.search, [field]: value },
        })),

      reset: () =>
        set((state) => ({
          search: {
            ...state.search,
            siteId: 0,
            siteName: '',
            siteProcessId: 0,
            siteProcessName: '',
          },
        })),
    },
  }),
)
