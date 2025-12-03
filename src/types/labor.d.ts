import { HistoryItem } from './ordering'

export interface LaborDataList {
  id: number
  type: string
  typeCode: string
  typeDescription: string
  name: string
  workType: string

  workTypeDescription: string
  isHeadOffice: boolean | null
  mainWork: string
  dailyWage: number
  bankName: string
  accountNumber: string
  accountHolder: string
  hireDate: string // 백엔드에서 ISO 문자열로 주므로 string으로
  resignationDate: string | null
  outsourcingCompany: OutsourcingCompany | null
  phoneNumber: string
  residentNumber: string
  createdAt: string
  updatedAt: string
  hasFile: boolean
  isSeverancePayEligible: boolean
  hasBankbook: boolean
  hasIdCard: boolean
  hasSignatureImage: boolean
  hasLaborContract: boolean
}

export interface OutsourcingCompany {
  id: number
  name: string
}

// 검색타입
export type LaborSearchState = {
  searchTrigger: number
  type: string
  typeDescription: string
  name: string
  residentNumber: string
  outsourcingCompanyId: number
  outsourcingCompanyName: string
  phoneNumber: string
  isHeadOffice: boolean | null

  arraySort: string
  currentPage: number
  pageCount: string

  reset: () => void

  setField: <K extends keyof Omit<LaborSearchState, 'reset' | 'setField'>>(
    field: K,
    value: LaborSearchState[K],
  ) => void

  handleSearch: () => void
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
  createdAt?: string
  updatedAt?: string
}

export type LaborFormState = {
  currentPage: number
  type: string
  typeDescription: string
  gradeId: number
  outsourcingCompanyId: number
  outsourcingCompanyName: string
  // 업체계약 이름
  outsourcingCompanyContractId: number | null
  outsourcingCompanyContractName: string
  name: string
  foreignName: string
  residentNumber: string
  residentNumberIsCheck?: boolean
  address: string
  detailAddress: string
  isModalOpen: boolean
  phoneNumber: string
  memo: string
  workType: string
  workTypeCode: string
  workTypeDescription: string
  mainWork: string
  dailyWage: number
  bankName: string
  accountNumber: string
  accountHolder: string
  hireDate: Date | null
  resignationDate: Date | null
  tenureDays?: string
  tenureMonths: string
  isSeverancePayEligible: string
  initialHireDateAt: string
  initialResignationDateAt: string

  // 파일첨부, 수정이력
  files: AttachedFile[]
  checkedAttachedFileIds: number[]

  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type LaborInfoFormStore = {
  form: LaborFormState

  reset: () => void

  // methods
  setField: <K extends keyof Omit<LaborFormState, 'reset' | 'setField'>>(
    field: K,
    value: LaborFormState[K],
  ) => void

  addItem: (type: 'attachedFile') => void
  updateItemField: (type: 'attachedFile', id: T, field: T, value: T) => void

  toggleCheckItem: (type: 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'attachedFile') => void

  updateMemo: (id: number, newMemo: string) => void

  //관리비 등록하기

  //payload 값
  newLaborData: () => void
}
