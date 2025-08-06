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
    isActive: '선택',
    memo: '',
    changeHistories: [],
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
        isActive: '선택',
        memo: '',
        changeHistories: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  updateMemo: (id, value) =>
    set((state) => {
      // 기존 changeHistories 업데이트
      const updatedHistories = state.form.changeHistories.map((history) =>
        history.id === id ? { ...history, memo: value } : history,
      )

      // 기존에 저장된 editedHistories 복사
      const edited = state.form.editedHistories ?? []

      // 이미 수정된 항목이 있으면 덮어쓰기, 없으면 새로 추가
      const updatedEditedHistories = edited.some((h) => h.id === id)
        ? edited.map((h) => (h.id === id ? { id, memo: value } : h))
        : [...edited, { id, memo: value }]

      return {
        form: {
          ...state.form,
          changeHistories: updatedHistories,
          editedHistories: updatedEditedHistories,
        },
      }
    }),

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
      ...(form.password && form.password.trim() !== '' ? { password: form.password } : {}),
      isActive: form.isActive === '1' ? true : false,
      memo: form.memo,

      // 수정된 항목만 보내기 (없으면 빈 배열)
      changeHistories: form.editedHistories ?? [],

      // changeHistories: form.changeHistories.map((history) => ({
      //   id: history.id,
      //   memo: history.memo,
      // })),
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
