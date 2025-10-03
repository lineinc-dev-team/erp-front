import { HistoryItem } from './ordering'

export interface DetailItem {
  id: number
  standard: string
  name: string
  unit: string
  count: number
  length: number
  totalLength: number
  unitWeight: number
  quantity: number
  unitPrice: number
  supplyPrice: number
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

export interface SteelList {
  id: number
  usage: string
  type: string
  typeCode: string
  previousType: string
  startDate: Date | null
  endDate: Date | null
  orderDate: Date | null
  approvalDate: null
  releaseDate: null
  hasFile: true
  memo: string
  site: Site
  process: Process
  outsourcingCompany?: {
    id: number
    name: string
    businessNumber: string
  }
  totalAmount?: T
}

// 검색타입
export type SteelSearchState = {
  searchTrigger: number
  siteId: number
  siteName: string
  siteProcessName: string
  itemName: string
  type: string
  outsourcingCompanyName: string
  startDate: Date | null
  endDate: Date | null
  arraySort: string
  currentPage: number
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<SteelSearchState, 'reset' | 'setField'>>(
    field: K,
    value: SteelSearchState[K],
  ) => void

  handleSearch: () => void
}

// 등록 타입
export type MaterialItem = {
  id: number
  outsourcingCompanyId: number
  outsourcingCompanyName?: string
  name: string
  specification: string
  weight: number
  count: number
  totalWeight: number
  unitPrice: number
  amount: number
  category: string
  createdAt?: Date | null
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  memo
}

export type AttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

export type ManagementSteelFormState = {
  siteId: number // 발행부서
  siteName: string
  siteProcessId: number // 공정명
  siteProcessName: string
  type: string
  // === Client Info ===

  // === Material Items ===
  details: MaterialItem[]
  checkedMaterialItemIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

export type SteelPayload = Omit<
  ManagementSteelFormState,
  'checkedMaterialItemIds' | 'checkedAttachedFileIds'
> & {
  files: {
    name: string
    fileUrl: string
    originalFileName: string
    memo: string
  }[]
}

type SteelFormStore = {
  form: ManagementSteelFormState

  reset: () => void

  resetDetailData: () => void

  // methods
  setField: <K extends keyof Omit<ManagementSteelFormState, 'reset' | 'setField'>>(
    field: K,
    value: ManagementSteelFormState[K],
  ) => void

  addItem: (type: 'MaterialItem' | 'attachedFile') => void
  updateItemField: (type: 'MaterialItem' | 'attachedFile', id: T, field: T, value: T) => void

  toggleCheckItem: (type: 'MaterialItem' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'MaterialItem' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'MaterialItem' | 'attachedFile') => void

  getWeightAmount: () => number
  getCountAmount: () => number
  getTotalWeightAmount: () => number
  getUnitPriceAmount: () => number
  getAmountAmount: () => number
  //관리비 등록하기

  updateMemo: (id: number, newMemo: string) => void

  //payload 값
  newSteelData: () => void
}
