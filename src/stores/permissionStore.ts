import { PermissionFormState, permissionSearchProps } from '@/types/permssion'
import { create } from 'zustand'

export const usePermissionSearchStore = create<{ search: permissionSearchProps }>((set) => ({
  search: {
    searchTrigger: 0,
    userSearch: '',
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
          userSearch: '',
          currentPage: 1,
          arraySort: '최신순',
          pageCount: '10',
        },
      })),
  },
}))

//권한 그룹 등록

export const usePermissionGroupStore = create<PermissionFormState>((set, get) => ({
  form: {
    name: '',
    memo: '',
    users: [],
    userIds: [],
    permissionIds: [],
    hasGlobalSiteProcessAccess: false,
    siteProcesses: [{ siteId: 0, processId: 0 }],
  },

  reset: () =>
    set(() => ({
      form: {
        name: '',
        memo: '',
        users: [],
        userIds: [],
        permissionIds: [],
        hasGlobalSiteProcessAccess: false,
        siteProcesses: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),

  setPermissionIds: (newIds: number[]) =>
    set((state) => ({
      form: {
        ...state.form,
        permissionIds: newIds,
      },
    })),

  toggleUserCheck: (userId, checked) =>
    set((state) => {
      const newUserIds = checked
        ? [...state.form.userIds, userId]
        : state.form.userIds.filter((id) => id !== userId)
      return {
        form: {
          ...state.form,
          userIds: newUserIds,
        },
      }
    }),

  toggleCheckAllItems: (checked) =>
    set((state) => ({
      form: {
        ...state.form,
        userIds: checked ? state.form.users.map((u) => u.userId) : [],
      },
    })),

  updateUserMemo: (userId, memo) =>
    set((state) => ({
      form: {
        ...state.form,
        users: state.form.users.map((user) => (user.userId === userId ? { ...user, memo } : user)),
      },
    })),

  addUser: () =>
    set((state) => {
      const currentUsers = state.form.users
      const lastUserId =
        currentUsers.length > 0 ? Math.max(...currentUsers.map((u) => u.userId)) : 0
      const newUserId = lastUserId + 1

      return {
        form: {
          ...state.form,
          users: [
            ...currentUsers,
            {
              userId: newUserId,
              loginId: '',
              username: '',
              department: '',
              memo: '',
            },
          ],
        },
      }
    }),

  updateUserField: (userId, field, value) =>
    set((state) => {
      const updatedUsers = state.form.users.map((user) =>
        user.userId === userId ? { ...user, [field]: value } : user,
      )
      return {
        form: {
          ...state.form,
          users: updatedUsers,
        },
      }
    }),

  updateSiteProcessField: (index: number, field: 'siteId' | 'processId', value: string) =>
    set((state) => {
      const updated = [...state.form.siteProcesses]
      if (!updated[index]) return state // 유효성 체크
      updated[index] = { ...updated[index], [field]: value }
      return {
        form: {
          ...state.form,
          siteProcesses: updated,
        },
      }
    }),

  addSiteProcess: () =>
    set((state) => ({
      form: {
        ...state.form,
        siteProcesses: [...state.form.siteProcesses, { siteId: 0, processId: 0 }],
      },
    })),

  removeSiteProcess: (index: number) =>
    set((state) => ({
      form: {
        ...state.form,
        siteProcesses: state.form.siteProcesses.filter((_, i) => i !== index),
      },
    })),

  removeUser: (userId) =>
    set((state) => ({
      form: {
        ...state.form,
        users: state.form.users.filter((u) => u.userId !== userId),
        userIds: state.form.userIds.filter((id) => id !== userId),
      },
    })),

  newPermissionGroupData: () => {
    const form = get().form
    return {
      name: form.name,
      memo: form.memo,
      users: form.users.map((u) => ({
        memo: u.memo,
        userId: u.userId, // 화면에서 고른 userId
      })),
      permissionIds: form.permissionIds,
      hasGlobalSiteProcessAccess: form.hasGlobalSiteProcessAccess,
      siteProcesses: form.siteProcesses,
    }
  },
}))
