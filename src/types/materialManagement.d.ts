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
  usage: string
  total: number
  vat: number
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

export interface OutsourcingData {
  businessNumber: number
  id: number
  name: string
}

export interface MaterialList {
  id: number
  inputType: string
  inputTypeDescription: string
  deliveryDate: Date | null
  hasFile: boolean
  memo: string
  details: DetailItem[]
  site: Site
  process: Process
  outsourcingCompany: OutsourcingData
}

// 검색타입
export type MaterialSearchState = {
  searchTrigger: number
  siteName: string
  siteId: number
  processName: string
  outsourcingCompanyName: string
  outsourcingCompanyId: number
  materialName: string
  deliveryStartDate: Date | null
  deliveryEndDate: Date | null
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
  name: string
  standard: string
  usage: string
  quantity: number
  unitPrice: number
  supplyPrice: number
  vat: number
  total: number
  memo: string
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

export type AttachedFile = {
  id: number
  memo: string
  fileUrl?: string
  originalFileName?: string
  files?: FileUploadInfo[]
}

export type ManagementMaterialFormState = {
  siteId: number // 발행부서
  siteName: string
  siteProcessId: number // 공정명
  siteProcessName: string
  outsourcingCompanyId: number
  inputType: string
  inputTypeDescription: string
  deliveryDate: Date | null
  initialDeliveryDateAt: string
  memo: string

  // === Material Items ===
  details: MaterialItem[]
  checkedMaterialItemIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type MaterialFormStore = {
  form: ManagementMaterialFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<ManagementMaterialFormState, 'reset' | 'setField'>>(
    field: K,
    value: ManagementMaterialFormState[K],
  ) => void

  addItem: (type: 'MaterialItem' | 'attachedFile') => void
  updateItemField: (type: 'MaterialItem' | 'attachedFile', id: T, field: T, value: T) => void

  toggleCheckItem: (type: 'MaterialItem' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'MaterialItem' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'MaterialItem' | 'attachedFile') => void

  updateMemo: (id: number, newMemo: string) => void

  //관리비 등록하기

  //payload 값
  newMaterialData: () => void
}
