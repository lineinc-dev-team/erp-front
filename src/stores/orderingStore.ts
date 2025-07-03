import { create } from 'zustand'
import type { FormState, Manager, AttachedFile } from '@/types/ordering'

export const useOrderingStore = create<{ form: FormState }>((set) => ({
  form: {
    name: '',
    businessNumber: '',
    ceoName: '',
    address: '',
    detaileAddress: '',
    areaNumber: '지역번호',
    landlineNumber: '',
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

    reset: () =>
      set((state) => ({
        form: {
          ...state.form,
          name: '',
          businessNumber: '',
          ceoName: '',
          address: '',
          detaileAddress: '',
          areaNumber: '지역번호',
          landlineNumber: '',
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

    newOrderingData: () =>
      set((state) => {
        const form = state.form

        const payload = {
          name: form.name,
          businessNumber: form.businessNumber,
          ceoName: form.ceoName,
          address: `${form.address} ${form.detaileAddress || ''}`.trim(),
          landlineNumber: `${form.areaNumber}-${form.landlineNumber}`,
          email: form.email,
          paymentMethod: form.paymentMethod,
          paymentPeriod: form.paymentPeriod,
          memo: form.memo,
          isActive: form.isActive === '사용' ? true : false,
          contacts: form.headManagers.map((m) => ({
            name: m.name,
            position: m.position,
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

        console.log('백엔드에 보낼 데이터:', JSON.stringify(payload, null, 2))
        alert(JSON.stringify(payload, null, 2))

        return state
      }),

    handleCancelData: () => {
      alert('이전 페이지 등록')
    },
  },
}))
