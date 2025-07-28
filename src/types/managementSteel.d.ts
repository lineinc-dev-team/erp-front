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
  paymentDate: Date | null
  hasFile: true
  memo: string
  details: DetailItem[]
  site: Site
  process: Process
}

// 검색타입
export type SteelSearchState = {
  searchTrigger: number
  siteName: string
  processName: string
  itemName: string
  type: string
  paymentStartDate: Date | null
  paymentEndDate: Date | null
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
  siteProcessId: number // 공정명
  usage: string // 구분
  type: string // 용도
  paymentDate: Date | null // 일자 (YYYY-MM-DD)
  memo: string // 비고

  // === Client Info ===
  clientName: string // 업체명
  businessNumber: string // 사업자등록번호
  rentalStartDate: Date | null // 임대기간 시작
  rentalEndDate: Date | null // 임대기간 종료

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

export type SteelPayload = Omit<
  ManagementSteelFormState,
  'checkedMaterialItemIds' | 'checkedAttachedFileIds' | 'modificationHistory'
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

  //관리비 등록하기

  //payload 값
  newSteelData: () => SteelPayload
}
