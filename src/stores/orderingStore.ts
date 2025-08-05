import { create } from 'zustand'
import type {
  Manager,
  AttachedFile,
  OrderingSearchState,
  ClientCompanyFormStore,
} from '@/types/ordering'

export const useOrderingSearchStore = create<{ search: OrderingSearchState }>((set) => ({
  search: {
    searchTrigger: 0,
    name: '',
    currentPage: 1,
    businessNumber: '',
    ceoName: '',
    userName: '',
    landlineNumber: '',
    contactName: '',
    email: '',
    startDate: null,
    endDate: null,
    isActive: '선택',
    arraySort: '최신순',
    pageCount: '10',

    setField: (field, value) =>
      set((state) => ({
        search: { ...state.search, [field]: value },
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
          name: '',
          businessNumber: '',
          currentPage: 1,
          ceoName: '',
          userName: '',
          areaNumber: '',
          landlineNumber: '',
          contactName: '',
          email: '',
          startDate: null,
          endDate: null,
          arraySort: '최신순',
          pageCount: '10',
          isActive: '선택',
        },
      })),

    handleOrderingListRemove: () => {
      alert('리스트에 대한 삭제가 됩니다.')
    },
  },
}))

export const useOrderingFormStore = create<ClientCompanyFormStore>((set, get) => ({
  form: {
    name: '',
    businessNumber: '',
    ceoName: '',
    address: '',
    detailAddress: '',
    areaNumber: '지역번호',
    landlineNumber: '',
    phoneNumber: '',
    isModalOpen: false,
    email: '',
    paymentMethod: '',
    paymentPeriod: '',
    memo: '',
    isActive: '선택',
    userId: 0,
    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [],
    checkedAttachedFileIds: [],
    modificationHistory: [],
    changeHistories: [],
  },
  reset: () =>
    set(() => ({
      form: {
        name: '',
        businessNumber: '',
        ceoName: '',
        address: '',
        userId: 0,
        detailAddress: '',
        areaNumber: '지역번호',
        landlineNumber: '',
        phoneNumber: '',
        isModalOpen: false,
        email: '',
        paymentMethod: '',
        paymentPeriod: '',
        memo: '',
        isActive: '선택',
        headManagers: [],
        checkedManagerIds: [],
        attachedFiles: [],
        checkedAttachedFileIds: [],
        modificationHistory: [],
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

  addItem: (type) =>
    set((state) => {
      if (type === 'manager') {
        const newItem: Manager = {
          id: Date.now(),
          name: '',
          position: '',
          department: '',
          managerAreaNumber: '지역번호',
          landlineNumber: '',
          phoneNumber: '',
          email: '',
          memo: '',
        }
        return { form: { ...state.form, headManagers: [...state.form.headManagers, newItem] } }
      } else {
        const newItem: AttachedFile = {
          id: Date.now(),
          name: '',
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

  setRepresentativeManager: (id: number) =>
    set((state) => ({
      form: {
        ...state.form,
        headManagers: state.form.headManagers.map((m) => ({
          ...m,
          isMain: m.id === id,
        })),
      },
    })),

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

  newClientCompanyData: () => {
    const form = get().form
    return {
      name: form.name,
      businessNumber: form.businessNumber,
      ceoName: form.ceoName,
      address: form.address,
      detailAddress: form.detailAddress,
      landlineNumber: `${form.areaNumber}-${form.landlineNumber}`,
      phoneNumber: form.phoneNumber,
      email: form.email,
      paymentMethod: form.paymentMethod,
      paymentPeriod: form.paymentPeriod,
      memo: form.memo,
      isActive: form.isActive === '사용' ? true : false,
      userId: form.userId,
      contacts: form.headManagers.map((m) => ({
        id: m.id,
        name: m.name,
        position: m.position,
        department: m.department,
        landlineNumber: `${m.managerAreaNumber}-${m.landlineNumber}`,
        phoneNumber: m.phoneNumber,
        email: m.email,
        memo: m.memo,
        isMain: m.isMain || false, // 여기 추가
      })),
      // files: form.attachedFiles.map((f) => ({
      //   name: f.fileName,
      //   fileUrl: f.files.publicUrl, // 백엔드 업로드 후 URL 받아와서 넣기
      //   originalFileName: f.files.file.name || 'testFile_2024.pdf',
      //   memo: f.memo,
      // })),
      files: form.attachedFiles.flatMap((f) =>
        f.files.map((fileObj) => ({
          id: f.id,
          name: f.name,
          fileUrl: fileObj.publicUrl,
          originalFileName: fileObj.file?.name || 'testFile_2024.pdf',
          memo: f.memo,
        })),
      ),
      changeHistories: form.editedHistories ?? [],
    }
  },

  handleCancelData: () => {
    alert('이전 페이지 등록')
  },

  newOrderingData: () => {
    alert('이전 페이지 등록')
  },
}))
