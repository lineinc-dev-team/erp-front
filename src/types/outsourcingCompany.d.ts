export type Manager = {
  id: number
  name: string
  department: string
  tel: string
  phone: string
  email: string
  memo: string
}

export type AttachedFile = {
  id: number
  fileName: string
  memo: string
  files: File[]
}

export type FormState = {
  // 기존 필드들
  companyName: string
  businessNumber: string
  address: string
  detailAddress: string
  ceoName: string
  areaNumber: string
  isModalOpen: boolean
  phoneNumber: string
  email: string
  deductType: string
  deductDesc: string
  guaranteeType: string
  isActive: string
  memo: string

  // 담당자 배열
  headManagers: Manager[]

  // 선택된 체크박스 id
  checkedManagerIds: number[]

  // 파일첨부, 수정이력
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]

  modificationHistory: {
    modifiedAt: Date | null
    modifiedField: string
    modifiedBy: string
    note: string
  }[]

  // methods
  reset: () => void
  setField: <K extends keyof Omit<FormState, 'reset' | 'setField'>>(
    field: K,
    value: FormState[K],
  ) => void

  addItem: (type: 'manager' | 'attachedFile') => void
  updateItemField: (type: 'manager' | 'attachedFile', id: number, field: string, value: T) => void
  toggleCheckItem: (ype: 'manager' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (ype: 'manager' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (ype: 'manager' | 'attachedFile') => void

  //외주업체 등록하기
  newOutsouringCompany: () => void
  handleCancelData: () => void
}

export type outSourcingCompanySearchProps = {
  companyName: string
  businessNumber: string
  ceoName: string
  phoneNumber: string
  contractorName: string
  email: string
  startDate: Date | null
  endDate: Date | null
  bossName: string
  isSubmit: string
  isActive: string
  arraySort: string
  pageCount: string

  reset: () => void
  setField: <K extends keyof Omit<outSourcingCompanySearchProps, 'reset' | 'setField'>>(
    field: K,
    value: outSourcingCompanySearchProps[K],
  ) => void
  handleSearch: () => void
}
