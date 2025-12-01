import { HistoryItem } from './ordering'

export interface DetailItem {
  id: number
  name: string
  quantity: number
  unitPrice: number
  supplyPrice: number
  vat: number
  total: number
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
  keyMoneyDeductAmountTotal: number
  detailDeductAmountTotal: number
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
  quantity: number
  unitPrice: number
  supplyPrice: number
  vat: number
  total: number
  memo: string
}

export type KeyMoneyDetail = {
  id: number
  account: string
  purpose: string
  personnelCount: number
  amount: number
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
  labor?: inLabor
  laborId: number | null
  name: string
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  unitPrice: number
  amount: number
  memo: string
}

export type mealFeeDetailDirectContractsDetail = {
  id: number
  labor?: inLabor
  laborId: number | null
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  unitPrice: number
  amount: number
  memo: string
}

export type mealFeeDetailOutsourcingsDetail = {
  id: number
  outsourcingCompanyId: number | null
  labor?: inLabor
  laborId: number | null
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  unitPrice: number
  amount: number
  memo: string
}

export type mealFeeDetailEquipmentsDetail = {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyContractDriverId: number
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
  unitPrice: number
  amount: number
  memo: string
}

export type mealFeeDetailOutsourcingContractsDetail = {
  id: number
  outsourcingCompanyId: number | null
  laborId: number | null
  breakfastCount: number
  lunchCount: number
  dinnerCount: number
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
  type: string
  typeCode?: string
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
  outsourcingCompanyName: string
  outsourcingCompanyId: number | null
  isDeductible: boolean

  deductionCompanyId: number
  deductionCompanyName: string

  deductionCompanyContractId: number
  deductionCompanyContractName: string

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

  // 식대에 직원
  mealFeeDetails: MealFeeDetail[]
  checkedMealFeeIds: number[]

  // 식대에서 직영
  mealFeeDetailDirectContracts: mealFeeDetailDirectContractsDetail[]
  checkedMealFeeDetailDirectContractIds: number[]

  // 식대에 용역

  mealFeeDetailOutsourcings: mealFeeDetailOutsourcingsDetail[]
  checkedMealFeeDetailOutsourcingIds: number[]

  // 식대의 장비 기사
  mealFeeDetailEquipments: mealFeeDetailEquipmentsDetail[]
  checkedMealFeeDetailEquipments: number[]

  // 식대의 외주 인력
  mealFeeDetailOutsourcingContracts: mealFeeDetailOutsourcingContractsDetail[]
  checkedMealFeeDetailOutsourcingContracts: number[]

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

  setForm: (newForm) => void

  addItem: (
    type:
      | 'costItem'
      | 'attachedFile'
      | 'mealListData'
      | 'mealFeeDetailDirectContracts'
      | 'mealFeeDetailOutsourcings'
      | 'mealFeeDetailEquipments'
      | 'mealFeeDetailOutsourcingContracts'
      | 'keyMoneyList',
  ) => void
  updateItemField: (
    type:
      | 'costItem'
      | 'attachedFile'
      | 'mealListData'
      | 'mealFeeDetailDirectContracts'
      | 'mealFeeDetailOutsourcings'
      | 'mealFeeDetailEquipments'
      | 'mealFeeDetailOutsourcingContracts'
      | 'keyMoneyList',
    id: T,
    field: keyof T,
    value: T,
  ) => void

  toggleCheckItem: (
    type:
      | 'costItem'
      | 'attachedFile'
      | 'mealListData'
      | 'mealFeeDetailDirectContracts'
      | 'mealFeeDetailOutsourcings'
      | 'mealFeeDetailEquipments'
      | 'mealFeeDetailOutsourcingContracts'
      | 'keyMoneyList',
    id: number,
    checked: boolean,
  ) => void
  toggleCheckAllItems: (
    type:
      | 'costItem'
      | 'attachedFile'
      | 'mealListData'
      | 'mealFeeDetailDirectContracts'
      | 'mealFeeDetailOutsourcings'
      | 'mealFeeDetailEquipments'
      | 'mealFeeDetailOutsourcingContracts'
      | 'keyMoneyList',
    checked: boolean,
  ) => void
  removeCheckedItems: (
    type:
      | 'costItem'
      | 'attachedFile'
      | 'mealListData'
      | 'mealFeeDetailDirectContracts'
      | 'mealFeeDetailOutsourcings'
      | 'mealFeeDetailEquipments'
      | 'mealFeeDetailOutsourcingContracts'
      | 'keyMoneyList',
  ) => void

  // 그외에 계산 함수값
  getQuantityTotal: () => number
  getPriceTotal: () => number
  getSupplyTotal: () => number
  getVatTotal: () => number
  getTotalCount: () => number

  // 전도금
  getPersonTotal: () => number
  getAmountTotal: () => number

  // 식대에서 계산 값
  getBreakfastTotalCount: () => number
  getLunchTotalCount: () => number
  getDinnerTotalCount: () => number

  getMealTotal: () => number
  getMealPriceTotal: () => number
  getMealTotalCount: () => number

  updateMemo: (id: number, newMemo: string) => void

  newCostData: () => void
}
