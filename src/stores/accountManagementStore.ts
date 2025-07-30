import {
  AccountFormStore,
  accountManagementSearchProps,
  // AttachedFile,
  // Manager,
} from '@/types/accountManagement'
import { create } from 'zustand'

export const useAccountManagementStore = create<{ search: accountManagementSearchProps }>(
  (set) => ({
    search: {
      searchTrigger: 0,
      username: '',
      roleId: '0',
      isActive: '0',
      createdStartDate: null,
      createdEndDate: null,
      lastLoginStartDate: null,
      lastLoginEndDate: null,
      departmentId: 0,
      gradeId: 0,
      positionId: 0,
      currentPage: 1,
      arraySort: '최신순',
      pageCount: '10',

      setField: (field, value) =>
        set((state) => ({
          search: {
            ...state.search,
            [field]: value,
          },
        })),

      handleSearch: () =>
        set((state) => ({
          search: {
            ...state.search,
            searchTrigger: state.search.searchTrigger + 1,
          },
        })),

      reset: () =>
        set((state) => ({
          search: {
            ...state.search,
            searchTrigger: 0,
            username: '',
            roleId: '0',
            isActive: '0',
            createdStartDate: null,
            createdEndDate: null,
            lastLoginStartDate: null,
            lastLoginEndDate: null,
            departmentId: 0,
            gradeId: 0,
            positionId: 0,
            currentPage: 1,
            arraySort: '최신순',
            pageCount: '10',
          },
        })),
    },
  }),
)

export const useAccountFormStore = create<AccountFormStore>((set, get) => ({
  form: {
    loginId: '',
    username: '',
    departmentId: 0,
    positionId: 0,
    gradeId: 0,
    email: '',
    phoneNumber: '',
    landlineNumber: '',
    password: '',
    checkPassword: '',
    isActive: '0',
    memo: '',
  },

  reset: () =>
    set(() => ({
      form: {
        loginId: '',
        username: '',
        departmentId: 0,
        positionId: 0,
        gradeId: 0,
        email: '',
        phoneNumber: '',
        landlineNumber: '',
        password: '',
        checkPassword: '',
        isActive: '0',
        memo: '',
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  newAccountUser: () => {
    const form = get().form
    return {
      loginId: form.loginId,
      username: form.username,
      departmentId: form.departmentId,
      positionId: form.positionId,
      gradeId: form.gradeId,
      email: form.email,
      phoneNumber: form.phoneNumber,
      landlineNumber: form.landlineNumber,
      // password: form.password,
      ...(form.password && form.password.trim() !== '' ? { password: form.password } : {}),
      // checkPassword: form.checkPassword,
      isActive: form.isActive === '1' ? true : false,
    }
  },
}))

// 리스트 체크 박스 용  삭제에서 사용하기 위함 id 세팅

type AccountState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedIds: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSelectedIds: (ids: any) => void
}

export const useAccountStore = create<AccountState>((set) => ({
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
}))
