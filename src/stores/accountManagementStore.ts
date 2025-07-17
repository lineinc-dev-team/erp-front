import {
  AccountFormStore,
  accountManagementSearchProps,
  AttachedFile,
  Manager,
} from '@/types/accountManagement'
import { create } from 'zustand'

export const useAccountManagementStore = create<{ search: accountManagementSearchProps }>(
  (set) => ({
    search: {
      companyName: '',
      businessNumber: '',
      ceoName: '',
      phoneNumber: '',
      contractorName: '',
      email: '',
      startDate: null,
      endDate: null,
      bossName: '',
      isSubmit: '전체',
      isActive: '선택',
      arraySort: '최신순',
      pageCount: '10',

      setField: (field, value) =>
        set((state) => ({
          search: { ...state.search, [field]: value },
        })),

      handleSearch: () =>
        set((state) => {
          const search = state.search

          const payload = {
            companyName: search.companyName,
            businessNumber: search.businessNumber,
            ceoName: search.ceoName,
            phoneNumber: search.phoneNumber,
            contractorName: search.contractorName,
            email: search.email,
            startDate: search.startDate,
            endDate: search.endDate,
            bossName: search.bossName,
            isActive: search.isActive === '사용' ? true : false,
            isSubmit: search.isSubmit === '제출' ? true : false,
          }
          alert(JSON.stringify(payload, null, 2))

          return state
        }),
      reset: () =>
        set((state) => ({
          search: {
            ...state.search,
            name: '',
            businessNumber: '',
            ceoName: '',
            phoneNumber: '',
            contractorName: '',
            email: '',
            startDate: null,
            endDate: null,
            bossName: '',
            arraySort: '최신순',
            pageCount: '10',
            isActive: '선택',
            isSubmit: '전체',
          },
        })),

      handleOrderingListRemove: () => {
        alert('리스트에 대한 삭제가 됩니다.')
      },
    },
  }),
)

export const useAccountFormStore = create<AccountFormStore>((set, get) => ({
  form: {
    loginId: '',
    username: '',
    detailAddress: '',
    ceoName: '',
    isModalOpen: false,
    areaNumber: '지역번호',
    phoneNumber: '',
    landlineNumber: '',
    email: '',
    password: '',
    deductType: '선택',
    deductDesc: '',
    guaranteeType: '선택',
    isActive: '선택',
    memo: '',
    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [],
    checkedAttachedFileIds: [],
    modificationHistory: [],
  },

  reset: () =>
    set(() => ({
      form: {
        loginId: '',
        username: '',
        detailAddress: '',
        ceoName: '',
        isModalOpen: false,
        areaNumber: '지역번호',
        phoneNumber: '',
        landlineNumber: '',
        email: '',
        password: '',
        deductType: '선택',
        deductDesc: '',
        guaranteeType: '선택',
        isActive: '선택',
        memo: '',
        headManagers: [],
        checkedManagerIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        modificationHistory: [],
      },
    })),

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  addItem: (type) =>
    set((state) => {
      if (type === 'manager') {
        const newItem: Manager = {
          id: Date.now(),
          name: '',
          department: '',
          tel: '',
          phone: '',
          email: '',
          memo: '',
        }
        return { form: { ...state.form, headManagers: [...state.form.headManagers, newItem] } }
      } else {
        const newItem: AttachedFile = {
          id: Date.now(),
          fileName: '',
          memo: '',
          files: [],
        }
        return { form: { ...state.form, attachedFiles: [...state.form.attachedFiles, newItem] } }
      }
    }),

  updateItemField: (type, id, field, value) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            headManagers: state.form.headManagers.map((m) =>
              m.id === id ? { ...m, [field]: value } : m,
            ),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.map((f) =>
              f.id === id ? { ...f, [field]: value } : f,
            ),
          },
        }
      }
    }),

  toggleCheckItem: (type, id, checked) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked
              ? [...state.form.checkedManagerIds, id]
              : state.form.checkedManagerIds.filter((cid) => cid !== id),
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked
              ? [...state.form.checkedAttachedFileIds, id]
              : state.form.checkedAttachedFileIds.filter((cid) => cid !== id),
          },
        }
      }
    }),

  toggleCheckAllItems: (type, checked) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            checkedManagerIds: checked ? state.form.headManagers.map((m) => m.id) : [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            checkedAttachedFileIds: checked ? state.form.attachedFiles.map((f) => f.id) : [],
          },
        }
      }
    }),

  removeCheckedItems: (type) =>
    set((state) => {
      if (type === 'manager') {
        return {
          form: {
            ...state.form,
            headManagers: state.form.headManagers.filter(
              (m) => !state.form.checkedManagerIds.includes(m.id),
            ),
            checkedManagerIds: [],
          },
        }
      } else {
        return {
          form: {
            ...state.form,
            attachedFiles: state.form.attachedFiles.filter(
              (f) => !state.form.checkedAttachedFileIds.includes(f.id),
            ),
            checkedAttachedFileIds: [],
          },
        }
      }
    }),

  newAccountUser: () => {
    const form = get().form
    return {
      loginId: form.loginId,
      username: form.username,
      email: form.email,
      phoneNumber: form.phoneNumber,
      landlineNumber: form.landlineNumber,
      password: form.password,
      ceoName: form.ceoName,
      // address: `${form.address} ${form.detailAddress || ''}`.trim(),
      deductType: form.deductType,
      deductDesc: form.deductDesc,
      guaranteeType: form.guaranteeType,
      isActive: form.isActive === '사용',
      memo: form.memo,
      contacts: form.headManagers.map((m) => ({
        name: m.name,
        position: m.department,
        landlineNumber: m.tel,
        phoneNumber: m.phone,
        email: m.email,
        memo: m.memo,
      })),
      files: form.attachedFiles.map((f) => ({
        documentName: f.fileName,
        fileUrl: '', // 백엔드 업로드 후 URL 받아와서 넣기
        originalFileName: f.files[0]?.name || '',
        memo: f.memo,
      })),
    }
  },

  handleCancelData: () => {
    alert('최소 !!!')
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
