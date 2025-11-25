export type FinalDashBoardSearchState = {
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string

  reset: () => void

  setField: <K extends keyof Omit<FinalDashBoardSearchState, 'reset' | 'setField'>>(
    field: K,
    value: FinalDashBoardSearchState[K],
  ) => void
}
