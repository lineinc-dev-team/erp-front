export type Manager = {
  id: number
  name: string
  position: string
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
  name: string
  businessNumber: string
  ceoName: string
  address: string
  detaileAddress: string
  landlineNumber: string
  areaNumber: string
  isModalOpen: boolean
  email: string
  paymentMethod: string
  paymentPeriod: string
  memo: string
  isActive: string

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

  //발주처 등록하기
  newOrderingData: () => void
  handleCancelData: () => void
}
