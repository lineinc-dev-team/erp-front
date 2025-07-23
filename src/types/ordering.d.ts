export type Manager = {
  id: number
  name: string
  position: string
  landlineNumber: string
  phoneNumber: string
  email: string
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

// 발주처 조회 리스트 가져오는 타입들

export interface Contact {
  id: number
  name: string
  phoneNumber: string
  landlineNumber: string
  email: string
  memo?: string
}

export interface User {
  id: number
  username: string
}

// 발주처 조회
export interface ClientCompany {
  id: number
  name: string // 발주처 이름
  businessNumber: string
  ceoName: string
  address: string
  detailAddress: string
  landlineNumber: string
  phoneNumber: string
  email: string
  memo: string
  isActive: boolean
  hasFile: boolean
  contacts: Contact[]
  createdAt: string // ISO 날짜 문자열
  updatedAt: string
  user: User
}

export type OrderingSearchState = {
  searchTrigger: number
  name: string
  businessNumber: string
  ceoName: string
  currentPage: number
  landlineNumber: string
  orderCEOname: string
  email: string
  startDate: Date | null
  endDate: Date | null
  bossName: string
  isActive: string
  arraySort: string
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<OrderingSearchState, 'reset' | 'setField'>>(
    field: K,
    value: OrderingSearchState[K],
  ) => void

  handleSearch: () => void
  handleOrderingListRemove: () => void
}

export type FormState = {
  // 기존 필드들
  name: string
  businessNumber: string
  ceoName: string
  address: string
  detailAddress: string
  areaNumber: string
  landlineNumber: string
  phoneNumber: string
  isModalOpen: boolean
  email: string
  paymentMethod: string
  paymentPeriod: string
  memo: string
  isActive: string
  userId: number

  // 담당자 배열
  headManagers: Manager[]

  // 선택된 체크박스 id
  checkedManagerIds: number[]

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

type ClientCompanyFormStore = {
  form: FormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<FormState, 'reset' | 'setField'>>(
    field: K,
    value: FormState[K],
  ) => void

  addItem: (type: 'manager' | 'attachedFile') => void
  updateItemField: (type: 'manager' | 'attachedFile', id: number, field: string, value: T) => void
  toggleCheckItem: (type: 'manager' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'manager' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'manager' | 'attachedFile') => void
  // updateAttachedFileUploads: (id: number, newFiles: FileUploadInfo[]) => void

  //발주처 등록하기

  //payload 값
  newClientCompanyData: () => void

  newOrderingData: () => void
  handleCancelData: () => void
}
