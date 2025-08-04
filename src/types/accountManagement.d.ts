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
}

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
  editedHistories?: Pick<HistoryItem, 'id' | 'memo'>[]

  // 수정이력에서 메모와 id 값
  changeHistories: HistoryItem[] // 수정 이력 포함
}

type AccountFormStore = {
  form: FormState

  reset: () => void
  setField: <K extends keyof Omit<FormState, 'modificationHistory'>>(
    field: K,
    value: FormState[K],
  ) => void

  newAccountUser: () => void
  updateMemo: (id: number, newMemo: string) => void
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
