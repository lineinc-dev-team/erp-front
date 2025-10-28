import { HistoryItem } from './ordering'

// 검색타입
export type SiteManagementSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string
  startYearMonth: Date | null
  endYearMonth: Date | null

  currentPage: number
  arraySort: string
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<SiteManagementSearchState, 'reset' | 'setField'>>(
    field: K,
    value: SiteManagementSearchState[K],
  ) => void

  handleSearch: () => void
}

export type SiteManamentFormState = {
  yearMonth: Date | null // ISO string
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string

  employeeSalary: number
  employeeSalaryMemo: string
  regularRetirementPension: number
  regularRetirementPensionMemo: string
  retirementDeduction: number
  retirementDeductionMemo: string
  majorInsuranceRegular: number
  majorInsuranceRegularMemo: string
  majorInsuranceDaily: number
  majorInsuranceDailyMemo: string
  contractGuaranteeFee: number
  contractGuaranteeFeeMemo: string
  equipmentGuaranteeFee: number
  equipmentGuaranteeFeeMemo: string
  nationalTaxPayment: number
  nationalTaxPaymentMemo: string
  headquartersManagementCost: number
  headquartersManagementCostMemo: string

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type SiteManamentStore = {
  form: SiteManamentFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<SiteManamentFormState, 'reset' | 'setField'>>(
    field: K,
    value: SiteManamentFormState[K],
  ) => void

  //   updateItemField: (type: 'siteCost', id: number, field: string, value: T) => void

  // updateItemField: (type: 'attachedFile', id: T, field: T, value: T) => void

  updateMemo: (id: number, newMemo: string) => void

  //관리비 등록하기

  //메모 값 수정 시
  newSiteManamentSummary: () => void
}
