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

export type UserInfoProps = {
  id: number
  loginId: string
  username: string
  phoneNumber: string | null
  landlineNumber: string | null
  email: string
  memo: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  updatedBy: string
  isActive: boolean
  roles?: string[]
}

export type FormState = {
  loginId: string
  username: string
  detailAddress: string
  startDate?: Date | null | undefined
  endDate?: Date | null | undefined
  ceoName: string
  areaNumber: string
  isModalOpen: boolean
  phoneNumber: string
  password: string
  landlineNumber: string
  email: string
  deductType: string
  deductDesc: string
  guaranteeType: string
  isActive: string
  memo: string
  headManagers: Manager[]
  checkedManagerIds: number[]
  attachedFiles: AttachedFile[]
  checkedAttachedFileIds: number[]
  modificationHistory: {
    modifiedAt: Date | null
    modifiedField: string
    modifiedBy: string
    note: string
  }[]
}

type AccountFormStore = {
  form: FormState

  reset: () => void
  setField: <K extends keyof Omit<FormState, 'modificationHistory'>>(
    field: K,
    value: FormState[K],
  ) => void

  addItem: (type: 'manager' | 'attachedFile') => void
  updateItemField: (type: 'manager' | 'attachedFile', id: number, field: string, value: T) => void

  toggleCheckItem: (type: 'manager' | 'attachedFile', id: number, checked: boolean) => void
  toggleCheckAllItems: (type: 'manager' | 'attachedFile', checked: boolean) => void
  removeCheckedItems: (type: 'manager' | 'attachedFile') => void

  newAccountUser: () => void
  handleCancelData: () => void
}

export type accountManagementSearchProps = {
  companyName: string
  businessNumber: string
  ceoName: string
  phoneNumber: string
  contractorName: string
  email: string
  startDate: Date | null | undefined
  endDate: Date | null | undefined
  bossName: string
  isSubmit: string
  isActive: string
  arraySort: string
  pageCount: string

  reset: () => void
  setField: <K extends keyof Omit<accountManagementSearchProps, 'reset' | 'setField'>>(
    field: K,
    value: accountManagementSearchProps[K],
  ) => void
  handleSearch: () => void
}
