export interface DetailItem {
  id: number
  name: string
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

export interface CostList {
  id: number
  itemType: string
  itemDescription: string
  paymentDate: string // ISO 형식 문자열
  businessNumber: string
  ceoName: string
  accountNumber: string
  accountHolder: string
  bankName: string
  hasFile: boolean
  memo: string
  details: DetailItem[]
  site: Site
  process: Process
}

export type CostSearchState = {
  searchTrigger: number
  siteId: number
  siteProcessId: number
  itemType: string
  itemDescription: string
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

export type costItem = {
  id: number
  name: string
  unitPrice: number
  supplyPrice: number
  vat: number
  total: number
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

export type ManagementCostFormState = {
  // 기존 필드들
  siteId: number
  siteProcessId: number
  itemType: string
  itemDescription: string
  paymentDate: Data | null // ISO string
  businessNumber: string
  ceoName: string
  accountNumber: string
  accountHolder: string
  bankName: string
  memo: string

  // 담당자 배열
  details: costItem[]

  // 선택된 체크박스 id
  checkedCostIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]

  //수정페이지에서 이력 조회 시 사용
  modificationHistory: {
    modifiedAt: Date | null
    modifiedField: string
    modifiedBy: string
    note: string
  }[]
}

type CostFormStore = {
  form: ManagementCostFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<ManagementCostFormState, 'reset' | 'setField'>>(
    field: K,
    value: ManagementCostFormState[K],
  ) => void

  addItem: (type: 'costItem' | 'attachedFile') => void
  updateItemField: (type: 'costItem' | 'attachedFile', id: number, field: string, value: T) => void
  toggleCheckItem: (type: 'costItem' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'costItem' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'costItem' | 'attachedFile') => void

  //관리비 등록하기

  //payload 값
  newCostData: () => void
}
