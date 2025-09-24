export interface DetailItem {
  id: number
  name: string
  unitPrice: number
  supplyPrice: number
  vat: number
  total: number
  isDeductible: boolean
  memo: string
}

export interface Site {
  id: number
  name: string
}

export interface Process {
  id: number
  name: string
}

export interface OutsourcingCompany {
  id: number
  name: string
  businessNumber: string
  ceoName: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

export interface CostList {
  id: number
  itemType: string
  itemTypeCode: string
  itemTypeDescription: string | null
  paymentDate: string // ISO 형식 (예: "2025-08-12T00:00:00+09:00")
  hasFile: T
  memo: string
  supplyPrice: number
  vat: number
  total: number
  mealFeeAmountTotal: number
  keyMoneyAmountTotal: number
  site: Site
  process: Process
  outsourcingCompany: OutsourcingCompany
}

export type CostSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  processId: number
  processName: string
  outsourcingCompanyName: string
  itemType: string
  itemTypeDescription: string
  paymentStartDate: Date | null
  paymentEndDate: Date | null
  arraySort: string
  currentPage: number
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<CostSearchState, 'reset' | 'setField'>>(
    field: K,
    value: CostSearchState[K],
  ) => void

  handleSearch: () => void
}

export type CostItem = {
  id: number
  name: string
  unitPrice: number
  supplyPrice: number
  vat: number
  total: number
  isDeductible: boolean
  memo: string
}

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
}

export type KeyMoneyDetail = {
  id: number
  account: string
  purpose: string
  personnelCount: number
  amount: number
  isDeductible: boolean
  memo: string
}

export type inLabor = {
  deleted: boolean
  id: number
  name: string
}

// 식대 세부항목
export type MealFeeDetail = {
  id: number
  workType: string
  labor?: inLabor
  laborId: number | null
  inputType?: string
  name: string
  breakfastCount: number
  lunchCount: number
  mealCount: number
  unitPrice: number
  amount: number
  memo: string
}

export type AttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

// 외주업체 정보
export type outsourcingCompanyInfo = {
  name: string
  businessNumber: string
  ceoName: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

export type ManagementCostFormState = {
  // 기존 필드들
  siteId: number
  siteName: string
  siteProcessId: number
  siteProcessName: string
  outsourcingCompanyId: number
  itemType: string
  itemTypeDescription: string
  paymentDate: Date | null // ISO string
  initialDeliveryDateAt: string
  outsourcingCompanyInfo: outsourcingCompanyInfo | null
  memo: string

  // 담당자 배열
  details: CostItem[]
  // 선택된 체크박스 id
  checkedCostIds: number[]

  keyMoneyDetails: KeyMoneyDetail[]
  checkedKeyMoneyIds: number[]

  mealFeeDetails: MealFeeDetail[]
  checkedMealFeeIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type CostFormStore = {
  form: ManagementCostFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<ManagementCostFormState, 'reset' | 'setField'>>(
    field: K,
    value: T,
  ) => void

  addItem: (type: 'costItem' | 'attachedFile' | 'mealListData' | 'keyMoneyList') => void
  updateItemField: (
    type: 'costItem' | 'attachedFile' | 'mealListData' | 'keyMoneyList',
    id: T,
    field: keyof T,
    value: T,
  ) => void

  toggleCheckItem: (
    type: 'costItem' | 'attachedFile' | 'mealListData' | 'keyMoneyList',
    id: number,
    checked: boolean,
  ) => void
  toggleCheckAllItems: (
    type: 'costItem' | 'attachedFile' | 'mealListData' | 'keyMoneyList',
    checked: boolean,
  ) => void
  removeCheckedItems: (type: 'costItem' | 'attachedFile' | 'mealListData' | 'keyMoneyList') => void

  // 그외에 계산 함수값
  getPriceTotal: () => number
  getSupplyTotal: () => number
  getVatTotal: () => number
  getTotalCount: () => number

  // 전도금
  getPersonTotal: () => number
  getAmountTotal: () => number

  // 식대에서 계산 값
  getMealTotal: () => number
  getMealPriceTotal: () => number
  getMealTotalCount: () => number

  updateMemo: (id: number, newMemo: string) => void

  newCostData: () => void
}
