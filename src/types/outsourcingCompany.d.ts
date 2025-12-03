import { HistoryItem } from './ordering'

export type OutsourcingManager = {
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

export type OutsourcingAttachedFile = {
  id: number
  name: string
  memo: string
  fileUrl?: string
  originalFileName?: string
  files: FileUploadInfo[]
  type: string
  typeCode?: string
}

// 발주처 조회 리스트 가져오는 타입들
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

// 발주처 조회
export interface OutsourcingCompanyList {
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
  isActive: boolean
  defaultDeductions: string
  defaultDeductionsCode: string
  defaultDeductionsDescription: string
  memo: string
  createdAt: string // ISO 날짜 문자열
  updatedAt: string
  hasFile: true
  contacts: Contact[]
}
// 계약 이력 조회

export type OutsourcingSearchState = {
  searchTrigger: number
  name: string
  businessNumber: string
  ceoName: string
  landlineNumber: string
  type: string
  startDate: Date | null
  endDate: Date | null
  isActive: T
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

// 외주업체 계약에서 계약이 생성 시 이력이 쌓이는 로직

type ContractHistoryItem = {
  contractId: number
  no: number
  siteName: string
  processName: string
  contractAmount: number
  type: string
  contactName: string
  defaultDeductions: string
  files: FileUploadInfo[]
  contractStartDate: string
  contractEndDate: string
  createdAt: string
  updatedAt: string
}

export type OutsourcingFormState = {
  // 기존 필드들
  name: string
  businessNumber: string
  type: string
  typeDescription: string
  ceoName: string
  address: string
  detailAddress: string
  isModalOpen: boolean
  areaNumber: string
  landlineNumber: string
  phoneNumber: string
  email: string
  defaultDeductions: string
  defaultDeductionsDescription: string
  bankName: string
  accountNumber: string
  accountHolder: string
  memo: string
  vatType: string
  isActive: string

  searchTrigger: number
  currentPage: number
  arraySort: string
  pageCount: string

  // 담당자 배열
  headManagers: OutsourcingManager[]

  // 선택된 체크박스 id
  checkedManagerIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: OutsourcingAttachedFile[]
  checkedAttachedFileIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type OutsourcingCompanyFormStore = {
  form: OutsourcingFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<OutsourcingFormState, 'reset' | 'setField'>>(
    field: K,
    value: OutsourcingFormState[K],
  ) => void

  addItem: (type: 'manager' | 'attachedFile') => void
  updateItemField: (type: 'manager' | 'attachedFile', id: number, field: string, value: T) => void
  toggleCheckItem: (type: 'manager' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'manager' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'manager' | 'attachedFile') => void
  // updateAttachedFileUploads: (id: number, newFiles: FileUploadInfo[]) => void

  updateMemo: (id: number, newMemo: string) => void

  setRepresentativeManager: (id: number) => void
  //발주처 등록하기

  //payload 값
  newOutsourcingCompanyData: () => void
}
