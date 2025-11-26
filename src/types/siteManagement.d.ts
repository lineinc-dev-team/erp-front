// 수정에 사용 할 타입
type HistoryItem = {
  id: number
  no: number
  getChanges: string
  description: string
  createdAt: string // or Date
  updatedAt: string
  content: string // 수정항목
  updatedBy: string
  memo: string
  type: string
  typeCode: string
  isEditable: boolean
}

// 검색타입
export type SiteManagementSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string
  startYearMonth: string
  endYearMonth: string

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
  yearMonth: Date | null | string // ISO string
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string

  employeeSalary: number
  employeeSalarySupplyPrice: number
  employeeSalaryVat: number
  employeeSalaryDeduction: number

  employeeSalaryMemo: string

  regularRetirementPension: number

  regularRetirementPensionSupplyPrice: number
  regularRetirementPensionVat: number
  regularRetirementPensionDeduction: number

  regularRetirementPensionMemo: string

  retirementDeduction: number

  retirementDeductionSupplyPrice: number
  retirementDeductionVat: number
  retirementDeductionDeduction: number

  retirementDeductionMemo: string

  majorInsuranceRegular: number

  majorInsuranceRegularSupplyPrice: number
  majorInsuranceRegularVat: number
  majorInsuranceRegularDeduction: number

  majorInsuranceRegularMemo: string

  majorInsuranceDaily: number

  majorInsuranceDailySupplyPrice: number
  majorInsuranceDailyVat: number
  majorInsuranceDailyDeduction: number

  majorInsuranceDailyMemo: string

  contractGuaranteeFee: number

  contractGuaranteeFeeSupplyPrice: number
  contractGuaranteeFeeVat: number
  contractGuaranteeFeeDeduction: number

  contractGuaranteeFeeMemo: string

  equipmentGuaranteeFee: number

  equipmentGuaranteeFeeSupplyPrice: number
  equipmentGuaranteeFeeVat: number
  equipmentGuaranteeFeeDeduction: number

  equipmentGuaranteeFeeMemo: string

  nationalTaxPaymentSupplyPrice: number
  nationalTaxPaymentVat: number
  nationalTaxPaymentDeduction: number

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

  AutomaticAmount: (prefix: string) => void
}
