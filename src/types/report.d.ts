export type ReportSearchState = {
  siteList: Array
  costCharts: Array
  startMonth: Date | null | string
  endMonth: Date | null | string
  allPeriod: boolean

  reset: () => void

  setField: <K extends keyof Omit<ReportSearchState, 'reset' | 'setField'>>(
    field: K,
    value: ReportSearchState[K],
  ) => void

  handleSearch: () => void
}
