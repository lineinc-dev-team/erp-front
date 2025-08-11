export type OutsourcingContractManager = {
  id: number
  name: string
  position: string
  department: string
  managerAreaNumber: string
  landlineNumber: string
  phoneNumber: string
  email: string
  memo: string
  isMain?: boolean //대표 담당자
}

export type OutsourcingContractAttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

export type OutsourcingContractPersonAttachedFile = {
  id: number
  name: string
  type: string
  content: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
}

// 외주계약 조회에서 가져오는 담당자 타입
export interface Contact {
  id: number
  name: string
  phoneNumber: string
  landlineNumber: string
  email: string
  memo?: string
  position: string
  department: string
  isMain?: boolean
}

// 외주계약 조회
export interface OutsourcingContractList {
  id: number
  name: string // 발주처 이름
  businessNumber: string
  type: string
  typeCode: string
  ceoName: string
  address: string
  detailAddress: string
  landlineNumber: string
  phoneNumber: string
  email: string
  isActive: false
  defaultDeductions: string
  defaultDeductionsCode: string
  defaultDeductionsDescription: string
  memo: string
  createdAt: string // ISO 날짜 문자열
  updatedAt: string
  hasFile: true
  contacts: Contact[]
}

export type OutsourcingContractSearchState = {
  searchTrigger: number
  name: string
  businessNumber: string
  ceoName: string
  landlineNumber: string
  type: string
  startDate: Date | null
  endDate: Date | null
  isActive: string
  currentPage: number
  arraySort: string
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<OutsourcingSearchState, 'reset' | 'setField'>>(
    field: K,
    value: OutsourcingSearchState[K],
  ) => void

  handleSearch: () => void
}

// 수정에 사용 할 타입
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

export type CompanyInfo = {
  id: number
  name: string
  businessNumber: string
}

export type OutsourcingContractFormState = {
  // 기존 필드들
  siteId: number
  siteName: string
  processId: number
  processName: string
  CompanyId: number
  CompanyName: string
  businessNumber: string
  type: string
  typeDescription: string
  contractAmount: number
  startedAt: Date | null
  endedAt: Date | null
  defaultDeductions: string
  defaultDeductionsDescription: string
  taxCalculat: string
  taxDay: string
  dayType: string
  memo: string
  categoryType: string
  isActive: string

  // 담당자 배열
  headManagers: OutsourcingContractManager[]

  // 선택된 체크박스 id
  checkedManagerIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: OutsourcingContractAttachedFile[]
  checkedAttachedFileIds: number[]

  // 인력 배열
  personManagers: OutsourcingContractPersonAttachedFile[]

  // 선택된 체크박스 id
  checkedPersonIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type OutsourcingContractFormStore = {
  form: OutsourcingContractFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<OutsourcingContractFormState, 'reset' | 'setField'>>(
    field: K,
    value: OutsourcingContractFormState[K],
  ) => void

  addItem: (type: 'manager' | 'attachedFile' | 'personAttachedFile') => void
  updateItemField: (
    type: 'manager' | 'attachedFile' | 'personAttachedFile',
    id: number,
    field: string,
    value: T,
  ) => void
  toggleCheckItem: (
    type: 'manager' | 'attachedFile' | 'personAttachedFile',
    id: number,
    checked: boolean,
  ) => void
  toggleCheckAllItems: (
    type: 'manager' | 'attachedFile' | 'personAttachedFile',
    checked: boolean,
  ) => void
  removeCheckedItems: (type: 'manager' | 'attachedFile' | 'personAttachedFile') => void

  updateMemo: (id: number, newMemo: string) => void
  setRepresentativeManager: (id: number) => void
  //외주계약 등록하기

  //payload 값
  newOutsourcingContractData: () => void
}
