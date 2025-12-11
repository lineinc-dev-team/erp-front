import { ReportSearchState } from '@/types/report'
import { create } from 'zustand'

export const useReportSearchStore = create<{ search: ReportSearchState }>((set) => ({
  search: {
    siteList: [],
    costCharts: [],

    startMonth: null,
    endMonth: null,
    allPeriod: false,

    setField: (field, value) =>
      set((state) => ({
        search: { ...state.search, [field]: value },
      })),

    handleSearch: () =>
      set((state) => ({
        search: {
          ...state.search,
        },
      })),

    reset: () =>
      set((state) => ({
        search: {
          ...state.search,
          searchTrigger: 0,
          siteList: [],
          costCharts: [],

          startMonth: null,
          endMonth: null,
          allPeriod: false,
        },
      })),
  },
}))
