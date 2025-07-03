import { create } from 'zustand'
import type { FormState, Manager, AttachedFile } from '@/types/outsourcingCompany'

export const useOutsourcingStore = create<{ form: FormState }>((set) => ({
  form: {
    companyName: '',
    businessNumber: '',
    address: '',
    detailAddress: '',
    ceoName: '',
    isModalOpen: false,
    areaNumber: '지역번호',
    phoneNumber: '',
    email: '',
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

    reset: () =>
      set((state) => ({
        form: {
          ...state.form,
          companyName: '',
          businessNumber: '',
          address: '',
          detailAddress: '',
          ceoName: '',
          isModalOpen: false,
          areaNumber: '지역번호',
          phoneNumber: '',
          email: '',
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

    newOutsouringCompany: () =>
      set((state) => {
        const form = state.form

        const payload = {
          name: form.companyName,
          businessNumber: form.businessNumber,
          ceoName: form.ceoName,
          address: `${form.address} ${form.detailAddress || ''}`.trim(),
          landlineNumber: `${form.areaNumber}-${form.phoneNumber}`,
          email: form.email,
          deductType: form.deductType,
          deductDesc: form.deductDesc,
          guaranteeType: form.guaranteeType,
          isActive: form.isActive === '사용' ? true : false,
          memo: '',
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

        alert(JSON.stringify(payload))

        return state
      }),

    handleCancelData: () => {
      alert('최소 !!!')
    },
  },
}))
