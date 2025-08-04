export interface PermissionGroupDetail {
  id: number
  name: string
  userCount: number
  createdAt: Date | null
  updatedAt: Date | null
  memo: string
  hasGlobalSiteProcessAccess: boolean
  sites: {
    id: number
    name: string
  }[]
  processes: {
    id: number
    name: string
  }[]
}

export type permissionSearchProps = {
  searchTrigger: number
  userSearch: string
  currentPage: number
  arraySort: string
  pageCount: string

  reset: () => void
  setField: <K extends keyof Omit<permissionSearchProps, 'reset' | 'setField'>>(
    field: K,
    value: permissionSearchProps[K],
  ) => void
  handleSearch: () => void
}

// 그룹 등록

export type RoleUser = {
  id: number
  userId: number
  loginId: string
  username: string
  department: string
  memo: string
}

export type FormState = {
  name: string
  memo: string
  users: {
    userId: number
    loginId: string
    username: string
    department: string
    memo: string
  }[]
  userIds: number[]
  permissionIds: number[]
  hasGlobalSiteProcessAccess: boolean
  siteProcesses: {
    siteId: number
    processId: number
  }[]
}

type PermissionFormState = {
  form: FormState

  reset: () => void
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void

  toggleUserCheck: (userId: number, checked: boolean) => void
  toggleCheckAllItems: (checked: boolean) => void
  updateUserMemo: (userId: number, memo: string) => void
  addUser: () => void
  removeUser: (userId: number) => void

  // 계정 추가

  updateUserField: (userId: T, field: keyof FormState['users'][number], value: T) => void

  // siteProcess 관련 메서드 추가
  updateSiteProcessField: (index: number, field: 'siteId' | 'processId', value: string) => void
  addSiteProcess: () => void
  removeSiteProcess: (index: number) => void

  newPermissionGroupData: () => void
  setPermissionIds: (newIds: number[]) => void
}

// 메뉴권한에 필요한 타입

type Permission = {
  id: number
  action: '조회' | '등록' | '수정' | '삭제' | '승인' // 권한 타입들 (필요하면 확장 가능)
}

type Menu = {
  id: number
  name: string
  permissions: Permission[]
}

type SideMenuList = {
  data: Menu[]
}
