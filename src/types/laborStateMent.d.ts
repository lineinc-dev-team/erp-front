// 검색타입
export type LaborStateMentSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  processId: number
  processName: string
  yearMonth: string

  currentPage: number
  arraySort: string
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<LaborStateMentSearchState, 'reset' | 'setField'>>(
    field: K,
    value: LaborStateMentSearchState[K],
  ) => void

  handleSearch: () => void
}

type HistoryItem = {
  id: number
  no: number
  getChanges: string
  createdAt: string // or Date
  updatedAt: string
  content: string // 수정항목
  updatedBy: string
  memo: string
  type: string
}

export type LaborStateMentList = {
  id: number
  day01Hours?: number
  day02Hours?: number
  day03Hours?: number
  day04Hours?: number
  day05Hours?: number
  day06Hours?: number
  day07Hours?: number
  day08Hours?: number
  day09Hours?: number
  day10Hours?: number
  day11Hours?: number
  day12Hours?: number
  day13Hours?: number
  day14Hours?: number
  day15Hours?: number
  day16Hours?: number
  day17Hours?: number
  day18Hours?: number
  day19Hours?: number
  day20Hours?: number
  day21Hours?: number
  day22Hours?: number
  day23Hours?: number
  day24Hours?: number
  day25Hours?: number
  day26Hours?: number
  day27Hours?: number
  day28Hours?: number
  day29Hours?: number
  day30Hours?: number
  day31Hours?: number

  // 합계 및 공제 항목
  totalWorkHours?: number
  totalWorkDays?: number
  totalLaborCost?: number
  incomeTax?: number
  employmentInsurance?: number
  healthInsurance?: number
  localTax?: number
  nationalPension?: number
  longTermCareInsurance?: number
  totalDeductions?: number
  netPayment?: number
  type: string

  // 메모
  memo?: string
}

export type LaborSummaryFormState = {
  siteId: number
  siteName: string
  processId: number
  processName: string
  yearMonth: string
  memo: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  laborStateMentInfo: any[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type LaborSummaryStore = {
  form: LaborSummaryFormState

  editedRows: Set<number>
  reset: () => void

  // methods
  setField: <K extends keyof Omit<LaborSummaryFormState, 'reset' | 'setField'>>(
    field: K,
    value: LaborSummaryFormState[K],
  ) => void

  updateItemField: (
    type: 'REGULAR_EMPLOYEE' | 'DIRECT_CONTRACT' | 'ETC',
    id: number,
    field: string,
    value: T,
  ) => void

  // updateItemField: (type: 'attachedFile', id: T, field: T, value: T) => void

  updateMemo: (id: number, newMemo: string) => void

  //관리비 등록하기

  //메모 값 수정 시
  newLaborSummary: () => void

  updateLaborSummary: () => void
}
