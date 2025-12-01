export type HeadOfficeAggregationSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string
  yearMonth: string
  outsourcingCompanyId: number
  outsourcingCompanyContractId: number

  reset: () => void

  setField: <K extends keyof Omit<HeadOfficeAggregationSearchState, 'reset' | 'setField'>>(
    field: K,
    value: HeadOfficeAggregationSearchState[K],
  ) => void

  handleSearch: () => void
}
