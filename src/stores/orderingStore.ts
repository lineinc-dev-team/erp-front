import { create } from 'zustand'
import type {
  Manager,
  AttachedFile,
  OrderingSearchState,
  ClientCompanyFormStore,
} from '@/types/ordering'

export const useOrderingSearchStore = create<{ search: OrderingSearchState }>((set) => ({
  search: {
    name: '',
    businessNumber: '',
    ceoName: '',
    landlineNumber: '',
    orderCEOname: '',
    email: '',
    startDate: null,
    endDate: null,
    bossName: '',
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
          name: search.name,
          businessNumber: search.businessNumber,
          ceoName: search.ceoName,
          landlineNumber: search.landlineNumber,
          orderCEOname: search.orderCEOname,
          email: search.email,
          startDate: search.startDate,
          endDate: search.endDate,
          bossName: search.bossName,
          isActive: search.isActive === '사용' ? true : false,
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
          areaNumber: '',
          landlineNumber: '',
          orderCEOname: '',
          email: '',
          startDate: null,
          endDate: null,
          bossName: '',
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
    paymentMethod: '선택',
    paymentPeriod: '',
    memo: '',
    isActive: '선택',
    userId: 0,
    headManagers: [],
    checkedManagerIds: [],
    attachedFiles: [],
    checkedAttachedFileIds: [],
    modificationHistory: [],
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
        paymentMethod: '선택',
        paymentPeriod: '',
        memo: '',
        isActive: '선택',
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
          position: '',
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
      paymentMethod: form.paymentMethod === '어음' ? 'CASH' : 'BILL',
      paymentPeriod: form.paymentPeriod,
      memo: form.memo,
      isActive: form.isActive === '사용' ? true : false,
      userId: form.userId,
      contacts: form.headManagers.map((m) => ({
        name: m.name,
        position: m.position,
        landlineNumber: m.landlineNumber,
        phoneNumber: m.phoneNumber,
        email: m.email,
        memo: m.memo,
      })),
      // files: form.attachedFiles.map((f) => ({
      //   name: f.fileName,
      //   fileUrl: f.files.publicUrl, // 백엔드 업로드 후 URL 받아와서 넣기
      //   originalFileName: f.files.file.name || 'testFile_2024.pdf',
      //   memo: f.memo,
      // })),
      files: form.attachedFiles.flatMap((f) =>
        f.files.map((fileObj) => ({
          name: f.name,
          fileUrl: fileObj.publicUrl,
          originalFileName: fileObj.file?.name || 'testFile_2024.pdf',
          memo: f.memo,
        })),
      ),
    }
  },

  handleCancelData: () => {
    alert('이전 페이지 등록')
  },

  newOrderingData: () => {
    alert('이전 페이지 등록')
  },
}))
