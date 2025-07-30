// export type Manager = {
//   id: number
//   name: string
//   department: string
//   tel: string
//   phone: string
//   email: string
//   memo: string
// }

// export type AttachedFile = {
//   id: number
//   fileName: string
//   memo: string
//   files: File[]
// }

export type UserInfoProps = {
  id: number
  loginId: string
  username: string
  phoneNumber: string
  email: string
  isActive: boolean
  createdAt: Date | null
  updatedAt: Date | null
  lastLoginAt: Date | null
  landlineNumber: string
  updatedBy: string
  memo: string
}

export type FormState = {
  loginId: string
  username: string
  departmentId: number
  positionId: number
  gradeId: number
  email: string
  phoneNumber: string
  landlineNumber: string
  password: string
  checkPassword: string
  isActive: string
  memo: string
}

type AccountFormStore = {
  form: FormState

  reset: () => void
  setField: <K extends keyof Omit<FormState, 'modificationHistory'>>(
    field: K,
    value: FormState[K],
  ) => void

  // addItem: (type: 'manager' | 'attachedFile') => void
  // updateItemField: (type: 'manager' | 'attachedFile', id: number, field: string, value: T) => void

  // toggleCheckItem: (type: 'manager' | 'attachedFile', id: number, checked: boolean) => void
  // toggleCheckAllItems: (type: 'manager' | 'attachedFile', checked: boolean) => void
  // removeCheckedItems: (type: 'manager' | 'attachedFile') => void

  newAccountUser: () => void
}

export type accountManagementSearchProps = {
  searchTrigger: number
  username: string
  roleId: string
  isActive: string
  createdStartDate: Date | null
  createdEndDate: Date | null
  lastLoginStartDate: Date | null
  lastLoginEndDate: Date | null
  departmentId: number
  gradeId: number
  positionId: number
  currentPage: number
  arraySort: string
  pageCount: string

  reset: () => void
  setField: <K extends keyof Omit<accountManagementSearchProps, 'reset' | 'setField'>>(
    field: K,
    value: accountManagementSearchProps[K],
  ) => void
  handleSearch: () => void
}
