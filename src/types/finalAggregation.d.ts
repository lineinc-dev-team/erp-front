export type FinalAggregationSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string
  yearMonth: string
  outsourcingCompanyId: number

  reset: () => void

  setField: <K extends keyof Omit<FinalAggregationSearchState, 'reset' | 'setField'>>(
    field: K,
    value: FinalAggregationSearchState[K],
  ) => void

  handleSearch: () => void
}
