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
}

// 검색타입
export type MaterialSearchState = {
  searchTrigger: number
  siteName: string
  processName: string
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

export type AttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

export type ManagementMaterialFormState = {
  siteId: number // 발행부서
  siteProcessId: number // 공정명
  inputType: string
  inputTypeDescription: string
  deliveryDate: Date | null
  memo: string

  // === Material Items ===
  details: MaterialItem[]
  checkedMaterialItemIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]

  //수정페이지에서 이력 조회 시 사용
  modificationHistory: {
    modifiedAt: Date | null
    modifiedField: string
    modifiedBy: string
    memo: string
  }[]
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

  //관리비 등록하기

  //payload 값
  newMaterialData: () => void
}
